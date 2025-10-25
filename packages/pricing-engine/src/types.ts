export interface PricingRules {
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
}

export interface EventData {
  id: number;
  eventDate: Date;
  totalTickets: number;
  bookedTickets: number;
  basePrice: number;
  priceFloor: number;
  priceCeiling: number;
  pricingRules: PricingRules;
}

export interface BookingData {
  eventId: number;
  createdAt: Date;
}

export interface PriceCalculationResult {
  basePrice: number;
  currentPrice: number;
  adjustments: {
    timeBased: {
      enabled: boolean;
      adjustment: number;
      multiplier: number;
    };
    demandBased: {
      enabled: boolean;
      adjustment: number;
      multiplier: number;
      recentBookings: number;
    };
    inventoryBased: {
      enabled: boolean;
      adjustment: number;
      multiplier: number;
      remainingPercentage: number;
    };
  };
  finalAdjustment: number;
  respectsFloor: boolean;
  respectsCeiling: boolean;
}
