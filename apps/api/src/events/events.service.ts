import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { events, bookings, type Event, type NewEvent } from '../database/schema';
import { eq, desc, and, gte } from 'drizzle-orm';
import { CreateEventDto } from './dto/create-event.dto';
import { PricingService } from './pricing.service';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

@Injectable()
export class EventsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly pricingService: PricingService,
  ) {}

  // async findAll(): Promise<Event[]> {
//     const db = this.databaseService.getDb();
    
//     const allEvents = await db
//       .select()
//       .from(events)
//       .where(eq(events.isActive, true))
// .orderBy(desc(events.eventDate));


//     // Calculate current prices for all events
//     const eventsWithPrices = await Promise.all(
//       allEvents.map(async (event) => {
//         const currentPrice = await this.pricingService.calculateCurrentPrice(event.id);
//         return {
//           ...event,
//           currentPrice: currentPrice.toString(),
//         };
//       })
//     );

//     return eventsWithPrices;
//   }
async findAll(): Promise<Event[]> {
  const db = this.databaseService.getDb();

  const allEvents = await db
    .select()
    .from(events)
    .orderBy(desc(events.eventDate));

  return allEvents.map(e => ({
    ...e,
    basePrice: e.basePrice.toString(),
    currentPrice: e.currentPrice.toString(),
    priceFloor: e.priceFloor.toString(),
    priceCeiling: e.priceCeiling.toString(),
    pricingRules: typeof e.pricingRules === 'string' ? JSON.parse(e.pricingRules) : e.pricingRules,
  }));
}



  async findOne(id: number): Promise<Event> {
    const db = this.databaseService.getDb();
    
    const eventResult = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    if (!eventResult.length) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    const event = eventResult[0];
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const db = this.databaseService.getDb();
    
    const newEvent: NewEvent = {
      ...createEventDto,
      eventDate: new Date(createEventDto.eventDate),
      basePrice: createEventDto.basePrice.toString(),
      currentPrice: createEventDto.basePrice.toString(),
      priceFloor: createEventDto.priceFloor.toString(),
      priceCeiling: createEventDto.priceCeiling.toString(),
      bookedTickets: 0,
      isActive: createEventDto.isActive ?? true,
    };
   console.log(newEvent);
    const createdEventResult = await db
      .insert(events)
      .values(newEvent)
      .returning();

    if (!createdEventResult.length) {
      throw new Error('Failed to create event');
    }

    const createdEvent = createdEventResult[0];
    if (!createdEvent) {
      throw new Error('Failed to create event');
    }

    return createdEvent;
  }

  async getEventWithPricing(id: number) {
    const event = await this.findOne(id);
    const pricingBreakdown = await this.pricingService.getPricingBreakdown(id);
    
    return {
      ...event,
      pricingBreakdown,
    };
  }

  async updateBookedTickets(eventId: number, additionalTickets: number) {
    const db = this.databaseService.getDb();
    
    // Get current booked tickets count
    const [currentEvent] = await db
      .select({ bookedTickets: events.bookedTickets })
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!currentEvent) {
      throw new Error('Event not found');
    }

    await db
      .update(events)
      .set({
        bookedTickets: currentEvent.bookedTickets + additionalTickets,
        updatedAt: new Date(),
      })
      .where(eq(events.id, eventId));
  }
}
