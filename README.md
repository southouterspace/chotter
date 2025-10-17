# Chotter

**AI-powered field service SaaS platform**

Eliminate wasted drive time and missed appointments for mobile service businesses through AI-powered scheduling, automatic route optimization, and intelligent customer communication.

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) >= 1.0.0
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Node.js](https://nodejs.org) >= 20.0.0 (for some tooling)

### Installation

```bash
# Install dependencies
bun install

# Start Supabase locally
cd supabase && supabase start

# Generate TypeScript types from database
bun run db:generate-types

# Start development servers
bun run dev
```

## 📁 Project Structure

```
chotter/
├── apps/                    # Applications
│   ├── web-admin/          # Admin Dashboard (React + Vite)
│   ├── web-customer/       # Customer Portal (React + Vite)
│   ├── mobile-tech/        # Technician App (Expo)
│   └── api/                # API Server (Hono + Bun)
├── packages/               # Shared packages
│   ├── database/           # Supabase types and client
│   ├── ui/                 # Shared React components
│   ├── utils/              # Shared utilities
│   └── config/             # Shared configurations
├── workers/                # Background workers
│   ├── route-optimizer/    # Route optimization (Bun)
│   └── notifications/      # Notification sender (Bun)
├── supabase/               # Database migrations and config
├── infrastructure/         # Deployment configs
└── ref/                    # Reference documentation
```

## 🛠️ Tech Stack

- **Runtime:** Bun
- **Database:** Supabase (PostgreSQL + PostGIS)
- **API:** Hono
- **Web Apps:** React + Vite
- **Mobile:** Expo (React Native)
- **Deployment:** Vercel (web) + Railway (API)
- **Payments:** Stripe Connect Express + Stripe Billing
- **AI:** ElevenLabs + Anthropic Claude
- **Communications:** Twilio + Resend

## 📜 Available Scripts

### Development

```bash
bun run dev              # Start all apps
bun run dev:admin        # Start admin dashboard
bun run dev:customer     # Start customer portal
bun run dev:mobile       # Start mobile app
bun run dev:api          # Start API server
```

### Database

```bash
bun run db:migrate       # Apply migrations
bun run db:reset         # Reset database
bun run db:generate-types # Generate TypeScript types
bun run db:seed          # Seed database
```

### Testing

```bash
bun test                 # Run all tests
bun test:watch           # Run tests in watch mode
```

### Code Quality

```bash
bun run lint             # Lint all code
bun run lint:fix         # Fix linting issues
bun run format           # Format all code
bun run format:check     # Check formatting
bun run type-check       # TypeScript type checking
```

### Build

```bash
bun run build            # Build all apps and packages
```

## 📚 Documentation

- [Development Plan](ref/chotter-dev-plan.md) - Detailed task breakdown
- [Product Requirements](ref/chotter-prd.md) - Complete product spec
- [Data Taxonomy](ref/chotter-taxonomy.md) - Database schema
- [Reference Docs](ref/README.md) - Documentation index

## 🎯 Core Features

- **AI Booking Agent:** 24/7 voice/SMS/web booking with ElevenLabs
- **Route Optimization:** Automatic daily route optimization
- **Real-time Tracking:** Live technician location tracking
- **Multi-tenant:** Full SaaS architecture with subscription billing
- **Payment Processing:** Stripe Connect for customer payments
- **Mobile App:** Native iOS/Android app for technicians

## 🏗️ Development Phases

1. **Phase 0:** Monorepo & Infrastructure Setup
2. **Phase 1:** Foundation (Database, Auth, Shared Packages)
3. **Phase 2:** Admin Dashboard
4. **Phase 3:** Technician Mobile App
5. **Phase 4:** AI Booking Agent
6. **Phase 5:** Route Optimization & Error Handling
7. **Phase 6:** Customer Portal & Notifications
8. **Phase 7:** Payment Integration
9. **Phase 8:** Subscription Billing
10. **Phase 9:** Testing & Launch

## 🤝 Contributing

This project is built with Claude Code. See the [Development Plan](ref/chotter-dev-plan.md) for detailed task execution.

## 📄 License

MIT

## 🔗 Links

- [Product Demo](#) (Coming soon)
- [Documentation](#) (Coming soon)
- [API Docs](#) (Coming soon)

---

**Built with ❤️ and Claude Code**
