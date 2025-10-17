# Field Service SaaS - Product Requirements Document v2.0

## Executive Summary

**Product Name:** Chotter

**Vision:** Eliminate wasted drive time and missed appointments for mobile service businesses through AI-powered scheduling, automatic route optimization, and intelligent customer communication.

**Target Market:** Mobile service businesses (auto mechanics, HVAC, plumbing, electrical) with 3-50 technicians

**Core Value Proposition:**

- **Customers:** Book via voice/SMS/web with AI agent, know exactly when technician arrives
- **Businesses:** 30%+ more appointments per day, 25% less fuel costs, 24/7 AI booking
- **Technicians:** Optimized routes, less driving, earlier finish times

**Tech Stack:** Bun + Supabase + Hono + Expo + React + Vercel + Railway + Stripe Billing + Stripe Connect + ElevenLabs AI

**Business Model:**

- **Subscription Revenue:** Monthly/annual plans ($49-$399/month), 14-day free trial
- **Customer Payment Processing:** Optional Stripe Connect Express (businesses connect own accounts, pay own fees, ~90% white-labeled)
- **Target Revenue:** 100 businesses × $99 avg = $9,900 MRR by Month 6

**Timeline:** 24 weeks with Claude Code (includes payment integration + subscription billing + error handling)

---

## User Types & Access Control

### 1. Customer (End User)

**Platform Access:**

- **Customer Portal** (Web - React + Vite)
- **SMS/Email Notifications** (Automated)
- **Optional:** Mobile app view (future)

**Authentication:**

- Magic link (passwordless) via Supabase Auth
- Phone number verification
- No account creation required for one-time bookings

**Can Access:**

- Their own appointment(s) only
- Assigned technician information
- Service history (their appointments)
- Uploaded media (photos/videos they submitted)

**Cannot Access:**

- Other customers' data
- Internal business operations
- Technician schedules
- Pricing/cost information beyond their service
- Admin functions

**Primary Actions:**

- **Book appointment (via AI agent: phone call, SMS, or website widget)** _(if business has agent enabled)_
- Book appointment (manual: call business directly, email)
- View upcoming appointment details
- Track technician in real-time (live map)
- Respond to early arrival requests (SMS)
- Upload photos/videos of issue
- Reschedule appointment
- **Make payment (card, Apple Pay, Google Pay)** _(if enabled)_
- **View payment history and receipts** _(if enabled)_
- **Request refund (within policy window)** _(if enabled)_
- Submit rating and review (post-service)
- View service summary

**Interface:**

```
Customer Portal (Web):
├── Appointment Details
│   ├── Service information
│   ├── Scheduled time window
│   ├── Technician profile (name, photo)
│   ├── Location/address
│   └── **Payment status badge** *(if enabled)*
├── Live Tracking
│   ├── Real-time technician location (map)
│   ├── ETA countdown
│   └── Status updates (on the way, arrived, in progress)
├── Media Upload
│   ├── Photo upload (via camera or file)
│   └── Video upload
├── **Payment** *(if enabled)*
│   ├── Price breakdown (base + surcharges)
│   ├── Stripe Checkout (card, Apple/Google Pay)
│   ├── Payment confirmation
│   └── Download receipt (PDF)
├── **Payment History** *(if enabled)*
│   ├── Past payments list
│   ├── Receipts download
│   └── Request refund
├── Reschedule
│   └── Available time slots (calendar picker)
└── Post-Service
    ├── Rate service (1-5 stars)
    ├── Write review
    └── View service summary

AI Booking Agent (Professional+ businesses only):
├── Voice (Phone Call)
│   └── Call business number → AI agent answers, books appointment
├── SMS
│   └── Text business number → AI agent responds, books via conversation
└── Web Widget (Embedded on business website)
    └── Click-to-call or text chat interface → connects to AI agent
```

**RLS Policies:**

```sql
-- Customers can only see their own appointments
appointments: customer_id = auth.uid()

-- Customers can only upload media to their tickets
media: ticket.customer_id = auth.uid()

-- Customers can only rate their own appointments
ratings: appointment.customer_id = auth.uid()

-- Customers can only see their own payments
payments: appointment.customer_id = auth.uid()

-- Customers can only view pricing rules (read-only)
pricing_rules: SELECT only (no customer_id filter)
```

**Communication Channels:**

- SMS notifications (Twilio)
- Email notifications (Resend)
- In-portal alerts
- **AI booking agent (voice, SMS, web)** _(if business enabled)_

---

### 2. Technician (Field Worker)

**Platform Access:**

- **Mobile App** (Expo + React Native)
- **SMS Notifications** (Important updates)

**Authentication:**

- Email/password via Supabase Auth
- Biometric unlock (Touch ID/Face ID)
- Stay logged in (refresh tokens)

**Can Access:**

- Their assigned routes only
- Their appointments (today and upcoming)
- Customer contact information (for assigned appointments)
- Navigation to job sites
- Service instructions

**Cannot Access:**

- Other technicians' routes or schedules
- Customer data beyond current assignments
- Pricing/business financials
- Admin/dispatch functions
- Route optimization controls

**Primary Actions:**

- View daily route (list of appointments)
- Navigate to next stop (opens Maps app)
- Check in at job site (geolocation verified)
- View customer information (name, phone, address, notes)
- View uploaded photos/videos from customer
- Mark job as complete
- Add internal notes (not visible to customer)
- Update location (automatic background tracking)
- Receive push notifications for route changes

**Interface:**

```
Mobile App (Expo):
├── Today's Route
│   ├── Appointment list (ordered by sequence)
│   ├── Total appointments count
│   ├── Estimated completion time
│   └── Current appointment highlighted
├── Appointment Detail
│   ├── Customer information
│   │   ├── Name
│   │   ├── Phone (tap to call)
│   │   ├── Address (tap to navigate)
│   │   └── Special instructions
│   ├── Service details
│   │   ├── Service type
│   │   ├── Estimated duration
│   │   └── Time window
│   ├── Customer-uploaded media
│   └── Action buttons
│       ├── Navigate (opens Maps)
│       ├── Check In
│       ├── Call Customer
│       └── Complete Job
├── Profile
│   ├── Personal information
│   ├── Skills/certifications
│   ├── Today's stats
│   └── Logout
└── Notifications
    └── Route updates, delays, emergencies
```

**RLS Policies:**

```sql
-- Technicians can only see routes assigned to them
routes: technician_id = auth.uid()

-- Technicians can only see their assigned appointments
appointments: assigned_technician_id = auth.uid()

-- Technicians can view customer info for assigned appointments
customers: EXISTS (
  SELECT 1 FROM appointments
  WHERE customer_id = customers.id
  AND assigned_technician_id = auth.uid()
)
```

**Location Tracking:**

- **Automatic:** Background location updates every 30 seconds while on route
- **Geofence Detection:** Automatic notifications when approaching/arriving
- **Manual:** Check-in button as backup

---

### 3. Admin/Dispatcher (Business Staff)

**Platform Access:**

- **Admin Dashboard** (Web - React + Vite)
- **Full system access** (all data, all functions)

**Authentication:**

- Email/password via Supabase Auth
- 2FA recommended (Supabase Auth TOTP)
- Role: admin

**Can Access:**

- ALL appointments, customers, technicians
- ALL routes (view, create, modify)
- System settings and configuration
- Analytics and reports
- User management

**Cannot Be Restricted:** (Full access for business operations)

**Primary Actions:**

**Scheduling & Dispatch:**

- Create/edit/cancel appointments
- Assign appointments to technicians
- Drag-and-drop route reordering
- Trigger route optimization
- Approve/reject route rebalancing suggestions
- Override AI scheduling recommendations
- Handle emergency requests

**Customer Management:**

- View all customers
- Create/edit customer profiles
- View customer appointment history
- View ratings/reviews
- Manual communication (SMS/email)

**Technician Management:**

- Create/edit technician profiles
- Set technician skills and certifications
- Configure working hours
- Set on-call schedules
- View technician performance metrics
- Track real-time locations (all techs)

**Configuration:**

- Create/edit service types
- Set default durations
- **Configure service pricing and dynamic pricing rules** _(independent of payment processing)_
- **Enable payment processing (requires Stripe Express Connect)**
- **Connect Stripe account via Express onboarding** _(~90% white-labeled)_
- **Manage payment methods (card, ACH, Apple Pay, Google Pay)** _(after Stripe connected)_
- **Configure refund policies** _(after Stripe connected)_
- Manage AI agent settings
- Set notification templates
- Configure business hours

**Monitoring:**

- Live map view (all technicians)
- Route progress tracking
- Delay detection and alerts
- **Payment transaction monitoring**
- **Revenue and payment analytics**
- Notification history
- System health monitoring

**Interface:**

```
Admin Dashboard (Web):
├── Dashboard
│   ├── Today's Overview
│   │   ├── Total appointments
│   │   ├── Active technicians
│   │   ├── Completion rate
│   │   └── Delays/issues
│   ├── Live Map (all technician locations)
│   └── Recent Activity Feed
├── Schedule
│   ├── Calendar View (day/week/month)
│   ├── Drag-and-drop appointments
│   ├── Filter by technician/status
│   └── Quick actions (create, edit, cancel)
├── Routes
│   ├── Route Visualization
│   │   ├── Map view with all routes
│   │   ├── List view with details
│   │   └── Optimization suggestions
│   ├── Route Management
│   │   ├── Trigger optimization
│   │   ├── Approve rebalancing
│   │   ├── Manual overrides
│   │   └── Route metrics
├── Appointments
│   ├── List View (filterable, sortable)
│   ├── Create New Appointment
│   ├── Edit/Cancel Appointments
│   └── AI Booking Log
├── Customers
│   ├── Customer List
│   ├── Customer Details
│   │   ├── Contact information
│   │   ├── Appointment history
│   │   ├── Ratings given
│   │   └── Notes
│   ├── Create/Edit Customer
│   └── Manual Communication
├── Technicians
│   ├── Technician List
│   ├── Technician Details
│   │   ├── Personal info
│   │   ├── Skills & certifications
│   │   ├── Schedule & availability
│   │   ├── On-call schedule
│   │   ├── Performance metrics
│   │   └── Current location
│   ├── Create/Edit Technician
│   └── Capacity Management
├── Services
│   ├── Service Type List
│   ├── Create/Edit Service
│   └── **Pricing Configuration** *(always available, no payment processing required)*
│       ├── Base prices per service
│       ├── After-hours surcharge rules
│       ├── Weekend/holiday surcharge rules
│       ├── Emergency multiplier settings
│       └── Service fees (flat/percentage)
├── **Payments** *(if enabled)*
│   ├── Payment Dashboard
│   │   ├── Transaction list (filterable by status)
│   │   ├── Revenue summary
│   │   └── Failed payments alert
│   ├── Process Manual Payment
│   ├── Issue Refund
│   ├── Payment Analytics
│   └── Stripe Integration Status
├── Settings
│   ├── Business Information
│   ├── Operating Hours
│   ├── **AI Booking Agent** *(Professional+ only)*
│   │   ├── [If Starter tier] → "Upgrade to Professional to enable AI agent"
│   │   ├── [If Professional+ but NOT created]
│   │   │   ├── AI Agent Benefits Overview
│   │   │   ├── [Create AI Agent] button
│   │   │   └── Feature comparison (24/7 availability, voice/SMS/web)
│   │   ├── [If Agent Created]
│   │   │   ├── Agent Status
│   │   │   │   ├── Status: ✅ Active / ⏸ Paused / ⚠️ Suspended
│   │   │   │   ├── Agent Name: "[Business Name] Booking Assistant"
│   │   │   │   ├── Phone Number: +1 (555) 123-4567 (Twilio-provided)
│   │   │   │   ├── Web Widget Embed Code: <script src="...">
│   │   │   │   ├── [Test Agent] → Make test call or send test SMS
│   │   │   │   └── [Pause Agent] / [Resume Agent] buttons
│   │   │   ├── Agent Capabilities (Simple Toggles)
│   │   │   │   ├── ✅ Schedule appointments (always on)
│   │   │   │   ├── ✅ Provide pricing quotes (always on)
│   │   │   │   ├── ☐ Allow rescheduling (toggle)
│   │   │   │   ├── ☐ Allow cancellations (toggle)
│   │   │   │   ├── ☐ Answer general service questions (toggle)
│   │   │   │   └── ✅ Proximity-aware slot suggestions (always on)
│   │   │   ├── Greeting & Personality
│   │   │   │   ├── Greeting Message: "Hi! I'm [Business Name]'s booking assistant..."
│   │   │   │   ├── Business Description: "We provide HVAC services..."
│   │   │   │   ├── Tone: [ ] Professional [x] Friendly [ ] Casual
│   │   │   │   └── [Future] Voice Clone (upload 30sec audio)
│   │   │   ├── Escalation Settings
│   │   │   │   ├── Escalation Method:
│   │   │   │   │   ├── [ ] Phone Transfer (transfer call to main line)
│   │   │   │   │   ├── [x] Create Support Ticket (admin sees in dashboard)
│   │   │   │   │   ├── [ ] SMS Handoff (forward to admin SMS)
│   │   │   │   │   └── [ ] All of the Above
│   │   │   │   ├── Business Contact Number: +1 (555) 987-6543
│   │   │   │   ├── Admin SMS Number: +1 (555) 111-2222
│   │   │   │   └── Escalation Keywords: "manager", "human", "speak to someone"
│   │   │   ├── Usage Stats (This Month)
│   │   │   │   ├── Minutes Used: 347 / 500 (69%)
│   │   │   │   │   └── Progress bar (green/yellow/red)
│   │   │   │   ├── Total Conversations: 87
│   │   │   │   ├── Successful Bookings: 23 (26%)
│   │   │   │   ├── Escalations: 4 (5%)
│   │   │   │   ├── Customer Satisfaction: 4.2 / 5.0 ⭐
│   │   │   │   └── [View Detailed Analytics]
│   │   │   ├── Conversation Logs
│   │   │   │   ├── Recent Conversations List
│   │   │   │   │   ├── Date/Time, Channel (📞/💬/🌐), Duration, Outcome
│   │   │   │   │   └── Click to view full transcript
│   │   │   │   └── Search/Filter (date range, channel, outcome)
│   │   │   └── Advanced (collapsed by default)
│   │   │       ├── Custom Instructions (additional agent context)
│   │   │       ├── Business Hours Override (agent availability)
│   │   │       └── [Delete Agent] (with confirmation)
│   ├── **Billing & Subscription**
│   │   ├── Current Plan
│   │   │   ├── Tier: Professional (Annual)
│   │   │   ├── Price: $1,430/year (Save $358 vs monthly)
│   │   │   ├── Renews: January 15, 2026
│   │   │   ├── Status: Active / Trial / Past Due / Canceled
│   │   │   └── [View Plans] [Upgrade] buttons
│   │   ├── Usage This Month
│   │   │   ├── Appointments: 347 / 500 (69%)
│   │   │   │   └── Progress bar (green/yellow/red)
│   │   │   ├── Admin Users: 2 / 2
│   │   │   ├── Field Technicians: 7 / 10
│   │   │   ├── Grace Periods Remaining: 1 / 1
│   │   │   └── [If approaching limit] → "Upgrade to avoid interruptions"
│   │   ├── Payment Method
│   │   │   ├── Card on file: •••• 4242 (Expires 12/26)
│   │   │   ├── [Update Payment Method]
│   │   │   └── Billing email: billing@business.com
│   │   ├── Billing History
│   │   │   ├── Invoice list (date, amount, status, PDF download)
│   │   │   └── Payment history (all charges)
│   │   ├── Manage Subscription
│   │   │   ├── [Compare Plans] → Side-by-side tier comparison
│   │   │   ├── [Upgrade to Enterprise] → Immediate access, prorated
│   │   │   ├── [Downgrade to Starter] → Takes effect at renewal
│   │   │   ├── [Switch to Annual] → Save 20%, immediate billing
│   │   │   ├── [Cancel Subscription] → Confirmation modal
│   │   │   └── [Reactivate] (if canceled but still in grace period)
│   ├── **Payment Processing** *(optional, Professional+ only)*
│   │   ├── [If Starter tier] → "Upgrade to Professional to enable payment processing"
│   │   ├── [If Professional+]
│   │   │   ├── Enable Payment Processing (master toggle - OFF by default)
│   │   │   ├── [If enabled but NOT connected]
│   │   │   │   └── Connect Stripe Account (Button → Stripe Express onboarding)
│   │   │   ├── [If connected]
│   │   │   │   ├── Connection Status
│   │   │   │   │   ├── ✅ Stripe Connected
│   │   │   │   │   ├── Account ID: acct_xxx
│   │   │   │   │   ├── Connected on: [date]
│   │   │   │   │   ├── Charges enabled: Yes/No
│   │   │   │   │   └── Payouts enabled: Yes/No
│   │   │   │   ├── Payment Methods (card, ACH, Apple Pay, Google Pay)
│   │   │   │   ├── Payment Timing Defaults (pre/post service)
│   │   │   │   ├── Refund Policy Configuration
│   │   │   │   ├── Test Mode Toggle
│   │   │   │   └── View in Stripe Dashboard (external link)
│   ├── Notification Templates
│   ├── AI Agent Configuration
│   ├── Integration Settings
│   └── User Management
└── Analytics
    ├── Performance Metrics
    ├── Revenue Reports
    ├── **Payment Analytics** *(if enabled)*
    ├── Customer Satisfaction
    └── Efficiency Metrics
```

**RLS Policies:**

```sql
-- Admins have full access to everything
ALL TABLES: role = 'admin' (bypass RLS)
```

**Stripe Express Onboarding Flow:**

When an admin enables payment processing and clicks "Connect Stripe Account":

1. **Backend creates Express account:**

   ```
   POST /api/stripe/create-express-account
   → Creates Stripe Express account
   → Stores account ID in payment_settings
   → Returns account ID
   ```

2. **Backend generates Account Link:**

   ```
   POST /api/stripe/create-account-link
   → Creates onboarding link for that account
   → Sets return_url (success page in your admin)
   → Sets refresh_url (if they need to restart)
   → Returns onboarding URL
   ```

3. **Admin redirected to Stripe Express onboarding:**
   - Embedded iframe OR full redirect (customizable)
   - Stripe-hosted form with your branding
   - Business provides:
     - Business details (name, type, industry)
     - Bank account (for payouts)
     - Tax information (EIN or SSN)
     - Identity verification (photo ID)
   - Takes 5-10 minutes
   - Feels ~90% like part of your platform

4. **After completion:**
   - Stripe redirects back to your return_url
   - Webhook fired: `account.updated`
   - Backend updates payment_settings:
     - `stripe_onboarding_complete = true`
     - `stripe_charges_enabled = true/false`
     - `stripe_payouts_enabled = true/false`

5. **Admin sees:**
   - ✅ "Stripe Connected" status
   - Account capabilities (charges/payouts enabled)
   - Can now configure payment methods
   - Can now accept payments

**If onboarding incomplete:**

- Webhook: `account.updated` with requirements
- Admin sees: "Complete Stripe Setup" button
- Generates new Account Link to continue

---

### 4. Super Admin (Platform Owner)

**Platform Access:**

- **Super Admin Dashboard** (Web - React + Vite)
- **Separate from business admin** (different auth level)
- **Full platform oversight**

**Authentication:**

- Email/password via Supabase Auth
- 2FA required (TOTP)
- Role: super_admin (distinct from business admin)

**Can Access:**

- All businesses in the platform
- Platform-wide analytics (MRR, ARR, churn)
- Subscription management for all businesses
- Global configuration settings
- Trial conversion tracking
- Grace period configuration
- Tier management (pricing, features, limits)

**Cannot Access:**

- Individual business data (HIPAA/privacy considerations)
- Customer PII from businesses
- Business Stripe accounts (only view connection status)

**Primary Actions:**

**Subscription Management:**

- View all active subscriptions
- Monitor trial conversions
- Track MRR/ARR growth
- Analyze churn metrics
- Manually adjust subscriptions (refunds, comp accounts, overrides)
- Suspend/reactivate accounts
- Export subscription data

