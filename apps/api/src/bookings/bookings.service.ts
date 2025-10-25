import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { EventsService } from '../events/events.service';
import { PricingService } from '../events/pricing.service';
import { bookings, events, type Booking, type NewBooking } from '../database/schema';
import { eq, and } from 'drizzle-orm';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly eventsService: EventsService,
    private readonly pricingService: PricingService,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    const db = this.databaseService.getDb();
    
    // Start a transaction to ensure atomicity
    return await db.transaction(async (tx: any) => {
      // Lock the event row for update to prevent race conditions
      const [event] = await tx
        .select()
        .from(events)
        .where(eq(events.id, createBookingDto.eventId))
        .for('update')
        .limit(1);

      if (!event) {
        throw new NotFoundException(`Event with ID ${createBookingDto.eventId} not found`);
      }

      // Check if event is still active and in the future
      if (!event.isActive) {
        throw new BadRequestException('Event is no longer active');
      }

      if (new Date(event.eventDate) <= new Date()) {
        throw new BadRequestException('Event has already passed');
      }

      // Check if there are enough tickets available
      const availableTickets = event.totalTickets - event.bookedTickets;
      if (availableTickets < createBookingDto.quantity) {
        throw new BadRequestException(
          `Not enough tickets available. Requested: ${createBookingDto.quantity}, Available: ${availableTickets}`
        );
      }

      // Calculate current price
      const currentPrice = await this.pricingService.calculateCurrentPrice(event.id);
      const totalPrice = currentPrice * createBookingDto.quantity;

      // Generate unique booking reference
      const bookingReference = this.generateBookingReference();

      // Create the booking
      const newBooking: NewBooking = {
        eventId: createBookingDto.eventId,
        userEmail: createBookingDto.userEmail,
        quantity: createBookingDto.quantity,
        pricePaid: totalPrice.toString(),
        bookingReference,
      };

      const [createdBooking] = await tx
        .insert(bookings)
        .values(newBooking)
        .returning();

      // Update the event's booked tickets count
      await tx
        .update(events)
        .set({
          bookedTickets: event.bookedTickets + createBookingDto.quantity,
          updatedAt: new Date(),
        })
        .where(eq(events.id, createBookingDto.eventId));

      return createdBooking;
    });
  }

  async findByEventId(eventId: number): Promise<Booking[]> {
    const db = this.databaseService.getDb();
    
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.eventId, eventId))
      .orderBy(bookings.createdAt);
  }

  async findByUserEmail(userEmail: string): Promise<Booking[]> {
    const db = this.databaseService.getDb();
    
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.userEmail, userEmail))
      .orderBy(bookings.createdAt);
  }

  async findOne(id: number): Promise<Booking> {
    const db = this.databaseService.getDb();
    
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id))
      .limit(1);

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  private generateBookingReference(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `BK${timestamp}${random}`.toUpperCase();
  }
}
