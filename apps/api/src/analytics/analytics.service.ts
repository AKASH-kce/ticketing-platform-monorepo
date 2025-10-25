import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { events, bookings } from '@repo/database';
import { eq, sql } from 'drizzle-orm';

@Injectable()
export class AnalyticsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getEventAnalytics(eventId: number) {
    const db = this.databaseService.getDb();
    
    // Get event details
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    // Get booking statistics
    const [stats] = await db
      .select({
        totalBookings: sql<number>`count(*)`,
        totalTicketsSold: sql<number>`sum(${bookings.quantity})`,
        totalRevenue: sql<number>`sum(${bookings.pricePaid}::numeric)`,
        averagePrice: sql<number>`avg(${bookings.pricePaid}::numeric)`,
      })
      .from(bookings)
      .where(eq(bookings.eventId, eventId));

    const remainingTickets = event.totalTickets - event.bookedTickets;
    const occupancyRate = event.totalTickets > 0 ? (event.bookedTickets / event.totalTickets) * 100 : 0;

    return {
      event: {
        id: event.id,
        name: event.name,
        eventDate: event.eventDate,
        venue: event.venue,
        totalTickets: event.totalTickets,
        bookedTickets: event.bookedTickets,
        remainingTickets,
        occupancyRate: Math.round(occupancyRate * 100) / 100,
        basePrice: parseFloat(event.basePrice),
        currentPrice: parseFloat(event.currentPrice),
        priceFloor: parseFloat(event.priceFloor),
        priceCeiling: parseFloat(event.priceCeiling),
      },
      analytics: {
        totalBookings: stats?.totalBookings || 0,
        totalTicketsSold: stats?.totalTicketsSold || 0,
        totalRevenue: parseFloat(stats?.totalRevenue?.toString() || '0'),
        averagePrice: parseFloat(stats?.averagePrice?.toString() || '0'),
      },
    };
  }

  async getSystemSummary() {
    const db = this.databaseService.getDb();
    
    // Get overall statistics
    const [eventStats] = await db
      .select({
        totalEvents: sql<number>`count(*)`,
        activeEvents: sql<number>`count(*) filter (where ${events.isActive} = true)`,
        totalCapacity: sql<number>`sum(${events.totalTickets})`,
        totalBooked: sql<number>`sum(${events.bookedTickets})`,
      })
      .from(events);

    const [bookingStats] = await db
      .select({
        totalBookings: sql<number>`count(*)`,
        totalTicketsSold: sql<number>`sum(${bookings.quantity})`,
        totalRevenue: sql<number>`sum(${bookings.pricePaid}::numeric)`,
        averagePrice: sql<number>`avg(${bookings.pricePaid}::numeric)`,
      })
      .from(bookings);

    const totalRevenue = parseFloat(bookingStats?.totalRevenue?.toString() || '0');
    const totalCapacity = eventStats?.totalCapacity || 0;
    const totalBooked = eventStats?.totalBooked || 0;
    const systemOccupancyRate = totalCapacity > 0 ? (totalBooked / totalCapacity) * 100 : 0;

    return {
      events: {
        total: eventStats?.totalEvents || 0,
        active: eventStats?.activeEvents || 0,
        totalCapacity,
        totalBooked,
        remainingCapacity: totalCapacity - totalBooked,
        occupancyRate: Math.round(systemOccupancyRate * 100) / 100,
      },
      bookings: {
        total: bookingStats?.totalBookings || 0,
        totalTicketsSold: bookingStats?.totalTicketsSold || 0,
        totalRevenue,
        averagePrice: parseFloat(bookingStats?.averagePrice?.toString() || '0'),
      },
    };
  }
}
