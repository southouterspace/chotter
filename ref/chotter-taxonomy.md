# Chotter - Complete Data Taxonomy v2.0

**Last Updated:** October 17, 2025
**Status:** Current
**Reference:** chotter-prd.md v2.0

---

## Document Overview

This document defines the complete data model for Chotter, a multi-tenant field service SaaS platform with AI-powered scheduling, subscription billing, payment processing, and route optimization.

### Architecture Principles

- **Multi-tenant:** All business-level tables include `business_id` for tenant isolation
- **Direct Supabase Access:** Frontend apps query Supabase directly with RLS policies (60-70% of operations)
- **Hono API:** Complex logic, webhooks, AI integration, payment processing (20-30% of operations)
- **Bun Workers:** Route optimization, background jobs (10% of operations)

### Domain Separation

This taxonomy is organized into two primary domains:

1. **Platform-Owner Domain** - Super admin tables for SaaS operations (subscriptions, tiers, analytics)
2. **Business-Level Domain** - Tables each business uses (appointments, customers, technicians, payments)

---

# PLATFORM-OWNER DOMAIN

> These tables are managed by the platform owner (super admins) and contain cross-business data for SaaS operations.

---

## businesses

Multi-tenant isolation table. Each business is a separate tenant with isolated data.

**Attributes:**

- `id`: uuid (PK)
- `name`: string (business name)
- `slug`: string (unique, URL-friendly identifier)
- `subdomain`: string (nullable, custom subdomain like `acme.chotter.com`)
- `industry`: enum [`hvac`, `plumbing`, `electrical`, `auto_repair`, `general`]
- `owner_person_id`: uuid (FK → Person.id, the initial admin user)
- `contact_email`: string
- `contact_phone`: string (E.164 format)
- `address_line1`: string
- `address_line2`: string (nullable)
- `city`: string
- `state`: string (2-letter code)
- `postal_code`: string
- `country`: string (ISO 3166-1 alpha-2, default 'US')
- `timezone`: string (IANA timezone, e.g., 'America/Los_Angeles')
- `business_hours`: jsonb (schedule per day: `{"monday": {"start": "08:00", "end": "17:00"}}`)
- `logo_url`: string (nullable)
- `website_url`: string (nullable)
- `status`: enum [`trial`, `active`, `suspended`, `cancelled`, `past_due`]
- `trial_started_at`: timestamp (nullable)
- `trial_ends_at`: timestamp (nullable)
- `activated_at`: timestamp (nullable, when converted to paid)
- `suspended_at`: timestamp (nullable)
- `cancelled_at`: timestamp (nullable)
- `settings`: jsonb (business preferences, notification templates, etc.)
- `created_at`: timestamp
- `updated_at`: timestamp

**Indexes:**

- slug (unique)
- subdomain (unique, sparse)
- status
- trial_ends_at (for trial expiration queries)
- owner_person_id

**Relationships:**

- Has one Subscription
- Has many Person records (employees, customers)
- Has many Services, Tickets, Routes, etc.
- Has one PaymentSettings (if payment processing enabled)
- Has one AIAgent (if AI booking enabled)

**RLS Policies:**

```sql
-- Businesses can only see their own record
SELECT: business_id = current_business_id()

-- Super admins can see all
SELECT: is_super_admin()
```

---

## subscription_tiers

Defines pricing tiers (Starter, Professional, Enterprise) with features and limits.

**Attributes:**

- `id`: uuid (PK)
- `name`: string (e.g., "Professional")
- `slug`: string (unique, e.g., "professional")
- `display_name`: string (public-facing name)
- `description`: text
- `monthly_price_cents`: integer
- `annual_price_cents`: integer
- `stripe_monthly_price_id`: string (Stripe Price ID)
- `stripe_annual_price_id`: string (Stripe Price ID)
- `features`: jsonb (feature flags: `{"payment_processing": true, "ai_agent": true, "advanced_analytics": true}`)
- `limits`: jsonb (usage limits: `{"appointments_per_month": 500, "admin_users": 2, "field_technicians": 10, "ai_voice_minutes": 500}`)
- `sort_order`: integer (for display ordering: 1=Starter, 2=Pro, 3=Enterprise)
- `active`: boolean (can be selected for new subscriptions)
- `is_public`: boolean (shown on pricing page)
- `created_at`: timestamp
- `updated_at`: timestamp

**Indexes:**

- slug (unique)
- active
- sort_order

**Relationships:**

- Has many Subscriptions

**Notes:**

- Platform owner manages via super admin dashboard
- Changing limits requires migration strategy for existing subscribers

---

## subscriptions

Per-business subscription records tracking billing, usage, and grace periods.

**Attributes:**

- `id`: uuid (PK)
- `business_id`: uuid (FK → businesses.id, unique)
- `tier_id`: uuid (FK → subscription_tiers.id)
- `stripe_customer_id`: string (Stripe Customer ID)
- `stripe_subscription_id`: string (Stripe Subscription ID, nullable during trial)
- `status`: enum [`trial`, `active`, `past_due`, `cancelled`, `incomplete`, `incomplete_expired`]
- `billing_period`: enum [`monthly`, `annual`]
- `current_period_start`: timestamp
- `current_period_end`: timestamp
- `trial_start`: timestamp (nullable)
- `trial_end`: timestamp (nullable)
- `cancel_at_period_end`: boolean (downgrade/cancel scheduled)
- `cancelled_at`: timestamp (nullable)
- `ended_at`: timestamp (nullable)
- `next_tier_id`: uuid (FK → subscription_tiers.id, nullable, for scheduled downgrades)
- `grace_periods_used_this_year`: integer (default 0)
- `grace_periods_reset_at`: timestamp (annual reset date)
- `current_usage`: jsonb (current period usage: `{"appointments": 347, "admin_users": 2, "field_technicians": 7, "ai_voice_minutes": 234}`)
- `overage_this_period`: boolean (has exceeded limits this month)
- `last_overage_warning_sent_at`: timestamp (nullable)
- `payment_method`: jsonb (card info from Stripe: `{"brand": "visa", "last4": "4242", "exp_month": 12, "exp_year": 2026}`)
- `metadata`: jsonb (additional Stripe metadata)
- `created_at`: timestamp
- `updated_at`: timestamp

**Indexes:**

- business_id (unique)
- tier_id
- stripe_customer_id (unique)
- stripe_subscription_id (unique, sparse)
- status
- current_period_end (for renewal queries)
- trial_end (for trial expiration)

**Relationships:**

- Belongs to Business
- Belongs to SubscriptionTier
- Has many InvoiceHistory records
- Has many UsageEvents

**RLS Policies:**

```sql
-- Businesses can only see their own subscription
SELECT: business_id = current_business_id()

-- Super admins can see all
SELECT: is_super_admin()
```

**Notes:**

- Usage tracked in real-time via triggers on appointments, users
- Grace period logic enforced in application layer
- Stripe webhooks keep status synchronized

---

## platform_settings

Global configuration for SaaS operations (grace periods, trials, etc.).

**Attributes:**

- `id`: uuid (PK)
- `setting_key`: string (unique, e.g., `grace_period_overage_threshold`)
- `setting_value`: jsonb (flexible value storage)
- `setting_type`: enum [`grace_period`, `trial_config`, `ai_config`, `feature_flag`, `notification_config`]
- `description`: text
- `updated_by_id`: uuid (FK → Person.id, super admin who changed it)
- `updated_at`: timestamp
- `created_at`: timestamp

**Example Records:**

