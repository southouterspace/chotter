# Chotter - Architecture & Technical Specification

**Single Source of Truth**
Last Updated: 2025-10-22

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Repository Structure](#repository-structure)
3. [User Roles & Access](#user-roles--access)
4. [Application Architecture](#application-architecture)
5. [Tech Stack](#tech-stack)
6. [Data Architecture](#data-architecture)
7. [Authentication & Authorization](#authentication--authorization)
8. [Infrastructure & Deployment](#infrastructure--deployment)
9. [Development Workflow](#development-workflow)
10. [Third-Party Integrations](#third-party-integrations)

---

## Executive Summary

**What is Chotter?**
Chotter is a field service management platform designed for mobile technicians (HVAC, plumbing, automotive, etc.). It handles scheduling, routing, customer management, and real-time technician tracking.

**Who uses Chotter?**

1. **Platform Admins** (Chotter employees) - Manage the entire platform, all businesses, subscriptions
2. **Business Admins** - Business owners who manage their technicians, customers, schedules, and routes
3. **Technicians** - Field workers who use the mobile app to view routes, check in/out, and complete jobs
4. **Customers** - End users who book appointments, track technicians, and view service history

**Core Value Proposition:**
Streamline field service operations with intelligent routing, real-time tracking, and automated scheduling.

---

## Repository Structure

Chotter uses **3 separate repositories** (not a monorepo) for clear separation of concerns and independent deployment:

### 1. `chotter-marketing`
**Purpose:** Public-facing marketing website
**Domain:** `chotter.com`
**Audience:** Prospective customers (businesses looking to sign up)

**Key Features:**
- Homepage, features, pricing pages
- Blog/content (via Sanity CMS)
- Sign-up flow (creates Supabase account)
- Lead capture and contact forms
- SEO optimized, static-first

### 2. `chotter-platform`
**Purpose:** Authenticated web application
**Domain:** `app.chotter.com`
**Audience:** Platform Admins, Business Admins, Customers

**Key Features:**
- **Customer Views:** Book appointments, track technicians, view history, make payments
- **Admin Views:** Dashboard, scheduling, route management, customer/technician management, settings
- **Super Admin Views:** Platform management, all businesses, subscription/billing oversight

### 3. `chotter-mobile`
**Purpose:** Native mobile app for field technicians
**Platforms:** iOS (TestFlight/App Store), Android (Google Play)
**Audience:** Technicians in the field

**Key Features:**
- Daily route view
- Appointment details and navigation
- Check-in/check-out flow
- Real-time location tracking
- Offline support with background sync
- Push notifications

---

## User Roles & Access

### Role Hierarchy

| Role | Access Scope | Primary App | Description |
|------|-------------|-------------|-------------|
| **Customer** | Own records only | Platform Web | End users receiving services |
| **Technician** | Assigned appointments within business | Mobile App | Field workers performing services |
| **Admin** | Full business access | Platform Web | Business owners/managers |
| **Super Admin** | All businesses (platform-wide) | Platform Web | Chotter employees managing the platform |

### Access Patterns

**Customer:**
- View/edit own profile
- Book new appointments
- View own appointment history
- Track assigned technician location
- Make payments for services
- Rate completed services

**Technician:**
- View assigned routes and appointments
- Check in/out of appointments
- Update job status
- View customer information for assigned jobs
- Add notes and photos to tickets
- Navigate to customer locations

**Admin:**
- Full CRUD on customers, technicians, services
- Create and manage schedules/routes
- View all appointments for their business
- Manage business settings and users
- View reports and analytics
- Process payments and invoicing

**Super Admin:**
- All Admin capabilities across ALL businesses
- Manage platform subscriptions and billing
- View platform-wide analytics
- Manage feature flags and rollouts
- Customer support and troubleshooting

---

## Application Architecture

### Simplified Architecture (2 Apps, Not 4)

**Previous Approach (Over-Engineered):**
- 4 separate apps: web-admin, web-customer, mobile-tech, api
- Separate frontends for each user type
- Complex deployment and coordination

**Current Approach (Streamlined):**
- **1 Web Platform** with role-based views (customers, admins, super admins)
- **1 Mobile App** for technicians
- **Minimal API** (Hono) for webhooks and operations that can't be client-side
- **Supabase RLS** handles most authorization logic

### Authentication Flow

```
User visits app.chotter.com
  ↓
Login screen (Supabase Auth)
  ↓
JWT includes custom claims:
  - person_id
  - business_id
  - role (customer/technician/admin/super_admin)
  ↓
App routes based on role:
  - role === 'customer' → Customer dashboard
  - role === 'admin' → Admin dashboard
  - role === 'super_admin' → Super admin dashboard
  - role === 'technician' → "Please use mobile app" message
```

### Data Flow

```
Frontend (React/Expo)
  ↓
Supabase Client (authenticated with JWT)
  ↓
Supabase PostgreSQL + PostGIS
  ↓
Row Level Security (RLS) policies enforce:
  - business_id isolation
  - role-based permissions
  - customer data privacy
```

**When API is Used:**
- Stripe webhooks (subscription events)
- AI agent processing (future)
- Complex operations requiring server-side logic
- Third-party integrations (Twilio, SendGrid, etc.)

---

## Tech Stack

### Marketing Website (`chotter-marketing`)

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | Next.js (App Router) | Static site generation, SEO optimization |
| **Language** | TypeScript | Type safety |
| **UI Framework** | React 19 | Component library |
| **Styling** | Tailwind CSS | Utility-first styling |
| **Components** | shadcn/ui | Pre-built accessible components |
| **CMS** | Sanity | Content management (blog, features, etc.) |
| **Forms** | Tanstack Form | Type-safe form handling |
| **Validation** | Zod | Schema validation |
| **Analytics** | PostHog | Product analytics, feature flags |
| **Deployment** | Vercel | Edge CDN, serverless functions |
| **Package Manager** | Bun | Fast package management |

**Key Dependencies:**
```json
{
  "next": "^15.x",
  "react": "^19.x",
  "typescript": "^5.x",
  "tailwindcss": "^4.x",
  "@tanstack/react-form": "latest",
  "zod": "^3.x",
  "next-sanity": "^9.x",
  "posthog-js": "^1.x"
}
```

---

### Platform Web App (`chotter-platform`)

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | Vite | Fast build tool, HMR |
| **Language** | TypeScript | Type safety |
| **UI Framework** | React 19 | Component library |
| **Routing** | Tanstack Router | Type-safe routing |
| **Styling** | Tailwind CSS | Utility-first styling |
| **Components** | shadcn/ui | Pre-built accessible components |
| **Data Fetching** | Tanstack Query | Server state management, caching |
| **Client State** | Zustand | Lightweight state management |
| **Forms** | Tanstack Form | Type-safe form handling |
| **Validation** | Zod | Schema validation |
| **Database** | Supabase | PostgreSQL + PostGIS + Auth |
| **Maps** | Google Maps API | Route visualization, location display |
| **Calendar** | [charlietlamb/calendar](https://github.com/charlietlamb/calendar) | Schedule and calendar views |
| **Payments** | Stripe | Subscription billing, invoicing |
| **Email** | Resend | Transactional emails |
| **Analytics** | PostHog | Product analytics, feature flags |
| **Testing** | Vitest | Unit testing |
| **Deployment** | Vercel | Frontend hosting |
| **API Runtime** | Railway | Hono API deployment |
| **Package Manager** | Bun | Fast package management |

**Key Dependencies:**
```json
{
  "react": "^19.x",
  "typescript": "^5.x",
  "vite": "^6.x",
  "@tanstack/react-router": "^1.x",
  "@tanstack/react-query": "^5.x",
  "@tanstack/react-form": "latest",
  "zustand": "^5.x",
  "zod": "^3.x",
  "@supabase/supabase-js": "^2.x",
  "tailwindcss": "^4.x",
  "stripe": "^17.x",
  "resend": "^4.x",
  "posthog-js": "^1.x",
  "@vis.gl/react-google-maps": "^1.x",
  "vitest": "^2.x"
}
```

**API Layer (Hono):**
```json
{
  "hono": "^4.x",
  "bun": "^1.x"
}
```

---

### Mobile App (`chotter-mobile`)

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | Expo SDK 52 | React Native abstraction layer |
| **Runtime** | React Native 0.76+ | Native mobile components |
| **Language** | TypeScript | Type safety |
| **Navigation** | Expo Router | File-based routing |
| **Database** | Supabase | Auth, database, realtime |
| **Data Fetching** | Tanstack Query | Server state + offline caching |
| **Validation** | Zod | Schema validation |
| **Maps** | react-native-maps | Native map rendering |
| **Location** | expo-location | GPS tracking (foreground/background) |
| **Background Tasks** | expo-task-manager | Background location updates |
| **Notifications** | expo-notifications | Push notifications |
| **Storage** | expo-secure-store | Encrypted token storage |
| **Network Status** | @react-native-community/netinfo | Online/offline detection |
| **Build & Deploy** | EAS (Expo Application Services) | Cloud builds, OTA updates |

**Key Dependencies:**
```json
{
  "expo": "~52.x",
  "react-native": "0.76.x",
  "expo-router": "~4.x",
  "typescript": "^5.x",
  "@supabase/supabase-js": "^2.x",
  "@tanstack/react-query": "^5.x",
  "zod": "^3.x",
  "react-native-maps": "^1.x",
  "expo-location": "~18.x",
  "expo-task-manager": "~12.x",
  "expo-notifications": "~0.29.x",
  "expo-secure-store": "~14.x",
  "@react-native-community/netinfo": "^11.x"
}
```

---

## Data Architecture

### Multi-Tenant Database Design

**Core Principle:** All business data is isolated via `business_id` foreign keys and enforced by PostgreSQL Row Level Security (RLS) policies.

### Primary Entities

```sql
-- Platform-level table
businesses (
  id UUID PRIMARY KEY,
  name TEXT,
  slug TEXT UNIQUE,
  owner_person_id UUID,
  status business_status, -- trial, active, suspended, cancelled
  subscription_tier_id UUID,
  created_at TIMESTAMPTZ,
  settings JSONB
)

-- Base user table (all user types)
persons (
  id UUID PRIMARY KEY,
  supabase_user_id UUID, -- FK to auth.users, nullable for walk-in customers
  business_id UUID,      -- FK to businesses, nullable for customers & super_admins
  email TEXT,
  phone TEXT,
  first_name TEXT,
  last_name TEXT,
  role person_role,      -- customer, technician, admin, super_admin
  is_active BOOLEAN,
  timezone TEXT,
  created_at TIMESTAMPTZ
)

-- Customer-specific data (1:1 with persons)
customers (
  id UUID PRIMARY KEY,
  person_id UUID UNIQUE, -- FK to persons
  business_id UUID,      -- FK to businesses
  location geography(Point), -- PostGIS for proximity queries
  address_line1 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  preferred_contact_method TEXT,
  tags JSONB,
  lifetime_value_cents INTEGER
)

-- Technician-specific data (1:1 with persons)
technicians (
  id UUID PRIMARY KEY,
  person_id UUID UNIQUE, -- FK to persons
  business_id UUID,      -- FK to businesses
  employee_id TEXT,
  skills JSONB,          -- ["ASE Certified", "HVAC License"]
  certifications JSONB,
  home_location geography(Point),
  current_location geography(Point),
  working_hours JSONB,
  performance_metrics JSONB
)

-- Service catalog
services (
  id UUID PRIMARY KEY,
  business_id UUID,      -- FK to businesses
  name TEXT,
  slug TEXT,
  category TEXT,
  default_duration_minutes INTEGER,
  required_skills JSONB,
  base_price_cents INTEGER,
  active BOOLEAN
)

-- Appointments/Jobs
tickets (
  id UUID PRIMARY KEY,
  business_id UUID,      -- FK to businesses
  ticket_number TEXT UNIQUE, -- Auto-generated
  customer_id UUID,      -- FK to customers
  service_id UUID,       -- FK to services
  assigned_technician_id UUID, -- FK to technicians
  status ticket_status,  -- pending, scheduled, en_route, in_progress, completed
  priority ticket_priority,
  scheduled_date DATE,
  scheduled_start_time TIME,
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,
  customer_notes TEXT,
  technician_notes TEXT,
  total_cost_cents INTEGER,
  payment_status payment_status
)

-- Daily routes
routes (
  id UUID PRIMARY KEY,
  business_id UUID,      -- FK to businesses
  route_number TEXT,
  route_date DATE,
  assigned_technician_id UUID, -- FK to technicians
  waypoints JSONB,       -- Ordered stops with ETAs
  total_distance_meters INTEGER,
  total_duration_minutes INTEGER,
  optimization_status route_status,
  optimized_at TIMESTAMPTZ
)
```

### Row Level Security (RLS) Policies

**Helper Functions (extract JWT claims):**
```sql
current_person_id() → Get person_id from JWT
current_business_id() → Get business_id from JWT
current_user_role() → Get role from JWT
is_super_admin() → Check if role = 'super_admin'
```

**Example Policies:**
```sql
-- Customers can only see their own data
CREATE POLICY customers_select_self ON customers
  FOR SELECT
  USING (
    person_id = current_person_id()
    AND current_user_role() = 'customer'
  );

-- Technicians can see customers in their business
CREATE POLICY customers_select_technician ON customers
  FOR SELECT
  USING (
    business_id = current_business_id()
    AND current_user_role() = 'technician'
  );

-- Admins see all customers in their business
CREATE POLICY customers_select_admin ON customers
  FOR SELECT
  USING (
    business_id = current_business_id()
    AND current_user_role() = 'admin'
  );

-- Super admins see everything
CREATE POLICY customers_select_super_admin ON customers
  FOR SELECT
  USING (is_super_admin());
```

**Data Isolation:**
- All queries automatically filtered by RLS
- No way for users to access other businesses' data
- Even compromised client code cannot bypass RLS
- Application logic stays simple (no manual filtering)

---

## Authentication & Authorization

### Supabase Auth

**Authentication Methods:**
1. Email + Password (primary)
2. Magic Link (passwordless email)
3. Phone OTP (SMS verification)

**Sign-Up Flow:**
```
1. User submits email/password on marketing site
2. Supabase creates auth.users record
3. Database trigger creates persons record with role='admin' (first user)
4. JWT issued with custom claims:
   {
     person_id: "...",
     business_id: "...",
     role: "admin",
     first_name: "...",
     last_name: "...",
     is_active: true
   }
5. Redirect to app.chotter.com with auto-login
6. Onboarding flow: set up business, invite team
```

### JWT Custom Claims

**Stored in JWT metadata:**
```typescript
interface JWTClaims {
  person_id: string;
  business_id: string | null; // null for customers & super_admins
  role: 'customer' | 'technician' | 'admin' | 'super_admin';
  first_name: string | null;
  last_name: string | null;
  is_active: boolean;
}
```

**Claims are refreshed:**
- On login
- On role change (admin promotes user)
- On business assignment
- Can force refresh via `supabase.auth.refreshSession()`

### Authorization Layers

**Layer 1: Database (RLS Policies)**
- Primary authorization mechanism
- Enforces business_id isolation
- Role-based access to rows
- Cannot be bypassed by client code

**Layer 2: Frontend Route Guards**
```tsx
// React Router protection
<ProtectedRoute allowedRoles={['admin', 'super_admin']}>
  <DashboardPage />
</ProtectedRoute>

// Or with Tanstack Router
export const Route = createFileRoute('/admin/dashboard')({
  beforeLoad: ({ context }) => {
    if (!['admin', 'super_admin'].includes(context.user.role)) {
      throw redirect({ to: '/unauthorized' })
    }
  }
})
```

**Layer 3: API Middleware (Hono)**
```typescript
// apps/api/src/middleware/auth.ts
export const requireAuth = async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  c.set('user', user)
  await next()
}
```

**Defense in Depth:**
- Even if frontend is compromised, RLS prevents unauthorized data access
- Even if API is bypassed, RLS still enforces rules
- JWT tampering is detected by Supabase signature verification

---

## Infrastructure & Deployment

### Hosting & Services

| Service | Provider | Purpose | Cost |
|---------|----------|---------|------|
| **Marketing Site** | Vercel | Static hosting, CDN | Free tier |
| **Platform Web** | Vercel | React app hosting | Free tier (Pro for team) |
| **API Server** | Railway | Hono API runtime | ~$5-20/mo |
| **Database** | Supabase | PostgreSQL + Auth + Storage | Free tier → $25/mo (Pro) |
| **Mobile Builds** | EAS | iOS/Android builds | Free tier → $99/mo (Production) |
| **CMS** | Sanity | Content management | Free tier |
| **Email** | Resend | Transactional emails | Free tier → $20/mo |
| **Payments** | Stripe | Subscription billing | 2.9% + 30¢ per transaction |
| **Maps** | Google Maps | Maps & routing | Pay per use (~$200/mo est.) |
| **Analytics** | PostHog | Product analytics | Free tier → $0/mo (self-hosted option) |

### Deployment Pipelines

**Marketing (chotter-marketing):**
```
Git push to main
  ↓
Vercel auto-deploy
  ↓
Preview on PRs, production on main
  ↓
Static pages cached at edge (CDN)
```

**Platform (chotter-platform):**
```
Git push to main
  ↓
Vercel auto-deploy (frontend)
  ↓
Railway auto-deploy (API)
  ↓
Both services live
```

**Mobile (chotter-mobile):**
```
Git push to main
  ↓
EAS Build triggered (manual or CI)
  ↓
iOS → TestFlight → App Store
Android → Internal Testing → Play Store
  ↓
OTA updates for JS changes (no store review)
```

### Environment Variables

**Platform Web (.env):**
```bash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_GOOGLE_MAPS_API_KEY=AIza...
VITE_STRIPE_PUBLISHABLE_KEY=pk_...
VITE_POSTHOG_KEY=phc_...
```

**API (.env):**
```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ... # Admin access
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
```

**Mobile (app.config.ts):**
```typescript
export default {
  expo: {
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      eas: { projectId: '...' }
    }
  }
}
```

### Database Migrations

**Managed via Supabase CLI:**
```bash
# Create new migration
supabase migration new add_feature

# Apply migrations locally
supabase db reset

# Push to production
supabase db push
```

**Migration files:**
```
supabase/migrations/
├── 00000000000001_platform_tables.sql
├── 00000000000002_business_core_tables.sql
├── 00000000000003_scheduling_tables.sql
├── 00000000000004_messaging_tables.sql
├── 00000000000005_payment_tables.sql
├── 00000000000006_rls_platform.sql
├── 00000000000007_rls_business.sql
├── 00000000000008_auth_triggers.sql
└── ...
```

---

## Development Workflow

### Git Strategy

**Branching:**
- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Individual features
- `hotfix/*` - Emergency production fixes

**Workflow:**
```
feature/new-dashboard → develop → main
                         ↓         ↓
                      Staging   Production
```

### Local Development

**Marketing:**
```bash
cd chotter-marketing
bun install
bun dev # localhost:3000
```

**Platform:**
```bash
cd chotter-platform
bun install
bun dev # localhost:5173 (Vite)

# In separate terminal for API
cd chotter-platform/api
bun run dev # localhost:3001
```

**Mobile:**
```bash
cd chotter-mobile
bun install
bunx expo start
# Press 'i' for iOS simulator
# Press 'a' for Android emulator
```

### Testing Strategy

**Platform:**
- Unit tests with Vitest for utilities and hooks
- Manual E2E testing (Playwright in future)
- RLS policy testing via SQL fixtures

**Mobile:**
- Manual testing on real devices (TestFlight/Play Console)
- Unit tests for critical business logic
- Skip E2E initially (Detox/Maestro complex for internal app)

**API:**
- Integration tests for webhook handlers
- Stripe webhook testing with Stripe CLI

### Code Quality

**All repos:**
```json
{
  "scripts": {
    "lint": "eslint .",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit"
  }
}
```

**Pre-commit hooks (optional):**
- Husky + lint-staged
- Run lint + type-check on changed files

---

## Third-Party Integrations

### Stripe (Payments & Subscriptions)

**Webhook Events:**
```typescript
// API handles these webhooks
'customer.subscription.created'
'customer.subscription.updated'
'customer.subscription.deleted'
'invoice.payment_succeeded'
'invoice.payment_failed'
```

**Flow:**
```
Admin upgrades plan
  ↓
Stripe Checkout session
  ↓
Payment processed
  ↓
Webhook to API (Railway)
  ↓
Update subscriptions table in Supabase
  ↓
Frontend reflects new plan instantly
```

### Resend (Transactional Email)

**Email Types:**
```typescript
// Sent via API
- Welcome email (new sign-up)
- Appointment confirmation (customer + technician)
- Appointment reminder (24hrs before)
- Appointment completed (receipt + rating request)
- Technician assigned (notification)
- Route published (daily route email to tech)
```

**Template Storage:**
- React Email components in API repo
- Rendered to HTML by Resend

### Google Maps

**Features Used:**
- Maps JavaScript API (map display)
- Directions API (route optimization)
- Geocoding API (address → lat/lng)
- Distance Matrix API (travel time estimates)

**Usage:**
- Platform: Route planning, customer location display, live tracking
- Mobile: Navigation, real-time location updates

### Sanity (CMS)

**Content Types:**
- Blog posts
- Feature descriptions
- Pricing tiers (synced to Stripe)
- FAQ items
- Case studies

**Editing:**
- Sanity Studio at `chotter.com/studio`
- Marketing team edits without code deploys
- Webhook triggers Vercel rebuild on publish

### PostHog (Analytics)

**Events Tracked:**
- Page views (all apps)
- Button clicks (sign-up, book appointment)
- Feature usage (route optimization, check-in)
- User properties (role, business_id, plan tier)

**Features Used:**
- Event tracking
- Feature flags (gradual rollouts)
- Session recordings (debug issues)
- Funnels (sign-up conversion)

---

## Migration Plan (From Current Monorepo)

### Phase 1: Extract Repos
1. Create 3 new repos: `chotter-marketing`, `chotter-platform`, `chotter-mobile`
2. Copy relevant code from `apps/*` to new repos
3. Set up CI/CD in each repo
4. Update environment variables

### Phase 2: Simplify Platform
1. Merge `web-admin` into `chotter-platform`
2. Add customer routes (book, track, history)
3. Implement role-based routing
4. Remove `web-customer` placeholder

### Phase 3: Deploy
1. Deploy marketing to Vercel
2. Deploy platform to Vercel
3. Keep mobile as-is (continue on current development)

### Phase 4: Cleanup
1. Archive old monorepo
2. Update documentation
3. Update team workflows

---

## Future Considerations

### Potential Additions

**AI Agent (Future):**
- Natural language appointment booking
- Smart route optimization
- Predictive maintenance suggestions
- Customer support chatbot

**Workflow Automation:**
- Zapier/Make.com integrations
- Custom webhook support
- API for third-party tools

**Advanced Features:**
- Multi-language support (i18n)
- White-labeling for enterprises
- Mobile app for customers (native experience)
- Inventory management
- Fleet management

**Scalability:**
- Supabase read replicas (high traffic)
- Redis caching layer (hot data)
- Queue system for background jobs (BullMQ)
- Microservices if API grows large

---

## Conclusion

This architecture prioritizes:
- **Simplicity** - 2 real apps (web + mobile), not 4
- **Security** - RLS policies enforce all authorization
- **Speed** - Minimal API, direct Supabase access
- **Developer Experience** - Familiar tools, clear separation
- **Cost Efficiency** - Generous free tiers, pay-as-you-grow

**Next Steps:**
1. Create the 3 repositories
2. Migrate code from monorepo
3. Set up CI/CD pipelines
4. Deploy and test

---

**Document Owner:** Chotter Development Team
**Last Reviewed:** 2025-10-22
**Next Review:** Quarterly or on major architecture changes
