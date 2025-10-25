'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, Users, AlertCircle, CheckCircle } from 'lucide-react';
// import { apiClient } from '@/lib/api';
import { apiClient } from '../../../src/lib/api';
import { EventWithPricing } from '@/types';

interface BookingFormProps {
  event: EventWithPricing;
}

export function BookingForm({ event }: BookingFormProps) {
  const [email, setEmail] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const remainingTickets = event.totalTickets - event.bookedTickets;
  const maxQuantity = Math.min(remainingTickets, 10); 
  const totalPrice = parseFloat(event.currentPrice) * quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const booking = await apiClient.createBooking({
        eventId: event.id,
        userEmail: email,
        quantity,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push(`/bookings/success?ref=${booking.bookingReference}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking Successful!</h3>
        <p className="text-gray-600">Redirecting to confirmation...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
          Number of Tickets
        </label>
        <select
          id="quantity"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((num) => (
            <option key={num} value={num}>
              {num} ticket{num > 1 ? 's' : ''}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          {remainingTickets} tickets remaining
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Price per ticket</span>
          <span className="font-medium">${parseFloat(event.currentPrice).toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Quantity</span>
          <span className="font-medium">{quantity}</span>
        </div>
        <div className="border-t border-gray-200 pt-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="text-xl font-bold text-green-600">${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
          <span className="text-sm text-red-600">{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || remainingTickets === 0}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
        ) : remainingTickets === 0 ? (
          'Sold Out'
        ) : (
          `Book ${quantity} Ticket${quantity > 1 ? 's' : ''} - $${totalPrice.toFixed(2)}`
        )}
      </button>

      <div className="text-xs text-gray-500 text-center">
        <p>By booking, you agree to our terms and conditions.</p>
        <p>No actual payment is required for this demo.</p>
      </div>
    </form>
  );
}