```sql
{
  setting_key: 'grace_period_overage_threshold',
  setting_value: {"percentage": 10},
  setting_type: 'grace_period'
}

{
  setting_key: 'grace_periods_per_year',
  setting_value: {"count": 1},
  setting_type: 'grace_period'
}

{
  setting_key: 'trial_length_days',
  setting_value: {"days": 14},
  setting_type: 'trial_config'
}

{
  setting_key: 'trial_reminder_schedule',
  setting_value: {"days": [7, 12, 13]},
  setting_type: 'trial_config'
}

{
  setting_key: 'ai_global_llm_model',
  setting_value: {"provider": "anthropic", "model": "claude-sonnet-4"},
  setting_type: 'ai_config'
}
```

**Indexes:**

- setting_key (unique)
- setting_type

**Relationships:**

- Updated by Person (super admin)

**RLS Policies:**

```sql
-- Only super admins can read/write
SELECT, UPDATE: is_super_admin()
```

---

## audit_logs

Audit trail for all super admin actions.

**Attributes:**

- `id`: uuid (PK)
- `admin_person_id`: uuid (FK → Person.id)
- `action_type`: enum [`subscription_modified`, `tier_created`, `tier_updated`, `business_suspended`, `refund_issued`, `limits_overridden`, `impersonation_started`, `impersonation_ended`, `setting_changed`]
- `target_business_id`: uuid (FK → businesses.id, nullable for global actions)
- `target_entity_type`: string (nullable, e.g., 'subscription', 'tier')
- `target_entity_id`: uuid (nullable)
- `action_details`: jsonb (full context: before/after values, reason, etc.)
- `ip_address`: inet (nullable)
- `user_agent`: text (nullable)
- `created_at`: timestamp

**Indexes:**

- admin_person_id
- target_business_id
- action_type
- created_at (DESC)

**Relationships:**

- Belongs to Person (admin)
- Belongs to Business (nullable)

**RLS Policies:**

```sql
-- Only super admins can read
SELECT: is_super_admin()

-- Insert-only (no updates/deletes)
INSERT: is_super_admin()
```

**Retention:** Keep indefinitely for compliance

---

## invoice_history

Record of all subscription invoices (synced from Stripe).

**Attributes:**

- `id`: uuid (PK)
- `subscription_id`: uuid (FK → subscriptions.id)
- `business_id`: uuid (FK → businesses.id)
- `stripe_invoice_id`: string (unique, Stripe Invoice ID)
- `stripe_payment_intent_id`: string (nullable)
- `invoice_number`: string (Stripe invoice number)
- `status`: enum [`draft`, `open`, `paid`, `uncollectible`, `void`]
- `amount_due_cents`: integer
- `amount_paid_cents`: integer
- `amount_remaining_cents`: integer
- `currency`: string (ISO 4217, default 'usd')
- `billing_reason`: enum [`subscription_create`, `subscription_cycle`, `subscription_update`, `manual`]
- `invoice_pdf_url`: string (nullable, Stripe-hosted PDF)
- `hosted_invoice_url`: string (nullable, Stripe-hosted page)
- `period_start`: timestamp
- `period_end`: timestamp
- `due_date`: timestamp (nullable)
- `paid_at`: timestamp (nullable)
- `finalized_at`: timestamp (nullable)
- `created_at`: timestamp (Stripe creation time)
- `updated_at`: timestamp

**Indexes:**

- subscription_id
- business_id
- stripe_invoice_id (unique)
- status
- paid_at

**Relationships:**

- Belongs to Subscription
- Belongs to Business

**RLS Policies:**

```sql
-- Businesses can only see their own invoices
SELECT: business_id = current_business_id()

-- Super admins can see all
SELECT: is_super_admin()
```

**Notes:**

- Populated via Stripe webhook `invoice.finalized`, `invoice.payment_succeeded`

---

## usage_events

Granular tracking of feature usage for analytics and overage detection.

**Attributes:**

- `id`: uuid (PK)
- `business_id`: uuid (FK → businesses.id)
- `subscription_id`: uuid (FK → subscriptions.id)
- `event_type`: enum [`appointment_created`, `user_added`, `user_removed`, `ai_voice_minutes_used`, `ai_conversation_completed`]
- `event_details`: jsonb (context: `{"appointment_id": "uuid", "technician_id": "uuid"}`)
- `quantity`: integer (e.g., 1 appointment, 15 minutes)
- `period_month`: string (YYYY-MM, for aggregation)
- `recorded_at`: timestamp

**Indexes:**

- business_id
- subscription_id
- event_type
- period_month
- recorded_at

**Relationships:**

- Belongs to Business
- Belongs to Subscription

**RLS Policies:**

```sql
-- Businesses can only see their own usage
SELECT: business_id = current_business_id()

-- Super admins can see all
SELECT: is_super_admin()
```

**Retention:** Keep 24 months for analytics, then aggregate and archive

---

# BUSINESS-LEVEL DOMAIN

> These tables contain per-business operational data. All include `business_id` for multi-tenant isolation.

---

## Core Entities

---

## Person

Base entity for all human users (customers, technicians, admins).

**Attributes:**

- `id`: uuid (PK)
- `business_id`: uuid (FK → businesses.id, nullable for customers)
- `supabase_user_id`: uuid (FK → auth.users, nullable for customers without accounts)
- `email`: string (nullable, not required for one-time customers)
- `phone`: string (E.164 format, indexed)
- `first_name`: string
- `last_name`: string
- `role`: enum [`customer`, `technician`, `admin`, `super_admin`]
- `avatar_url`: string (nullable)
- `notification_preference`: enum [`sms`, `email`, `both`, `none`]
- `timezone`: string (IANA timezone, defaults to business timezone)
- `active`: boolean
- `created_at`: timestamp
- `updated_at`: timestamp
- `last_login_at`: timestamp (nullable)

**Indexes:**

- email (sparse, for registered users)
- phone (for caller ID lookups)
- business_id
- role
- supabase_user_id (unique, sparse)
- composite: (business_id, role) for filtering

**Relationships:**

- Belongs to Business (nullable for customers)
- Has one Customer profile (if role=customer)
- Has one Technician profile (if role=technician)
- Has many Notifications (as recipient)
- Has many StatusHistory records (as actor)

**RLS Policies:**

```sql
-- Customers can only see themselves
SELECT: id = auth.uid() AND role = 'customer'

-- Technicians can see themselves + customers on their appointments
SELECT: (id = auth.uid() AND role = 'technician') OR
        (role = 'customer' AND EXISTS (
          SELECT 1 FROM tickets
          WHERE customer_id = person.id
          AND assigned_technician_id = auth.uid()
        ))

-- Admins can see all within their business
SELECT: business_id = current_business_id() AND role = 'admin'

-- Super admins can see all
SELECT: is_super_admin()
```

**Notes:**

- Customers don't need accounts for one-time bookings (magic link for portal access)
- Super admins have `business_id = NULL` and role = 'super_admin'

---

## Customer

Extends Person with customer-specific data and location.

**Attributes:**

- `id`: uuid (PK)
- `person_id`: uuid (FK → Person.id, unique)
- `business_id`: uuid (FK → businesses.id)
- `address_line1`: string
- `address_line2`: string (nullable)
- `city`: string
- `state`: string (2-letter code)
- `postal_code`: string
- `country`: string (ISO 3166-1 alpha-2)
- `location`: point (PostGIS geometry, lat/lng for proximity calculations)
- `location_verified`: boolean (geocoded address confirmed)
- `preferred_contact_method`: enum [`call`, `sms`, `email`]
- `notes`: text (nullable, internal business notes)
- `customer_since`: date
- `total_appointments`: integer (computed, cached via trigger)
- `average_rating_given`: decimal(3,2) (nullable, avg of ratings they gave)
- `lifetime_value_cents`: integer (total revenue from this customer)
- `tags`: jsonb (array of tags: `["VIP", "Fleet Customer", "Cash Only"]`)
- `metadata`: jsonb (custom fields defined by business)
- `created_at`: timestamp
- `updated_at`: timestamp

