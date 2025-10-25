import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { events, bookings } from '../database/schema';
import { eq, gte } from 'drizzle-orm';
import { PricingEngine, type EventData, type BookingData } from './pricing-engine';

@Injectable()
export class PricingService {
  constructor(private readonly databaseService: DatabaseService) {}

  async calculateCurrentPrice(eventId: number): Promise<number> {
    const event = await this.getEventData(eventId);
    const recentBookings = await this.getRecentBookings(eventId);
    
    const result = PricingEngine.calculatePrice(event, recentBookings);
    
    // Update the current price in the database
    await this.updateCurrentPrice(eventId, result.currentPrice);
    
    return result.currentPrice;
  }

  async getPricingBreakdown(eventId: number) {
    const event = await this.getEventData(eventId);
    const recentBookings = await this.getRecentBookings(eventId);
    
    return PricingEngine.calculatePrice(event, recentBookings);
  }

  private async getEventData(eventId: number): Promise<EventData> {
    const db = this.databaseService.getDb();
    
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) {
      throw new Error(`Event with ID ${eventId} not found`);
    }

    return {
      id: event.id,
      eventDate: event.eventDate,
      totalTickets: event.totalTickets,
      bookedTickets: event.bookedTickets,
      basePrice: parseFloat(event.basePrice),
      priceFloor: parseFloat(event.priceFloor),
      priceCeiling: parseFloat(event.priceCeiling),
      pricingRules: event.pricingRules,
    };
  }

  private async getRecentBookings(eventId: number): Promise<BookingData[]> {
    const db = this.databaseService.getDb();
    
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const recentBookings = await db
      .select({
        eventId: bookings.eventId,
        createdAt: bookings.createdAt,
      })
      .from(bookings)
      .where(
        eq(bookings.eventId, eventId)
      );

    return recentBookings.filter(booking => 
      new Date(booking.createdAt) >= oneHourAgo
    );
  }

  private async updateCurrentPrice(eventId: number, newPrice: number) {
    const db = this.databaseService.getDb();
    
    await db
      .update(events)
      .set({
        currentPrice: newPrice.toString(),
        updatedAt: new Date(),
      })
      .where(eq(events.id, eventId));
  }
}
