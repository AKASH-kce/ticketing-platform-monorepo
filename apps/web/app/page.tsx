import Link from 'next/link';
import { Calendar, TrendingUp, Users, DollarSign } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                TicketFlow
              </Link>
            </div>
            <div className="flex items-center space-x-8">
              <Link
                href="/events"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Events
              </Link>
              <Link
                href="/my-bookings"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                My Bookings
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Smart Event Ticketing
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Experience dynamic pricing that adapts to demand, time, and availability. 
            Get the best deals on tickets for amazing events.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/events"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Browse Events
            </Link>
            <Link
              href="/my-bookings"
              className="bg-white text-gray-700 px-8 py-3 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              View My Bookings
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How Dynamic Pricing Works
          </h2>
          <p className="text-lg text-gray-600">
            Our intelligent pricing system adjusts ticket prices based on multiple factors
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Time-Based Pricing</h3>
            <p className="text-gray-600">
              Prices increase as the event date approaches. Book early for the best deals!
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Demand-Based Pricing</h3>
            <p className="text-gray-600">
              High booking velocity triggers price increases. Popular events cost more!
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Inventory-Based Pricing</h3>
            <p className="text-gray-600">
              Limited remaining tickets drive prices up. Don't wait too long!
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Discover amazing events with our intelligent pricing system
          </p>
          <Link
            href="/events"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
          >
            Explore Events Now
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">TicketFlow</h3>
            <p className="text-gray-400 mb-6">
              Smart event ticketing with dynamic pricing
            </p>
            <div className="flex justify-center space-x-8">
              <Link href="/events" className="text-gray-400 hover:text-white">
                Events
              </Link>
              <Link href="/my-bookings" className="text-gray-400 hover:text-white">
                My Bookings
              </Link>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800">
              <p className="text-gray-400 text-sm">
                © 2024 TicketFlow. Built with Next.js, NestJS, and Drizzle ORM.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}