**Indexes:**

- person_id (unique)
- business_id
- location (spatial index for proximity queries)
- phone (via Person FK, for caller ID)
- tags (GIN index for tag queries)

**Relationships:**

- Belongs to Person
- Belongs to Business
- Has many Tickets
- Has many Media items (uploaded content)

**RLS Policies:**

```sql
-- Customers can only see themselves
SELECT: person_id = auth.uid()

-- Technicians can see customers on their appointments
SELECT: business_id = current_business_id() AND EXISTS (
  SELECT 1 FROM tickets
  WHERE customer_id = customer.id
  AND assigned_technician_id = auth.uid()
)

-- Admins can see all customers in their business
SELECT: business_id = current_business_id()
```

**Notes:**

- Location auto-geocoded on address save via PostGIS/Mapbox API
- Total appointments updated via trigger on tickets table

---

## Technician

Extends Person with technician-specific data, skills, and scheduling.

**Attributes:**

- `id`: uuid (PK)
- `person_id`: uuid (FK → Person.id, unique)
- `business_id`: uuid (FK → businesses.id)
- `employee_id`: string (nullable, for external HR systems)
- `skills`: jsonb (array of skill names: `["ASE Certified", "Brake Specialist", "HVAC EPA 608"]`)
- `certifications`: jsonb (array of certification objects: `[{"name": "ASE Master", "issuer": "ASE", "number": "123456", "expires": "2026-12-31"}]`)
- `home_location`: point (PostGIS geometry, starting point for routes)
- `current_location`: point (PostGIS geometry, real-time position)
- `current_location_updated_at`: timestamp
- `working_hours`: jsonb (schedule per day: `{"monday": {"start": "08:00", "end": "17:00", "breaks": [{"start": "12:00", "end": "13:00"}]}}`)
- `on_call_schedule`: jsonb (on-call windows: `[{"start": "2025-10-20T17:00:00Z", "end": "2025-10-21T08:00:00Z"}]`)
- `max_appointments_per_day`: integer (capacity limit)
- `vehicle_info`: jsonb (vehicle details: `{"make": "Ford", "model": "Transit", "year": 2022, "plate": "ABC123", "color": "white"}`)
- `hourly_rate_cents`: integer (for cost calculations)
- `active`: boolean (currently employed and available)
- `hire_date`: date
- `termination_date`: date (nullable)
- `preferred_zones`: jsonb (nullable, preferred geographic areas: `[{"name": "North County", "radius_miles": 20, "center": {"lat": 33.1581, "lng": -117.3506}}]`)
- `performance_metrics`: jsonb (cached metrics: `{"avg_jobs_per_day": 5.2, "avg_rating": 4.7, "on_time_percentage": 94}`)
- `created_at`: timestamp
- `updated_at`: timestamp

**Indexes:**

- person_id (unique)
- business_id
- skills (GIN index for array containment)
- current_location (spatial index)
- active
- composite: (business_id, active) for available tech queries

**Relationships:**

- Belongs to Person
- Belongs to Business
- Has many Routes
- Has many Tickets (assigned)
- Has many LocationHistory records
- Has many OnCallSchedules

**RLS Policies:**

```sql
-- Technicians can only see themselves
SELECT: person_id = auth.uid()

-- Admins can see all technicians in their business
SELECT: business_id = current_business_id()
```

**Notes:**

- Current location updated automatically from mobile app every 30s
- Skills matching used by AI scheduling and route optimization

---

## Service

Defines bookable service types with pricing and requirements.

**Attributes:**

- `id`: uuid (PK)
- `business_id`: uuid (FK → businesses.id)
- `name`: string (e.g., "Oil Change", "AC Repair", "Brake Inspection")
- `slug`: string (URL-friendly, unique within business)
- `description`: text
- `category`: string (e.g., "Maintenance", "Repair", "Diagnostic", "Emergency")
- `default_duration_minutes`: integer
- `duration_buffer_minutes`: integer (travel/cleanup buffer)
- `required_skills`: jsonb (array of required skills: `["ASE Certified", "Brake Specialist"]`)
- `required_certifications`: jsonb (nullable, array of required cert names)
- `base_price_cents`: integer (nullable, base service price)
- `taxable`: boolean
- `requires_parts`: boolean (parts inventory tracking needed)
- `customer_media_required`: boolean (require customer to upload photos/videos)
- `customer_media_prompt`: text (nullable, e.g., "Please upload photos of the dashboard warning lights")
- `active`: boolean (bookable)
- `display_order`: integer (for UI sorting)
- `metadata`: jsonb (custom fields for industry-specific data)
- `created_at`: timestamp
- `updated_at`: timestamp

**Indexes:**

- business_id
- slug (unique within business, composite: (business_id, slug))
- active
- required_skills (GIN index)
- category

**Relationships:**

- Belongs to Business
- Has many Tickets
- Has many PricingRules

**RLS Policies:**

```sql
-- Everyone can read active services for a business
SELECT: active = true

-- Only admins can create/update
INSERT, UPDATE: business_id = current_business_id() AND role = 'admin'
```

---

## Ticket

Core entity for service requests/appointments.

**Attributes:**

- `id`: uuid (PK)
- `business_id`: uuid (FK → businesses.id)
- `ticket_number`: string (human-readable, auto-generated: "TKT-20251017-001")
- `customer_id`: uuid (FK → Customer.id)
- `service_id`: uuid (FK → Service.id)
- `assigned_technician_id`: uuid (FK → Technician.id, nullable until assigned)
- `route_id`: uuid (FK → Route.id, nullable until scheduled)
- `status`: enum [`pending`, `scheduled`, `confirmed`, `en_route`, `in_progress`, `completed`, `cancelled`, `on_hold`]
- `priority`: enum [`emergency`, `urgent`, `normal`, `low`]
- `scheduled_date`: date (nullable for pending)
- `time_window_start`: time (nullable)
- `time_window_end`: time (nullable)
- `window_type`: enum [`time_window`, `by_time`, `flexible`, `emergency`]
- `allow_early_arrival`: boolean (customer opt-in)
- `earliest_acceptable_time`: time (nullable)
- `early_arrival_notification_required`: boolean (default true)
- `estimated_duration_minutes`: integer (from Service, adjustable)
- `actual_start_time`: timestamp (nullable)
- `actual_end_time`: timestamp (nullable)
- `check_in_location`: point (PostGIS, nullable)
- `check_out_location`: point (PostGIS, nullable)
- `customer_notes`: text (nullable, from customer)
- `technician_notes`: text (nullable, internal)
- `work_summary`: text (nullable, post-completion)
- `parts_used`: jsonb (array of part objects, nullable)
- `customer_rating`: integer (1-5, nullable)
- `customer_review`: text (nullable)
- `payment_status`: enum [`not_required`, `pending`, `authorized`, `captured`, `refunded`, `failed`] (default: 'not_required')
- `payment_id`: uuid (FK → payments.id, nullable)
- `total_cost_cents`: integer (nullable)
- `ai_scheduled`: boolean (true if booked via AI agent)
- `ai_conversation_id`: uuid (FK → ai_conversations.id, nullable)
- `ai_optimization_score`: decimal(5,2) (nullable, routing efficiency)
- `created_at`: timestamp
- `updated_at`: timestamp
- `completed_at`: timestamp (nullable)
- `cancelled_at`: timestamp (nullable)
- `cancellation_reason`: text (nullable)