**Global Configuration:**

- Configure grace period rules (overage %, periods per year, auto-upgrade)
- Configure trial settings (length, reminder schedule)
- Manage pricing tiers (CRUD operations)
- Set feature flags per tier
- Adjust usage limits
- Configure platform-wide notifications

**Analytics & Reporting:**

- MRR/ARR dashboard
- Trial-to-paid conversion rates
- Churn analysis (why businesses leave)
- Usage analytics (appointments per business)
- Tier distribution (Starter/Professional/Enterprise %)
- Payment failure tracking
- Customer acquisition cost (CAC)
- Lifetime value (LTV)

**Industry Pricing (Future):**

- Create add-on modules (HVAC, Electrical, Plumbing)
- Set add-on pricing
- Enable/disable add-ons per business

**Interface:**

```
Super Admin Dashboard (Platform Owner):
├── Overview
│   ├── Key Metrics
│   │   ├── Total Businesses: 247
│   │   ├── Active Subscriptions: 203
│   │   ├── In Trial: 44
│   │   ├── MRR: $18,450
│   │   ├── ARR: $221,400
│   │   ├── Churn Rate: 2.8%
│   ├── Growth Chart (MRR over time)
│   └── Recent Activity Feed
├── Subscriptions
│   ├── All Subscriptions List
│   │   ├── Filter: Tier / Status / Billing Period
│   │   ├── Search: Business name
│   │   ├── Columns: Business, Tier, Price, Status, Renewal Date, Usage
│   │   └── Actions: View Details, Adjust, Suspend, Refund
│   ├── Subscription Details (modal/page)
│   │   ├── Business information
│   │   ├── Current tier & pricing
│   │   ├── Usage stats (appointments, users)
│   │   ├── Billing history
│   │   ├── Payment method status
│   │   ├── Grace periods used
│   │   ├── Manual Actions:
│   │   │   ├── Issue refund
│   │   │   ├── Comp account (free access)
│   │   │   ├── Override limits
│   │   │   ├── Force upgrade/downgrade
│   │   │   ├── Suspend account
│   │   │   └── Cancel subscription
├── Analytics
│   ├── Revenue Metrics
│   │   ├── MRR/ARR trend
│   │   ├── New MRR (new subscriptions)
│   │   ├── Expansion MRR (upgrades)
│   │   ├── Contraction MRR (downgrades)
│   │   ├── Churned MRR (cancellations)
│   │   └── Net MRR change
│   ├── Trial Conversions
│   │   ├── Trial starts (last 30 days)
│   │   ├── Trial-to-paid conversion rate
│   │   ├── Conversion by tier
│   │   ├── Average trial length
│   │   └── Reasons for non-conversion
│   ├── Churn Analysis
│   │   ├── Monthly churn rate
│   │   ├── Churn by tier
│   │   ├── Churn reasons (survey data)
│   │   ├── Winback opportunities
│   │   └── Customer feedback
│   ├── Usage Analytics
│   │   ├── Avg appointments per business
│   │   ├── Usage by tier
│   │   ├── Businesses approaching limits
│   │   ├── Grace periods triggered
│   │   └── Feature adoption rates
│   ├── Tier Distribution
│   │   ├── Pie chart: Starter/Pro/Enterprise %
│   │   ├── Revenue by tier
│   │   ├── Upgrade path analysis
│   │   └── Tier saturation
├── Platform Settings
│   ├── Grace Period Configuration
│   │   ├── Overage Threshold % (0-25%) → Default: 10%
│   │   │   └── "Allow businesses to exceed limits by X%"
│   │   ├── Grace Periods Per Year (0-3) → Default: 1
│   │   │   └── "How many times per year can they use grace period"
│   │   ├── Auto-Upgrade After Grace (Yes/No) → Default: No
│   │   │   └── "Automatically upgrade tier when grace exhausted"
│   │   └── [Save Settings]
│   ├── Trial Configuration
│   │   ├── Trial Length (days) → Default: 14
│   │   ├── Reminder Schedule (days array) → [7, 12, 13]
│   │   │   └── "Send reminders on these trial days"
│   │   ├── Card Required (Yes/No) → Default: No
│   │   │   └── "Require card at trial signup"
│   │   └── [Save Settings]
│   ├── Subscription Tiers (CRUD)
│   │   ├── Tier List
│   │   │   ├── Starter ($49/month, $470/year)
│   │   │   ├── Professional ($149/month, $1,430/year)
│   │   │   └── Enterprise (Custom)
│   │   ├── Edit Tier (modal)
│   │   │   ├── Display Name
│   │   │   ├── Monthly Price
│   │   │   ├── Annual Price (calculated discount %)
│   │   │   ├── Features (JSON editor)
│   │   │   │   └── {payment_processing: true, analytics: true, ...}
│   │   │   ├── Limits (JSON editor)
│   │   │   │   └── {appointments_per_month: 500, admin_users: 2, ...}
│   │   │   ├── Sort Order
│   │   │   ├── Active/Inactive
│   │   │   └── [Save] [Cancel]
│   │   └── [Create New Tier]
│   ├── Industry Add-Ons (Future)
│   │   ├── Add-On List (HVAC, Electrical, Plumbing)
│   │   ├── Create/Edit Add-On
│   │   │   ├── Name
│   │   │   ├── Price (monthly)
│   │   │   ├── Features included
│   │   │   └── Compatible tiers
│   │   └── [Create New Add-On]
│   └── Platform Notifications
│       ├── Email templates (trial reminders, upgrade prompts)
│       ├── In-app notification settings
│       └── Webhooks (external integrations)
├── Support Tools
│   ├── Search Business (by name, email, stripe ID)
│   ├── Impersonate Business (for support)
│   │   └── "View as" mode (clearly indicated, audit logged)
│   ├── Bulk Operations
│   │   ├── Export subscriptions (CSV)
│   │   ├── Bulk email campaigns
│   │   └── Feature flag rollout
│   └── Audit Logs
│       └── All super admin actions logged
└── Account
    ├── Super Admin Profile
    ├── 2FA Settings
    ├── Activity Log
    └── Logout
```

**RLS Policies:**

```sql
-- Super admins bypass all RLS
ALL TABLES: role = 'super_admin' (bypass RLS)

-- Super admin table (only super admins can read)
super_admins: role = 'super_admin'

-- Audit log (write-only for super admins)
audit_logs: role = 'super_admin' (INSERT only)
```

**Key Security Considerations:**

- Super admin role separate from business admin
- All super admin actions audit logged
- 2FA required for super admin access
- Cannot access individual customer PII (privacy)
- Impersonation mode clearly indicated + logged
- Limited to 1-3 super admin accounts (you + co-founders)

---

### 5. AI Booking Agent (ElevenLabs Conversational AI)

**Platform:**

- **ElevenLabs Conversational AI** (multimodal: voice, SMS, web)
- **Twilio** (phone numbers, SMS, call routing)
- **Hono API** (agent tools, business logic)
- **Supabase Database** (read/write customer data, appointments)

**Availability:**

- **Professional tier and above only** (premium feature)
- Each business gets their own dedicated AI agent
- Dedicated Twilio phone number per business
- 24/7 availability (configurable business hours)

**Purpose:**

- **Conversational appointment booking via voice, SMS, and web**
- Optimal slot recommendation with proximity awareness
- Natural language understanding across multiple channels
- Hands-free booking experience for customers

**Channels:**

1. **Voice (Phone Calls):**
   - Customer calls business's dedicated number
   - AI agent answers, conducts natural conversation
   - Books appointment, provides confirmation
   - Can transfer to human if needed

2. **SMS:**
   - Customer texts business's dedicated number
   - AI agent responds via text messages
   - Handles multi-turn booking conversation
   - Sends confirmation with appointment details

3. **Web Widget:**
   - Embeddable widget on business website
   - Click-to-call or text chat interface
   - Connects to same AI agent as phone/SMS
   - Consistent experience across channels

**Can Access (Data & Context):**

- Available technicians and schedules (real-time)
- Service types, durations, and pricing rules
- **Caller ID recognition** (identify returning customers by phone number)
- **Customer appointment history** (past services, preferences)
- **Customer notes and special instructions**
- **Real-time technician locations and routes** (for proximity awareness)
- Existing routes for optimization
- Business pricing rules and surcharges

**Cannot Access:**

- Internal business financials (revenue, costs)
- Other businesses' data (isolated per business)
- Admin credentials or settings
- Payment processing (only generates links)
- Technician personal information (beyond schedule)

**Agent Capabilities (Configurable per Business):**

**Always Enabled:**

- ✅ Schedule appointments with proximity-aware slot suggestions
- ✅ Provide pricing quotes based on business rules
- ✅ Recognize returning customers (caller ID lookup)
- ✅ Suggest optimal time slots based on existing routes

**Optional (Business Toggles in Admin):**

- ☐ Allow rescheduling existing appointments
- ☐ Allow canceling appointments
- ☐ Answer general service questions (FAQs)

**Agent Actions:**

1. **Greet customer** (personalized if recognized via caller ID)
   - Example: "Hi Sarah! I see you last had HVAC service with us in January. How can I help you today?"

2. **Understand intent** (natural language processing)
   - Parse service type, urgency, date preferences
   - Ask clarifying questions if needed

3. **Query available slots** (proximity-aware)
   - Check technician schedules and existing routes
   - Calculate insertion cost for new appointment
   - Prioritize slots near existing appointments
   - Example: "We have a technician in your area tomorrow at 2pm. Does that work?"

4. **Calculate pricing** (based on business rules)
   - Apply base price + surcharges (after-hours, emergency, etc.)
   - Communicate pricing transparently
   - Example: "The total for AC repair is $149, which includes a $30 emergency fee since it's after hours."

5. **Handle objections** (flexible negotiation)
   - If customer rejects suggested slot, offer alternatives
   - Explain why certain slots are optimal
   - Balance business efficiency with customer preference

6. **Confirm booking** (capture all details)
   - Service type, date, time, address
   - Customer contact information
   - Special instructions or notes
   - Create appointment in database

7. **Generate payment link** (if required)
   - If business requires pre-payment
   - Send Stripe Checkout link via SMS/email
   - Confirm payment status before finalizing

8. **Provide confirmation** (multi-channel)
   - Verbal confirmation on call
   - SMS confirmation with details
   - Email confirmation (via notification worker)

9. **Escalate when needed** (configurable methods)
   - Customer requests human ("I want to speak to someone")
   - Agent can't handle request (out of scope)
   - Methods: Phone transfer, support ticket, SMS handoff

**Proximity-Aware Slot Optimization:**

The AI agent uses proximity intelligence to suggest slots that minimize drive time:

```
Example Scenario:
- Customer at 123 Oak St requests service
- Technician John has route tomorrow: [456 Elm St, 789 Pine St]
- 123 Oak St is 0.5 miles from 789 Pine St
- Agent suggests: "We have a technician in your area tomorrow at 3pm. Does that work?"
- Result: Minimal drive time between appointments, customer happy with fast service
```

**Algorithm:**

1. Query all technicians with required skills
2. Get existing routes for next 7 days
3. Calculate distance from customer to each appointment in routes
4. Score slots by: proximity (70%) + customer preference (20%) + technician availability (10%)
5. Suggest top 3 slots with reasoning
6. Allow customer to choose or request alternatives

**Escalation Workflows (Business Configurable):**

**Method 1: Phone Transfer**

- Agent: "Let me connect you with someone who can help."
- Transfers call to business's main line
- Passes context (customer name, issue)

**Method 2: Support Ticket**

- Agent: "I'll create a support ticket and someone will call you back within 2 hours."
- Creates ticket in admin dashboard
- Admin sees: Customer name, phone, issue description, urgency
- Admin calls customer back

**Method 3: SMS Handoff**

- Agent: "I'll connect you with our team via text."
- Sends SMS to admin with customer info
- Admin continues conversation via SMS
- Customer sees seamless handoff

**Method 4: All of the Above**

- Business configures preferred method + fallbacks
- Example: Try phone transfer, if no answer → create ticket

**Usage Tracking & Analytics:**

Per business, per month:

