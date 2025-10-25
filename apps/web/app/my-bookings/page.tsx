'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Users, DollarSign, ArrowLeft, Search, Mail } from 'lucide-react';
import { format, isAfter } from 'date-fns';
// import { apiClient } from '@/lib/api';
import { apiClient } from '../../src/lib/api';
import { Booking, Event } from '@/types';

export default function MyBookingsPage() {
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [events, setEvents] = useState<Map<number, Event>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const userBookings = await apiClient.getBookingsByUser(email);
      setBookings(userBookings);

      // Fetch event details for each booking
      const eventPromises = userBookings.map(booking => 
        apiClient.getEvent(booking.eventId).catch(() => null)
      );
      const eventResults = await Promise.all(eventPromises);
      
      const eventMap = new Map<number, Event>();
      eventResults.forEach((event, index) => {
        if (event) {
          eventMap.set(userBookings[index].eventId, event);
        }
      });
      setEvents(eventMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/events"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="mt-2 text-gray-600">
            Enter your email address to view your bookings
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="bg-blue-600 text-white py-2 px-6 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Searching...
                  </div>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2 inline" />
                    Search
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bookings List */}
        {hasSearched && !isLoading && (
          <>
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Found</h3>
                <p className="text-gray-600 mb-6">
                  No bookings found for {email}. Make sure you're using the correct email address.
                </p>
                <Link
                  href="/events"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Browse Events
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {bookings.length} Booking{bookings.length > 1 ? 's' : ''} Found
                  </h2>
                </div>

                <div className="grid gap-6">
                  {bookings.map((booking) => {
                    const event = events.get(booking.eventId);
                    if (!event) return null;

                    const eventDate = new Date(event.eventDate);
                    const isUpcoming = isAfter(eventDate, new Date());
                    const currentPrice = parseFloat(event.currentPrice);
                    const pricePaid = parseFloat(booking.pricePaid);
                    const priceDifference = currentPrice - pricePaid;

                    return (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        event={event}
                        isUpcoming={isUpcoming}
                        priceDifference={priceDifference}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function BookingCard({ 
  booking, 
  event, 
  isUpcoming, 
  priceDifference 
}: { 
  booking: Booking; 
  event: Event; 
  isUpcoming: boolean;
  priceDifference: number;
}) {
  const eventDate = new Date(event.eventDate);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{event.name}</h3>
          <p className="text-sm text-gray-600">Booking #{booking.bookingReference}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          isUpcoming ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {isUpcoming ? 'Upcoming' : 'Past Event'}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-3">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{format(eventDate, 'MMM dd, yyyy • h:mm a')}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{event.venue}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            <span>{booking.quantity} ticket{booking.quantity > 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-gray-600">
            <DollarSign className="h-4 w-4 mr-2" />
            <span>Paid: ${pricePaid.toFixed(2)} per ticket</span>
          </div>

          <div className="flex items-center text-gray-600">
            <span className="text-sm">Total: ${(pricePaid * booking.quantity).toFixed(2)}</span>
          </div>

          {priceDifference !== 0 && (
            <div className={`flex items-center text-sm ${
              priceDifference > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              <span>
                Current price: ${currentPrice.toFixed(2)} 
                ({priceDifference > 0 ? '+' : ''}{priceDifference.toFixed(2)})
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>Booked on {format(new Date(booking.createdAt), 'MMM dd, yyyy • h:mm a')}</span>
          {isUpcoming && (
            <Link
              href={`/events/${event.id}`}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View Event Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