**Indexes:**

- ticket_number (unique)
- business_id
- customer_id
- assigned_technician_id
- service_id
- route_id
- status
- scheduled_date
- priority
- payment_status
- composite: (business_id, status, scheduled_date) for dashboard
- composite: (assigned_technician_id, scheduled_date, status) for technician routes

**Relationships:**

- Belongs to Business
- Belongs to Customer
- Belongs to Service
- Belongs to Technician (assigned, nullable)
- Belongs to Route (nullable)
- Belongs to Payment (nullable)
- Belongs to AIConversation (nullable)
- Has many Media items
- Has many Notifications
- Has many StatusHistory records
- Has one EmergencyRequest (if priority=emergency)

**RLS Policies:**

```sql
-- Customers can only see their own tickets
SELECT: customer_id = auth.uid()

-- Technicians can see tickets assigned to them
SELECT: assigned_technician_id = auth.uid()

-- Admins can see all tickets in their business
SELECT: business_id = current_business_id()
```

**Notes:**

- Ticket number auto-generated via trigger (format: TKT-YYYYMMDD-NNN)
- Payment status independent of payment processing enablement (pricing always tracked)

---

## Route

Daily optimized route for a technician.

**Attributes:**

- `id`: uuid (PK)
- `business_id`: uuid (FK → businesses.id)
- `technician_id`: uuid (FK → Technician.id)
- `date`: date
- `status`: enum [`planned`, `active`, `completed`, `cancelled`]
- `ticket_sequence`: jsonb (ordered array of ticket IDs: `["uuid1", "uuid2", "uuid3"]`)
- `start_location`: point (PostGIS, usually technician home)
- `end_location`: point (PostGIS, nullable, may differ from start)
- `total_distance_miles`: decimal(10,2)
- `estimated_duration_minutes`: integer (travel + service time)
- `estimated_start_time`: time
- `estimated_end_time`: time
- `actual_start_time`: timestamp (nullable)
- `actual_end_time`: timestamp (nullable)
- `optimization_version`: integer (increments on rebalance)
- `optimization_algorithm`: string (e.g., "OR-Tools-v1.2", for tracking)
- `optimization_score`: decimal(10,2) (efficiency metric, lower is better)
- `manual_override`: boolean (true if admin manually edited)
- `created_at`: timestamp
- `last_optimized_at`: timestamp
- `completed_at`: timestamp (nullable)

**Indexes:**

- business_id
- technician_id
- date
- status
- composite: (technician_id, date) (unique)
- composite: (business_id, date, status)

**Relationships:**

- Belongs to Business
- Belongs to Technician
- Has many Tickets (via ticket_sequence)
- Has many RouteEvents (audit trail)

**RLS Policies:**

```sql
-- Technicians can only see their own routes
SELECT: technician_id = auth.uid()

-- Admins can see all routes in their business
SELECT: business_id = current_business_id()
```

**Notes:**

- Optimization version increments on each route rebalancing
- Manual overrides prevent automatic reoptimization

---

## Subscription & Billing Entities

---

## payment_settings

Stripe Connect configuration per business (optional, Professional+ only).

**Attributes:**

- `id`: uuid (PK)
- `business_id`: uuid (FK → businesses.id, unique)
- `payment_processing_enabled`: boolean (master toggle, default false)
- `stripe_account_id`: string (nullable, Stripe Connect Express account ID)
- `stripe_onboarding_complete`: boolean (default false)
- `stripe_charges_enabled`: boolean (can accept payments)
- `stripe_payouts_enabled`: boolean (can receive payouts)
- `stripe_connected_at`: timestamp (nullable)
- `stripe_details_submitted`: boolean
- `stripe_requirements`: jsonb (nullable, currently_due/eventually_due fields from Stripe)
- `default_payment_timing`: enum [`pre_service`, `post_service`, `flexible`] (default: 'post_service')
- `accepted_payment_methods`: jsonb (array: `["card", "ach_debit", "apple_pay", "google_pay"]`)
- `refund_policy_days`: integer (nullable, e.g., 7 days for refund eligibility)
- `refund_policy_text`: text (nullable, customer-facing refund policy)
- `test_mode`: boolean (default true, switch to false for live payments)
- `webhook_secret`: string (nullable, Stripe webhook signing secret)
- `metadata`: jsonb (additional Stripe metadata)
- `created_at`: timestamp
- `updated_at`: timestamp

**Indexes:**

- business_id (unique)
- stripe_account_id (unique, sparse)

**Relationships:**

- Belongs to Business

**RLS Policies:**

```sql
-- Only admins of the business can read/update
SELECT, UPDATE: business_id = current_business_id() AND role = 'admin'
```

**Notes:**

- Payment processing only available on Professional+ tiers
- Stripe Express onboarding handled via account links
- Webhooks verify signature with webhook_secret

---

## Payment & Pricing Entities

---

## pricing_rules

Dynamic pricing rules for surcharges (after-hours, emergency, weekend, etc.).

**Attributes:**

- `id`: uuid (PK)
- `business_id`: uuid (FK → businesses.id)
- `service_id`: uuid (FK → Service.id, nullable for global rules)
- `rule_name`: string (e.g., "After-Hours Surcharge", "Weekend Premium", "Emergency Fee")
- `rule_type`: enum [`time_based`, `priority_based`, `fixed_fee`, `percentage_markup`]
- `conditions`: jsonb (when rule applies: `{"days": ["saturday", "sunday"], "time_after": "17:00", "time_before": "08:00"}`)
- `value_type`: enum [`percentage`, `fixed_cents`]
- `value`: integer (percentage (e.g., 50 for 50%) or cents (e.g., 3000 for $30.00))
- `applies_to`: enum [`all_services`, `specific_service`, `emergency_only`]
- `priority`: integer (order of application if multiple rules match)
- `active`: boolean
- `created_at`: timestamp
- `updated_at`: timestamp

**Examples:**

```sql
{
  rule_name: "After-Hours Surcharge",
  rule_type: "time_based",
  conditions: {"time_after": "17:00", "time_before": "08:00"},
  value_type: "fixed_cents",
  value: 3000,  // $30.00
  applies_to: "all_services"
}

{
  rule_name: "Emergency Fee",
  rule_type: "priority_based",
  conditions: {"priority": "emergency"},
  value_type: "percentage",
  value: 50,  // 50% markup
  applies_to: "all_services"
}

{
  rule_name: "Weekend Premium",
  rule_type: "time_based",
  conditions: {"days": ["saturday", "sunday"]},
  value_type: "percentage",
  value: 25,  // 25% markup
  applies_to: "all_services"
}
```

**Indexes:**

- business_id
- service_id (sparse)
- active

**Relationships:**

- Belongs to Business
- Belongs to Service (nullable)

**RLS Policies:**

```sql
-- Customers can read pricing rules (for transparency)
SELECT: business_id IN (SELECT business_id FROM tickets WHERE customer_id = auth.uid())

-- Admins can manage
INSERT, UPDATE: business_id = current_business_id() AND role = 'admin'
```

**Notes:**

- Multiple rules can apply (stacked)
- Application order determined by priority field
- AI agent queries these rules for quote generation

---

## payments

Customer payment transactions (Stripe Connect).

**Attributes:**

