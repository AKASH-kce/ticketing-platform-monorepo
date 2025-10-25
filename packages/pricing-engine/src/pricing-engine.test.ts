import { describe, it, expect, beforeEach } from 'vitest';
import { PricingEngine } from './pricing-engine';
import { EventData, BookingData, PricingRules } from './types';

describe('PricingEngine', () => {
  let baseEvent: EventData;
  let defaultRules: PricingRules;

  beforeEach(() => {
    defaultRules = PricingEngine.getDefaultPricingRules();
    
    baseEvent = {
      id: 1,
      eventDate: new Date('2024-12-31T20:00:00Z'),
      totalTickets: 100,
      bookedTickets: 0,
      basePrice: 100,
      priceFloor: 50,
      priceCeiling: 200,
      pricingRules: defaultRules,
    };
  });

  describe('Time-based pricing', () => {
    it('should apply no adjustment for events 30+ days away', () => {
      const event = {
        ...baseEvent,
        eventDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
      };

      const result = PricingEngine.calculatePrice(event);
      
      expect(result.adjustments.timeBased.adjustment).toBe(0);
      expect(result.currentPrice).toBe(100);
    });

    it('should apply 20% adjustment for events within 7 days', () => {
      const event = {
        ...baseEvent,
        eventDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      };

      const result = PricingEngine.calculatePrice(event);
      
      expect(result.adjustments.timeBased.adjustment).toBe(0.2);
      expect(result.currentPrice).toBe(100 * (1 + 0.2 * 0.4)); // Only time-based weight applied
    });

    it('should apply 50% adjustment for events tomorrow', () => {
      const event = {
        ...baseEvent,
        eventDate: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
      };

      const result = PricingEngine.calculatePrice(event);
      
      expect(result.adjustments.timeBased.adjustment).toBe(0.5);
      expect(result.currentPrice).toBe(100 * (1 + 0.5 * 0.4)); // Only time-based weight applied
    });

    it('should not apply time-based adjustment when disabled', () => {
      const event = {
        ...baseEvent,
        eventDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        pricingRules: {
          ...defaultRules,
          timeBased: { ...defaultRules.timeBased, enabled: false },
        },
      };

      const result = PricingEngine.calculatePrice(event);
      
      expect(result.adjustments.timeBased.adjustment).toBe(0);
      expect(result.currentPrice).toBe(100);
    });
  });

  describe('Demand-based pricing', () => {
    it('should apply adjustment when recent bookings exceed threshold', () => {
      const recentBookings: BookingData[] = Array(12).fill(null).map((_, i) => ({
        eventId: 1,
        createdAt: new Date(Date.now() - i * 5 * 60 * 1000), // Last hour
      }));

      const result = PricingEngine.calculatePrice(baseEvent, recentBookings);
      
      expect(result.adjustments.demandBased.adjustment).toBe(0.15);
      expect(result.adjustments.demandBased.recentBookings).toBe(12);
    });

    it('should not apply adjustment when recent bookings are below threshold', () => {
      const recentBookings: BookingData[] = Array(5).fill(null).map((_, i) => ({
        eventId: 1,
        createdAt: new Date(Date.now() - i * 5 * 60 * 1000), // Last hour
      }));

      const result = PricingEngine.calculatePrice(baseEvent, recentBookings);
      
      expect(result.adjustments.demandBased.adjustment).toBe(0);
      expect(result.adjustments.demandBased.recentBookings).toBe(5);
    });

    it('should not apply demand-based adjustment when disabled', () => {
      const event = {
        ...baseEvent,
        pricingRules: {
          ...defaultRules,
          demandBased: { ...defaultRules.demandBased, enabled: false },
        },
      };

      const recentBookings: BookingData[] = Array(15).fill(null).map((_, i) => ({
        eventId: 1,
        createdAt: new Date(Date.now() - i * 5 * 60 * 1000),
      }));

      const result = PricingEngine.calculatePrice(event, recentBookings);
      
      expect(result.adjustments.demandBased.adjustment).toBe(0);
    });
  });

  describe('Inventory-based pricing', () => {
    it('should apply adjustment when remaining tickets are below threshold', () => {
      const event = {
        ...baseEvent,
        totalTickets: 100,
        bookedTickets: 85, // 15% remaining (below 20% threshold)
      };

      const result = PricingEngine.calculatePrice(event);
      
      expect(result.adjustments.inventoryBased.adjustment).toBe(0.25);
      expect(result.adjustments.inventoryBased.remainingPercentage).toBe(15);
    });

    it('should not apply adjustment when remaining tickets are above threshold', () => {
      const event = {
        ...baseEvent,
        totalTickets: 100,
        bookedTickets: 70, // 30% remaining (above 20% threshold)
      };

      const result = PricingEngine.calculatePrice(event);
      
      expect(result.adjustments.inventoryBased.adjustment).toBe(0);
      expect(result.adjustments.inventoryBased.remainingPercentage).toBe(30);
    });

    it('should not apply inventory-based adjustment when disabled', () => {
      const event = {
        ...baseEvent,
        totalTickets: 100,
        bookedTickets: 85, // 15% remaining
        pricingRules: {
          ...defaultRules,
          inventoryBased: { ...defaultRules.inventoryBased, enabled: false },
        },
      };

      const result = PricingEngine.calculatePrice(event);
      
      expect(result.adjustments.inventoryBased.adjustment).toBe(0);
    });
  });

  describe('Combined pricing rules', () => {
    it('should combine all enabled rules with their weights', () => {
      const event = {
        ...baseEvent,
        eventDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        totalTickets: 100,
        bookedTickets: 85, // 15% remaining
      };

      const recentBookings: BookingData[] = Array(12).fill(null).map((_, i) => ({
        eventId: 1,
        createdAt: new Date(Date.now() - i * 5 * 60 * 1000),
      }));

      const result = PricingEngine.calculatePrice(event, recentBookings);
      
      // Time-based: 0.2 * 0.4 = 0.08
      // Demand-based: 0.15 * 0.3 = 0.045
      // Inventory-based: 0.25 * 0.3 = 0.075
      // Total: 0.08 + 0.045 + 0.075 = 0.2
      const expectedAdjustment = 0.2 * 0.4 + 0.15 * 0.3 + 0.25 * 0.3;
      const expectedPrice = 100 * (1 + expectedAdjustment);
      
      expect(result.finalAdjustment).toBeCloseTo(expectedAdjustment, 3);
      expect(result.currentPrice).toBeCloseTo(expectedPrice, 2);
    });
  });

  describe('Floor and ceiling constraints', () => {
    it('should respect price floor', () => {
      const event = {
        ...baseEvent,
        basePrice: 100,
        priceFloor: 150, // Floor higher than base price
        pricingRules: {
          ...defaultRules,
          timeBased: { ...defaultRules.timeBased, weight: 1 }, // Full weight to time-based
        },
      };

      const result = PricingEngine.calculatePrice(event);
      
      expect(result.currentPrice).toBe(150); // Should be capped at floor
      expect(result.respectsFloor).toBe(true);
    });

    it('should respect price ceiling', () => {
      const event = {
        ...baseEvent,
        basePrice: 100,
        priceCeiling: 120,
        pricingRules: {
          ...defaultRules,
          timeBased: { ...defaultRules.timeBased, weight: 1 }, // Full weight to time-based
        },
      };

      const result = PricingEngine.calculatePrice(event);
      
      expect(result.currentPrice).toBe(120); // Should be capped at ceiling
      expect(result.respectsCeiling).toBe(true);
    });

    it('should apply both floor and ceiling when needed', () => {
      const event = {
        ...baseEvent,
        basePrice: 100,
        priceFloor: 50,
        priceCeiling: 120,
        pricingRules: {
          ...defaultRules,
          timeBased: { ...defaultRules.timeBased, weight: 1 },
        },
      };

      const result = PricingEngine.calculatePrice(event);
      
      expect(result.currentPrice).toBeGreaterThanOrEqual(50);
      expect(result.currentPrice).toBeLessThanOrEqual(120);
    });
  });

  describe('Edge cases', () => {
    it('should handle zero total tickets', () => {
      const event = {
        ...baseEvent,
        totalTickets: 0,
        bookedTickets: 0,
      };

      const result = PricingEngine.calculatePrice(event);
      
      expect(result.adjustments.inventoryBased.remainingPercentage).toBe(0);
      expect(result.adjustments.inventoryBased.adjustment).toBe(0.25); // Should trigger inventory rule
    });

    it('should handle all tickets sold', () => {
      const event = {
        ...baseEvent,
        totalTickets: 100,
        bookedTickets: 100,
      };

      const result = PricingEngine.calculatePrice(event);
      
      expect(result.adjustments.inventoryBased.remainingPercentage).toBe(0);
      expect(result.adjustments.inventoryBased.adjustment).toBe(0.25);
    });

    it('should handle events in the past', () => {
      const event = {
        ...baseEvent,
        eventDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      };

      const result = PricingEngine.calculatePrice(event);
      
      // Should apply the highest time-based multiplier
      expect(result.adjustments.timeBased.adjustment).toBe(0.5);
    });
  });
});
