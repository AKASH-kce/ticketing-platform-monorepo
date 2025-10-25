import { db } from './index';
import { events, bookings } from './schema';
import { eq } from 'drizzle-orm';

const defaultPricingRules = {
  timeBased: {
    enabled: true,
    weight: 0.4,
    rules: [
      { daysBefore: 30, multiplier: 0 },
      { daysBefore: 7, multiplier: 0.2 },
      { daysBefore: 1, multiplier: 0.5 },
    ],
  },
  demandBased: {
    enabled: true,
    weight: 0.3,
    threshold: 10, // bookings per hour
    multiplier: 0.15,
  },
  inventoryBased: {
    enabled: true,
    weight: 0.3,
    threshold: 20, // percentage of remaining tickets
    multiplier: 0.25,
  },
};

const sampleEvents = [
  {
    name: 'Tech Conference 2024',
    description: 'Annual technology conference featuring the latest innovations in AI, blockchain, and cloud computing.',
    venue: 'Convention Center Downtown',
    eventDate: new Date('2024-12-15T09:00:00Z'),
    totalTickets: 500,
    bookedTickets: 0,
    basePrice: '150.00',
    currentPrice: '150.00',
    priceFloor: '100.00',
    priceCeiling: '300.00',
    pricingRules: defaultPricingRules,
  },
  {
    name: 'Music Festival Summer',
    description: 'Three-day outdoor music festival with top artists from around the world.',
    venue: 'Central Park Amphitheater',
    eventDate: new Date('2024-08-20T18:00:00Z'),
    totalTickets: 2000,
    bookedTickets: 0,
    basePrice: '75.00',
    currentPrice: '75.00',
    priceFloor: '50.00',
    priceCeiling: '150.00',
    pricingRules: defaultPricingRules,
  },
  {
    name: 'Startup Pitch Competition',
    description: 'Watch innovative startups pitch their ideas to a panel of investors.',
    venue: 'Innovation Hub',
    eventDate: new Date('2024-11-10T14:00:00Z'),
    totalTickets: 100,
    bookedTickets: 0,
    basePrice: '25.00',
    currentPrice: '25.00',
    priceFloor: '15.00',
    priceCeiling: '50.00',
    pricingRules: defaultPricingRules,
  },
  {
    name: 'Art Gallery Opening',
    description: 'Exclusive opening of the new contemporary art exhibition.',
    venue: 'Modern Art Museum',
    eventDate: new Date('2024-10-05T19:00:00Z'),
    totalTickets: 150,
    bookedTickets: 0,
    basePrice: '40.00',
    currentPrice: '40.00',
    priceFloor: '25.00',
    priceCeiling: '80.00',
    pricingRules: defaultPricingRules,
  },
  {
    name: 'Sports Championship Final',
    description: 'Championship game featuring the top two teams in the league.',
    venue: 'Stadium Arena',
    eventDate: new Date('2024-09-30T20:00:00Z'),
    totalTickets: 5000,
    bookedTickets: 0,
    basePrice: '120.00',
    currentPrice: '120.00',
    priceFloor: '80.00',
    priceCeiling: '250.00',
    pricingRules: defaultPricingRules,
  },
];

async function seed() {
  console.log(' Starting database seed...');

  try {
    // Clear existing data
    await db.delete(bookings);
    await db.delete(events);

    // Insert sample events
    const insertedEvents = await db.insert(events).values(sampleEvents).returning();
    console.log(` Inserted ${insertedEvents.length} events`);

    // Create some sample bookings for testing
    const sampleBookings = [
      {
        eventId: insertedEvents[0]?.id || 1,
        userEmail: 'john.doe@example.com',
        quantity: 2,
        pricePaid: '150.00',
        bookingReference: 'BK001',
      },
      {
        eventId: insertedEvents[0]?.id || 1,
        userEmail: 'jane.smith@example.com',
        quantity: 1,
        pricePaid: '150.00',
        bookingReference: 'BK002',
      },
      {
        eventId: insertedEvents[1]?.id || 2,
        userEmail: 'mike.wilson@example.com',
        quantity: 4,
        pricePaid: '75.00',
        bookingReference: 'BK003',
      },
    ];

    await db.insert(bookings).values(sampleBookings);
    console.log(`✅ Inserted ${sampleBookings.length} sample bookings`);

    // Update booked tickets count
    for (const event of insertedEvents) {
      const totalBooked = await db
        .select({ total: bookings.quantity })
        .from(bookings)
        .where(eq(bookings.eventId, event.id));

      const bookedCount = totalBooked.reduce((sum, booking) => sum + booking.total, 0);
      await db
        .update(events)
        .set({ bookedTickets: bookedCount })
        .where(eq(events.id, event.id));
    }

    console.log('🎉 Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seed().then(() => {
    process.exit(0);
  });
}

export { seed };