- `id`: uuid (PK)
- `business_id`: uuid (FK → businesses.id)
- `ticket_id`: uuid (FK → Ticket.id)
- `customer_id`: uuid (FK → Customer.id)
- `stripe_payment_intent_id`: string (unique, Stripe PaymentIntent ID)
- `stripe_charge_id`: string (nullable, Stripe Charge ID after capture)
- `amount_cents`: integer (total charged)
- `currency`: string (ISO 4217, default 'usd')
- `status`: enum [`pending`, `requires_action`, `processing`, `succeeded`, `failed`, `cancelled`, `refunded`]
- `payment_method_type`: enum [`card`, `ach_debit`, `apple_pay`, `google_pay`]
- `payment_method_details`: jsonb (card brand, last4, etc. from Stripe)
- `payment_timing`: enum [`pre_service`, `post_service`]
- `captured`: boolean (false for authorized, true for captured)
- `captured_at`: timestamp (nullable)
- `refunded_amount_cents`: integer (default 0)
- `failure_code`: string (nullable, Stripe error code)
- `failure_message`: text (nullable)
- `receipt_url`: string (nullable, Stripe-hosted receipt)
- `metadata`: jsonb (additional details, breakdown)
- `created_at`: timestamp
- `updated_at`: timestamp

**Indexes:**

- business_id
- ticket_id
- customer_id
- stripe_payment_intent_id (unique)
- status
- captured_at

**Relationships:**

- Belongs to Business
- Belongs to Ticket
- Belongs to Customer
- Has many Refunds

**RLS Policies:**

```sql
-- Customers can only see their own payments
SELECT: customer_id = auth.uid()

-- Admins can see all payments in their business
SELECT: business_id = current_business_id() AND role = 'admin'
```

**Notes:**

- All payments processed via Stripe Connect on behalf of connected account
- Pre-service payments are authorized, captured post-completion
- Webhooks update status from Stripe events

---

## refunds

Refund transactions (Stripe Connect).

**Attributes:**

- `id`: uuid (PK)
- `business_id`: uuid (FK → businesses.id)
- `payment_id`: uuid (FK → payments.id)
- `ticket_id`: uuid (FK → Ticket.id)
- `stripe_refund_id`: string (unique, Stripe Refund ID)
- `amount_cents`: integer (refunded amount)
- `currency`: string (ISO 4217)
- `status`: enum [`pending`, `succeeded`, `failed`, `cancelled`]
- `reason`: enum [`duplicate`, `fraudulent`, `requested_by_customer`, `service_not_completed`]
- `reason_details`: text (nullable, additional context)
- `requested_by_id`: uuid (FK → Person.id, who initiated refund)
- `requested_at`: timestamp
- `processed_at`: timestamp (nullable)
- `failure_reason`: text (nullable)
- `metadata`: jsonb
- `created_at`: timestamp
- `updated_at`: timestamp

**Indexes:**

- payment_id
- business_id
- ticket_id
- stripe_refund_id (unique)
- status

**Relationships:**

- Belongs to Business
- Belongs to Payment
- Belongs to Ticket
- Requested by Person

**RLS Policies:**

```sql
-- Customers can see refunds for their payments
SELECT: payment_id IN (SELECT id FROM payments WHERE customer_id = auth.uid())

-- Admins can manage refunds
SELECT, INSERT: business_id = current_business_id() AND role = 'admin'
```

---

## AI Booking Agent Entities

---

## ai_agents

Per-business AI booking agent configuration (Professional+ only).

**Attributes:**

- `id`: uuid (PK)
- `business_id`: uuid (FK → businesses.id, unique)
- `agent_name`: string (e.g., "Acme HVAC Booking Assistant")
- `status`: enum [`active`, `paused`, `suspended`]
- `elevenlabs_agent_id`: string (nullable, ElevenLabs agent ID)
- `twilio_phone_number`: string (nullable, E.164 format, dedicated booking number)
- `twilio_phone_sid`: string (nullable, Twilio phone number SID)
- `greeting_message`: text (AI agent opening message)
- `business_description`: text (context for AI: "We provide HVAC services...")
- `tone`: enum [`professional`, `friendly`, `casual`] (default: 'friendly')
- `capabilities`: jsonb (toggles: `{"allow_rescheduling": true, "allow_cancellations": false, "answer_questions": true}`)
- `escalation_method`: enum [`phone_transfer`, `support_ticket`, `sms_handoff`, `all`]
- `escalation_phone`: string (nullable, business main line for transfers)
- `escalation_sms`: string (nullable, admin SMS for handoffs)
- `escalation_keywords`: jsonb (array: `["manager", "human", "speak to someone"]`)
- `usage_limit_minutes`: integer (from subscription tier, e.g., 500)
- `usage_this_period_minutes`: integer (default 0, resets monthly)
- `usage_period_start`: timestamp
- `usage_period_end`: timestamp
- `web_widget_enabled`: boolean (default true)
- `web_widget_embed_code`: text (nullable, generated <script> tag)
- `custom_instructions`: text (nullable, additional AI context)
- `created_at`: timestamp
- `updated_at`: timestamp
- `activated_at`: timestamp (nullable)
- `paused_at`: timestamp (nullable)

**Indexes:**

- business_id (unique)
- twilio_phone_number (unique, sparse)
- status

**Relationships:**

- Belongs to Business
- Has many AIConversations
- Has many AIUsageEvents

**RLS Policies:**

```sql
-- Only admins of the business can read/update
SELECT, UPDATE: business_id = current_business_id() AND role = 'admin'

-- Super admins can view all agents
SELECT: is_super_admin()
```

**Notes:**

- Only available on Professional+ tiers
- Phone number provisioned via Twilio API on agent creation
- ElevenLabs handles conversation transcripts (not stored in our DB)

---

## ai_conversations

Summary of AI booking agent conversations (transcripts in ElevenLabs).

**Attributes:**

- `id`: uuid (PK)
- `business_id`: uuid (FK → businesses.id)
- `ai_agent_id`: uuid (FK → ai_agents.id)
- `customer_id`: uuid (FK → Customer.id, nullable if new customer)
- `ticket_id`: uuid (FK → Ticket.id, nullable until booking confirmed)
- `session_id`: string (ElevenLabs conversation ID)
- `channel`: enum [`voice`, `sms`, `web_widget`]
- `phone_number`: string (nullable, customer phone for caller ID)
- `conversation_outcome`: enum [`booking_completed`, `quote_provided`, `escalated`, `abandoned`, `error`]
- `booking_completed`: boolean
- `escalation_triggered`: boolean
- `escalation_reason`: text (nullable)
- `slots_suggested_count`: integer (how many options shown)
- `duration_seconds`: integer (nullable, voice calls only)
- `message_count`: integer (for SMS/web)
- `customer_satisfaction_rating`: integer (nullable, 1-5, post-conversation survey)
- `conversation_summary`: text (nullable, AI-generated summary)
- `started_at`: timestamp
- `ended_at`: timestamp (nullable)
- `created_at`: timestamp

**Indexes:**

- business_id
- ai_agent_id
- customer_id (sparse)
- ticket_id (sparse)
- session_id (unique)
- channel
- conversation_outcome
- started_at

**Relationships:**

- Belongs to Business
- Belongs to AIAgent
- Belongs to Customer (nullable)
- Belongs to Ticket (nullable)

**RLS Policies:**

```sql
-- Customers can see their own conversations
SELECT: customer_id = auth.uid()

-- Admins can see all conversations for their business
SELECT: business_id = current_business_id() AND role = 'admin'

-- Super admins can view all (for platform analytics)
SELECT: is_super_admin()
```

**Notes:**

