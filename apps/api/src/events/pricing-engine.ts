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
    threshold: number;
    multiplier: number;
  };
  inventoryBased: {
    enabled: boolean;
    weight: number;
    threshold: number;
    multiplier: number;
  };
}

export class PricingEngine {
  /**
   * Calculate the current price for an event based on all pricing rules
   */
  static calculatePrice(
    event: EventData,
    recentBookings: BookingData[] = []
  ): PriceCalculationResult {
    const basePrice = event.basePrice;
    const rules = event.pricingRules;

    // Calculate time-based adjustment
    const timeBasedAdjustment = this.calculateTimeBasedAdjustment(event, rules);
    
    // Calculate demand-based adjustment
    const demandBasedAdjustment = this.calculateDemandBasedAdjustment(
      event,
      recentBookings,
      rules
    );
    
    // Calculate inventory-based adjustment
    const inventoryBasedAdjustment = this.calculateInventoryBasedAdjustment(event, rules);

    // Calculate weighted total adjustment
    const totalAdjustment = 
      (timeBasedAdjustment * rules.timeBased.weight) +
      (demandBasedAdjustment * rules.demandBased.weight) +
      (inventoryBasedAdjustment * rules.inventoryBased.weight);

    // Calculate final price
    const calculatedPrice = basePrice * (1 + totalAdjustment);
    
    // Apply floor and ceiling constraints
    const finalPrice = Math.max(
      event.priceFloor,
      Math.min(calculatedPrice, event.priceCeiling)
    );

    const finalAdjustment = (finalPrice - basePrice) / basePrice;

    return {
      basePrice,
      currentPrice: finalPrice,
      adjustments: {
        timeBased: {
          enabled: rules.timeBased.enabled,
          adjustment: timeBasedAdjustment,
          multiplier: timeBasedAdjustment,
        },
        demandBased: {
          enabled: rules.demandBased.enabled,
          adjustment: demandBasedAdjustment,
          multiplier: demandBasedAdjustment,
          recentBookings: recentBookings.length,
        },
        inventoryBased: {
          enabled: rules.inventoryBased.enabled,
          adjustment: inventoryBasedAdjustment,
          multiplier: inventoryBasedAdjustment,
          remainingPercentage: this.getRemainingPercentage(event),
        },
      },
      finalAdjustment,
      respectsFloor: calculatedPrice >= event.priceFloor,
      respectsCeiling: calculatedPrice <= event.priceCeiling,
    };
  }

  /**
   * Calculate time-based price adjustment
   */
  private static calculateTimeBasedAdjustment(
    event: EventData,
    rules: PricingRules
  ): number {
    if (!rules.timeBased.enabled) {
      return 0;
    }

    const now = new Date();
    const eventDate = new Date(event.eventDate);
    const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Find the applicable rule (highest multiplier for current days until event)
    let applicableMultiplier = 0;
    
    for (const rule of rules.timeBased.rules) {
      if (daysUntilEvent <= rule.daysBefore) {
        applicableMultiplier = Math.max(applicableMultiplier, rule.multiplier);
      }
    }

    return applicableMultiplier;
  }

  /**
   * Calculate demand-based price adjustment
   */
  private static calculateDemandBasedAdjustment(
    event: EventData,
    recentBookings: BookingData[],
    rules: PricingRules
  ): number {
    if (!rules.demandBased.enabled) {
      return 0;
    }

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Count bookings in the last hour for this event
    const recentBookingsCount = recentBookings.filter(
      booking => 
        booking.eventId === event.id && 
        new Date(booking.createdAt) >= oneHourAgo
    ).length;

    // Apply multiplier if threshold is exceeded
    if (recentBookingsCount >= rules.demandBased.threshold) {
      return rules.demandBased.multiplier;
    }

    return 0;
  }

  /**
   * Calculate inventory-based price adjustment
   */
  private static calculateInventoryBasedAdjustment(
    event: EventData,
    rules: PricingRules
  ): number {
    if (!rules.inventoryBased.enabled) {
      return 0;
    }

    const remainingPercentage = this.getRemainingPercentage(event);

    // Apply multiplier if remaining tickets are below threshold
    if (remainingPercentage <= rules.inventoryBased.threshold) {
      return rules.inventoryBased.multiplier;
    }

    return 0;
  }

  /**
   * Get the percentage of tickets remaining
   */
  private static getRemainingPercentage(event: EventData): number {
    if (event.totalTickets === 0) return 0;
    return ((event.totalTickets - event.bookedTickets) / event.totalTickets) * 100;
  }

  /**
   * Get default pricing rules
   */
  static getDefaultPricingRules(): PricingRules {
    return {
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
  }
}
