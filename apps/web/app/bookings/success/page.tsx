import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Calendar, MapPin, Users, DollarSign, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
// import { apiClient } from '@/lib/api';
import { apiClient } from '../../../src/lib/api';

interface BookingSuccessPageProps {
  searchParams: {
    ref?: string;
  };
}

async function BookingSuccess({ bookingRef }: { bookingRef: string }) {
  try {
    return <BookingSuccessContent bookingRef={bookingRef} />;
  } catch (error) {
    notFound();
  }
}

function BookingSuccessContent({ bookingRef }: { bookingRef: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 mb-8">
            Your tickets have been successfully booked. You will receive a confirmation email shortly.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Booking Reference</span>
              <span className="font-mono text-sm font-medium">{bookingRef}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Status</span>
              <span className="text-green-600 font-medium">Confirmed</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Booking Date</span>
              <span>{format(new Date(), 'MMM dd, yyyy • h:mm a')}</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">What's Next?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Check your email for booking confirmation</li>
            <li>• Save your booking reference for future reference</li>
            <li>• Arrive at the venue 15 minutes before the event</li>
            <li>• Bring a valid ID for ticket verification</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link
            href="/my-bookings"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-center block"
          >
            View My Bookings
          </Link>
          
          <Link
            href="/events"
            className="w-full bg-white text-gray-700 py-3 px-4 rounded-md font-medium border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-center block"
          >
            <ArrowLeft className="h-4 w-4 inline mr-2" />
            Browse More Events
          </Link>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact us at support@ticketingplatform.com
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BookingSuccessPage({ searchParams }: BookingSuccessPageProps) {
  const bookingRef = searchParams.ref;

  if (!bookingRef) {
    notFound();
  }

  return (
    <Suspense fallback={<BookingSuccessLoadingSkeleton />}>
      <BookingSuccess bookingRef={bookingRef} />
    </Suspense>
  );
}

function BookingSuccessLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gray-200 rounded-full mb-6 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded mb-8 animate-pulse"></div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="h-6 bg-gray-200 rounded mb-4 animate-pulse"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