- Full transcripts stored in ElevenLabs, fetched via API when needed
- Duration tracked only for voice calls (SMS is message count)
- Used for usage billing and analytics

---

## ai_usage_events

Granular AI agent usage tracking for billing and analytics.

**Attributes:**

- `id`: uuid (PK)
- `business_id`: uuid (FK → businesses.id)
- `ai_agent_id`: uuid (FK → ai_agents.id)
- `conversation_id`: uuid (FK → ai_conversations.id)
- `event_type`: enum [`voice_minutes`, `sms_message`, `web_message`, `tool_call`, `escalation`]
- `quantity`: integer (minutes for voice, count for messages/tools)
- `cost_cents`: integer (nullable, for cost tracking)
- `recorded_at`: timestamp

**Indexes:**

- business_id
- ai_agent_id
- event_type
- recorded_at

**Relationships:**

- Belongs to Business
- Belongs to AIAgent
- Belongs to AIConversation

**RLS Policies:**

```sql
-- Only admins can see usage
SELECT: business_id = current_business_id() AND role = 'admin'

-- Super admins can see all
SELECT: is_super_admin()
```

**Retention:** Keep 24 months, then aggregate

---

## Supporting Entities

---

## Media

Photos/videos uploaded by customers or technicians.

**Attributes:**

- `id`: uuid (PK)
- `business_id`: uuid (FK → businesses.id)
- `ticket_id`: uuid (FK → Ticket.id)
- `uploaded_by_id`: uuid (FK → Person.id)
- `uploader_role`: enum [`customer`, `technician`]
- `media_type`: enum [`photo`, `video`]
- `file_url`: string (S3/Supabase Storage URL)
- `thumbnail_url`: string (nullable, for videos)
- `file_size_bytes`: bigint
- `mime_type`: string
- `original_filename`: string (nullable)
- `caption`: text (nullable)
- `upload_method`: enum [`mms`, `sms_link`, `web_portal`, `technician_app`]
- `metadata`: jsonb (EXIF data, location, device info, nullable)
- `created_at`: timestamp

**Indexes:**

- business_id
- ticket_id
- uploaded_by_id
- media_type
- created_at

**Relationships:**

- Belongs to Business
- Belongs to Ticket
- Uploaded by Person

**RLS Policies:**

```sql
-- Customers can see media on their tickets
SELECT: ticket_id IN (SELECT id FROM tickets WHERE customer_id = auth.uid())

-- Technicians can see media on assigned tickets
SELECT: ticket_id IN (SELECT id FROM tickets WHERE assigned_technician_id = auth.uid())

-- Admins can see all media
SELECT: business_id = current_business_id() AND role = 'admin'

-- Upload permissions
INSERT: business_id = current_business_id() AND (
  (uploader_role = 'customer' AND uploaded_by_id = auth.uid()) OR
  (uploader_role = 'technician' AND uploaded_by_id = auth.uid())
)
```

---

## Notification

Communication log for automated and manual messages.

**Attributes:**

- `id`: uuid (PK)
- `business_id`: uuid (FK → businesses.id)
- `ticket_id`: uuid (FK → Ticket.id, nullable for broadcast messages)
- `recipient_id`: uuid (FK → Person.id)
- `notification_type`: enum [`booking_confirmation`, `on_way`, `arriving_soon`, `delayed`, `early_arrival_request`, `completed`, `rating_request`, `payment_link`, `payment_received`, `refund_processed`, `custom`]
- `delivery_method`: enum [`sms`, `email`, `push`]
- `status`: enum [`pending`, `sent`, `delivered`, `failed`, `customer_responded`]
- `subject`: string (nullable, for emails)
- `message_body`: text
- `sent_at`: timestamp (nullable)
- `delivered_at`: timestamp (nullable)
- `customer_response`: text (nullable, for two-way SMS)
- `customer_response_at`: timestamp (nullable)
- `external_id`: string (nullable, Twilio SID or SendGrid ID)
- `error_message`: text (nullable)
- `cost_cents`: integer (nullable, SMS cost)
- `created_at`: timestamp

**Indexes:**

- business_id
- ticket_id
- recipient_id
- notification_type
- status
- sent_at

**Relationships:**

- Belongs to Business
- Belongs to Ticket (nullable)
- Sent to Person (recipient)

**RLS Policies:**

```sql
-- Customers can see their own notifications
SELECT: recipient_id = auth.uid()

-- Admins can see all notifications in their business
SELECT: business_id = current_business_id() AND role = 'admin'
```

---

## LocationHistory

Real-time and historical technician location tracking.

**Attributes:**

- `id`: uuid (PK)
- `business_id`: uuid (FK → businesses.id)
- `technician_id`: uuid (FK → Technician.id)
- `location`: point (PostGIS geometry)
- `accuracy_meters`: decimal(10,2) (GPS accuracy)
- `speed_mph`: decimal(6,2) (nullable)
- `heading_degrees`: integer (nullable, 0-359)
- `battery_level`: integer (nullable, 0-100)
- `is_moving`: boolean
- `source`: enum [`mobile_app`, `browser`, `manual`]
- `recorded_at`: timestamp (device timestamp)
- `created_at`: timestamp (server timestamp)

**Indexes:**

- business_id
- technician_id
- recorded_at (DESC, for time-series queries)
- location (spatial index)
- composite: (technician_id, recorded_at DESC) for latest location

**Relationships:**

- Belongs to Business
- Belongs to Technician

**RLS Policies:**

```sql
-- Technicians can see their own location history
SELECT: technician_id = auth.uid()

-- Admins can see all location history
SELECT: business_id = current_business_id() AND role = 'admin'
```

**Retention:** Delete records older than 90 days (GDPR compliance)

---

## GeofenceEvent

Triggered events when technicians enter/exit geofences around appointments.

**Attributes:**

- `id`: uuid (PK)
- `business_id`: uuid (FK → businesses.id)
- `technician_id`: uuid (FK → Technician.id)
- `ticket_id`: uuid (FK → Ticket.id)
- `event_type`: enum [`approaching`, `arrived`, `departed`]
- `geofence_radius_meters`: integer (e.g., 1609 for 1 mile)
- `distance_meters`: decimal(10,2) (distance from ticket location at trigger)
- `location`: point (PostGIS, technician location at trigger)
- `triggered_at`: timestamp
- `notification_sent`: boolean
- `notification_id`: uuid (FK → Notification.id, nullable)

**Indexes:**

- business_id
- technician_id
- ticket_id
- event_type
- triggered_at

**Relationships:**

- Belongs to Business
- Belongs to Technician
- Belongs to Ticket
- Triggered Notification (nullable)

**RLS Policies:**

```sql
-- Admins only
SELECT: business_id = current_business_id() AND role = 'admin'
```

---

## StatusHistory

Audit trail for ticket status changes.

**Attributes:**

- `id`: uuid (PK)
- `business_id`: uuid (FK → businesses.id)
- `ticket_id`: uuid (FK → Ticket.id)
- `from_status`: enum (Ticket.status values, nullable for initial)
- `to_status`: enum (Ticket.status values)
- `changed_by_id`: uuid (FK → Person.id)
- `changed_by_role`: enum [`customer`, `technician`, `admin`, `system`]
- `reason`: text (nullable)
- `created_at`: timestamp

**Indexes:**

- ticket_id
- business_id
- created_at

**Relationships:**

- Belongs to Business
- Belongs to Ticket
- Changed by Person

**RLS Policies:**

