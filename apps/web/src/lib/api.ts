import { Event, EventWithPricing, Booking, CreateBookingRequest, EventAnalytics, SystemSummary } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Events
  async getEvents(): Promise<Event[]> {
    return this.request<Event[]>('/events');
  }

  async getEvent(id: number): Promise<EventWithPricing> {
    return this.request<EventWithPricing>(`/events/${id}`);
  }
  
async createEvent(eventData: any): Promise<Event> {
  return this.request<Event>('/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', 
      'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || 'dev-api-key-123',
    },
    body: JSON.stringify(eventData),
  });
}

  // Bookings
  async createBooking(bookingData: CreateBookingRequest): Promise<Booking> {
    return this.request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getBookingsByEvent(eventId: number): Promise<Booking[]> {
    return this.request<Booking[]>(`/bookings?eventId=${eventId}`);
  }

  async getBookingsByUser(email: string): Promise<Booking[]> {
    return this.request<Booking[]>(`/bookings/user/${encodeURIComponent(email)}`);
  }

  async getBooking(id: number): Promise<Booking> {
    return this.request<Booking>(`/bookings/${id}`);
  }

  // Analytics
  async getEventAnalytics(eventId: number): Promise<EventAnalytics> {
    return this.request<EventAnalytics>(`/analytics/events/${eventId}`);
  }

  async getSystemSummary(): Promise<SystemSummary> {
    return this.request<SystemSummary>('/analytics/summary');
  }

  // Development
  async seedDatabase(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/dev/seed', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();