- **Minutes used** (voice calls only, SMS doesn't count toward limit)
- **Total conversations** (voice + SMS + web)
- **Successful bookings** (appointments created)
- **Escalations** (times agent handed off to human)
- **Customer satisfaction** (optional post-conversation rating)
- **Outcome breakdown** (booked, quoted, escalated, abandoned)

**Interface:**

```
AI Agent (Customer Experience):
├── Voice Call
│   ├── Customer calls dedicated number
│   ├── AI agent answers with greeting
│   ├── Natural conversation (multi-turn)
│   ├── Booking confirmation (verbal)
│   └── SMS confirmation sent after call
├── SMS
│   ├── Customer texts dedicated number
│   ├── AI agent responds (conversational)
│   ├── Multi-message booking flow
│   └── Final confirmation message
└── Web Widget (Embedded on business website)
    ├── Click-to-call button → initiates voice call
    ├── Or: Text chat interface → connects to AI agent
    └── Same AI agent, consistent experience

Admin AI Configuration (Settings > AI Booking Agent):
├── Agent Status
│   ├── Active / Paused / Suspended
│   ├── Dedicated phone number
│   ├── Web widget embed code
│   └── Test agent (make test call/SMS)
├── Capabilities (Simple Toggles)
│   ├── ✅ Schedule appointments (always on)
│   ├── ✅ Provide quotes (always on)
│   ├── ☐ Allow rescheduling
│   ├── ☐ Allow cancellations
│   └── ☐ Answer service questions
├── Greeting & Personality
│   ├── Greeting message
│   ├── Business description (context)
│   ├── Tone (Professional / Friendly / Casual)
│   └── [Future] Voice clone
├── Escalation Settings
│   ├── Escalation method (phone/ticket/SMS/all)
│   ├── Business contact number
│   ├── Admin SMS number
│   └── Escalation keywords
├── Usage Stats
│   ├── Minutes used / limit
│   ├── Conversations count
│   ├── Successful bookings
│   ├── Escalations
│   └── Customer satisfaction
├── Conversation Logs
│   ├── View all conversations
│   ├── Full transcripts
│   └── Filter by date, channel, outcome
└── Advanced
    ├── Custom instructions
    ├── Business hours override
    └── Delete agent
```

**LLM Configuration (Platform Owner - Super Admin):**

The platform owner (not individual businesses) chooses the underlying LLM model via ElevenLabs:

**Available Models (via ElevenLabs):**

- Claude (Anthropic) - Best reasoning, longer context
- GPT-4o (OpenAI) - Fast, good general performance
- GPT-4 Turbo (OpenAI) - Balance of speed and capability
- Gemini Pro (Google) - Multimodal, good for complex queries

**Platform Owner Sets Globally:**

- All businesses use the same LLM model
- Can be changed anytime via super admin dashboard
- Trade-offs: cost, latency, capability
- Default: Claude (best for nuanced service booking conversations)

**Super Admin Interface:**

```
Platform Settings > AI Configuration:
├── Global LLM Model
│   ├── Current: Claude (Anthropic)
│   ├── [Change Model] → dropdown
│   │   ├── Claude (Anthropic) - $0.08/min
│   │   ├── GPT-4o (OpenAI) - $0.10/min
│   │   ├── GPT-4 Turbo (OpenAI) - $0.09/min
│   │   └── Gemini Pro (Google) - $0.07/min
│   └── Model change affects all businesses immediately
├── ElevenLabs API Keys
│   ├── Production API key
│   └── Test mode API key
└── Voice Settings (Global)
    ├── Default voice (ElevenLabs voice library)
    ├── Speech rate
    └── Interruption handling
```

---

## Access Control Matrix

| Feature                       | Customer              | Technician         | Admin                  | Super Admin          | AI Agent            |
| ----------------------------- | --------------------- | ------------------ | ---------------------- | -------------------- | ------------------- |
| **View own appointments**     | ✅                    | ✅                 | ✅                     | ❌                   | ✅                  |
| **View all appointments**     | ❌                    | ❌                 | ✅ (own business)      | ✅ (all businesses)  | ✅ (read-only)      |
| **Create appointment**        | ✅ (via AI)           | ❌                 | ✅                     | ❌                   | ✅                  |
| **Edit appointment**          | ⚠️ (reschedule only)  | ❌                 | ✅                     | ❌                   | ❌                  |
| **Cancel appointment**        | ⚠️ (own only)         | ❌                 | ✅                     | ⚠️ (manual override) | ❌                  |
| **View technician location**  | ✅ (assigned only)    | ❌                 | ✅ (all)               | ❌                   | ❌                  |
| **Update location**           | ❌                    | ✅ (own)           | ❌                     | ❌                   | ❌                  |
| **Check in/out**              | ❌                    | ✅                 | ✅ (override)          | ❌                   | ❌                  |
| **View customer details**     | ⚠️ (own only)         | ⚠️ (assigned only) | ✅ (own business)      | ❌ (privacy)         | ⚠️ (limited)        |
| **Upload media**              | ✅ (own appointments) | ❌                 | ✅                     | ❌                   | ❌                  |
| **Submit rating**             | ✅ (post-service)     | ❌                 | ❌                     | ❌                   | ❌                  |
| **Manage routes**             | ❌                    | ❌                 | ✅                     | ❌                   | ❌                  |
| **Optimize routes**           | ❌                    | ❌                 | ✅ (trigger)           | ❌                   | ❌                  |
| **Configure services**        | ❌                    | ❌                 | ✅                     | ❌                   | ❌                  |
| **Manage technicians**        | ❌                    | ⚠️ (own profile)   | ✅                     | ❌                   | ❌                  |
| **View analytics**            | ❌                    | ⚠️ (own stats)     | ✅ (own business)      | ✅ (platform-wide)   | ❌                  |
| **System settings**           | ❌                    | ❌                 | ✅                     | ✅ (global)          | ⚠️ (via config)     |
| **View pricing**              | ⚠️ (during booking)   | ❌                 | ✅                     | ❌                   | ✅ (to communicate) |
| **Make payment**              | ✅ (own appointments) | ❌                 | ⚠️ (manual processing) | ❌                   | ❌                  |
| **View payment history**      | ⚠️ (own only)         | ❌                 | ✅ (own business)      | ✅ (all businesses)  | ❌                  |
| **Issue refund**              | ⚠️ (request only)     | ❌                 | ✅                     | ⚠️ (manual override) | ❌                  |
| **Configure pricing**         | ❌                    | ❌                 | ✅                     | ❌                   | ❌                  |
| **Connect payment processor** | ❌                    | ❌                 | ✅ (Professional+)     | ❌                   | ❌                  |
| **View payment analytics**    | ❌                    | ❌                 | ✅ (own business)      | ✅ (all businesses)  | ❌                  |
| **View own subscription**     | ❌                    | ❌                 | ✅                     | ❌                   | ❌                  |
| **Upgrade/downgrade tier**    | ❌                    | ❌                 | ✅                     | ⚠️ (manual)          | ❌                  |
| **View all subscriptions**    | ❌                    | ❌                 | ❌                     | ✅                   | ❌                  |
| **Manage platform settings**  | ❌                    | ❌                 | ❌                     | ✅                   | ❌                  |
| **Configure grace periods**   | ❌                    | ❌                 | ❌                     | ✅                   | ❌                  |
| **Manage pricing tiers**      | ❌                    | ❌                 | ❌                     | ✅                   | ❌                  |
| **View MRR/ARR analytics**    | ❌                    | ❌                 | ❌                     | ✅                   | ❌                  |
| **Impersonate business**      | ❌                    | ❌                 | ❌                     | ✅ (for support)     | ❌                  |
| **Create AI booking agent**   | ❌                    | ❌                 | ✅ (Professional+)     | ❌                   | ❌                  |
| **Configure AI agent**        | ❌                    | ❌                 | ✅ (own agent)         | ⚠️ (view only)       | ❌                  |
| **View AI conversations**     | ❌                    | ❌                 | ✅ (own business)      | ✅ (all businesses)  | ❌                  |
| **Set global AI model**       | ❌                    | ❌                 | ❌                     | ✅                   | ❌                  |
| **Book via AI agent**         | ✅ (if enabled)       | ❌                 | ❌                     | ❌                   | ❌                  |

**Legend:**

- ✅ Full access
- ⚠️ Limited/conditional access
- ❌ No access

---

## Communication Channels by User Type

### Customer

- **Inbound:** AI chat widget, phone calls (handled by admin), web portal
- **Outbound:** SMS (automated), Email (automated), In-portal notifications

### Technician

- **Inbound:** Mobile app, push notifications, SMS (critical updates)
- **Outbound:** Check-in/out status, location updates (automated), internal notes

### Admin

- **Inbound:** Dashboard, email alerts (system notifications), mobile notifications (optional)
- **Outbound:** Manual SMS/email to customers, system-wide announcements, route updates to technicians

### AI Agent

- **Inbound:** Customer chat messages (via widget API)
- **Outbound:** Chat responses, appointment confirmations

---

## Subscription & Monetization Model

### Revenue Model Overview

**Chotter generates revenue through subscription fees paid by businesses that use the platform.** This is separate from customer payment processing (Stripe Connect Express), where businesses collect payments from their customers.

**Two distinct money flows:**

1. **Platform Revenue:** Businesses pay Chotter for using the platform (subscription billing)
2. **Customer Payments:** Businesses collect payment from their customers for services (Stripe Connect)

### Subscription Tiers

#### Starter: $49/month or $470/year

**Save $118/year with annual billing**

**Included:**

- 1 admin user
- 3 field technicians
- Up to 100 appointments/month
- **AI booking agent: ❌ Not included** (manual booking only)
- Basic scheduling & dispatching
- Customer portal (web + magic link auth)
- Mobile app for technicians (iOS/Android)
- Email/SMS notifications (platform-paid)
- Real-time tracking
- Route optimization
- Pricing configuration (always available)
- **Payment processing: ❌ Not included**
- Basic analytics
- Email support

**Ideal for:** Small businesses, solopreneurs, new service businesses, low call volume

---

#### Professional: $179/month or $1,720/year

**Save $428/year with annual billing**

**Everything in Starter, plus:**

- 2 admin users
- 10 field technicians
- Up to 500 appointments/month
- **✅ AI booking agent enabled (voice, SMS, web widget)**
  - **500 voice minutes/month included** (~200-250 calls)
  - Unlimited SMS conversations
  - Dedicated Twilio phone number
  - Web widget embed code
  - 24/7 availability
  - Proximity-aware slot suggestions
  - Caller ID recognition
  - **Overage: $0.12/minute** (if exceeding 500 min)
- **✅ Payment processing enabled (Stripe Connect Express)**
- Advanced pricing rules (surcharges, emergency rates)
- Multi-location support
- Custom branding (logo, colors)
- Advanced analytics & reporting
- Priority support (24hr response)
- Zapier integration
- Customer segments & targeting
- Automated follow-ups

**Ideal for:** Growing businesses, 5-15 employees, high call volume, need AI booking + payment processing

---

#### Enterprise: Custom Pricing (starts ~$449/month)

**Everything in Professional, plus:**

- Unlimited admin users
- Unlimited field technicians
- Unlimited appointments
- **AI booking agent with expanded limits**
  - **2,000 voice minutes/month included** (~800-1,000 calls)
  - Overage: $0.10/minute (discounted)
  - Voice cloning (future feature)
  - Advanced agent customization
- Payment processing included
- API access (custom integrations)
- White-label options (full branding)
- Dedicated account manager
- Custom workflows
- Advanced security (SSO, SAML)
- SLA guarantees (99.9% uptime)
- Custom contract terms
- On-call support

**Ideal for:** Large enterprises, 50+ employees, very high call volume, complex workflows

---

### Free Trial

**14-Day Free Trial - No credit card required**

- Full access to chosen tier (Starter or Professional)
- No feature restrictions during trial
- No charges during trial period
- Email reminders on days 7, 12, 13
- Trial converts to paid at day 14 (requires card)
- Can cancel anytime during trial

**Annual Discount Incentive:**

- **Monthly billing:** No card at signup, card required at trial end
- **Annual billing:** Card required at signup (20% savings), NOT charged until trial ends
- Encourages annual commitment with immediate savings visibility

---

### Usage Limits & Grace Periods

**Appointment Limits:**

- Starter: 100 appointments/month
- Professional: 500 appointments/month
- Enterprise: Unlimited

**Grace Period System (Admin-Configurable by Platform Owner):**

**Default Settings:**

- Overage threshold: 10% (e.g., Starter can create up to 110 appointments)
- Grace periods per year: 1
- Auto-upgrade: Disabled (business chooses when to upgrade)

**How it works:**

1. **First overage (within 10% threshold):**
   - Appointments 101-110 allowed
   - Warning email sent: "You've used 110/100 appointments. You have 1 grace period remaining this year."
   - In-app banner prompts upgrade
   - Grace period counter: 1 used

2. **Second overage attempt:**
   - If already used grace period this year → hard block
   - Cannot create appointment #111 until upgrade
   - Prominent upgrade prompt with tier comparison

3. **Grace period reset:**
   - Resets annually on subscription anniversary
   - Example: Subscribed Jan 15 → resets Jan 15 next year

**Platform Owner Controls (Super Admin):**

- Adjust overage threshold (0-25%)
- Set grace periods per year (0-3)
- Enable/disable auto-upgrade
- Override limits for specific businesses

**User Limits:**

- Starter: 1 admin + 3 technicians = 4 users
- Professional: 2 admins + 10 technicians = 12 users
- Hard limits (no grace period)
- Prompt to upgrade when adding user beyond limit

---

### Payment Timing & Billing

**Trial Period:**

- Day 1-14: Full access, no charges
- Day 7: First reminder email
- Day 12: Second reminder email
- Day 13: Final reminder email
- Day 14: Trial ends
  - If card on file → auto-charge and continue
  - If no card → account suspended, prompt to add payment

**Monthly Billing:**

- Charged on same day each month
- Example: Subscribe Jan 15 → charged 15th of every month
- Failed payment → 3 retry attempts over 7 days
- After 3 failures → account suspended (read-only access)

**Annual Billing:**

- Charged once per year (save 20%)
- Example: $470/year instead of $588 (12 × $49)
- Card required at signup (for commitment)
- Not charged until after trial ends
- Renewal reminder 30 days before

**Billing Cycle Changes:**

- Upgrade: Prorated credit applied immediately
- Downgrade: Takes effect at next renewal (no pro-rating)
- Cancel: Access until end of current period

---

### Subscription Management (Business Admin)

**What Businesses Can Do:**

**View Subscription Details:**

- Current tier (Starter/Professional/Enterprise)
- Billing period (monthly/annual)
- Next billing date
- Payment method on file
- Billing history & invoices

**Manage Usage:**

- Current month usage: "347 / 500 appointments (69%)"
- Users: "7 / 10 field techs"
- Grace periods remaining: "1 / 1"
- Overage warnings

**Upgrade/Downgrade:**

- Upgrade anytime (prorated, immediate access)
- Downgrade at renewal (prevents overpayment)
- Compare tiers side-by-side
- See cost difference

**Payment Methods:**

- Add/update credit card
- View payment history
- Download invoices (PDF)
- Update billing email

**Cancellation:**

- Cancel anytime
- Access until period end
- No refunds for unused time (unless extenuating circumstances)
- Data export available for 30 days post-cancellation

---

### Industry Pricing Strategy (Future)

**Current State (MVP):**

- All businesses pay Standard rate
- Everyone on same pricing
- Focus on core features

**Future Evolution (Post-Launch):**

- Introduce industry-specific add-on modules
- Example pricing model:
  - **Base:** $149/month (Professional tier)
  - **HVAC Add-On:** +$30/month (HVAC-specific features)
  - **Electrician Add-On:** +$30/month (electrical licensing, permits)
  - **Plumbing Add-On:** +$20/month (parts tracking, diagrams)

**Why This Approach:**

- Avoid alienating early adopters with industry pricing
- Build niche features based on actual demand
- Allows specialization without forced segmentation
- Customers only pay for features they need

**Potential Industry Add-Ons:**

- HVAC: Equipment database, seasonal maintenance scheduling, warranty tracking
- Electrical: Permit management, code compliance, panel diagrams
- Plumbing: Parts catalog, fixture compatibility, water testing logs
- Auto Repair: VIN decoding, service history, part ordering integration

---

### Revenue Projections

**Conservative Growth Scenario (First Year):**

**Month 1-3: Free Beta**

- Target: 10 pilot businesses
- Revenue: $0 MRR
- Focus: Product-market fit, feedback, iteration
- All on free trial

**Month 4: Paid Launch**

- Target: 5 conversions from beta
- Tier mix: 60% Starter ($49), 40% Professional ($149)
- Avg price: $69
- Revenue: **$345 MRR** ($4,140 ARR)

**Month 6: Early Traction**

- Target: 20 total businesses
- New signups: ~3/month
- Tier mix: 55% Starter, 40% Professional, 5% Enterprise ($399)
- Avg price: $85
- Revenue: **$1,700 MRR** ($20,400 ARR)
- Operating costs: ~$250/month
- **Net profit: $1,450/month**

**Month 9: Growth Phase**

- Target: 40 total businesses
- New signups: ~7/month
- Tier mix: 50% Starter, 45% Professional, 5% Enterprise
- Avg price: $92
- Revenue: **$3,680 MRR** ($44,160 ARR)
- Operating costs: ~$350/month
- **Net profit: $3,330/month**

**Month 12: Year-End**

- Target: 50 total businesses
- New signups: ~3-5/month (steady state)
- Tier mix: 50% Starter, 45% Professional, 5% Enterprise
- Avg price: $99
- Revenue: **$4,950 MRR** ($59,400 ARR)
- Operating costs: ~$400/month
- **Net profit: $4,550/month**
- **Annual net: ~$25,000** (after ramp-up period)

---

**Optimistic Growth Scenario (First Year):**

**Month 6:**

- 50 businesses at $99 avg = **$4,950 MRR**
- Net profit: ~$4,300/month

**Month 12:**

- 150 businesses at $110 avg = **$16,500 MRR** ($198,000 ARR)
- Tier mix: 40% Starter, 50% Professional, 10% Enterprise
- Operating costs: ~$700/month
- **Net profit: $15,800/month**
- **Annual net: ~$90,000**

---

**Key Assumptions:**

- 15% monthly churn (industry average for SMB SaaS)
- 60% trial-to-paid conversion (with pilot customers, lower post-launch)
- 20% annual discount uptake (reduces Stripe fees)
- 10% upgrade rate per year (Starter → Professional)
- No industry add-ons in Year 1 (MVP focus)
- No platform fee on customer payments in Year 1 (0%)

**Upside Opportunities (Year 2+):**

- **Platform fee on payments:** 1% on customer transactions
  - Example: Professional tier business processes $50k/year → $500/year additional revenue
  - Conservative: 30% adoption = $150/year per Professional customer
- **Industry add-ons:** $20-30/month per add-on
  - 20% attach rate = +$6/month per customer avg
- **Enterprise deals:** Custom pricing $500-1,500/month
  - 5-10 Enterprise customers = +$5,000-15,000 MRR

**Path to $100k ARR:**

- Conservative: Month 18-24 (100-150 customers at $90-110 avg)
- Optimistic: Month 10-12 (90-100 customers at $110 avg)

---

## Monorepo Structure

```
chotter/
├── packages/
│   ├── web/                    # Admin dashboard (React + Vite)
│   ├── mobile/                 # Technician app (Expo + React Native)
│   ├── customer-portal/        # Customer web app (React + Vite)
│   ├── api/                    # Hono API for complex logic
│   ├── workers/                # Bun workers for heavy tasks
│   ├── ai-agent/               # AI scheduling agent (Hono)
│   └── shared/                 # Types, utils, components
├── supabase/                   # Database migrations, Edge Functions, RLS policies
├── infrastructure/             # Docker, Railway, Vercel configs
└── docs/                       # Documentation
```

**Architecture Pattern:**

- **Frontend → Supabase (Direct):** 60-70% of operations (CRUD with RLS)
- **Hono API:** 20-30% (complex logic, webhooks, AI integration)
- **Bun Workers:** 10% (route optimization, background jobs)

---

## Core Features by Phase

### Phase 1: Foundation (Weeks 1-2)

**Supabase Setup:**

- PostgreSQL + PostGIS database
- Authentication (JWT)
- Storage buckets for media
- Row Level Security (RLS) policies
- Local development environment

**Database Schema:**

- Core tables: Person, Customer, Technician, Service, Ticket, Route
- PostGIS for geospatial queries
- Foreign key relationships and indexes
- RLS policies for secure direct client access
- Generate TypeScript types via Supabase CLI

**RLS Policies (Critical for Direct Client Access):**

- Customers can only see their own appointments
- Technicians can only see their assigned routes
- Admins have full access
- Service data is public (read-only for customers)

**Hono API Foundation (Complex Logic Only):**

- Bun + Hono server
- Supabase client integration
- Auth middleware (verify Supabase JWT)
- Request validation (Zod)
- Error handling
- CORS configuration

**Endpoints (Minimal - Most CRUD via Direct Supabase):**

**Core Workflows:**

- POST /api/webhooks/geofence (from mobile app)
- POST /api/ai/chat (AI agent)
- POST /api/routes/optimize (trigger optimization)
- POST /api/routes/rebalance (rebalancing logic)

**Customer Payment Processing (Stripe Connect):**

- POST /api/stripe/create-express-account (create Stripe Express account for business)
- POST /api/stripe/create-account-link (generate Express onboarding link)
- GET /api/stripe/account-status/:business_id (check Express account capabilities)
- POST /api/payments/create-checkout-session (on behalf of connected account)
- POST /api/payments/create-payment-intent (on behalf of connected account)
- POST /api/payments/capture-payment (capture authorized payment)
- POST /api/payments/refund (process refund on connected account)
- GET /api/payments/:appointment_id (payment details)
- POST /api/webhooks/stripe-connect (Connect events: account.updated, etc.)
- POST /api/webhooks/stripe-payments (payment events on connected accounts)
- POST /api/pricing/calculate (dynamic price calculation)

**Platform Subscription Billing (Business Admin):**

- POST /api/subscriptions/start-trial (create trial subscription for new business)
- POST /api/subscriptions/create-checkout (create Stripe Checkout for subscription payment)
- POST /api/subscriptions/upgrade (upgrade tier, prorated charge, immediate access)
- POST /api/subscriptions/downgrade (schedule downgrade at period end)
- POST /api/subscriptions/cancel (cancel subscription, access until period end)
- POST /api/subscriptions/reactivate (reactivate canceled subscription if still in period)
- GET /api/subscriptions/current (get current subscription details + usage)
- GET /api/subscriptions/usage (get current period usage stats)
- POST /api/subscriptions/update-payment-method (update card via Stripe Customer Portal)
- GET /api/subscriptions/invoices (list invoices with PDF download links)

**Platform Subscription Admin (Super Admin Only):**

- GET /api/admin/subscriptions (list all subscriptions, filterable)
- GET /api/admin/subscriptions/:id (detailed subscription view)
- PATCH /api/admin/subscriptions/:id (manually adjust subscription)
- POST /api/admin/subscriptions/:id/refund (issue refund)
- POST /api/admin/subscriptions/:id/comp (create comp/free account)
- POST /api/admin/subscriptions/:id/suspend (suspend account)
- POST /api/admin/subscriptions/:id/override-limits (temporarily override limits)
- GET /api/admin/analytics/mrr (MRR/ARR calculations, growth metrics)
- GET /api/admin/analytics/trials (trial conversion tracking)
- GET /api/admin/analytics/churn (churn analysis, reasons)
- GET /api/admin/analytics/usage (usage stats across all businesses)
- PATCH /api/admin/settings/grace-period (update grace period configuration)
- PATCH /api/admin/settings/trial-config (update trial settings)
- GET /api/admin/tiers (list all subscription tiers)
- POST /api/admin/tiers (create new tier)
- PATCH /api/admin/tiers/:id (update tier pricing, features, limits)
- DELETE /api/admin/tiers/:id (deactivate tier)
- GET /api/admin/audit-logs (view super admin actions)
- POST /api/admin/impersonate/:business_id (generate impersonation token)

**Platform Subscription Webhooks (Stripe Billing):**

- POST /api/webhooks/stripe-billing (subscription lifecycle events)
  - customer.subscription.created
  - customer.subscription.updated
  - customer.subscription.deleted
  - customer.subscription.trial_will_end
  - invoice.payment_succeeded
  - invoice.payment_failed
  - invoice.finalized

**AI Booking Agent (Business Admin):**

- POST /api/ai-agent/create (create ElevenLabs agent for business, provision Twilio number)
- DELETE /api/ai-agent/:agent_id (delete agent, release phone number)
- PATCH /api/ai-agent/:agent_id/config (update capabilities, escalation, greeting)
- POST /api/ai-agent/:agent_id/pause (pause agent temporarily)
- POST /api/ai-agent/:agent_id/resume (resume paused agent)
- GET /api/ai-agent/:agent_id/usage (get current month usage stats)
- GET /api/ai-agent/:agent_id/conversations (list conversations with filters)
- GET /api/ai-agent/:agent_id/conversation/:conversation_id (get full conversation transcript)

**AI Agent Tools (Called BY ElevenLabs agent via webhooks):**

- POST /api/agent-tools/schedule-appointment (book new appointment with proximity optimization)
- POST /api/agent-tools/get-available-slots (get optimal time slots for customer)
- POST /api/agent-tools/calculate-quote (calculate pricing with surcharges)
- POST /api/agent-tools/reschedule-appointment (reschedule existing appointment, if enabled)
- POST /api/agent-tools/cancel-appointment (cancel appointment, if enabled)
- POST /api/agent-tools/get-customer-history (caller ID lookup, past appointments)
- POST /api/agent-tools/escalate (trigger escalation workflow)
- POST /api/agent-tools/answer-question (search business FAQs, if enabled)

**ElevenLabs Webhooks (Receive agent events):**

- POST /api/webhooks/elevenlabs/conversation-started (new conversation initiated)
- POST /api/webhooks/elevenlabs/conversation-ended (conversation completed)
- POST /api/webhooks/elevenlabs/tool-called (agent called a tool, log for debugging)

**Twilio Webhooks (SMS/Voice routing):**

- POST /api/webhooks/twilio/sms-inbound (incoming SMS to agent number)
- POST /api/webhooks/twilio/voice-inbound (incoming call to agent number)
- POST /api/webhooks/twilio/call-status (call completed, log duration)
- POST /api/webhooks/twilio/call-transfer (transfer to business number)

**Super Admin (AI Configuration):**

- PATCH /api/admin/ai-config/llm-model (change global LLM model for all agents)
- GET /api/admin/ai-config/usage-stats (platform-wide AI usage metrics)
- GET /api/admin/ai-agents (list all AI agents across businesses)
- GET /api/admin/ai-conversations (view all conversations, filterable)

**Shared Package:**

- TypeScript types (from Supabase)
- Validation schemas (Zod)
- Utility functions
- Constants and enums

### Phase 2: Admin Dashboard (Weeks 3-4)

**Web Dashboard:**

- React + Vite + TypeScript
- TanStack Router for routing
- TanStack Query for data fetching
- Zustand for state management
- Tailwind CSS styling
- Supabase client for direct database access

**Key Features:**

- Login page (Supabase Auth)
- Dashboard overview
- **Appointment CRUD (Direct Supabase calls with RLS)**
- **Technician management (Direct Supabase calls)**
- **Service type configuration (Direct Supabase calls)**
- **Customer management (Direct Supabase calls)**
- Calendar view (day/week/month)

**Direct Supabase Pattern:**
All CRUD operations call Supabase directly from frontend:

- Create appointment: `supabase.from('appointments').insert()`
- Update technician: `supabase.from('technicians').update()`
- Query routes: `supabase.from('routes').select()`
- RLS policies ensure security

**Hono API Calls (Complex Logic Only):**

- Trigger route optimization
- Request AI booking suggestions
- Handle webhooks

**No Traditional REST API for CRUD** - Supabase handles it all with type-safe client + RLS

### Phase 3: Technician Mobile App (Weeks 5-7)

**Expo Setup:**

- Pure Expo (no dev client for MVP)
- Expo Router for navigation
- Supabase integration
- Authentication

**Key Features:**

- Login screen
- Today's route view
- Appointment details with customer info
- Check-in/Complete buttons
- Navigate to next stop (opens Maps app)
- Customer contact information

**Location Tracking (MVP):**

- expo-location for basic tracking
- Foreground and background location updates
- Send location to Supabase
- Basic geofencing with expo-task-manager

**Push Notifications:**

- expo-notifications (no Firebase needed!)
- Register for push tokens
- Handle foreground/background notifications
- In-app alerts

**Direct Supabase Integration:**

- Fetch route: `supabase.from('routes').select('*, appointments(*)').eq('technician_id', id)`
- Check-in: `supabase.from('appointments').update({ status: 'in_progress', actual_start_time: now })`
- Complete: `supabase.from('appointments').update({ status: 'completed', actual_end_time: now })`
- Real-time route updates via Supabase Realtime subscriptions

**Hono API Calls (Minimal):**

- POST to /api/webhooks/geofence (geofence events for notification triggers)
- Complex location validation if needed

### Phase 4: AI Booking Agent with ElevenLabs (Weeks 8-10)

**Week 8: ElevenLabs Integration + Agent Creation**

**ElevenLabs Setup:**

- Create ElevenLabs account + generate API keys (production + test)
- Choose default LLM model (Claude via ElevenLabs) in super admin settings
- Configure global voice settings (voice library, speech rate, interruption handling)
- Test conversational AI in ElevenLabs dashboard
- Review ElevenLabs docs: https://elevenlabs.io/docs/agents-platform

**Twilio Setup:**

- Create Twilio account + generate API keys
- Configure Twilio phone number pool (US numbers, voice + SMS enabled)
- Set up webhook endpoints for inbound calls/SMS
- Test phone number provisioning API
- Configure call recording (for debugging, opt-in only)

**Agent Creation Endpoint (POST /api/ai-agent/create):**

- Create ai_agents database record (status='setup')
- Provision Twilio phone number for business
- Create ElevenLabs agent via API:
  - Configure agent name: "[Business Name] Booking Assistant"
  - Set LLM model (from platform settings)
  - Register agent tools (webhooks to our API)
  - Set default greeting from business config
- Store elevenlabs_agent_id and phone_number in database
- Return agent details to admin
- Update status to 'active'

**Agent Tools Registration:**
Register these tools with ElevenLabs agent (webhooks to our API):

- schedule_appointment (book new appointment)
- get_available_slots (query optimal time slots)
- calculate_quote (get pricing)
- get_customer_history (caller ID lookup)
- reschedule_appointment (if enabled)
- cancel_appointment (if enabled)
- escalate (trigger human handoff)

**Web Widget Scaffold:**

- Create embeddable widget package
- Click-to-call button (initiates call via Twilio)
- Text chat interface (connects to SMS number)
- Embed code generation

**Week 9: Agent Tools + Business Logic**

**Proximity-Aware Slot Algorithm (POST /api/agent-tools/get-available-slots):**

```typescript
async function getAvailableSlots(customerId, serviceId, preferences) {
  // 1. Get customer location
  const customer = await supabase.from('customers').select('location').eq('id', customerId)

  // 2. Get technicians with required skills
  const technicians = await getTechniciansWithSkills(serviceId)

  // 3. Get existing routes for next 7 days
  const routes = await getUpcomingRoutes(technicians)

  // 4. Calculate proximity scores
  const slots = []
  for (const route of routes) {
    for (const appointment of route.appointments) {
      const distance = calculateDistance(customer.location, appointment.location)
      if (distance < 5) { // Within 5 miles
        const slot = {
          technician_id: route.technician_id,
          suggested_time: appointment.end_time + 30min,
          proximity_score: 1 / (distance + 0.1), // Closer = higher score
          reasoning: `We have a technician in your area at ${formatTime(slot.suggested_time)}`
        }
        slots.push(slot)
      }
    }
  }

  // 5. Score and rank slots
  slots.sort((a, b) => b.proximity_score - a.proximity_score)

  // 6. Return top 3 with reasoning
  return slots.slice(0, 3)
}
```

**Implement Agent Tools:**

- **schedule_appointment:** Create appointment, customer, link to technician, send confirmation
- **calculate_quote:** Apply pricing rules (base + surcharges), return breakdown
- **get_customer_history:** Lookup by phone number, return past appointments
- **escalate:** Trigger configured escalation (phone transfer/ticket/SMS)
- All tools: Validate business_id, check agent capabilities, log tool calls

**Caller ID Recognition:**

- Inbound call/SMS → extract phone number
- Query: `supabase.from('customers').select().eq('phone', number)`
- If found → pass customer_id + history to agent context
- Agent greets: "Hi Sarah! I see you last had service in January..."

**Conversation Logging:**

- ElevenLabs webhook: conversation_started → Create ai_conversations record
- ElevenLabs webhook: conversation_ended → Update with transcript, outcome, duration
- Store full transcript for admin review
- Calculate duration_seconds for usage tracking

**Usage Tracking:**

- Twilio webhook: call_status → Extract duration
- Update ai_agents.usage_this_period (increment by minutes)
- Check against tier limit (500 min Professional, 2000 min Enterprise)
- Send warning email at 80% usage
- Return 402 Payment Required if exceeded (with upgrade link)

**Escalation Workflows:**

- **Phone Transfer:** Use Twilio <Dial> verb to transfer to business number, pass context
- **Support Ticket:** Create ticket record in database, notify admin via email + SMS
- **SMS Handoff:** Send SMS to admin with customer details, continue conversation
- All methods: Log escalation in ai_conversations table

**Week 10: Admin Configuration + Testing**

**AI Agent Settings Page (Settings > AI Booking Agent):**

- Agent creation wizard:
  1. Enable AI agent (explain benefits)
  2. Configure greeting + tone
  3. Toggle capabilities (reschedule, cancel, questions)
  4. Set escalation method
  5. Test agent (make test call/SMS)
  6. Get embed code (widget)
- Configuration UI (all toggles from design above)
- Usage dashboard (minutes, conversations, bookings, escalations)
- Conversation logs viewer:
  - List all conversations (date, channel, duration, outcome)
  - Click to view full transcript
  - Filter by date range, channel, outcome
  - Download CSV export

**Web Widget Implementation:**

- Embed script generates iframe
- Click-to-call: Opens Twilio client, initiates call to agent number
- Text chat: POST messages to Twilio SMS API
- Real-time message display (polling or WebSocket)
- Conversation history (last 24 hours)
- Mobile-responsive design

**Twilio Webhook Handlers:**

- POST /api/webhooks/twilio/voice-inbound:
  - Extract phone number (caller ID)
  - Route to ElevenLabs agent
  - Return TwiML: <Connect> to agent
- POST /api/webhooks/twilio/sms-inbound:
  - Extract message body + phone number
  - Forward to ElevenLabs agent via API
  - Agent responds, send SMS back via Twilio
- POST /api/webhooks/twilio/call-status:
  - Log call duration
  - Update usage tracking
  - Save to ai_conversations

**ElevenLabs Webhook Handlers:**

- POST /api/webhooks/elevenlabs/conversation-started:
  - Create ai_conversations record
  - Start timer
- POST /api/webhooks/elevenlabs/conversation-ended:
  - Update record with transcript
  - Calculate outcome (booked if appointment_id)
  - Send SMS confirmation if booking successful
- POST /api/webhooks/elevenlabs/tool-called:
  - Log tool name + parameters (debugging)
  - Track which tools used most

**Testing Scenarios:**

1. **Happy Path (Voice):**
   - Call agent number
   - Agent greets, asks how to help
   - Request HVAC repair tomorrow
   - Agent suggests 2pm slot (near existing route)
   - Confirm booking
   - Receive SMS confirmation

2. **Returning Customer:**
   - Sarah calls (recognized via caller ID)
   - Agent: "Hi Sarah! I see you last had service in January..."
   - Books follow-up appointment

3. **Pricing Quote:**
   - Customer asks price for emergency AC repair
   - Agent calculates: $149 base + $30 emergency fee = $179
   - Customer books

4. **Escalation:**
   - Customer asks complex question agent can't handle
   - Agent: "Let me connect you with someone who can help."
   - Transfer to business number OR create ticket

5. **SMS Booking:**
   - Customer texts agent number: "Need plumbing repair"
   - Agent responds: "I can help! What day works best?"
   - Multi-message conversation
   - Booking confirmation via SMS

6. **Usage Limit:**
   - Business exceeds 500 minutes (Professional tier)
   - Next call returns error + SMS to admin
   - Admin sees "Upgrade to Enterprise" prompt

**Direct Supabase Integration:**

- Agent tools query: `supabase.from('technicians').select()`, `routes`, `appointments`
- Create appointment: `supabase.from('appointments').insert()`
- Caller ID lookup: `supabase.from('customers').select().eq('phone', number)`
- All with RLS policies (agent uses service role key)

**Super Admin AI Configuration:**

- Platform Settings > AI Configuration
- Select global LLM model (Claude, GPT-4o, etc.)
- View platform-wide AI usage (total minutes across all businesses)
- List all AI agents (filterable by business)
- View all conversations (privacy considerations, anonymize customer data)
- Override agent settings (for support/debugging)

### Phase 5: Route Optimization & Error Handling (Weeks 10-13)

**Week 10-11: Route Optimization**

**Bun Worker Process (Long-Running):**

- Pure Bun script (no framework needed)
- Google OR-Tools or custom VRPTW algorithm
- Distance matrix API (Google Maps/Mapbox)
- Reads/writes directly to Supabase

**Initial Route Generation:**

1. Query Supabase for unscheduled appointments
2. Query Supabase for available technicians
3. Build skill eligibility matrix
4. Geographic clustering (k-means)
5. Assign clusters to technicians
6. Optimize sequence within cluster (TSP)
7. Add time buffers
8. Validate time windows
9. **Write routes directly to Supabase** (no API layer)

**Real-Time Rebalancing Worker:**

- Continuous process monitoring Supabase
- Subscribe to appointment completion events (Supabase Realtime)
- Calculate reassignment opportunities
- Write rebalancing suggestions to database
- Dispatcher approves via admin dashboard (direct Supabase update)

**Admin Route Management:**

- Route visualization on map (Mapbox)
- Drag-and-drop assignment (direct Supabase updates)
- View optimization suggestions (from worker)
- Approve/reject rebalancing (direct Supabase updates)
- All via frontend → Supabase, no API

**Hono Endpoints (Triggers Only):**

- POST /api/workers/optimize-routes (trigger worker via queue/webhook)
- POST /api/workers/rebalance (trigger rebalancing check)
- Workers do actual work, write results to Supabase

---

**Week 11: Monitoring & Alerting Setup**

**BetterStack Uptime Monitoring:**

- Configure 50 uptime monitors (1-min checks)
  - API health endpoint: /api/health
  - Customer portal root
  - Admin portal root
  - Mobile API status
- Set up alerting thresholds:
  - Warning: Response time >1s or single failure
  - Critical: 2+ consecutive failures or >3s response
- Create public status page (status.chotter.com)
- Configure Slack webhook for alerts

**Sentry Error Tracking:**

- Configure Sentry SDK across all apps:
  - Hono API (server-side errors)
  - React admin dashboard (frontend errors)
  - React customer portal
  - Expo mobile app
- Set up release tracking
- Configure performance monitoring (APM)
- Define error grouping rules
- Set up Slack integration

**BetterStack Logs:**

- Configure log aggregation from Railway + Vercel
- Set up 14-day retention policy
- Create log search queries for common issues
- Configure log-based alerts (error rate >5%)

**Custom Metrics Dashboard:**

- Super admin dashboard metrics:
  - Active businesses count
  - Total appointments today
  - AI agent conversations (success rate)
  - Payment success rate
  - Failed appointments count
- Real-time health indicators:
  - API response time (avg)
  - Database query time (avg)
  - Error rate (last hour)
  - Uptime (30 days)

---

**Week 12: Error Handling Patterns**

**Circuit Breaker Implementation:**

- Create CircuitBreaker class in shared lib
  ```typescript
  class CircuitBreaker {
    threshold: number; // Open after N failures
    timeout: number; // Stay open for X ms
    resetTimeout: number; // Reset count after X ms
  }
  ```
- Implement for each external API:
  - Stripe (threshold: 10, timeout: 5min)
  - Mapbox (threshold: 5, timeout: 10min)
  - Twilio (threshold: 5, timeout: 5min)
  - ElevenLabs (threshold: 3, timeout: 5min)

**Retry Logic with Exponential Backoff:**

- Payment processing retries:
  - Immediate → 1s → 2s → 5s → 10s → 30s
  - Queue for background processing after 6 attempts
- SMS/Voice retries:
  - 5min → 15min → 1hr → 6hr → 24hr
- Webhook retries:
  - Immediate → 1min → 5min → 30min → 2hr → 12hr → 24hr (×4)

**Database Tables for Error Handling:**

```sql
-- Failed payments queue
CREATE TABLE failed_payments (
  id UUID PRIMARY KEY,
  payment_id UUID,
  business_id UUID,
  customer_id UUID,
  amount INTEGER,
  error_code TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Webhook events tracking
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY,
  provider TEXT NOT NULL,
  idempotency_key TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL,
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMP,
  last_error TEXT,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Dead letter queue for failed webhooks
CREATE TABLE webhook_dlq (
  id UUID PRIMARY KEY,
  webhook_event_id UUID REFERENCES webhook_events(id),
  provider TEXT,
  event_type TEXT,
  payload JSONB,
  failure_reason TEXT,
  total_attempts INTEGER,
  moved_to_dlq_at TIMESTAMP DEFAULT NOW()
);

-- SMS retry queue
CREATE TABLE sms_queue (
  id UUID PRIMARY KEY,
  to_number TEXT,
  from_number TEXT,
  message TEXT,
  business_id UUID,
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Security events log
CREATE TABLE security_events (
  id UUID PRIMARY KEY,
  event_type TEXT NOT NULL,
  provider TEXT,
  ip_address TEXT,
  payload TEXT,
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Webhook Signature Verification:**

- Implement verification middleware for:
  - Stripe webhooks (stripe.webhooks.constructEvent)
  - Twilio webhooks (twilio.validateRequest)
  - ElevenLabs webhooks (HMAC-SHA256)
- Log invalid signatures to security_events table
- Alert super admin if >5 failures in 10 min

**AI Agent Fallback Logic:**

- Voice channel: Route to voicemail + callback queue
- SMS channel: Auto-reply + manual inbox
- Web widget: Show manual booking form with cached slots
- Health check worker (runs every 5 min):
  - Monitor ElevenLabs/Twilio status APIs
  - Enable fallback mode when degraded
  - Process queued requests when recovered

---

**Week 13: Testing & Documentation**

**Chaos Engineering Tests (Staging):**

1. Database failure & PITR restore drill
2. Payment processing failure simulation
3. AI agent complete outage (all channels)
4. Webhook replay attack (idempotency)
5. External API rate limiting (circuit breaker)
6. Multiple simultaneous failures

**Automated Tests:**

- Unit tests for circuit breaker logic
- Unit tests for retry with exponential backoff
- Unit tests for webhook signature verification
- Integration tests for webhook processing
- Integration tests for AI agent fallback flows
- Load tests: 1000 concurrent appointments, 500 AI conversations

**Incident Response Playbook:**

- Document 6-step incident procedure:
  1. Detect (0-5 min)
  2. Assess (5-15 min)
  3. Communicate (15-30 min)
  4. Mitigate (30min-4hr)
  5. Resolve (varies)
  6. Post-mortem (48hr)
- Create runbooks for common scenarios:
  - Database slow queries
  - Payment processing failures
  - AI agent outages
  - External API degradation
- Set up PagerDuty on-call rotation
- Train team on incident response

**Performance SLA Monitoring:**

- Configure alerts for SLA violations:
  - API response time >300ms (95th percentile)
  - Database query time >1s (average)
  - Page load time >2s (customer portal)
  - Error rate >5% (5-min window)
- Test all alert scenarios
- Verify escalation procedures

**Documentation:**

- Error handling architecture diagram
- Circuit breaker configuration guide
- Webhook retry policy documentation
- AI agent fallback flow diagrams
- Monitoring dashboard setup guide
- Post-mortem template

### Phase 6: Customer Portal & Notifications (Weeks 14-15)

**Notification Worker (Bun):**

- Pure Bun script monitoring Supabase
- Subscribe to database changes via Supabase Realtime
- Twilio SMS integration
- Resend email integration
- React Email templates

**Notification Triggers (Database Events):**

- Appointment created → SMS + Email confirmation
- Appointment status = 'en_route' → "On the way"
- GeofenceEvent with type 'approaching' → "Arriving in 15 min"
- GeofenceEvent with type 'arrived' → "Technician arrived"
- Appointment status = 'completed' → Rating request
- **Payment succeeded → Payment confirmation email with receipt**
- **Payment required → Payment request SMS with link**
- **Payment failed → Payment failure notification**
- Check delay calculation → Send delay notification

**Customer Portal (Direct Supabase):**

- React + Vite
- Magic link authentication (Supabase Auth)
- **All data via direct Supabase queries with RLS**
- View appointment: `supabase.from('appointments').select('*, technician(*)')`
- Live tracking via Supabase Realtime subscription
- **View pricing: `supabase.from('pricing_rules').select()`**
- **View payment status: `supabase.from('payments').select()`**
- Reschedule: Direct `update()` call
- Upload photos: Direct to Supabase Storage
- Submit rating: Direct `update()` call
- **Payment history: Direct query from payments table**
- **Download receipts: Direct from Stripe receipt_url**

**Media Upload:**

- Direct upload to Supabase Storage from client
- No API needed - client has upload permissions via RLS
- Create media record via `supabase.from('media').insert()`

**Hono Endpoints (Minimal):**

- POST /api/webhooks/twilio (handle SMS replies)
- POST /api/webhooks/resend (handle email events)
- Webhook handlers only - no CRUD

**Note:** Payment integration will be added in Phase 7 before testing.

### Phase 7: Payment Integration (Weeks 16-20)

**Week 14: Foundation & Database**

- Create payment tables migration (payment_settings, pricing_rules, payments, refunds)
- Update existing tables (services, appointments, customers) with payment fields
- Apply RLS policies for payment tables
- Generate TypeScript types
- **Set up Stripe Connect platform account** (one-time setup for you as platform owner)
- Configure Stripe Connect API keys (test mode)
- Register webhook endpoints for Connect events

**Week 15: Stripe Express Onboarding & Pricing Configuration**

- **Separate pricing from payment processing:**
  - Move Pricing Configuration to Services section (always available)
  - Pricing Rules Builder:
    - Base pricing per service
    - Time-based surcharges (after-hours, weekends, holidays)
    - Emergency multiplier configuration
    - Service fee settings (flat/percentage)
- **Stripe Express Connect integration:**
  - Payment Processing settings page (separate from pricing)
  - "Enable Payment Processing" toggle
  - Create Express Account endpoint (POST /api/stripe/create-express-account)
  - Create Account Link endpoint (POST /api/stripe/create-account-link)
  - Handle return URLs (success/refresh)
  - Display connection status (account ID, capabilities, connected date)
  - Test mode indicator
- **Webhook handlers for Connect events:**
  - account.updated (onboarding status, capabilities)
  - account.application.deauthorized (disconnection)
- Payment methods configuration UI (only shown after Stripe connected)

**Week 16: Payment Processing on Connected Accounts**

- Stripe SDK integration for Connect (Hono API)
- Create Checkout Session endpoint (on behalf of connected account)
  - Use `stripe_account` header with Express account ID
  - Payment goes directly to business's Stripe account
  - Optional: Add application_fee_amount for platform revenue (0 for MVP)
- Create Payment Intent endpoint (on behalf of connected account)
- Payment webhook handlers:
  - payment_intent.succeeded → Update appointment + create payment record
  - payment_intent.payment_failed → Update status + notify admin
  - charge.refunded → Update payment record
- Webhook signature verification (separate endpoints for platform vs connected account webhooks)
- Idempotency key handling
- Receipt generation (React Email template with business branding)

**Week 17: Customer Payment Experience**

- Enhanced AI booking flow:
  - Calculate pricing based on rules
  - Display price breakdown
  - Generate payment link if required
- Payment page (Stripe Checkout integration)
- Post-booking payment flow
- Payment history view in customer portal
- Receipt download functionality
- Refund request UI

**Week 18: Admin Payment Management & Testing**

- Payment dashboard (transaction list, revenue summary)
- Manual payment processing UI
- Refund processing interface
- Payment analytics and reporting
- Comprehensive testing:
  - Stripe test cards (success, decline, disputed)
  - Pre-booking payment flow
  - Post-service payment flow
  - Refund scenarios
  - Webhook event handling
  - Edge cases (partial refunds, cancellations)
- Security audit of payment flows

**Direct Supabase Integration:**

- Read pricing rules: `supabase.from('pricing_rules').select()`
- Read payment status: `supabase.from('payments').select()` (with RLS)
- Write via Stripe webhook only (server-side)

**Hono API Endpoints:**

- POST /api/stripe/create-express-account
- POST /api/stripe/create-account-link
- GET /api/stripe/account-status/:business_id
- POST /api/payments/create-checkout-session (on connected account)
- POST /api/payments/create-payment-intent (on connected account)
- POST /api/payments/capture-payment
- POST /api/payments/refund (on connected account)
- GET /api/payments/:appointment_id
- POST /api/webhooks/stripe-connect (Connect account events)
- POST /api/webhooks/stripe-payments (payment events)
- POST /api/pricing/calculate

**Key Features:**

- Fully optional (master toggle in admin settings)
- Flexible pricing rules engine
- Multiple payment methods (card, Apple Pay, Google Pay, ACH)
- Pre-booking and post-service payment support
- Automated receipt generation and delivery
- Refund management with admin approval
- Comprehensive payment analytics
- Stripe test mode for development

**Security & Compliance (Stripe Express):**

- All Stripe API calls server-side only
- Webhook signature verification (platform + connected account webhooks)
- RLS policies prevent unauthorized payment access
- Idempotency keys prevent duplicate charges
- PCI compliance via Stripe (no card data stored)
- **Stripe handles KYC/AML for Express accounts** (reduces compliance burden)
- **Platform never touches business funds** (direct to connected account)
- **Businesses pay their own Stripe fees** (2.9% + $0.30 from their account)
- **Optional platform fee** (configurable via application_fee_amount, 0% for MVP)

---

## Payment Architecture Overview

### Money Flow with Stripe Connect Express:

```
Customer Payment:
1. Customer enters payment details in Stripe Checkout
2. Payment processed by Stripe
3. Funds go DIRECTLY to business's connected Stripe account
4. Business pays Stripe fees (2.9% + $0.30) from their account
5. Optional: Platform fee deducted automatically (0% for MVP)
6. Business receives net payment (minus Stripe fees)
7. Business receives payouts to their bank (2-day default)

Platform Owner:
- Never touches customer funds
- Pays $0 in transaction fees
- No money transmission license needed
- Reduced compliance burden
- Optional revenue via platform fee
```

### Why Stripe Connect Express?

**Benefits for Platform Owner:**

- ✅ No money transmission compliance
- ✅ Zero transaction fees
- ✅ Stripe handles all KYC/AML
- ✅ No fraud liability
- ✅ ~90% white-labeled experience
- ✅ Optional revenue model (platform fees)

**Benefits for Businesses:**

- ✅ Keep full control of their money
- ✅ 5-10 minute onboarding (feels native)
- ✅ Choose their own payout schedule
- ✅ Access to full Stripe dashboard (optional)
- ✅ Transparent fee structure
- ✅ Can disconnect anytime

**vs. Traditional Payment Processing:**

- ❌ Traditional: Platform processes all payments, holds funds, pays out to businesses
- ❌ Requires money transmission licenses (expensive, complex)
- ❌ Platform pays all Stripe fees upfront
- ❌ Higher fraud liability
- ❌ More compliance burden

**vs. Stripe Standard Accounts:**

- ❌ Standard: Businesses must create Stripe account manually first
- ❌ Less integrated experience
- ❌ Businesses must understand Stripe
- ✅ Express: Everything happens within your platform

### Common Business Workflows:

**Scenario 1: Business wants to show prices but not accept payments yet**

1. Admin goes to Services → Pricing Configuration
2. Sets base prices, surcharges, emergency rates
3. Pricing shows in AI chat widget during bookings
4. Appointments created without payment
5. Later: Admin can enable payment processing when ready

**Scenario 2: Business wants to accept payments immediately**

1. Admin goes to Services → Pricing Configuration
2. Sets base prices, surcharges, emergency rates
3. Admin goes to Settings → Payment Processing
4. Toggles "Enable Payment Processing" ON
5. Clicks "Connect Stripe Account"
6. Completes 5-10 min Express onboarding
7. Configures payment methods and timing
8. Customers can now pay during booking or after service

**Scenario 3: Business already has Stripe account (can't use with Express)**

- Express accounts are created by the platform
- If business has existing Stripe, they would need to:
  - Option A: Create new Express account for this platform
  - Option B: Wait for future Standard Account support (Phase 10+)
- Express is simpler and recommended for most

### Phase 8: Subscription Billing (Weeks 21-23)

**Week 18: Stripe Billing Setup + Trial Flow**

- **Stripe Billing Configuration:**
  - Create Stripe account for platform (NOT Connect - separate billing account)
  - Create Stripe Products for each tier (Starter, Professional, Enterprise)
  - Create Stripe Prices (monthly + annual) for each product
  - Set up Stripe tax settings (if applicable)
  - Configure Stripe Customer Portal (for payment method management)
  - Register Stripe billing webhook endpoint
  - Test webhook signature verification

- **Database Setup:**
  - Create migration: subscriptions, subscription_tiers, usage_tracking, platform_settings, super_admins, audit_logs tables
  - Seed subscription_tiers with default values
  - Seed platform_settings with default configuration
  - Apply RLS policies (subscriptions: business can view own, super_admin can view all)
  - Generate TypeScript types

- **Trial Signup Flow:**
  - Signup page UI (choose tier, monthly/annual)
  - POST /api/subscriptions/start-trial endpoint
    - Create business record in database
    - Create Stripe Customer (no card for monthly, card required for annual)
    - Create Stripe Subscription with trial_period_days=14
    - Write subscription record to database
    - Send welcome email
  - Trial reminder email worker
    - Query subscriptions where trial_end in (7 days, 2 days, 1 day)
    - Send reminder emails via Resend
    - Use React Email templates

- **Trial-to-Paid Conversion:**
  - Trial ending page (card collection if not on file)
  - Stripe Checkout Session for subscription payment
  - Handle invoice.payment_succeeded webhook
  - Activate subscription on successful payment
  - Handle invoice.payment_failed webhook (suspend account)

**Week 19: Usage Tracking + Feature Gating**

- **Usage Counter System:**
  - Database trigger: Increment appointments_created in usage_tracking on appointment insert
  - Background worker: Calculate monthly usage per business
  - Reset counters at period_start
  - Track grace period usage

- **Feature Gating Middleware:**
  - Hono middleware: checkSubscription()
  - Check subscription status (trialing, active, past_due, canceled)
  - Check trial expiration
  - Check tier feature access
  - Return 402 Payment Required if subscription invalid
  - Return 403 Forbidden if feature not in tier

- **Usage Limit Enforcement:**
  - Middleware: checkAppointmentLimit()
  - Query current usage vs tier limit
  - Calculate grace period allowance (default 10%)
  - If within threshold → allow + increment grace_periods_used
  - If exceeded grace → hard block + return upgrade prompt
  - Send warning emails when approaching limit

- **Grace Period Configuration UI (Super Admin):**
  - Platform Settings page
  - Update overage threshold (0-25%)
  - Update grace periods per year (0-3)
  - Toggle auto-upgrade
  - PATCH /api/admin/settings/grace-period

- **Upgrade Prompts (Business Admin):**
  - In-app banner when 80% of limit reached
  - Modal when limit exceeded
  - Show tier comparison
  - Calculate cost difference
  - Link to upgrade flow

**Week 20: Subscription Management + Super Admin Dashboard**

- **Business Admin Subscription UI:**
  - Billing & Subscription settings page (as designed above)
  - Current plan widget (tier, price, renewal date, status)
  - Usage this month (appointments, users, grace periods)
  - Payment method management (Stripe Customer Portal redirect)
  - Billing history (list invoices, download PDFs)
  - Upgrade/downgrade flows
    - GET /api/subscriptions/current
    - POST /api/subscriptions/upgrade (prorated, immediate)
    - POST /api/subscriptions/downgrade (at period end)
  - Cancellation flow
    - POST /api/subscriptions/cancel
    - Confirmation modal with reasons survey
    - Access until period end
  - Tier comparison modal

- **Super Admin Dashboard:**
  - Overview page (MRR, ARR, active subs, trials, churn)
  - Subscriptions list (filterable, searchable)
  - Subscription detail view
  - Manual adjustment tools:
    - Issue refund
    - Comp account (free forever)
    - Override limits
    - Suspend/reactivate
  - Analytics pages:
    - MRR/ARR trend charts (Chart.js or Recharts)
    - Trial conversion funnel
    - Churn analysis
    - Usage distribution
    - Tier distribution pie chart
  - Platform Settings pages (grace period, trial config, tier management)
  - Audit log viewer

- **Stripe Webhook Handlers:**
  - POST /api/webhooks/stripe-billing
  - Handle subscription lifecycle:
    - customer.subscription.created → update status
    - customer.subscription.updated → sync changes
    - customer.subscription.deleted → mark canceled
    - customer.subscription.trial_will_end → send reminder
    - invoice.payment_succeeded → activate/continue subscription
    - invoice.payment_failed → retry 3 times, then suspend
    - invoice.finalized → send invoice email
  - Idempotency: Check event ID before processing
  - Webhook signature verification

- **Subscription Analytics Calculations:**
  - GET /api/admin/analytics/mrr
    - Calculate total MRR (sum of active subscriptions / billing period)
    - New MRR (new subscriptions this month)
    - Expansion MRR (upgrades)
    - Contraction MRR (downgrades)
    - Churned MRR (cancellations)
    - Net MRR change
  - GET /api/admin/analytics/trials
    - Trial starts (last 30 days)
    - Conversions (trials → paid)
    - Conversion rate by tier
    - Reasons for non-conversion
  - GET /api/admin/analytics/churn
    - Monthly churn rate
    - Churn by tier
    - Cancellation reasons (from survey)
    - Winback opportunities

- **Testing:**
  - Stripe test mode throughout
  - Test cards (successful, declined, disputed)
  - Test subscription lifecycle (trial → paid → upgrade → downgrade → cancel)
  - Test grace period enforcement
  - Test failed payment handling (retry logic)
  - Test webhook event handling
  - Test super admin impersonation
  - Security audit (RLS policies, auth middleware)

**Direct Supabase Integration:**

- Read subscription: `supabase.from('subscriptions').select()` (with RLS)
- Read tier config: `supabase.from('subscription_tiers').select()`
- Read usage: `supabase.from('usage_tracking').select()`
- Write via webhooks only (server-side, service role)

**Key Features:**

- 14-day free trial (no card for monthly, card required for annual)
- Automated trial reminders (days 7, 12, 13)
- Grace period system (configurable by super admin)
- Usage-based limits with enforcement
- Prorated upgrades (immediate access)
- Scheduled downgrades (at renewal)
- MRR/ARR analytics for platform owner
- Trial conversion tracking
- Churn analysis
- Super admin override tools
- Audit logging for all super admin actions

**Security & Compliance:**

- All Stripe API calls server-side only
- Webhook signature verification (separate from Connect webhooks)
- RLS policies prevent unauthorized subscription access
- Super admin 2FA required
- Impersonation mode audit logged
- Payment card data never stored (Stripe handles)
- PCI compliance via Stripe

---

### Phase 9: Testing & Launch (Week 24)

**Testing:**

- Unit tests (Bun test)
- Integration tests for API
- E2E tests (Playwright)
- Mobile testing on real devices
- Load testing (k6)

**Documentation:**

- API documentation
- Developer setup guide
- Architecture overview
- Deployment guide
- User guides (admin, tech, customer)

**Deployment:**

- Vercel: Web dashboard + customer portal
- Railway: API workers + notification service
- Supabase: Database + auth + storage
- Expo: Build mobile app (EAS Build)
- GitHub Actions: CI/CD pipeline

**Beta Launch:**

- Recruit 3-5 pilot customers
- Onboarding sessions
- Feedback collection
- Bug fixes
- Performance monitoring

---

## Technology Stack

### Backend Architecture (Hybrid Approach)

**1. Supabase (Primary - 60-70% of operations):**

- PostgreSQL + PostGIS (database)
- Supabase Auth (JWT authentication)
- Supabase Storage (media files)
- Supabase Realtime (live updates)
- Row Level Security (direct client access security)
- **Used for:** All CRUD operations, real-time updates, file storage

**2. Hono API (Complex Logic - 20-30% of operations):**

- Runtime: Bun 1.0+
- Framework: Hono (ultrafast, type-safe)
- **Used for:** AI agent, webhooks, optimization triggers, complex business logic

**3. Bun Workers (Heavy Tasks - 10% of operations):**

- Pure Bun scripts (no framework)
- **Used for:** Route optimization, rebalancing, notification processing, background jobs

**Why This Hybrid?**

- Eliminates 60-70% of traditional API endpoints
- Supabase RLS provides security for direct client access
- Hono handles complex logic that can't be done client-side
- Workers handle long-running computations
- Simpler, faster, less code to maintain

### Frontend Web

- Framework: React 18+
- Build: Vite
- Routing: TanStack Router
- State: Zustand
- Data: TanStack Query + Supabase Client
- Styling: Tailwind CSS
- Maps: Mapbox GL JS
- Database: Direct Supabase calls (no REST API layer)

### Mobile

- Framework: Expo + React Native
- Navigation: Expo Router
- Location: expo-location (MVP)
- Push: expo-notifications
- State: Zustand
- Data: TanStack Query + Supabase Client
- Database: Direct Supabase calls

### AI & External Services

- AI: Anthropic Claude API
- Maps: Google Maps API / Mapbox
- SMS: Twilio
- Email: Resend
- **Payments: Stripe Connect (Express Accounts)**
  - Express account onboarding (~90% white-labeled)
  - Payment processing on connected accounts
  - Businesses pay their own Stripe fees
  - Optional platform fee capability (0% for MVP)
- Validation: Zod

### Infrastructure

- Package Manager: Bun
- Frontend Host: Vercel (web dashboard + customer portal)
- API Host: Railway (Hono API for complex logic)
- Workers Host: Railway (Bun workers)
- Database: Supabase (managed PostgreSQL)
- CI/CD: GitHub Actions
- Monitoring: Sentry

---

## Data Models (Key Tables)

**Person:** Base user entity (email, phone, role, auth)

**Customer:** Extends Person (address, location point, preferences, **stripe_customer_id**)

**Technician:** Extends Person (skills array, home location, current location, working hours, on-call schedule)

**Service:** Service offerings (name, duration, required skills, **base_price, requires_payment, payment_timing [pre, post, either]**, photo requirements)

**Ticket:** Core appointment entity (customer, technician, service, scheduled date/time, time window, allow_early_arrival flag, status, location, ratings, **total_amount, payment_status, stripe_checkout_session_id**)

**Route:** Daily optimized route (technician, date, ticket sequence array, distance, duration, optimization score)

**PaymentSettings:** Business payment configuration (business_id, payment_processing_enabled boolean, stripe_account_id [Express account], stripe_account_type 'express', stripe_connected_at timestamp, stripe_onboarding_complete boolean, stripe_charges_enabled boolean, stripe_payouts_enabled boolean, accepted_payment_methods array, payment_timing_default [pre/post/either], refund_policy_days integer, platform_fee_percentage decimal [optional, 0 for MVP])

**PricingRule:** Dynamic pricing configuration (service_id, base_price, after_hours_type, after_hours_amount, weekend_type, weekend_amount, holiday_type, holiday_amount, emergency_multiplier, time_range_start, time_range_end)

**Payment:** Transaction records (appointment_id, stripe_payment_intent_id, stripe_checkout_session_id, customer_id, amount, currency, status [pending, succeeded, failed, refunded], payment_timing [pre, post], payment_method_types array, receipt_url, metadata jsonb)

**Refund:** Refund tracking (payment_id, stripe_refund_id, amount, reason, status [pending, succeeded, failed], requested_by, processed_by, requested_at, processed_at)

**Media:** Photos/videos (ticket, uploader, file URL, type, size)

**Notification:** Communication log (ticket, recipient, type, delivery method, status, message)

**LocationHistory:** Technician tracking (technician, location point, timestamp, accuracy)

**GeofenceEvent:** Triggered events (technician, ticket, event type, location, notification)

**AISchedulingLog:** Conversation audit (ticket, session, transcript, suggested slots, optimization score)

**Subscriptions:** Business subscription tracking (business_id, stripe_subscription_id, stripe_customer_id, tier [starter, professional, enterprise], billing_period [monthly, annual], status [trialing, active, past_due, canceled, unpaid], current_period_start timestamp, current_period_end timestamp, trial_end timestamp, cancel_at_period_end boolean, grace_periods_used_this_year integer default 0, grace_period_reset_date timestamp)

**SubscriptionTiers:** Tier definitions managed by platform owner (tier_name [starter, professional, enterprise], display_name, monthly_price decimal, annual_price decimal, features jsonb {payment_processing: boolean, analytics: boolean, zapier: boolean, api_access: boolean, white_label: boolean}, limits jsonb {appointments_per_month: integer, admin_users: integer, field_technicians: integer}, payment_processing_enabled boolean, is_active boolean, sort_order integer)

**UsageTracking:** Monthly usage counters (business_id, subscription_id, period_start timestamp, period_end timestamp, appointments_created integer, grace_period_triggered boolean, grace_period_date timestamp)

**PlatformSettings:** Global configuration singleton (grace_period_overage_threshold_pct integer default 10, grace_periods_per_year integer default 1, auto_upgrade_after_grace boolean default false, trial_length_days integer default 14, trial_reminder_days jsonb [7, 12, 13])

**SuperAdmins:** Platform admin accounts (person_id → Person.id, role 'super_admin', two_factor_enabled boolean required, last_login timestamp, audit_log_enabled boolean default true)

**AuditLogs:** Super admin action tracking (super_admin_id, action_type [view_subscription, adjust_subscription, impersonate_business, update_settings, manual_refund], target_business_id, details jsonb, ip_address, timestamp)

**AIAgents:** AI booking agent per business (business_id, elevenlabs_agent_id string, status enum[setup, active, paused, suspended], phone_number string [Twilio], capabilities jsonb {can_schedule: true, can_reschedule: boolean, can_cancel: boolean, can_answer_questions: boolean, proximity_aware: true}, escalation_settings jsonb {method: 'phone'|'ticket'|'sms'|'all', phone_number: string, sms_number: string, keywords: array}, greeting_config jsonb {greeting_message: string, business_description: string, tone: 'professional'|'friendly'|'casual'}, usage_this_period integer [minutes], period_start timestamp, created_at timestamp)

**AIConversations:** Conversation tracking (agent_id → ai_agents.id, business_id, customer_id uuid [if recognized], channel enum[phone, sms, web], phone_number string, started_at timestamp, ended_at timestamp, duration_seconds integer, transcript text, outcome enum[booked, quoted, escalated, abandoned], appointment_id uuid [if booked], escalated boolean, customer_satisfaction integer [1-5, optional])

---

## Key Algorithms

### Route Optimization (VRPTW)

**Input:** Appointments, technicians, service durations, time windows
**Constraints:** Skills, time windows, capacity, working hours
**Objective:** Minimize distance, balance workload, respect constraints
**Approach:** Geographic clustering + TSP with time windows

### Real-Time Rebalancing

**Triggers:** Early/late completion, emergency, technician unavailable
**Logic:** Calculate reassignment opportunities, check savings threshold, generate suggestions
**Output:** Rebalancing recommendations with time/distance impact

### AI Slot Optimization

**Input:** Customer location, service type, date range
**Process:** Get eligible technicians, calculate insertion cost for each time slot, score by proximity + efficiency
**Output:** Top 3-5 optimal slots with reasoning

---

## Development Environment

### Prerequisites

- Bun 1.0+
- Docker (for local Supabase)
- Supabase CLI
- Expo CLI
- Vercel CLI
- Xcode (iOS) or Android Studio

### Setup

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Clone and install
git clone <repo>
cd chotter
bun install

# Start local Supabase
supabase start

# Generate types from database
bun run db:types

# Start all services
bun dev
# - Web dashboard (Vite) with direct Supabase access
# - Customer portal (Vite) with direct Supabase access
# - Hono API (complex logic only)
# - Workers (route optimization, notifications)
```

### Scripts

- `bun dev` - Start all services
- `bun test` - Run tests
- `bun run db:migrate` - Apply migrations
- `bun run db:types` - Generate TypeScript types from Supabase
- `bun run db:seed` - Seed development data
- `bun run build` - Build for production

---

## Deployment Strategy

### Vercel (Frontend)

- Auto-deploy on git push to main
- Web dashboard + customer portal
- Environment variables via Vercel dashboard
- Edge network CDN
- **No backend API deployment** (using direct Supabase + separate Hono API)

### Railway (Hono API + Workers)

- Deploy Hono API with Bun runtime
- Deploy Bun workers as separate services
- Environment variables via Railway dashboard
- Auto-scaling based on load
- Continuous processes for workers

### Supabase (Database + Auth + Storage + Realtime)

- Managed PostgreSQL with PostGIS
- Row Level Security policies
- Auto-backups
- Apply migrations via CLI
- Real-time subscriptions
- Direct client access from frontend/mobile

### Expo (Mobile)

- Build with EAS Build
- Submit to App Store / Play Store
- OTA updates via EAS Update

---

## Success Metrics

### MVP Launch (Week 21)

- 5 pilot customers onboarded and on paid plans
- **3+ businesses on Starter, 2+ on Professional tier**
- **$500+ MRR from subscriptions**
- 20+ active technicians
- 100+ AI-scheduled appointments
- 90%+ notification delivery
- <5% error rate
- **2+ businesses with payment processing enabled** (optional feature)
- **Zero payment-related compliance issues** (Stripe handles all)
- **80%+ trial-to-paid conversion** (with pilot customers)

### 3 Months Post-Launch

- 50+ paying customers
- 500+ active technicians
- 25%+ drive time reduction
- 4.5+ star customer rating
- 80%+ AI adoption

### 6 Months Post-Launch

- 150+ customers
- Revenue positive
- <3% monthly churn
- 4+ stars on app stores

---

## Post-MVP Roadmap

### Phase 8: Pro Geolocation (Month 4)

- Add expo-dev-client
- Install react-native-background-geolocation ($200/year)
- Upgrade location tracking (30 min migration)
- More reliable geofencing
- Better battery optimization

### Phase 9: Advanced Features (Months 5-6)

- Multi-day route optimization
- Inventory management
- Digital forms/signatures
- **Advanced payment features:**
  - Saved payment methods (card on file)
  - Split payments (deposit + final payment)
  - Payment plans / installments
  - Tip functionality for technicians
  - Invoice generation (PDF)
  - Automatic late payment reminders
- Advanced analytics

### Phase 10: Integrations (Months 7-9)

- QuickBooks accounting **(includes payment sync from connected Stripe accounts)**
- Zapier webhooks
- Public REST API
- CRM integrations
- **Additional payment processors (PayPal, Square via similar Connect models)** _(optional)_
- **Enable platform fee** (add revenue model via Stripe application fees)
- **AI Setup Assistant (ElevenLabs-powered onboarding):**
  - Voice-guided business onboarding for new signups
  - Hands-free data collection via phone call
  - Captures: business info, services offered, pricing, technician details
  - Creates admin account, sets up initial configuration
  - Reduces time-to-value, improves trial conversion
  - Available as opt-in during trial signup
  - Example flow:
    1. User signs up, receives welcome email + phone number
    2. Calls setup assistant: "Hi! I'm here to help you get started..."
    3. AI asks questions, fills out setup form automatically
    4. Admin logs in to fully configured account
    5. 80% less manual data entry

### Phase 11: Enterprise (Months 10-12)

- SSO via Supabase Auth
- Advanced permissions
- Audit logging
- Custom branding
- SLA monitoring

---

## Risk Mitigation

| Risk                                                       | Impact | Mitigation                                                                                                                  |
| ---------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------- |
| Expo location unreliable on iOS                            | High   | Manual check-in buttons + upgrade path to pro geolocation                                                                   |
| Route optimization too slow                                | Medium | Incremental optimization, caching, background processing                                                                    |
| AI gives incorrect info                                    | High   | Human review for first 100 bookings, extensive testing                                                                      |
| API rate limits (Maps, Twilio)                             | Medium | Implement caching, batch requests, upgrade plans                                                                            |
| Database performance                                       | Medium | Optimize queries, indexes, consider read replicas                                                                           |
| **Stripe Express onboarding friction**                     | Medium | Clear instructions, pre-fill business data, support chat, allow skip for later                                              |
| **Payment disputes/chargebacks**                           | Medium | Businesses handle via their Stripe account (platform not liable), provide dispute management guide                          |
| **Low trial-to-paid conversion**                           | High   | No card required trial lowers friction, automated reminders, show value quickly, offer annual discount incentive            |
| **Subscription payment failures**                          | Medium | Stripe handles 3 retries over 7 days, send proactive email alerts, easy payment method update via Customer Portal           |
| **Businesses exceed limits during busy season**            | Medium | Grace period system (10% overage), proactive warnings at 80% usage, easy in-app upgrade flow                                |
| **Price sensitivity (too expensive for small businesses)** | High   | Start at $49/month (competitive with alternatives), clear ROI messaging (30%+ more appointments), free trial to prove value |
| **Churn due to complexity**                                | Medium | Excellent onboarding, in-app tutorials, responsive support, proactive check-ins at 30/60/90 days                            |
| Low adoption                                               | High   | Pilot with friendly customers, iterate on feedback                                                                          |
| High churn                                                 | High   | Proactive onboarding, regular check-ins, usage analytics to identify at-risk customers                                      |

---

## Error Handling & Disaster Recovery

### Overview

This section defines how the platform handles failures, maintains availability, and recovers from disasters. The goal is to balance reliability with cost-effectiveness for a new B2B SaaS platform.

**Target SLAs:**

- **RTO (Recovery Time Objective):** <4 hours (time to restore service)
- **RPO (Recovery Point Objective):** <1 hour (maximum data loss)
- **Uptime Target:** 99.5% (minimum 3.6 hours downtime/month acceptable)

---

### 1. Database Backup & Recovery

**Strategy:** Automated backups with point-in-time recovery using Supabase Pro features.

#### Backup Schedule

**Automated Backups:**

- **Daily automated backups** (retained 7 days) via Supabase
- **Point-in-time recovery (PITR)** to any second within last 7 days
- **Weekly backups** retained for 30 days
- **Monthly snapshots** retained for 1 year (starting Month 6)

**Backup Testing:**

- Monthly automated restore test to staging environment
- Quarterly manual restoration drill with full verification
- Document restoration time and any issues encountered

#### Recovery Procedure

**When Database Issues Occur:**

```
STEP 1: DETECTION (0-5 min)
- Alert received via monitoring (Supabase status or customer reports)
- On-call engineer acknowledges alert
- Check Supabase dashboard for error details

STEP 2: ASSESSMENT (5-15 min)
- Determine severity: Data corruption? Accidental deletion? Performance issue?
- Check status.supabase.com for platform-wide issues
- Identify scope: All data affected or specific tables?
- Determine if PITR restore needed or if fix can be applied

STEP 3: COMMUNICATION (15-30 min)
- Update internal status page
- Post to customer status page: "Investigating database issues"
- If Critical: Email all businesses with ETA
- Notify team in Slack #incidents channel

STEP 4: RESTORE (30 min - 2 hours)
Option A: Point-in-Time Recovery (for data corruption/deletion)
  1. Identify last known good timestamp
  2. Use Supabase dashboard or CLI: `supabase db restore --time "2025-10-17 14:30:00"`
  3. Wait for restore to complete (typically 30-60 min for <10GB)
  4. Verify data integrity

Option B: Selective Table Restore (for specific table issues)
  1. Export affected table from backup
  2. Drop corrupted table
  3. Import clean data
  4. Verify foreign key constraints

STEP 5: VERIFICATION (2-3 hours)
- Run smoke tests:
  ✓ Login to admin portal
  ✓ Create test appointment
  ✓ View route optimization
  ✓ Test AI agent booking
  ✓ Process test payment
- Check logs for errors
- Monitor performance metrics

STEP 6: POST-INCIDENT (3-4 hours)
- Update status page: "Issue resolved"
- Send resolution email to affected businesses
- Document incident in post-mortem (within 48 hours)
- Schedule team review to identify prevention measures
```

**Upgrade Path:**

- **At 500+ businesses:** Move to Supabase Team plan with multi-region replication
- **Enterprise customers demanding <1hr RTO:** Implement automated failover with read replicas

---

### 2. AI Agent Failure Handling

**Strategy:** Intelligent multi-channel fallback based on failure type and customer channel.

#### Health Monitoring

**Continuous Health Checks:**

```
Every 30 seconds, check:
├── ElevenLabs API health endpoint
├── Twilio status API
└── Our agent webhook endpoints

Failure Threshold:
- 3+ failed conversation starts in 5 min = INCIDENT
- ElevenLabs down >5 min = CRITICAL
- Twilio down >30 min = DISABLE AGENT
```

#### Fallback Logic by Channel

**A. Voice Channel (Phone Call) Failure**

```
Scenario: Customer calls business number, ElevenLabs API is down

Fallback Flow:
1. Twilio detects ElevenLabs webhook failure (timeout after 5s)
2. Route to pre-recorded voicemail:

   "Thank you for calling [Business Name]. We're experiencing
    technical difficulties with our booking system. Please text
    us at this number or visit [website] to book online.
    We'll call you back within 2 hours. Sorry for the inconvenience!"

3. Log to database:
   - Table: ai_conversations
   - Status: 'failed_voicemail'
   - Fields: phone_number, business_id, timestamp, recording_url

4. Alert business owner:
   - Email: "AI agent unavailable, [X] voicemails waiting"
   - SMS: "Check admin dashboard - manual follow-ups needed"

5. Admin dashboard shows:
   ┌─────────────────────────────────────┐
   │ ⚠️ Manual Follow-Up Queue            │
   │ [3 voicemails awaiting callback]     │
   │                                      │
   │ 📞 (555) 123-4567 - 10 min ago      │
   │ 📞 (555) 987-6543 - 25 min ago      │
   │ 📞 (555) 555-1212 - 1 hour ago      │
   └─────────────────────────────────────┘

6. Auto-retry every 5 minutes:
   - When ElevenLabs healthy: Process queued callbacks (async worker)
   - Send SMS to customers: "Our system is back online! Call us back or book at [link]"
```

**B. SMS Channel Failure**

```
Scenario: Customer texts business number, ElevenLabs SMS API down

Fallback Flow:
1. Detect ElevenLabs webhook timeout (10s)
2. Auto-respond via Twilio SMS:

   "Hi! Our AI assistant is temporarily unavailable.
    Book online at [booking_url] or call us at [phone].
    A team member will respond to your message shortly."

3. Log to database:
   - Table: ai_conversations
   - Status: 'failed_sms'
   - Store full conversation context

4. Route to manual SMS inbox:
   - Admin dashboard: "Pending SMS Responses" tab
   - Shows customer message + context
   - Admin can reply manually via dashboard

5. Admin sees:
   ┌─────────────────────────────────────┐
   │ 💬 Pending SMS Responses             │
   │                                      │
   │ (555) 123-4567 - 5 min ago          │
   │ "I need an oil change tomorrow"      │
   │ [Reply Manually] [Send Booking Link] │
   └─────────────────────────────────────┘

6. When recovered:
   - SMS customers: "Our AI assistant is back! Reply to continue booking."
   - Resume AI conversations seamlessly
```

**C. Web Widget Failure**

```
Scenario: Widget loads on business website, ElevenLabs connection fails

Fallback Flow:
1. Widget detects connection failure (timeout after 3s)
2. Display fallback UI:

   ┌────────────────────────────────────┐
   │ ⚠️ AI Assistant Temporarily         │
   │    Unavailable                      │
   │                                     │
   │ Book your appointment:              │
   │                                     │
   │ 📞 Call: (555) 123-4567            │
   │                                     │
   │ 💬 Text: (555) 123-4567            │
   │                                     │
   │ 📝 [Show Booking Form]             │
   └────────────────────────────────────┘

3. "Show Booking Form" reveals simple form:
   - Pre-populated with available time slots (cached from last successful fetch)
   - Fields: Name, Phone, Service Type, Preferred Date/Time
   - Submit creates "manual_booking" record for admin review

4. Admin dashboard:
   ┌─────────────────────────────────────┐
   │ 📝 Manual Bookings Pending Review    │
   │ (These were submitted during outage) │
   │                                      │
   │ John Doe - Oil Change - Tomorrow 2pm │
   │ [Confirm & Schedule] [Call Customer] │
   └─────────────────────────────────────┘

5. When recovered:
   - Widget automatically reconnects
   - Display: "✅ AI assistant is back online!"
```

**D. Partial Failure (ElevenLabs up, Twilio down)**

```
Scenario: ElevenLabs healthy but Twilio phone/SMS service down

Impact:
- ✅ Web widget: Works normally (uses ElevenLabs web SDK directly)
- ❌ Voice/SMS: Cannot receive calls or texts

Fallback:
1. Detect Twilio outage via status API
2. Update business websites:
   - Widget shows: "⚠️ Phone service temporarily down. Book here via chat!"
3. Admin dashboard alert:
   - "Twilio outage detected. Voice/SMS bookings disabled until resolved."
4. Status page update:
   - "Phone and SMS bookings temporarily unavailable. Web bookings unaffected."
```

#### Recovery Process

**Automatic Recovery:**

```
Health check worker (runs every 5 min):
1. Detect when failed service returns to healthy
2. Process queued voicemails/SMS (up to 50 at a time)
3. Send recovery notifications:
   - Businesses: "AI agent back online"
   - Customers: "Our booking system is restored! You can now call/text."
4. Resume normal operation
5. Log recovery time and queue backlog processed
```

---

### 3. External API Failure Handling

**Strategy:** Layered approach with circuit breakers, retries, caching, and graceful degradation.

#### A. Stripe (Payment Processing) - Zero Tolerance

**Critical dependency:** Payment failures directly impact revenue.

**Failure Handling:**

```
STEP 1: Immediate Retry with Exponential Backoff
- Attempt 1: Immediate
- Attempt 2: 1 second later
- Attempt 3: 2 seconds later
- Attempt 4: 5 seconds later
- Attempt 5: 10 seconds later
- Attempt 6: 30 seconds later

STEP 2: If all retries fail (>1 min)
- Log to "failed_payments" table
  Fields: payment_id, business_id, customer_id, amount,
          error_code, error_message, retry_count, next_retry_at

- Show user friendly message:
  "Payment processing is temporarily delayed. We'll automatically
   retry your payment and send you a confirmation email.
   No action needed from you."

STEP 3: Background Retry Queue
- Cron worker checks "failed_payments" every 5 minutes
- Retry schedule: 5min, 15min, 30min, 1hr, 2hr, 6hr, 24hr
- After 7 failed attempts (>48 hours):
  - Alert super admin via PagerDuty
  - Email customer: "Please contact support to complete payment"

STEP 4: Circuit Breaker
- Track Stripe API failure rate
- If >10 failures in 1 minute:
  - Open circuit: Stop calling Stripe API for 5 minutes
  - Show maintenance message: "Payment processing temporarily unavailable"
  - Alert super admin immediately (CRITICAL)

- After 5 min, half-open circuit:
  - Try 1 test request
  - If succeeds: Close circuit, resume normal operation
  - If fails: Keep circuit open another 10 minutes
```

**Implementation:**

```typescript
// Hono middleware for Stripe circuit breaker
import { CircuitBreaker } from '@/lib/circuit-breaker'

const stripeBreaker = new CircuitBreaker({
  threshold: 10,        // Open after 10 failures
  timeout: 300000,      // Stay open for 5 min
  resetTimeout: 600000  // Reset failure count after 10 min
})

// Usage in payment endpoint
if (stripeBreaker.isOpen()) {
  return c.json({ error: 'Payment processing temporarily unavailable' }, 503)
}

try {
  const payment = await stripe.paymentIntents.create(...)
  stripeBreaker.recordSuccess()
  return c.json(payment)
} catch (error) {
  stripeBreaker.recordFailure()
  // Queue for retry...
}
```

#### B. Mapbox (Route Optimization) - Graceful Degradation

**Non-critical dependency:** Routes can use cached data or simple time-based scheduling.

**Failure Handling:**

```
STEP 1: Serve Cached Routes (24-hour cache)
- Every successful route optimization stored in cache
- Cache key: `route:${technician_id}:${date}`
- If Mapbox fails: Serve cached route from previous day
- Display banner in admin UI:

  ⚠️ Using yesterday's traffic data due to technical issue.
     Routes may not reflect current conditions.

STEP 2: Fall Back to Simple Scheduling
- If no cache available (e.g., first day using platform):
  - Disable route optimization temporarily
  - Use time-based scheduling: earliest-to-latest appointments
  - Technician sees list view instead of optimized map route

STEP 3: Circuit Breaker
- After 5 failures in 2 minutes: Disable route optimization for 10 min
- Admin dashboard shows:

  ⚠️ Route optimization temporarily disabled
     Appointments will be scheduled by time only.
     [Refresh Status]

STEP 4: Auto-Recovery
- Health check every 10 minutes
- When Mapbox healthy: Re-enable optimization automatically
- Re-optimize today's routes in background
- Notify admins: "Route optimization restored"
```

#### C. Twilio (SMS/Voice) - Queue & Alternative Channels

**Critical for AI agent:** Must handle SMS/voice failures gracefully.

**Failure Handling:**

```
STEP 1: Queue Failed Messages (SMS)
- SMS fails → Store in "sms_queue" table
  Fields: to_number, from_number, message, business_id,
          created_at, retry_count, next_retry_at

- Retry schedule: 5min, 15min, 1hr, 6hr, 24hr
- After 5 failed attempts: Alert business owner

STEP 2: Alternative Delivery (Email as backup)
- If SMS fails after 1 hour:
  - Check if customer has email address
  - Send email with same content:
    Subject: "Message from [Business Name]"
    Body: [SMS content] + "We tried to text you but couldn't deliver."

STEP 3: Voice Call Failures
- Call fails → Route to voicemail (see AI Agent section above)
- Log to ai_conversations with status 'failed_voice'

STEP 4: Twilio Status Monitoring
- Check status.twilio.com API every 30 seconds
- If Twilio reports outage:
  - Disable AI agent voice/SMS channels
  - Show "Phone service unavailable" message
  - Keep web widget functional (doesn't use Twilio)
```

#### D. ElevenLabs (AI Conversations) - Immediate Fallback

**Critical for AI bookings:** See detailed AI Agent Failure Handling above.

**Quick Summary:**

- Voice → Pre-recorded voicemail + callback queue
- SMS → Auto-reply with booking link + manual inbox
- Web → Show manual booking form with cached slots
- Recovery: Auto-retry every 5 min, process queued requests

---

### 4. Webhook Failure Handling

**Strategy:** Industry-standard retry logic with idempotency, signatures, and dead letter queue.

#### A. Automatic Retry with Exponential Backoff

**All webhooks (Stripe, Twilio, ElevenLabs) follow same pattern:**

```
Webhook received at: /api/webhooks/[provider]/[event]

STEP 1: Verify Signature
- Stripe: stripe.webhooks.constructEvent(payload, sig, secret)
- Twilio: twilio.validateRequest(token, sig, url, params)
- ElevenLabs: HMAC-SHA256 with shared secret

- If signature invalid:
  → Log to security_events table
  → Return 401 Unauthorized
  → Alert super admin (potential attack)

STEP 2: Check Idempotency
- Query: SELECT * FROM webhook_events WHERE idempotency_key = ?
- If exists AND status = 'completed':
  → Return 200 OK (already processed, skip duplicate)
- If exists AND status = 'processing':
  → Return 200 OK (currently processing, avoid race condition)
- If not exists:
  → Insert record with status = 'pending'
  → Proceed to processing

STEP 3: Process Webhook
try {
  await processWebhook(payload)
  UPDATE webhook_events SET status = 'completed', completed_at = NOW()
  return 200 OK
} catch (error) {
  UPDATE webhook_events SET
    status = 'failed',
    retry_count = retry_count + 1,
    last_error = error.message,
    next_retry_at = calculateNextRetry(retry_count)
  return 500 Internal Server Error (triggers provider retry)
}

STEP 4: Retry Schedule (if processing fails)
- Attempt 1: Immediate (initial webhook)
- Attempt 2: 1 min later
- Attempt 3: 5 min later
- Attempt 4: 30 min later
- Attempt 5: 2 hours later
- Attempt 6: 12 hours later
- Attempts 7-10: Every 24 hours (up to 3 days total)

Implementation:
- Cron worker runs every minute
- Query: SELECT * FROM webhook_events WHERE status = 'failed' AND next_retry_at <= NOW()
- Process each webhook, update retry_count and next_retry_at
```

#### B. Dead Letter Queue (DLQ)

**For webhooks that fail after max retries:**

```
After 10 failed attempts (>3 days):

STEP 1: Move to DLQ
- Table: webhook_dlq
  Fields: webhook_event_id, provider, event_type, payload (jsonb),
          failure_reason, total_attempts, moved_to_dlq_at

- Update original record:
  UPDATE webhook_events SET status = 'dead_letter', moved_to_dlq_at = NOW()

STEP 2: Alert Super Admin
- Email subject: "Webhook Failed After 10 Attempts"
- Content:
  Provider: Stripe
  Event: payment_intent.succeeded
  Business: Acme HVAC (#1234)
  Payload: [JSON]
  Error: "Database connection timeout"

  [View in Admin Dashboard] [Retry Manually]

STEP 3: Admin Dashboard DLQ Page
┌────────────────────────────────────────────────┐
│ 🚨 Failed Webhooks (Dead Letter Queue)         │
├────────────────────────────────────────────────┤
│ Provider   Event Type               Business    │
│ Stripe     payment_intent.succeeded Acme HVAC  │
│ Failed: Database connection timeout            │
│ [View Payload] [Retry] [Mark Resolved]         │
├────────────────────────────────────────────────┤
│ Twilio     sms.received             Joe's Auto │
│ Failed: Invalid phone number format            │
│ [View Payload] [Retry] [Mark Resolved]         │
└────────────────────────────────────────────────┘

STEP 4: Manual Resolution Options
- Retry: Attempt to process again (useful if issue was temporary)
- Mark Resolved: Note that issue was fixed manually (e.g., payment confirmed via Stripe dashboard)
- Investigate: View full payload and error logs to understand root cause
```

#### C. Idempotency Keys

**Prevent duplicate processing when webhooks are sent multiple times:**

```
Idempotency Key Sources:
├── Stripe: webhook.id (e.g., "evt_1Ab2Cd3Ef4Gh5Ij6")
├── Twilio: MessageSid or CallSid (e.g., "SM9d3a2b1c0...")
└── ElevenLabs: conversation_id (e.g., "conv_xyz123...")

Database Schema:
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY,
  provider TEXT NOT NULL, -- 'stripe', 'twilio', 'elevenlabs'
  idempotency_key TEXT UNIQUE NOT NULL, -- provider's unique ID
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL, -- 'pending', 'processing', 'completed', 'failed', 'dead_letter'
  retry_count INT DEFAULT 0,
  next_retry_at TIMESTAMP,
  last_error TEXT,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_webhook_events_idempotency ON webhook_events(idempotency_key);
CREATE INDEX idx_webhook_events_retry ON webhook_events(status, next_retry_at) WHERE status = 'failed';

Example: Stripe sends payment_intent.succeeded webhook twice
- First request: idempotency_key not found → Insert & process → Return 200
- Second request (duplicate): idempotency_key found & status = 'completed' → Skip & return 200
- Result: Payment only recorded once, no duplicate charge/appointment
```

#### D. Signature Verification

**Prevent spoofed or malicious webhooks:**

```typescript
// Stripe webhook signature verification
export async function verifyStripeWebhook(req: Request) {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
    return event
  } catch (err) {
    // Log to security_events table
    await db.insert(securityEvents).values({
      event_type: 'webhook_signature_failed',
      provider: 'stripe',
      ip_address: req.headers.get('x-forwarded-for'),
      payload: body,
      error: err.message
    })

    // Alert super admin if >5 failures in 10 min (potential attack)
    throw new Error('Invalid webhook signature')
  }
}

// Twilio webhook signature verification
export async function verifyTwilioWebhook(req: Request, url: string) {
  const signature = req.headers.get('x-twilio-signature')
  const params = await req.json()

  const valid = twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN,
    signature,
    url,
    params
  )

  if (!valid) {
    await db.insert(securityEvents).values({
      event_type: 'webhook_signature_failed',
      provider: 'twilio',
      ...
    })
    throw new Error('Invalid Twilio signature')
  }
}

// ElevenLabs webhook signature verification
export async function verifyElevenLabsWebhook(req: Request) {
  const signature = req.headers.get('x-elevenlabs-signature')
  const body = await req.text()

  const expectedSig = crypto
    .createHmac('sha256', process.env.ELEVENLABS_WEBHOOK_SECRET)
    .update(body)
    .digest('hex')

  if (signature !== expectedSig) {
    await db.insert(securityEvents).values({
      event_type: 'webhook_signature_failed',
      provider: 'elevenlabs',
      ...
    })
    throw new Error('Invalid ElevenLabs signature')
  }
}
```

---

### 5. Monitoring & Alerting

**Strategy:** Multi-layer observability with proactive alerting before users notice issues.

#### What to Monitor

**A. Uptime & Availability (Every 60 seconds)**

```
Health Check Endpoints:
├── API: GET https://api.chotter.com/health
│   Response: { status: "ok", version: "1.0.0", uptime: 123456 }
│   Expected: 200 OK in <500ms
│
├── Customer Portal: GET https://app.chotter.com/
│   Expected: 200 OK in <2s
│
├── Admin Portal: GET https://admin.chotter.com/
│   Expected: 200 OK in <2s
│
└── Mobile API: GET https://api.chotter.com/v1/status
    Response: { status: "ok", services: { db: "ok", stripe: "ok", ... } }
    Expected: 200 OK in <500ms

Uptime Thresholds:
- Warning: Response time >1s or single check failure
- Critical: 2+ consecutive failures or response time >3s
```

**B. External API Health (Every 30 seconds)**

```
Monitor via Status APIs:
├── Stripe: https://status.stripe.com/api/v2/status.json
├── Supabase: https://status.supabase.com/api/v2/status.json
├── ElevenLabs: https://status.elevenlabs.io/api/v2/status.json
├── Twilio: https://status.twilio.com/api/v2/status.json
└── Mapbox: https://status.mapbox.com/api/v2/status.json

If status != "operational":
- Log degradation event
- Enable fallback mode proactively
- Alert team via Slack
```

**C. Error Rate Alerts**

```
Track via Sentry + Custom Metrics:

1. API Error Rate:
   - Threshold: >5% of requests fail in 5-minute window
   - Alert: Severity 2 (High)
   - Action: Investigate failed endpoints, check logs

2. Database Query Performance:
   - Threshold: Average query time >1 second
   - Alert: Severity 3 (Medium)
   - Action: Review slow query log, optimize indexes

3. Failed Webhooks:
   - Threshold: >10 webhook failures in 1 hour
   - Alert: Severity 2 (High)
   - Action: Check webhook endpoint logs, verify signatures

4. AI Agent Failures:
   - Threshold: >3 failed conversation starts in 5 minutes
   - Alert: Severity 1 (Critical)
   - Action: Enable fallback mode, investigate ElevenLabs/Twilio

5. Payment Processing Failures:
   - Threshold: >2 Stripe API failures in 10 minutes
   - Alert: Severity 1 (Critical)
   - Action: Check Stripe status, review failed_payments queue
```

**D. Business Metrics (Real-Time Dashboard)**

```
Super Admin Dashboard Metrics:

Platform Health:
├── Active Businesses: 87 (↑3 this week)
├── Total Appointments Today: 342
├── AI Agent Conversations: 156 (45% of bookings)
├── Failed Appointments: 2 (customer no-show, not system error)
└── Payment Success Rate: 99.2% (2 failed out of 250)

Critical Alerts:
├── ⚠️ Acme HVAC: 3 failed appointments today (investigate)
├── ⚠️ Joe's Auto: Approaching AI minute limit (480/500)
└── ✅ All other businesses operating normally

System Health:
├── API Response Time: 245ms avg (last hour)
├── Database Queries: 0.15s avg (last hour)
├── Error Rate: 0.8% (last hour)
├── Uptime (30 days): 99.7%
└── Open Support Tickets: 4 (1 urgent)
```

#### Alerting Channels

**Severity 1: Critical (Immediate Action Required)**

```
Triggers:
- Database down or unresponsive >2 min
- Payment processing completely failed >5 min
- AI agent down >30 min (all channels)
- API uptime <95% in last 10 min
- Security breach detected (invalid webhook signatures >10 in 5 min)

Alert Methods:
1. PagerDuty → SMS + Phone call to on-call engineer
2. Slack → @channel in #incidents (everyone notified)
3. Email → Super admin + engineering team
4. Status Page → Auto-update with "Major Outage" status

Response Time: Acknowledge within 5 minutes, respond within 15 minutes
```

**Severity 2: High (Action Within 1 Hour)**

```
Triggers:
- External API degraded (Stripe, Twilio, ElevenLabs)
- Error rate >5% for 5+ minutes
- Webhook failures >10 in 1 hour
- Database query performance degraded (>1s avg)
- Failed payments queue >20 items

Alert Methods:
1. Slack → #alerts channel (engineering team)
2. Email → On-call engineer + super admin

Response Time: Acknowledge within 30 minutes, fix within 4 hours
```

**Severity 3: Medium (Action Within 4 Hours)**

```
Triggers:
- Performance degradation (API response time >1s)
- Cache miss rate >20%
- Background job queue backlog >100 items
- Individual business experiencing issues (not platform-wide)
- AI agent usage approaching tier limit (>80%)

Alert Methods:
1. Slack → #monitoring channel
2. Email → Engineering team (non-urgent)

Response Time: Review within 4 hours, fix within 24 hours
```

**Severity 4: Low (Review Next Business Day)**

```
Triggers:
- Individual webhook failure (will auto-retry)
- Slow database query detected (not impacting users)
- High traffic spike (good problem to have!)
- Non-critical feature degradation

Alert Methods:
1. Daily digest email → Engineering team
2. Logged to monitoring dashboard

Response Time: Review during next standup, prioritize in backlog
```

#### Monitoring Tools

**Recommended Stack (Total: ~$100/month):**

```
1. BetterStack Uptime Monitoring ($20/month)
   - 50 uptime monitors (1-min checks)
   - Status page included
   - SMS/call/email/Slack alerting
   - 90-day data retention

2. Sentry Error Tracking ($26/month)
   - 50K events/month (Team plan)
   - Full stack traces
   - Release tracking
   - Performance monitoring (APM)
   - Already specified in PRD

3. BetterStack Logs ($25/month)
   - 10 GB logs/month
   - 14-day retention
   - Fast search & filtering
   - Automatic log aggregation from Railway/Vercel

4. Statuspage.io ($29/month)
   - Public status page for customers
   - Automated incident updates
   - Email/SMS subscriber notifications
   - 99.95% uptime SLA

Alternative: BetterStack can replace Statuspage.io (included in Uptime plan)
Total with BetterStack-only: ~$71/month ($20 + $26 + $25)
```

**Implementation Priorities:**

```
Week 11 (Phase 5):
├── Set up BetterStack uptime monitors
├── Configure Sentry error tracking (already planned)
├── Create public status page
└── Set up Slack webhook for alerts

Week 12:
├── Implement custom metrics tracking
├── Configure log aggregation (BetterStack Logs)
├── Set up PagerDuty on-call rotation
└── Create monitoring dashboard for super admin

Week 13:
├── Test all alert scenarios (simulate failures)
├── Document runbooks for each alert type
└── Train team on incident response procedures
```

---

### 6. Incident Response Playbook

**Step-by-Step Guide for Handling Production Incidents**

#### STEP 1: DETECT (0-5 minutes)

```
How Incidents Are Detected:
├── Automated alert via PagerDuty/Slack
├── Customer support ticket marked "urgent"
├── Business owner reports issue via email/chat
├── Team member notices error in Sentry
└── Status page monitoring shows downtime

On-Call Engineer Actions:
1. Acknowledge alert (stop paging)
2. Open incident doc template
3. Post to #incidents Slack channel: "Incident detected, investigating..."
4. Note detection time: [2025-10-17 14:35 UTC]
```

#### STEP 2: ASSESS (5-15 minutes)

```
Triage Questions:
1. What is the impact?
   - How many businesses affected? (1? 10? All?)
   - What functionality is broken? (Booking? Payments? Routes?)
   - Can users still use core features?

2. What is the scope?
   - One specific business/technician?
   - One feature across all businesses?
   - Complete platform outage?

3. What is the root cause?
   - Check external status pages (Stripe, Supabase, Twilio, ElevenLabs)
   - Review Sentry errors (look for spike patterns)
   - Check logs for error messages
   - Review recent deployments (did we ship something broken?)

Severity Assessment:
├── Critical: Core functionality down for >50% of users
│   Examples: Database offline, payment processing failed, AI agent completely down
│
├── High: Feature degraded or subset of users affected
│   Examples: Route optimization failing, one business's AI agent down, SMS delayed
│
├── Medium: Non-critical feature impacted or workaround available
│   Examples: Admin dashboard slow, reports not loading, mobile app minor bug
│
└── Low: Cosmetic issue or single-user problem
    Examples: Typo in UI, one technician can't upload photo

Document Assessment:
- Incident severity: [Critical/High/Medium/Low]
- Affected users: [X businesses, Y technicians, Z customers]
- Root cause hypothesis: [Best guess at this point]
- Next steps: [What we'll try first]
```

#### STEP 3: COMMUNICATE (15-30 minutes)

```
Internal Communication:
1. Update #incidents Slack channel:
   "Incident confirmed - [brief description]
    Severity: [Critical/High/Medium/Low]
    Impact: [X users affected]
    Investigating: [Engineer names]
    ETA for update: [30 min]"

2. Tag relevant people:
   - @super-admin (always)
   - @engineering-team (if Severity 1-2)
   - @customer-support (if customer-facing impact)

External Communication (if Severity 1-2):

1. Update Status Page:
   Status: Investigating
   Component: [AI Booking Agent / Payment Processing / Route Optimization / etc]
   Message:
   "We're investigating reports of [brief description].
    Affected: [estimated % of users]
    Workaround: [if available, e.g., 'Book via manual form']
    Next update: [15-30 minutes]"

2. Email Affected Businesses (if Critical):
   Subject: "Service Issue: [Component] - Investigating"
   Body:
   "Hi [Business Name],

   We're aware of an issue affecting [booking/payments/routes].
   Our team is actively working on a fix.

   Workaround: [If available]
   Status updates: https://status.chotter.com

   Expected resolution: [If known]

   We apologize for the disruption.
   - Chotter Team"

3. Social Media (if Major Outage >1 hour):
   Twitter/LinkedIn:
   "We're experiencing technical difficulties with [component].
    Our team is working on a fix. Status: https://status.chotter.com"
```

#### STEP 4: MITIGATE (30 min - 4 hours)

```
Mitigation Strategies by Issue Type:

A. Database Issues:
├── If slow queries:
│   1. Check pg_stat_statements for slow queries
│   2. Kill long-running queries if blocking others
│   3. Add missing indexes if identified
│   4. Scale up database if resource-constrained
│
├── If corrupted data:
│   1. Identify affected tables
│   2. Restore from PITR backup (see section 1 above)
│   3. Verify data integrity post-restore
│
└── If connection pool exhausted:
    1. Increase connection limit temporarily
    2. Restart API servers to clear stale connections
    3. Investigate connection leaks in code

B. External API Failures:
├── If Stripe down:
│   → Enable circuit breaker, queue payments for retry
│   → Notify businesses payment processing delayed
│
├── If ElevenLabs/Twilio down:
│   → Enable AI agent fallback mode (see section 2)
│   → Display alternative booking methods
│
└── If Mapbox down:
    → Serve cached routes or disable optimization temporarily
    → Notify admins to use manual scheduling

C. Code Bugs:
├── If recent deployment caused issue:
│   1. Rollback to previous version: git revert && deploy
│   2. Verify rollback fixes issue
│   3. Post-mortem to prevent similar bugs
│
├── If bug in production for a while:
│   1. Apply hotfix with minimal changes
│   2. Fast-track through testing
│   3. Deploy with extra monitoring
│
└── If config error:
    1. Identify incorrect env var or setting
    2. Update via Railway/Vercel dashboard
    3. Restart affected services

D. Infrastructure Issues:
├── If Railway/Vercel degraded:
│   → Check status pages, wait for provider resolution
│   → Consider temporary migration to backup if >2 hours
│
├── If DDoS or high traffic:
│   1. Enable Cloudflare rate limiting
│   2. Scale up API servers
│   3. Add caching for hot endpoints
│
└── If SSL cert expired:
    1. Renew cert immediately via Vercel/Railway
    2. Verify HTTPS working
    3. Set up auto-renewal alerts

Document All Actions:
- What we tried: [List of attempts]
- What worked: [Successful mitigation]
- What didn't work: [Dead ends]
- Time to mitigation: [X minutes]
```

#### STEP 5: RESOLVE (Varies by severity)

```
Verification Steps:

1. Automated Tests (Run smoke tests):
   ├── User login (admin portal)
   ├── Create appointment
   ├── View route optimization
   ├── AI agent booking (phone/SMS/web)
   ├── Process payment
   ├── Send customer notification
   └── Technician mobile app check-in

2. Manual Verification:
   ├── Check Sentry for new errors (should be zero)
   ├── Review logs for warnings
   ├── Monitor metrics for 15 min (error rate, response time)
   ├── Ask affected businesses to confirm fix
   └── Test affected feature thoroughly

3. Confirm Resolution:
   - Error rate back to normal (<1%)
   - No new reports from customers
   - Monitoring shows healthy metrics
   - All automated tests passing

Update Communications:

1. Status Page:
   Status: Resolved
   Message:
   "The issue affecting [component] has been resolved.
    Root cause: [Brief explanation]
    Resolution: [What we did]
    Time to resolution: [X hours Y minutes]
    We apologize for the disruption."

2. Email to Affected Businesses:
   Subject: "Resolved: [Component] Issue"
   Body:
   "Hi [Business Name],

   The [booking/payment/route] issue has been resolved.
   All functionality should be working normally now.

   What happened: [Brief explanation]
   How we fixed it: [Actions taken]
   Preventing future issues: [If applicable]

   If you continue to experience issues, please contact support.

   Thank you for your patience.
   - Chotter Team"

3. Slack #incidents:
   "✅ RESOLVED: [Brief description]
    Total downtime: [X hours Y min]
    Post-mortem: [Will be completed within 48 hours]"
```

#### STEP 6: POST-MORTEM (Within 48 hours)

```
Post-Mortem Document Template:

# Incident Post-Mortem: [Brief Title]

## Incident Summary
- **Date**: 2025-10-17
- **Duration**: 2 hours 35 minutes (14:35 - 17:10 UTC)
- **Severity**: Critical
- **Impact**: 45 businesses, ~200 attempted bookings failed
- **Root Cause**: Database connection pool exhausted due to connection leak

## Timeline
- 14:35 - First alert: PagerDuty notifies on-call engineer (API error rate >5%)
- 14:40 - Incident confirmed, status page updated
- 14:50 - Root cause identified: Connection pool at 100% capacity
- 15:10 - Mitigation applied: Increased pool size + restarted API servers
- 15:30 - Issue persists, investigating code for connection leaks
- 16:45 - Connection leak found in route optimization code (missing .release())
- 17:00 - Hotfix deployed with proper connection cleanup
- 17:10 - Verified resolved, monitoring for 30 min, issue did not recur

## What Went Well
- ✅ Alert triggered within 5 minutes of issue starting
- ✅ Team responded quickly (on-call engineer acknowledged in 2 min)
- ✅ Root cause identified within 15 minutes
- ✅ Clear communication via status page and email to businesses
- ✅ Hotfix tested and deployed safely

## What Went Wrong
- ❌ Connection leak existed in code for 3 weeks, not caught in testing
- ❌ No monitoring for connection pool usage (would have caught earlier)
- ❌ Rollback considered but took too long (should be 1-click)
- ❌ Some businesses didn't receive email notification (email list incomplete)

## Root Cause Analysis (5 Whys)
1. **Why did bookings fail?** → Database connections were unavailable
2. **Why were connections unavailable?** → Connection pool exhausted (100/100 used)
3. **Why was pool exhausted?** → Connections not released after use
4. **Why weren't connections released?** → Missing .release() in route optimization code
5. **Why was bug not caught?** → No integration test for connection cleanup, no pool monitoring

## Action Items
- [ ] Add monitoring for database connection pool usage (alert at 80%) - @engineer1 - Due: Oct 24
- [ ] Add integration test for connection cleanup in all DB queries - @engineer2 - Due: Oct 24
- [ ] Implement 1-click rollback in deployment pipeline - @engineer1 - Due: Oct 31
- [ ] Audit all code for similar connection leaks - @engineering-team - Due: Oct 31
- [ ] Verify email notification list includes all active businesses - @customer-support - Due: Oct 20
- [ ] Document connection pool best practices in engineering wiki - @engineer2 - Due: Oct 27

## Lessons Learned
- **For next time**: Connection pool monitoring would have caught this before impact
- **Prevention**: All DB queries should use try/finally blocks to ensure .release()
- **Response**: Rollback should be instant (1-click), not 30+ minutes
- **Communication**: Verify notification systems reach all intended recipients

## Follow-Up
- Post-mortem reviewed in team meeting: Oct 19
- Action items tracked in project management tool
- Progress review: Oct 31 (verify all items completed)
```

---

### 7. Testing Strategy for Error Handling

**Chaos Engineering Scenarios to Test Regularly:**

#### Monthly Disaster Drills (Staging Environment)

```
Test 1: Database Failure & Restore
- Simulate: Drop critical table (appointments)
- Expected: RLS prevents unauthorized deletion, but if superuser drops table...
- Verify: PITR restore procedure works, documented time matches actual
- Success Criteria: Restore completed in <1 hour, all data intact

Test 2: Payment Processing Failure
- Simulate: Set Stripe API key to invalid value
- Expected: Circuit breaker opens after 10 failures, payments queued for retry
- Verify: Failed payments appear in admin dashboard, retry logic works
- Success Criteria: No lost payments, all queued payments processed when recovered

Test 3: AI Agent Complete Outage
- Simulate: Disable ElevenLabs API access for 30 min
- Expected: All channels (phone/SMS/web) fall back gracefully
- Verify: Voicemails logged, SMS auto-responds, web shows manual form
- Success Criteria: Zero customer-facing errors, all fallback messages correct

Test 4: Webhook Replay Attack
- Simulate: Send same webhook 5 times with valid signature
- Expected: Idempotency key prevents duplicate processing
- Verify: Only 1 appointment/payment created, others return 200 OK
- Success Criteria: No duplicate data, all requests acknowledged

Test 5: External API Rate Limiting
- Simulate: Make 1000 Mapbox requests in 1 minute (trigger rate limit)
- Expected: Circuit breaker opens, cached routes served
- Verify: Admin dashboard shows "optimization disabled", routes still work
- Success Criteria: No user-facing errors, graceful degradation

Test 6: Multiple Simultaneous Failures
- Simulate: Disable Stripe + ElevenLabs + Mapbox at same time
- Expected: Each component falls back independently
- Verify: Customers can still book (manual form), view appointments, message business
- Success Criteria: Core functionality remains available despite 3 failed dependencies
```

#### Automated Testing (CI/CD Pipeline)

```
Unit Tests:
├── Circuit breaker logic (opens/closes correctly)
├── Retry logic with exponential backoff
├── Webhook signature verification (valid/invalid cases)
├── Idempotency key checking
└── Error message formatting

Integration Tests:
├── Database connection pool cleanup
├── External API timeout handling
├── Webhook processing end-to-end
├── Payment retry queue processing
└── AI agent fallback flows

Load Tests (Pre-Launch):
├── 1000 concurrent appointment creations
├── 500 concurrent AI agent conversations
├── 100 concurrent payment processings
├── Database connection pool under load (should not exhaust)
└── Webhook processing with 1000 events/min
```

---

### 8. Performance SLAs

**Defined Targets for System Performance:**

```
API Response Times (95th percentile):
├── GET /api/appointments: <300ms
├── POST /api/appointments: <500ms
├── GET /api/routes/optimize: <2s (complex calculation allowed)
├── POST /api/payments: <1s (Stripe API call)
└── GET /api/health: <100ms

Database Query Times (avg):
├── Simple queries (single table): <50ms
├── Complex queries (joins): <200ms
├── Route optimization queries: <1s
└── Analytics/reporting: <5s

Page Load Times (DOMContentLoaded):
├── Customer portal: <2s
├── Admin dashboard: <3s
├── Mobile app (native): <1s
└── AI booking widget: <1.5s

AI Agent Response Times:
├── Voice: First response within 3s of customer speaking
├── SMS: Response sent within 10s of customer message
└── Web widget: Response visible within 2s of customer typing

Uptime Targets:
├── Core API: 99.5% (monthly)
├── Customer portal: 99.5% (monthly)
├── Admin dashboard: 99.5% (monthly)
├── AI agent: 99% (monthly) - lower due to external dependencies
└── Payment processing: 99.9% (monthly) - critical for revenue
```

**Alerts Triggered When Exceeding SLAs:**

- If any metric exceeds SLA by 50% for >5 min → Severity 2 alert
- If any metric exceeds SLA by 100% for >2 min → Severity 1 alert

---

### 9. Data Retention & Cleanup

**Prevent Database Bloat and Manage Costs:**

```
Retention Policies:

1. Webhook Events (webhook_events table):
   - Completed: Retain 90 days, then archive to cold storage
   - Failed/DLQ: Retain until manually resolved, then 90 days
   - Archive location: S3 bucket (for compliance/auditing)

2. AI Conversation Logs (ai_conversations table):
   - Active transcripts: Retain 1 year for businesses to review
   - After 1 year: Anonymize (remove PII) and aggregate for analytics
   - Audio recordings: Delete after 90 days (privacy)

3. Logs (Application/System):
   - Info/Debug logs: 14 days (via BetterStack Logs)
   - Error logs: 90 days
   - Security events: 1 year (compliance)

4. Monitoring Metrics:
   - High-resolution (1-min): 30 days
   - Aggregated (1-hour): 1 year
   - Long-term trends (1-day): Indefinite

5. Appointments:
   - Active/upcoming: Indefinite (business needs)
   - Completed: Retain 2 years for warranty/service history
   - Cancelled: Retain 1 year, then delete

6. Payment Records:
   - All payment transactions: 7 years (IRS requirement)
   - Failed payment attempts: 1 year
   - Refund records: 7 years

Automated Cleanup Jobs:
- Daily: Delete temp files, clear expired sessions
- Weekly: Archive old webhook events
- Monthly: Anonymize old AI transcripts, aggregate old metrics
- Quarterly: Review storage usage, optimize if >80% capacity
```

---

## Summary: Error Handling Approach

| Area              | Strategy                                          | Tools               | Cost            |
| ----------------- | ------------------------------------------------- | ------------------- | --------------- |
| **Database**      | PITR backups (7 days), monthly restore tests      | Supabase Pro        | $25/mo          |
| **AI Agent**      | Multi-channel fallback (voicemail, SMS, web form) | Logic only          | $0              |
| **External APIs** | Circuit breakers, retries, caching, degradation   | Custom code         | $0              |
| **Webhooks**      | Retry, DLQ, idempotency, signature verification   | Custom code         | $0              |
| **Monitoring**    | BetterStack + Sentry + PagerDuty                  | BetterStack, Sentry | $71-100/mo      |
| **Incidents**     | 6-step playbook, runbooks, post-mortems           | Notion/Docs         | $0              |
| **Testing**       | Monthly chaos drills, automated tests             | CI/CD               | $0              |
| **Total**         | —                                                 | —                   | **~$96-125/mo** |

**Implementation Timeline:**

- **Week 11 (Phase 5):** Monitoring setup, circuit breakers, retry logic
- **Week 12:** Webhook handling, DLQ, signature verification
- **Week 13:** Testing, runbooks, team training
- **Ongoing:** Monthly disaster drills, quarterly post-mortem reviews

---

## Cost Estimates

### Development (One-Time)

- Claude Code assistance: Included
- Supabase: Free tier
- Development tools: Free
- **Total: $0-100**

### First Year Operations

**Infrastructure:**

- Supabase: $0-25/month (free tier → pro at 50+ businesses)
- Railway: $5-20/month (Hono API + workers)
- Vercel: $0-20/month (free tier → pro at scale)
- Twilio SMS (notifications): ~$50-150/month (1000-3000 SMS)
- Resend: $0-20/month (free tier → starter)
- Google Maps API: $50-200/month
- Expo: $0 (free tier)
- Domains/SSL: $20/year

**Monitoring & Error Handling:**

- BetterStack Uptime: $20/month (50 monitors, status page, alerting)
- Sentry Error Tracking: $0-26/month (free → team, 50K events)
- BetterStack Logs: $25/month (10GB logs, 14-day retention)
- **Total monitoring: ~$71/month** (or $100/month with Statuspage.io)

**AI Agent Costs (Professional+ tier feature):**

- **ElevenLabs Conversational AI:**
  - Voice calls: $0.08-0.10/minute (varies by LLM model)
  - Cost calculation examples:
    - Professional tier: 500 min included × $0.09 avg = $45/month per business
    - Enterprise tier: 2,000 min included × $0.09 avg = $180/month per business
  - Platform pays, white-labels service to businesses

- **Twilio Phone Numbers + Voice/SMS:**
  - Phone numbers: $1/month per dedicated number
  - Voice minutes: $0.0085/minute inbound, $0.013/minute outbound (US)
  - SMS: $0.0079/message inbound, $0.0079/message outbound
  - Example costs per Professional business:
    - Phone number: $1/month
    - Voice: 500 min × $0.0085 = $4.25/month (inbound calls)
    - SMS: ~100 messages × $0.0079 = $0.79/month
    - **Total per business: ~$6-7/month in Twilio costs**

- **Combined AI Agent Costs:**
  - Professional business (500 min/month): ~$51-52/month
  - Enterprise business (2,000 min/month): ~$186-187/month
  - Covered by increased tier pricing ($179 Professional, $449 Enterprise)

**Stripe Costs:**

- **Stripe Connect: $0/month platform fee**
  - Businesses pay their own Stripe fees (2.9% + $0.30) from connected accounts
  - Platform owner pays $0 in customer transaction fees
  - _Optional future revenue: Platform fee (e.g., 1% per transaction)_

- **Stripe Billing (Platform Subscriptions): 2.9% + $0.30 per subscription charge**
  - Updated pricing: Professional $179, Enterprise $449 (includes AI agent)
  - Example costs at different scales:
    - 10 businesses × $129 avg × 2.9% = $37/month in Stripe fees
    - 50 businesses × $129 avg × 2.9% = $187/month
    - 100 businesses × $129 avg × 2.9% = $374/month
    - 250 businesses × $179 avg × 2.9% = $1,298/month
  - Annual subscriptions reduce Stripe fees (charged once vs 12 times)

**Total Operating Costs:**

**Assumptions:**

- 60% of Professional+ businesses enable AI agent (use 400 min avg)
- Starter tier has no AI costs

- **Month 1-3 (Beta, 0-10 businesses, mostly Starter):** ~$200-520/month
  - Infrastructure: $105-365/month
  - Monitoring: $71/month
  - AI agent costs: $0-50/month (few early adopters)
  - Stripe subscription fees: ~$29-37/month

- **Month 6 (50 businesses: 30 Starter, 18 Professional, 2 Enterprise):**
  - Revenue: $5,580/month (30×$49 + 18×$179 + 2×$449)
  - Infrastructure: $180-465/month
  - Monitoring: $71/month
  - AI agent costs: ~$650/month (18 Pro × $40 avg + 2 Ent × $150 avg)
  - Stripe subscription fees: ~$162/month
  - **Total costs: ~$1,060-1,350/month**
  - **Net profit: ~$4,230-4,520/month**

- **Month 12 (100 businesses: 50 Starter, 43 Professional, 7 Enterprise):**
  - Revenue: $13,343/month (50×$49 + 43×$179 + 7×$449)
  - Infrastructure: $250-565/month
  - Monitoring: $71/month
  - AI agent costs: ~$2,000/month (43 Pro × $40 avg + 7 Ent × $150 avg)
  - Stripe subscription fees: ~$387/month
  - **Total costs: ~$2,710-3,025/month**
  - **Net profit: ~$10,320-10,635/month**

- **Year 1 Total Operating Costs:** ~$16,000-23,000 (includes ~$850/year monitoring)
- **Year 1 Revenue (Conservative):** ~$85,000-100,000 ARR (100 businesses by month 12, 50% Professional+)
- **Year 1 Net Profit:** ~$62,000-84,000

**Key Insight:** AI agent costs (~$40-50/business) are covered by $30 price increase (Professional $179 vs old $149). Profit margins remain healthy (~75-80%).

**Note:** Stripe fees on customer payments (Connect Express) are still paid by businesses from their accounts, not you.

### Future (Pro Geolocation)

- react-native-background-geolocation: $200/year
- **Total: +$200/year**

---

## Key Decisions Made

1. ✅ **Hybrid Architecture** - Frontend → Supabase (direct) for 60-70% of operations
2. ✅ **Hono over Express** - 10x faster, type-safe, modern, built for Bun
3. ✅ **Bun over Node.js** - 3-5x faster development
4. ✅ **Supabase RLS** - Direct client access with Row Level Security (eliminates most API)
5. ✅ **No Prisma** - Supabase client + CLI sufficient
6. ✅ **Expo over React Native CLI** - Faster development, easier push notifications
7. ✅ **Pure Expo for MVP** - Upgrade to pro geolocation later if needed
8. ✅ **No Firebase** - Expo handles push notifications
9. ✅ **Resend over SendGrid** - Better DX, modern API
10. ✅ **TanStack Router** - Type-safe, better than React Router
11. ✅ **Vercel + Railway** - Simple deployment, generous free tiers
12. ✅ **Workers as Separate Services** - Long-running processes isolated from API
13. ✅ **Stripe Connect Express** - White-labeled onboarding (~90%), businesses connect own accounts & pay own fees, optional platform fee for future revenue
14. ✅ **Pricing separate from payments** - Businesses can configure pricing without enabling payment processing
15. ✅ **Payment optional** - Master toggle allows businesses to disable entirely
16. ✅ **Flexible pricing model** - Rules engine supports various mobile service business models
17. ✅ **Subscription billing model** - Monthly/annual tiers ($49-$449/month), 14-day trial with no card required (annual requires card upfront but not charged until trial ends)
18. ✅ **Standard pricing for MVP** - Everyone pays same rate initially; industry-specific add-ons introduced later as niche features develop
19. ✅ **Grace period system** - 10% overage allowance with configurable grace periods (default 1/year), admin-adjustable via super admin panel
20. ✅ **Payment processing gated** - Stripe Connect Express only available in Professional/Enterprise tiers, encourages upgrades
21. ✅ **Separate Stripe accounts** - Stripe Connect for customer payments (businesses pay fees), Stripe Billing for platform subscriptions (platform pays 2.9% + $0.30)
22. ✅ **Super admin dashboard** - Dedicated platform owner interface for subscription management, MRR/ARR analytics, trial tracking, and global settings
23. ✅ **ElevenLabs Conversational AI** - Multimodal AI booking agent (voice, SMS, web widget) via ElevenLabs platform, replaces Claude chat widget
24. ✅ **AI agent as premium feature** - Only available in Professional ($179/month, 500 min included) and Enterprise ($449/month, 2,000 min included) tiers
25. ✅ **Dedicated Twilio phone numbers** - Each Professional+ business gets own phone number for branded caller ID and SMS
26. ✅ **Platform pays AI costs** - White-labeled service, ElevenLabs + Twilio costs covered by increased tier pricing ($30 increase)
27. ✅ **Global LLM model selection** - Super admin chooses LLM (Claude, GPT-4o, etc.) via ElevenLabs, applies to all businesses
28. ✅ **Proximity-aware slot suggestions** - AI agent suggests appointment times near existing routes to minimize drive time
29. ✅ **Configurable escalation workflows** - Businesses choose: phone transfer, support ticket, SMS handoff, or all methods
30. ✅ **AI Setup Assistant (Phase 10+)** - ElevenLabs-powered voice onboarding for new businesses, reduces manual data entry by 80%
31. ✅ **Error handling strategy** - Circuit breakers, exponential backoff, retry queues for external API failures (Stripe, Twilio, Mapbox, ElevenLabs)
32. ✅ **Webhook reliability** - Automatic retry (10 attempts over 3 days), idempotency keys, HMAC signature verification, dead letter queue for manual review
33. ✅ **AI agent fallback** - Intelligent multi-channel fallback (voice→voicemail, SMS→manual inbox, web→cached form) with auto-recovery every 5 minutes
34. ✅ **Disaster recovery** - Supabase PITR backups (7-day retention), 4-hour RTO, 1-hour RPO, monthly restore tests, documented recovery procedures
35. ✅ **Monitoring stack** - BetterStack uptime (50 monitors), Sentry errors (50K events), BetterStack Logs (10GB), 4-tier severity alerting (~$71/month)
36. ✅ **Incident response** - 6-step playbook (detect, assess, communicate, mitigate, resolve, post-mortem), PagerDuty on-call rotation, runbooks for common failures
37. ✅ **Performance SLAs** - API <300ms (95th), DB queries <1s avg, 99.5% uptime for core services, alerts trigger at 50% SLA breach for >5min

---

## Next Steps

1. ✅ Review and approve PRD
2. Setup monorepo with Bun workspaces
3. Create Supabase project
4. Initialize Phase 1 (Foundation)
5. Weekly progress reviews
6. Iterate based on pilot feedback

**Timeline:** 24 weeks to MVP (includes 5-week customer payment integration + 3-week subscription billing + 4-week error handling)
**Cost:**

- **Operating:** ~$130-700/month (scales with growth, includes Stripe subscription fees)
- **Revenue Potential:** $500+ MRR by launch (5 pilot customers), $4,500+ MRR by month 6
- **Note:** Platform owner pays Stripe fees on own subscriptions (2.9% + $0.30), businesses pay their own customer payment fees
  **Team:** 1 developer + Claude Code

**Architecture Benefits:**

- 60-70% fewer API endpoints (direct Supabase access)
- Faster performance (no proxy layer)
- Type-safe database queries
- Real-time updates built-in
- Automatic scaling via Supabase
- Less code to maintain
- **Optional payment processing** (fully configurable per business)

Ready to build! 🚀
