'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Users, DollarSign } from 'lucide-react';
import { format, isAfter } from 'date-fns';
import { apiClient } from '../../src/lib/api';
import { Event } from '@/types';

// Events List Component
function EventsList({ refreshKey }: { refreshKey: number }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const eventsData = await apiClient.getEvents();
        console.log("events................", eventsData);

        setEvents(eventsData);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [refreshKey]);

  if (loading) return <EventsLoadingSkeleton />;

  if (events.length === 0)
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Events Available</h2>
        <p className="text-gray-600">Check back later for upcoming events!</p>
      </div>
    );

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

// Event Card Component
function EventCard({ event }: { event: Event }) {
  const eventDate = new Date(event.eventDate);
  const isUpcoming = isAfter(eventDate, new Date());
  const remainingTickets = event.totalTickets - event.bookedTickets;
  const occupancyRate = event.totalTickets > 0 ? (event.bookedTickets / event.totalTickets) * 100 : 0;

  return (
    <Link href={`/events/${event.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">{event.name}</h3>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              isUpcoming ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}
          >
            {isUpcoming ? 'Upcoming' : 'Past'}
          </span>
        </div>
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{format(eventDate, 'MMM dd, yyyy • h:mm a')}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="line-clamp-1">{event.venue}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            <span>{remainingTickets} tickets remaining</span>
          </div>
        </div>
        {event.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
        )}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">
              ${parseFloat(event.currentPrice).toFixed(2)}
            </span>
            {parseFloat(event.currentPrice) !== parseFloat(event.basePrice) && (
              <span className="text-sm text-gray-500 line-through">
                ${parseFloat(event.basePrice).toFixed(2)}
              </span>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">{occupancyRate.toFixed(0)}% sold</div>
            <div className="w-20 bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${occupancyRate}%` }} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Skeleton Loader
function EventsLoadingSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3 mb-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="flex justify-between items-center">
            <div className="h-8 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Create Event Form
function CreateEventForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [venue, setVenue] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [priceFloor, setPriceFloor] = useState('');
  const [priceCeiling, setPriceCeiling] = useState('');
  const [totalTickets, setTotalTickets] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!name.trim() || !venue.trim() || !eventDate.trim()) {
        alert('Please fill all required fields');
        setLoading(false);
        return;
      }
      if (
        !basePrice.trim() ||
        isNaN(Number(basePrice)) ||
        !priceFloor.trim() ||
        isNaN(Number(priceFloor)) ||
        !priceCeiling.trim() ||
        isNaN(Number(priceCeiling)) ||
        !totalTickets.trim() ||
        isNaN(Number(totalTickets))
      ) {
        alert('Please enter valid numbers for pricing and tickets');
        setLoading(false);
        return;
      }

      const bp = Number(basePrice);
      const pf = Number(priceFloor);
      const pc = Number(priceCeiling);
      const tt = Number(totalTickets);

      if (pc < pf) {
        alert('Price Ceiling cannot be less than Price Floor');
        setLoading(false);
        return;
      }
      if (pc < bp) {
        alert('Price Ceiling cannot be less than Base Price');
        setLoading(false);
        return;
      }

      const isoDate = new Date(eventDate).toISOString();

      // Correct payload for backend
      const payload = {
        name: name.trim(),
        venue: venue.trim(),
        description: description.trim() || 'No description provided',
        eventDate: isoDate,
        totalTickets: tt,
        basePrice: bp,
        priceFloor: pf,
        priceCeiling: pc,
        pricingRules: {
          timeBased: {},
          demandBased: {},
          inventoryBased: {},
        },
        isActive: true,
      };

      console.log('📦 Sending payload:', payload);

      await apiClient.createEvent(payload);

      alert('✅ Event created successfully!');
      onSuccess();

      // Reset form
      setName('');
      setVenue('');
      setDescription('');
      setEventDate('');
      setBasePrice('');
      setPriceFloor('');
      setPriceCeiling('');
      setTotalTickets('');
    } catch (err: any) {
      console.error('❌ API Error:', err);
      alert(err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Event Name *</label>
          <input
            type="text"
            placeholder="Event Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Venue *</label>
          <input
            type="text"
            placeholder="Venue"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Event Date *</label>
          <input
            type="datetime-local"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Base Price *</label>
          <input
            type="text"
            placeholder="Base Price"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price Floor *</label>
          <input
            type="text"
            placeholder="Price Floor"
            value={priceFloor}
            onChange={(e) => setPriceFloor(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price Ceiling *</label>
          <input
            type="text"
            placeholder="Price Ceiling"
            value={priceCeiling}
            onChange={(e) => setPriceCeiling(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Tickets *</label>
          <input
            type="text"
            placeholder="Total Tickets"
            value={totalTickets}
            onChange={(e) => setTotalTickets(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 rounded w-full"
            rows={3}
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:bg-gray-400"
        disabled={loading}
      >
        {loading ? 'Creating...' : 'Create Event'}
      </button>
    </form>
  );
}

// Main Events Page
export default function EventsPage() {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Upcoming Events</h1>
            <p className="mt-2 text-gray-600">
              Discover amazing events with dynamic pricing based on demand and availability
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {showForm ? 'Cancel' : 'Create Event'}
          </button>
        </div>

        {showForm && (
          <CreateEventForm
            onSuccess={() => {
              setShowForm(false);
              setRefreshKey((prev) => prev + 1);
            }}
          />
        )}

        <EventsList refreshKey={refreshKey} />
      </div>
    </div>
  );
}
