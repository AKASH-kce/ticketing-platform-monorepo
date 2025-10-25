import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database/database.service';
import { events, bookings } from '@repo/database';
import { eq } from 'drizzle-orm';

describe('Concurrent Bookings (e2e)', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;
  let testEventId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    databaseService = moduleFixture.get<DatabaseService>(DatabaseService);
  });

  beforeEach(async () => {
    // Create a test event with only 1 ticket remaining
    const db = databaseService.getDb();
    
    const [testEvent] = await db
      .insert(events)
      .values({
        name: 'Concurrency Test Event',
        description: 'Test event for concurrency testing',
        venue: 'Test Venue',
        eventDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        totalTickets: 1,
        bookedTickets: 0,
        basePrice: '100.00',
        currentPrice: '100.00',
        priceFloor: '50.00',
        priceCeiling: '200.00',
        pricingRules: {
          timeBased: { enabled: false, weight: 0, rules: [] },
          demandBased: { enabled: false, weight: 0, threshold: 0, multiplier: 0 },
          inventoryBased: { enabled: false, weight: 0, threshold: 0, multiplier: 0 },
        },
        isActive: true,
      })
      .returning();

    testEventId = testEvent.id;
  });

  afterEach(async () => {
    // Clean up test data
    const db = databaseService.getDb();
    await db.delete(bookings).where(eq(bookings.eventId, testEventId));
    await db.delete(events).where(eq(events.id, testEventId));
  });

  afterAll(async () => {
    await app.close();
  });

  it('prevents overbooking of last ticket', async () => {
    const bookingRequests = [
      request(app.getHttpServer())
        .post('/bookings')
        .send({
          eventId: testEventId,
          userEmail: 'user1@test.com',
          quantity: 1,
        }),
      request(app.getHttpServer())
        .post('/bookings')
        .send({
          eventId: testEventId,
          userEmail: 'user2@test.com',
          quantity: 1,
        }),
    ];

    // Execute both requests simultaneously
    const responses = await Promise.allSettled(bookingRequests);

    // Check that exactly one request succeeded and one failed
    const successfulBookings = responses.filter(
      (response) => response.status === 'fulfilled' && response.value.status === 201
    );
    const failedBookings = responses.filter(
      (response) => response.status === 'fulfilled' && response.value.status !== 201
    );

    expect(successfulBookings).toHaveLength(1);
    expect(failedBookings).toHaveLength(1);

    // Verify that only one booking was actually created
    const db = databaseService.getDb();
    const createdBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.eventId, testEventId));

    expect(createdBookings).toHaveLength(1);

    // Verify that the event's booked tickets count is correct
    const [updatedEvent] = await db
      .select()
      .from(events)
      .where(eq(events.id, testEventId))
      .limit(1);

    expect(updatedEvent.bookedTickets).toBe(1);
  });

  it('handles multiple concurrent bookings for different quantities', async () => {
    // Create an event with 3 tickets
    const db = databaseService.getDb();
    
    await db
      .update(events)
      .set({ totalTickets: 3 })
      .where(eq(events.id, testEventId));

    const bookingRequests = [
      request(app.getHttpServer())
        .post('/bookings')
        .send({
          eventId: testEventId,
          userEmail: 'user1@test.com',
          quantity: 2,
        }),
      request(app.getHttpServer())
        .post('/bookings')
        .send({
          eventId: testEventId,
          userEmail: 'user2@test.com',
          quantity: 2,
        }),
    ];

    const responses = await Promise.allSettled(bookingRequests);

    // One should succeed (2 tickets), one should fail (would exceed capacity)
    const successfulBookings = responses.filter(
      (response) => response.status === 'fulfilled' && response.value.status === 201
    );
    const failedBookings = responses.filter(
      (response) => response.status === 'fulfilled' && response.value.status !== 201
    );

    expect(successfulBookings).toHaveLength(1);
    expect(failedBookings).toHaveLength(1);

    // Verify total booked tickets doesn't exceed capacity
    const [updatedEvent] = await db
      .select()
      .from(events)
      .where(eq(events.id, testEventId))
      .limit(1);

    expect(updatedEvent.bookedTickets).toBeLessThanOrEqual(3);
  });
});