```sql
-- Customers can see history for their tickets
SELECT: ticket_id IN (SELECT id FROM tickets WHERE customer_id = auth.uid())

-- Technicians can see history for assigned tickets
SELECT: ticket_id IN (SELECT id FROM tickets WHERE assigned_technician_id = auth.uid())

-- Admins can see all history
SELECT: business_id = current_business_id() AND role = 'admin'
```

---

## RouteEvent

Audit trail for route optimization and rebalancing.

**Attributes:**

- `id`: uuid (PK)
- `business_id`: uuid (FK → businesses.id)
- `route_id`: uuid (FK → Route.id)
- `event_type`: enum [`created`, `optimized`, `rebalanced`, `manual_override`, `ticket_added`, `ticket_removed`, `completed`]
- `previous_sequence`: jsonb (nullable, array of ticket IDs before change)
- `new_sequence`: jsonb (nullable, array of ticket IDs after change)
- `triggered_by_id`: uuid (FK → Person.id, nullable for system events)
- `trigger_reason`: text (e.g., "Job finished 20 minutes early")
- `optimization_improvement`: jsonb (nullable, metrics: `{"distance_saved_miles": 5.2, "time_saved_minutes": 15}`)
- `created_at`: timestamp

**Indexes:**

- business_id
- route_id
- event_type
- created_at

**Relationships:**

- Belongs to Business
- Belongs to Route
- Triggered by Person (nullable)

**RLS Policies:**

```sql
-- Admins only
SELECT: business_id = current_business_id() AND role = 'admin'
```

---

## OnCallSchedule

Defines emergency/on-call technician availability windows.

**Attributes:**

- `id`: uuid (PK)
- `business_id`: uuid (FK → businesses.id)
- `technician_id`: uuid (FK → Technician.id)
- `start_time`: timestamp (on-call window starts)
- `end_time`: timestamp (on-call window ends)
- `priority`: integer (1-10, for multiple on-call techs, lower = higher priority)
- `max_emergency_tickets`: integer (capacity during on-call)
- `response_time_minutes`: integer (SLA for emergency response)
- `created_at`: timestamp
- `created_by_id`: uuid (FK → Person.id)

**Indexes:**

- business_id
- technician_id
- start_time, end_time (for range queries)
- composite: (start_time, end_time) with GIST for overlapping ranges

**Relationships:**

- Belongs to Business
- Belongs to Technician
- Created by Person (admin)

**RLS Policies:**

```sql
-- Admins can manage on-call schedules
SELECT, INSERT, UPDATE: business_id = current_business_id() AND role = 'admin'
```

---

## EmergencyRequest

Tracks emergency/urgent service requests outside business hours.

**Attributes:**

- `id`: uuid (PK)
- `business_id`: uuid (FK → businesses.id)
- `ticket_id`: uuid (FK → Ticket.id, unique)
- `requested_at`: timestamp
- `assigned_technician_id`: uuid (FK → Technician.id, nullable)
- `assigned_at`: timestamp (nullable)
- `response_deadline`: timestamp (calculated from SLA)
- `customer_callback_number`: string (may differ from customer.phone)
- `urgency_reason`: text
- `auto_assigned`: boolean (true if AI assigned, false if manual)
- `status`: enum [`pending`, `assigned`, `en_route`, `resolved`, `escalated`]

**Indexes:**

- business_id
- ticket_id (unique)
- assigned_technician_id
- status
- requested_at
- response_deadline

**Relationships:**

- Belongs to Business
- Belongs to Ticket
- Assigned to Technician (nullable)

**RLS Policies:**

```sql
-- Admins can manage emergency requests
SELECT, UPDATE: business_id = current_business_id() AND role = 'admin'

-- Assigned technicians can see their emergency requests
SELECT: assigned_technician_id = auth.uid()
```

---

## Enums Reference

### User Roles

```sql
CREATE TYPE user_role AS ENUM (
  'customer',
  'technician',
  'admin',
  'super_admin'
);
```

### Business Status

```sql
CREATE TYPE business_status AS ENUM (
  'trial',
  'active',
  'suspended',
  'cancelled',
  'past_due'
);
```

### Subscription Status

```sql
CREATE TYPE subscription_status AS ENUM (
  'trial',
  'active',
  'past_due',
  'cancelled',
  'incomplete',
  'incomplete_expired'
);
```

### Billing Period

```sql
CREATE TYPE billing_period AS ENUM (
  'monthly',
  'annual'
);
```

### Ticket Status

```sql
CREATE TYPE ticket_status AS ENUM (
  'pending',
  'scheduled',
  'confirmed',
  'en_route',
  'in_progress',
  'completed',
  'cancelled',
  'on_hold'
);
```

### Ticket Priority

```sql
CREATE TYPE ticket_priority AS ENUM (
  'emergency',
  'urgent',
  'normal',
  'low'
);
```

### Payment Status

```sql
CREATE TYPE payment_status AS ENUM (
  'not_required',
  'pending',
  'authorized',
  'captured',
  'refunded',
  'failed'
);
```

### Payment Timing

```sql
CREATE TYPE payment_timing AS ENUM (
  'pre_service',
  'post_service',
  'flexible'
);
```

### Route Status

```sql
CREATE TYPE route_status AS ENUM (
  'planned',
  'active',
  'completed',
  'cancelled'
);
```

### AI Conversation Outcome

```sql
CREATE TYPE conversation_outcome AS ENUM (
  'booking_completed',
  'quote_provided',
  'escalated',
  'abandoned',
  'error'
);
```

### Notification Type

```sql
CREATE TYPE notification_type AS ENUM (
  'booking_confirmation',
  'on_way',
  'arriving_soon',
  'delayed',
  'early_arrival_request',
  'completed',
  'rating_request',
  'payment_link',
  'payment_received',
  'refund_processed',
  'custom'
);
```

---

## Key Algorithms & Business Logic

### Multi-Tenant Isolation

All business-level queries must filter by `business_id`:

```sql
-- Get function from JWT or session
CREATE FUNCTION current_business_id() RETURNS uuid AS $$
  SELECT business_id FROM person WHERE supabase_user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- RLS policy example
CREATE POLICY business_isolation ON tickets
  FOR SELECT USING (business_id = current_business_id());
```

### Grace Period Logic

```sql
-- Check if business can create appointment beyond limit
CREATE FUNCTION can_create_appointment(business_id uuid) RETURNS boolean AS $$
DECLARE
  tier_limit integer;
  current_usage integer;
  grace_threshold integer;
  grace_used integer;
BEGIN
  -- Get tier limit
  SELECT limits->>'appointments_per_month' INTO tier_limit
  FROM subscription_tiers t
  JOIN subscriptions s ON s.tier_id = t.id
  WHERE s.business_id = $1;

  -- Get current usage
  SELECT current_usage->>'appointments' INTO current_usage
  FROM subscriptions WHERE business_id = $1;

  -- Get grace threshold from platform_settings
  SELECT (setting_value->>'percentage')::integer INTO grace_threshold
  FROM platform_settings WHERE setting_key = 'grace_period_overage_threshold';

  -- Get grace periods used
  SELECT grace_periods_used_this_year INTO grace_used
  FROM subscriptions WHERE business_id = $1;

  -- Allow if under limit
  IF current_usage < tier_limit THEN
    RETURN true;
  END IF;

  -- Allow if within grace threshold and grace not exhausted
  IF current_usage < (tier_limit * (1 + grace_threshold / 100.0))
     AND grace_used < 1 THEN
    RETURN true;
  END IF;

  -- Otherwise block
  RETURN false;
END;
$$ LANGUAGE plpgsql;
```

### Proximity-Aware Slot Calculation (AI Agent)

