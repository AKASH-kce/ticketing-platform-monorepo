# TicketFlow - Dynamic Event Ticketing Platform

A full-stack event ticketing platform with intelligent dynamic pricing that adjusts based on time until event, booking velocity, and remaining inventory.

## 🚀 Features

- **Dynamic Pricing Engine**: Prices automatically adjust based on:
  - Time until event (early bird discounts, last-minute premiums)
  - Booking velocity (popular events cost more)
  - Remaining inventory (scarcity drives prices up)
- **Concurrency Control**: Prevents overselling with database-level locking
- **Real-time Pricing**: Live price updates and breakdowns
- **Modern Tech Stack**: Next.js 15, NestJS, Drizzle ORM, PostgreSQL
- **Comprehensive Testing**: Unit tests, integration tests, and concurrency tests

## 🏗️ Architecture

This is a Turborepo monorepo with the following structure:

```
ticketing-platform-monorepo/
├── apps/
│   ├── api/                 # NestJS API server
│   └── web/                 # Next.js 15 frontend
├── packages/
│   ├── database/            # Drizzle ORM schema and client
│   ├── pricing-engine/      # Dynamic pricing logic
│   ├── ui/                  # Shared UI components
│   ├── eslint-config/       # Shared ESLint configuration
│   └── typescript-config/   # Shared TypeScript configuration
```

## 🛠️ Tech Stack

### Backend
- **NestJS** - Scalable Node.js framework
- **PostgreSQL** - Primary database
- **Drizzle ORM** - Type-safe database queries
- **TypeScript** - Type safety and developer experience

### Frontend
- **Next.js 15** - React framework with App Router
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **date-fns** - Date manipulation

### Development
- **Turborepo** - Monorepo build system
- **pnpm** - Fast package manager
- **Vitest** - Testing framework
- **Jest** - Additional testing for API

## 📋 Prerequisites

- Node.js 18+ 
- pnpm 8+
- PostgreSQL 15+
- Docker & Docker Compose (optional)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd ticketing-platform-monorepo
pnpm install
```

### 2. Database Setup

#### Option A: Using Docker (Recommended)
```bash
docker-compose up -d postgres
```

#### Option B: Local PostgreSQL
Create a database named `ticketing_platform` and update the connection string in your `.env` file.

### 3. Environment Configuration

```bash
cp env.example .env
```

Update the `.env` file with your database credentials:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ticketing_platform
PORT=3001
FRONTEND_URL=http://localhost:3000
API_KEY=dev-api-key-123
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_KEY=dev-api-key-123
```

### 4. Database Migration and Seeding

```bash
# Generate and run migrations
pnpm --filter @repo/database db:generate
pnpm --filter @repo/database db:push

# Seed the database with sample data
pnpm --filter @repo/database db:seed
```

### 5. Start Development Servers

```bash
# Start API server (Terminal 1)
pnpm --filter api dev

# Start web application (Terminal 2)
pnpm --filter web dev
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **Database Studio**: `pnpm --filter @repo/database db:studio`

## 🧪 Testing

### Run All Tests
```bash
pnpm test
```

### Run Specific Test Suites
```bash
# Pricing engine tests
pnpm --filter @repo/pricing-engine test

# API tests
pnpm --filter api test

# E2E tests
pnpm --filter api test:e2e
```

### Test Coverage
```bash
# Pricing engine coverage
pnpm --filter @repo/pricing-engine test:coverage

# API coverage
pnpm --filter api test:cov
```

## 📚 API Documentation

### Events
- `GET /events` - List all upcoming events with current pricing
- `GET /events/:id` - Get event details with pricing breakdown
- `POST /events` - Create new event (requires API key)

### Bookings
- `POST /bookings` - Create a new booking
- `GET /bookings?eventId=:id` - List bookings for an event
- `GET /bookings/user/:email` - List user's bookings
- `GET /bookings/:id` - Get specific booking details

### Analytics
- `GET /analytics/events/:id` - Get event analytics
- `GET /analytics/summary` - Get system-wide metrics

### Development
- `POST /dev/seed` - Seed database with sample data

## 🎯 Dynamic Pricing Rules

The pricing engine applies three types of adjustments:

### 1. Time-Based Pricing
- **30+ days**: Base price (no adjustment)
- **7-30 days**: +20% adjustment
- **1-7 days**: +50% adjustment
- **< 1 day**: +50% adjustment

### 2. Demand-Based Pricing
- Monitors bookings in the last hour
- If >10 bookings/hour: +15% adjustment
- Configurable threshold and multiplier

### 3. Inventory-Based Pricing
- Tracks remaining ticket percentage
- If <20% remaining: +25% adjustment
- Configurable threshold and multiplier

### Final Price Calculation
```
currentPrice = basePrice × (1 + weightedAdjustments)
```

Where weighted adjustments are:
- Time-based: 40% weight
- Demand-based: 30% weight  
- Inventory-based: 30% weight

## 🔒 Concurrency Control

The system prevents overselling through:

1. **Database Transactions**: All booking operations are atomic
2. **Row-Level Locking**: Events are locked during booking
3. **Inventory Validation**: Real-time availability checks
4. **Automated Testing**: Concurrency tests verify no overselling

## 🏃‍♂️ Development Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run linting
pnpm lint

# Type checking
pnpm type-check

# Clean all build artifacts
pnpm clean

# Run specific package commands
pnpm --filter <package-name> <command>
```

## 📁 Project Structure

```
apps/
├── api/                     # NestJS API
│   ├── src/
│   │   ├── events/         # Event management
│   │   ├── bookings/       # Booking system
│   │   ├── analytics/      # Analytics endpoints
│   │   ├── development/    # Dev utilities
│   │   └── database/       # Database service
│   └── test/               # E2E tests
└── web/                    # Next.js frontend
    ├── app/
    │   ├── events/         # Event pages
    │   ├── bookings/       # Booking pages
    │   └── my-bookings/    # User bookings
    └── src/
        ├── lib/            # API client
        └── types/          # TypeScript types

packages/
├── database/               # Drizzle ORM
│   ├── src/
│   │   ├── schema.ts      # Database schema
│   │   ├── index.ts       # Database client
│   │   └── seed.ts        # Sample data
├── pricing-engine/         # Dynamic pricing
│   ├── src/
│   │   ├── pricing-engine.ts
│   │   ├── types.ts
│   │   └── pricing-engine.test.ts
└── ui/                     # Shared components
```

## 🚀 Deployment

### Environment Variables
Ensure all required environment variables are set in production:

- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - API server port
- `FRONTEND_URL` - Frontend URL for CORS
- `API_KEY` - API authentication key
- `NEXT_PUBLIC_API_URL` - Public API URL
- `NEXT_PUBLIC_API_KEY` - Public API key

### Build for Production
```bash
# Build all packages
pnpm build

# Start production servers
pnpm --filter api start
pnpm --filter web start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

**Database Connection Error**
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env file
- Verify database exists

**Port Already in Use**
- Change PORT in .env file
- Kill existing processes on ports 3000/3001

**Migration Errors**
- Drop and recreate database
- Run `pnpm --filter @repo/database db:push`

**Build Errors**
- Clear node_modules: `rm -rf node_modules && pnpm install`
- Clear build cache: `pnpm clean`

### Getting Help

- Check the [Design Document](./DESIGN.md) for technical details
- Review test files for usage examples
- Open an issue for bugs or feature requests