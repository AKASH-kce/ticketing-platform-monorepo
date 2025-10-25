export interface Event {
  id: number;
  name: string;
  description?: string;
  venue: string;
  eventDate: string;
  totalTickets: number;
  bookedTickets: number;
  basePrice: string;
  currentPrice: string;
  priceFloor: string;
  priceCeiling: string;
  pricingRules: {
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
      threshold: number;
      multiplier: number;
    };
    inventoryBased: {
      enabled: boolean;
      weight: number;
      threshold: number;
      multiplier: number;
    };
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventWithPricing extends Event {
  pricingBreakdown: {
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
  };
}

export interface Booking {
  id: number;
  eventId: number;
  userEmail: string;
  quantity: number;
  pricePaid: string;
  bookingReference: string;
  createdAt: string;
}

export interface CreateBookingRequest {
  eventId: number;
  userEmail: string;
  quantity: number;
}

export interface EventAnalytics {
  event: {
    id: number;
    name: string;
    eventDate: string;
    venue: string;
    totalTickets: number;
    bookedTickets: number;
    remainingTickets: number;
    occupancyRate: number;
    basePrice: number;
    currentPrice: number;
    priceFloor: number;
    priceCeiling: number;
  };
  analytics: {
    totalBookings: number;
    totalTicketsSold: number;
    totalRevenue: number;
    averagePrice: number;
  };
}

export interface SystemSummary {
  events: {
    total: number;
    active: number;
    totalCapacity: number;
    totalBooked: number;
    remainingCapacity: number;
    occupancyRate: number;
  };
  bookings: {
    total: number;
    totalTicketsSold: number;
    totalRevenue: number;
    averagePrice: number;
  };
}
