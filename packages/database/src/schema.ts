import { pgTable, serial, varchar, text, timestamp, integer, decimal, jsonb, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Events table
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  venue: varchar('venue', { length: 255 }).notNull(),
  eventDate: timestamp('event_date', { withTimezone: true }).notNull(),
  totalTickets: integer('total_tickets').notNull().default(0),
  bookedTickets: integer('booked_tickets').notNull().default(0),
  basePrice: decimal('base_price', { precision: 10, scale: 2 }).notNull(),
  currentPrice: decimal('current_price', { precision: 10, scale: 2 }).notNull(),
  priceFloor: decimal('price_floor', { precision: 10, scale: 2 }).notNull(),
  priceCeiling: decimal('price_ceiling', { precision: 10, scale: 2 }).notNull(),
  pricingRules: jsonb('pricing_rules').notNull().$type<{
    timeBased: {
      enabled: boolean;
      weight: number;
      rules: Array<{
        daysBefore: number;
        multiplier: number;
      }>;
    };
    demandBased: {
      enabled: boolean;
      weight: number;
      threshold: number; // bookings per hour
      multiplier: number;
    };
    inventoryBased: {
      enabled: boolean;
      weight: number;
      threshold: number; // percentage of remaining tickets
      multiplier: number;
    };
  }>(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Bookings table
export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => events.id),
  userEmail: varchar('user_email', { length: 255 }).notNull(),
  quantity: integer('quantity').notNull(),
  pricePaid: decimal('price_paid', { precision: 10, scale: 2 }).notNull(),
  bookingReference: varchar('booking_reference', { length: 50 }).notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Relations
export const eventsRelations = relations(events, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  event: one(events, {
    fields: [bookings.eventId],
    references: [events.id],
  }),
}));

// Types for TypeScript
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type PricingRules = Event['pricingRules'];