```typescript
// POST /api/agent-tools/get-available-slots
async function getOptimalSlots(
  businessId: string,
  customerId: string,
  serviceId: string,
  dateRange: { start: Date; end: Date }
) {
  // 1. Get customer location
  const customer = await supabase
    .from('customers')
    .select('location')
    .eq('id', customerId)
    .single();

  // 2. Get technicians with required skills
  const service = await supabase
    .from('services')
    .select('required_skills')
    .eq('id', serviceId)
    .single();

  const technicians = await supabase
    .from('technicians')
    .select('*')
    .eq('business_id', businessId)
    .eq('active', true)
    .filter('skills', 'cs', `{${service.required_skills.join(',')}}`);

  // 3. Get existing routes in date range
  const routes = await supabase
    .from('routes')
    .select(
      `
      *,
      tickets (
        id,
        customer_id,
        customers!inner (location),
        scheduled_date,
        time_window_start,
        time_window_end,
        estimated_duration_minutes
      )
    `
    )
    .in(
      'technician_id',
      technicians.map((t) => t.id)
    )
    .gte('date', dateRange.start)
    .lte('date', dateRange.end);

  // 4. Calculate proximity scores for each potential slot
  const slots = [];
  for (const route of routes) {
    for (let i = 0; i < route.tickets.length; i++) {
      const ticket = route.tickets[i];
      const nextTicket = route.tickets[i + 1];

      // Calculate distance from customer to this ticket's location
      const distance = calculateDistance(customer.location, ticket.customers.location);

      if (distance < 5) {
        // Within 5 miles
        // Suggest time slot after this ticket
        const suggestedTime = addMinutes(
          ticket.time_window_end,
          30 // Travel buffer
        );

        const proximityScore = 1 / (distance + 0.1); // Closer = higher
        const timeScore = calculateTimePreference(suggestedTime); // User preference
        const techScore = 1 - route.tickets.length / 10; // Less busy = better

        const totalScore = proximityScore * 0.7 + timeScore * 0.2 + techScore * 0.1;

        slots.push({
          technician_id: route.technician_id,
          technician_name: technicians.find((t) => t.id === route.technician_id).name,
          suggested_date: route.date,
          suggested_time: suggestedTime,
          score: totalScore,
          reasoning: `We have a technician in your area at ${formatTime(suggestedTime)}`,
          distance_miles: distance.toFixed(1),
        });
      }
    }
  }

  // 5. Sort by score and return top 3
  return slots.sort((a, b) => b.score - a.score).slice(0, 3);
}
```

### Real-Time Route Rebalancing Trigger

```sql
-- Trigger on ticket completion
CREATE FUNCTION check_rebalancing_opportunity() RETURNS trigger AS $$
DECLARE
  route_record RECORD;
  remaining_tickets integer;
BEGIN
  -- Only check if completed early
  IF NEW.status = 'completed' AND
     NEW.actual_end_time < NEW.time_window_end - interval '20 minutes' THEN

    -- Get route
    SELECT * INTO route_record
    FROM routes WHERE id = NEW.route_id;

    -- Count remaining tickets
    SELECT COUNT(*) INTO remaining_tickets
    FROM tickets
    WHERE route_id = NEW.route_id
      AND status NOT IN ('completed', 'cancelled');

    -- If more than 2 tickets remaining, queue rebalancing check
    IF remaining_tickets > 2 THEN
      INSERT INTO route_rebalancing_queue (
        route_id,
        trigger_reason,
        created_at
      ) VALUES (
        NEW.route_id,
        'Job completed 20+ minutes early',
        NOW()
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ticket_completion_rebalancing
  AFTER UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION check_rebalancing_opportunity();
```

---

## Data Retention Policies

| Entity           | Retention  | Rationale                          |
| ---------------- | ---------- | ---------------------------------- |
| location_history | 90 days    | GDPR compliance, GPS tracking      |
| audit_logs       | Indefinite | Compliance, security               |
| invoice_history  | 7 years    | Tax compliance (IRS)               |
| usage_events     | 24 months  | Analytics, trend analysis          |
| ai_conversations | 24 months  | Quality monitoring, then summarize |
| media            | Indefinite | Customer service records           |
| notifications    | 12 months  | Dispute resolution                 |
| status_history   | Indefinite | Audit trail                        |
| route_events     | 24 months  | Performance analytics              |

---

## Performance Indexes Summary

**High-Traffic Queries:**

1. Dashboard appointment list: `(business_id, status, scheduled_date)`
2. Technician route view: `(assigned_technician_id, scheduled_date, status)`
3. Customer portal: `(customer_id, status)`
4. Real-time tracking: `(technician_id, recorded_at DESC)` on location_history
5. Proximity search: Spatial index on `customer.location`, `technician.current_location`
6. AI slot search: `(business_id, active)` on technicians + spatial indexes
7. Payment lookup: `(ticket_id, status)` on payments
8. Usage tracking: `(business_id, period_month, event_type)` on usage_events

**Spatial Indexes (PostGIS):**

- `customer.location`
- `technician.home_location`
- `technician.current_location`
- `location_history.location`
- `geofence_events.location`

**GIN Indexes (JSON/Array):**

- `technician.skills`
- `service.required_skills`
- `pricing_rules.conditions`

---

## Security Notes

### RLS Policy Patterns

1. **Customer**: Can only see own data (`customer_id = auth.uid()`)
2. **Technician**: Can see own data + assigned tickets
3. **Admin**: Can see all data for their business (`business_id = current_business_id()`)
4. **Super Admin**: Bypass RLS for platform operations

### Sensitive Data

- Payment method details: Tokenized in Stripe, only last4 stored
- Stripe API keys: Stored encrypted in `payment_settings`
- Webhook secrets: Encrypted
- Location data: Auto-deleted after 90 days (GDPR)

### API Key Management

- Supabase service role key: Backend only, never in frontend
- Stripe secret keys: Backend only
- ElevenLabs API keys: Platform-level, super admin config
- Twilio credentials: Platform-level

---

## Migration Strategy

### Phase 1: Core Schema (Week 1)

- Platform tables: businesses, subscription_tiers, platform_settings
- Core entities: Person, Customer, Technician, Service, Ticket, Route
- Supporting: Media, Notification, LocationHistory

### Phase 2: Subscription & Billing (Week 2)

- Subscriptions, invoice_history, usage_events
- Stripe webhook event log table

### Phase 3: Payment Processing (Week 3)

- payment_settings, payments, refunds, pricing_rules
- Payment webhook event log

### Phase 4: AI Booking (Week 4)

- ai_agents, ai_conversations, ai_usage_events
- ElevenLabs/Twilio integration tables

### Phase 5: Emergency & Advanced (Week 5)

- OnCallSchedule, EmergencyRequest
- GeofenceEvent, StatusHistory, RouteEvent
- Audit logs

---

## Version History

**v2.0** - October 17, 2025

- Complete rewrite incorporating subscription billing, payment processing, AI booking agent
- Multi-tenant architecture with platform-owner vs business-level separation
- Hybrid payment schema (core tables + JSONB)
- Lightweight AI tracking (ElevenLabs handles transcripts)
- Hybrid pricing model (base + dynamic rules)

**v1.0** - Previous spec (chotter-spec.md)

- Initial taxonomy without subscription/payment features

---

## Next Steps

1. ✅ Review and approve taxonomy
2. Generate Supabase migration files (SQL DDL)
3. Create ERD diagram (Mermaid or dbdiagram.io)
4. Define TypeScript types (generated from Supabase)
5. Implement RLS policies
6. Create seed data for development
7. Begin Phase 1 development (Foundation)

---

**End of Taxonomy Document**
