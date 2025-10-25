import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Users, DollarSign, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { format, isAfter } from 'date-fns';
// import { apiClient } from '@/lib/api';
import { apiClient } from '../../../src/lib/api';
import { EventWithPricing } from '@/types';
import { BookingForm } from './booking-form';

interface EventPageProps {
  params: {
    id: string;
  };
}

async function EventDetails({ eventId }: { eventId: number }) {
  try {
    const event = await apiClient.getEvent(eventId);
    return <EventDetailContent event={event} />;
  } catch (error) {
    notFound();
  }
}

function EventDetailContent({ event }: { event: EventWithPricing }) {
  const eventDate = new Date(event.eventDate);
  const isUpcoming = isAfter(eventDate, new Date());
  const remainingTickets = event.totalTickets - event.bookedTickets;
  const occupancyRate = event.totalTickets > 0 ? (event.bookedTickets / event.totalTickets) * 100 : 0;
  const pricing = event.pricingBreakdown;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/events"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Event Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-start mb-6">
                <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isUpcoming ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {isUpcoming ? 'Upcoming' : 'Past Event'}
                </span>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-3" />
                  <span className="text-lg">{format(eventDate, 'EEEE, MMMM dd, yyyy • h:mm a')}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-3" />
                  <span className="text-lg">{event.venue}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <Users className="h-5 w-5 mr-3" />
                  <span className="text-lg">
                    {remainingTickets} of {event.totalTickets} tickets remaining
                  </span>
                </div>
              </div>

              {event.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{event.description}</p>
                </div>
              )}

              {/* Pricing Breakdown */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Breakdown</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Base Price</span>
                    <span className="font-medium">${pricing.basePrice.toFixed(2)}</span>
                  </div>

                  {pricing.adjustments.timeBased.enabled && pricing.adjustments.timeBased.adjustment > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-blue-600" />
                        <span className="text-gray-600">Time-based adjustment</span>
                      </div>
                      <span className="font-medium text-blue-600">
                        +{pricing.adjustments.timeBased.adjustment * 100}%
                      </span>
                    </div>
                  )}

                  {pricing.adjustments.demandBased.enabled && pricing.adjustments.demandBased.adjustment > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2 text-orange-600" />
                        <span className="text-gray-600">Demand-based adjustment</span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({pricing.adjustments.demandBased.recentBookings} recent bookings)
                        </span>
                      </div>
                      <span className="font-medium text-orange-600">
                        +{pricing.adjustments.demandBased.adjustment * 100}%
                      </span>
                    </div>
                  )}

                  {pricing.adjustments.inventoryBased.enabled && pricing.adjustments.inventoryBased.adjustment > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
                        <span className="text-gray-600">Inventory-based adjustment</span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({pricing.adjustments.inventoryBased.remainingPercentage.toFixed(0)}% remaining)
                        </span>
                      </div>
                      <span className="font-medium text-red-600">
                        +{pricing.adjustments.inventoryBased.adjustment * 100}%
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-2 font-bold text-lg">
                    <span>Current Price</span>
                    <span className="text-green-600">${pricing.currentPrice.toFixed(2)}</span>
                  </div>
                </div>

                {pricing.respectsFloor && pricing.respectsCeiling && (
                  <p className="text-sm text-gray-500 mt-2">
                    Price is within the configured range of ${parseFloat(event.priceFloor).toFixed(2)} - ${parseFloat(event.priceCeiling).toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Book Tickets</h3>
              
              {isUpcoming ? (
                <BookingForm event={event} />
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">This event has already passed</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EventPage({ params }: EventPageProps) {
  const eventId = parseInt(params.id);

  if (isNaN(eventId)) {
    notFound();
  }

  return (
    <Suspense fallback={<EventLoadingSkeleton />}>
      <EventDetails eventId={eventId} />
    </Suspense>
  );
}

function EventLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="h-8 bg-gray-200 rounded mb-6"></div>
                <div className="space-y-4 mb-6">
                  <div className="h-5 bg-gray-200 rounded"></div>
                  <div className="h-5 bg-gray-200 rounded"></div>
                  <div className="h-5 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-4">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
