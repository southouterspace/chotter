-- =====================================================================
-- CHOTTER PLATFORM-OWNER DOMAIN TABLES
-- =====================================================================
-- Migration: 00000000000001_platform_tables.sql
-- Description: Creates core platform tables for multi-tenant SaaS operations
-- Domain: Platform-Owner (managed by super admins)
--
-- Tables Created:
--   1. businesses - Multi-tenant isolation and business profiles
--   2. subscription_tiers - Pricing tiers (Starter, Professional, Enterprise)
--   3. subscriptions - Per-business subscription and billing tracking
--   4. platform_settings - Global SaaS configuration
--   5. audit_logs - Super admin action audit trail
--   6. invoice_history - Stripe invoice synchronization
--   7. usage_events - Feature usage tracking for analytics and limits
--
-- Design Patterns:
--   - UUID primary keys with gen_random_uuid() defaults
--   - TIMESTAMPTZ for all timestamps (timezone-aware)
--   - JSONB for flexible structured data (features, limits, settings)
--   - ENUMs for status and category fields
--   - Automatic created_at/updated_at timestamps via triggers
--   - Composite indexes for common query patterns
--   - Foreign key constraints with appropriate CASCADE/RESTRICT
-- =====================================================================

-- =====================================================================
-- ENUMS
-- =====================================================================

-- Business status for multi-tenant lifecycle
CREATE TYPE business_status AS ENUM (
    'trial',        -- Free trial period
    'active',       -- Active paid subscription
    'suspended',    -- Temporarily suspended (payment issues, violations)
    'cancelled',    -- Cancelled, awaiting end of billing period
    'past_due'      -- Payment failed, in grace period
);

-- Subscription status (mirrors Stripe subscription statuses)
CREATE TYPE subscription_status AS ENUM (
    'trial',                -- Trial period
    'active',               -- Active and paid
    'past_due',             -- Payment failed, in grace period
    'cancelled',            -- Cancelled, awaiting end of period
    'incomplete',           -- Created but not confirmed
    'incomplete_expired'    -- Expired before confirmation
);

-- Billing period options
CREATE TYPE billing_period AS ENUM (
    'monthly',
    'annual'
);

-- Industry categories for vertical-specific features
CREATE TYPE industry AS ENUM (
    'hvac',
    'plumbing',
    'electrical',
    'auto_repair',
    'general'
);

-- Audit log action types
CREATE TYPE action_type AS ENUM (
    'subscription_modified',
    'tier_created',
    'tier_updated',
    'business_suspended',
    'refund_issued',
    'limits_overridden',
    'impersonation_started',
    'impersonation_ended',
    'setting_changed'
);

-- Invoice statuses (mirrors Stripe invoice statuses)
CREATE TYPE invoice_status AS ENUM (
    'draft',            -- Not yet finalized
    'open',             -- Finalized and awaiting payment
    'paid',             -- Successfully paid
    'uncollectible',    -- Marked as uncollectible
    'void'              -- Voided/cancelled
);

-- Billing reasons (why invoice was created)
CREATE TYPE billing_reason AS ENUM (
    'subscription_create',  -- Initial subscription
    'subscription_cycle',   -- Regular billing cycle
    'subscription_update',  -- Mid-cycle change
    'manual'                -- Manually created
);

-- Usage event types for tracking
CREATE TYPE event_type AS ENUM (
    'appointment_created',
    'user_added',
    'user_removed',
    'ai_voice_minutes_used',
    'ai_conversation_completed'
);

-- Platform setting categories
CREATE TYPE setting_type AS ENUM (
    'grace_period',
    'trial_config',
    'ai_config',
    'feature_flag',
    'notification_config'
);

COMMENT ON TYPE business_status IS 'Lifecycle status of a business tenant';
COMMENT ON TYPE subscription_status IS 'Subscription billing status (synced with Stripe)';
COMMENT ON TYPE billing_period IS 'Billing frequency for subscriptions';
COMMENT ON TYPE industry IS 'Business industry vertical for feature customization';
COMMENT ON TYPE action_type IS 'Types of super admin actions tracked in audit logs';
COMMENT ON TYPE invoice_status IS 'Invoice payment status (synced with Stripe)';
COMMENT ON TYPE billing_reason IS 'Reason an invoice was created';
COMMENT ON TYPE event_type IS 'Types of usage events tracked for limits and analytics';
COMMENT ON TYPE setting_type IS 'Categories of platform-wide settings';

-- =====================================================================
-- TABLES
-- =====================================================================

-- ---------------------------------------------------------------------
-- businesses
-- ---------------------------------------------------------------------
-- Multi-tenant isolation table. Each business is a separate tenant with
-- isolated data. This is the foundation of the multi-tenancy architecture.
-- All business-level domain tables will reference this via business_id.

CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Business Identity
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    subdomain TEXT UNIQUE,
    industry industry NOT NULL DEFAULT 'general',

    -- Owner (references Person table, will be created in later migration)
    -- For now, we'll add this FK constraint in a later migration
    owner_person_id UUID,

    -- Contact Information
    contact_email TEXT NOT NULL,
    contact_phone TEXT NOT NULL,

    -- Address
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'US',

    -- Operational Details
    timezone TEXT NOT NULL DEFAULT 'America/Los_Angeles',
    business_hours JSONB NOT NULL DEFAULT '{}',
    logo_url TEXT,
    website_url TEXT,

    -- Status & Lifecycle
    status business_status NOT NULL DEFAULT 'trial',
    trial_started_at TIMESTAMPTZ,
    trial_ends_at TIMESTAMPTZ,
    activated_at TIMESTAMPTZ,
    suspended_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,

    -- Flexible Settings Storage
    settings JSONB NOT NULL DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT businesses_slug_format CHECK (slug ~ '^[a-z0-9-]+$'),
    CONSTRAINT businesses_subdomain_format CHECK (subdomain IS NULL OR subdomain ~ '^[a-z0-9-]+$'),
    CONSTRAINT businesses_email_format CHECK (contact_email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT businesses_phone_e164_format CHECK (contact_phone ~ '^\+[1-9]\d{1,14}$'),
    CONSTRAINT businesses_state_code CHECK (LENGTH(state) = 2),
    CONSTRAINT businesses_country_code CHECK (LENGTH(country) = 2)
);

-- Indexes for common queries
CREATE INDEX idx_businesses_status ON businesses(status) WHERE status != 'cancelled';
CREATE INDEX idx_businesses_trial_ends_at ON businesses(trial_ends_at) WHERE trial_ends_at IS NOT NULL;
CREATE INDEX idx_businesses_owner_person_id ON businesses(owner_person_id);
CREATE INDEX idx_businesses_industry ON businesses(industry);

COMMENT ON TABLE businesses IS 'Multi-tenant business records - each business is an isolated tenant';
COMMENT ON COLUMN businesses.slug IS 'URL-friendly unique identifier (e.g., "acme-hvac")';
COMMENT ON COLUMN businesses.subdomain IS 'Optional custom subdomain (e.g., "acme.chotter.com")';
COMMENT ON COLUMN businesses.business_hours IS 'JSON schedule per day: {"monday": {"start": "08:00", "end": "17:00"}}';
COMMENT ON COLUMN businesses.settings IS 'Business-specific preferences, notification templates, etc.';
COMMENT ON COLUMN businesses.trial_ends_at IS 'Indexed for daily trial expiration queries';

-- ---------------------------------------------------------------------
-- subscription_tiers
-- ---------------------------------------------------------------------
-- Pricing tier definitions (Starter, Professional, Enterprise) with
-- features and usage limits. Managed by platform owner via super admin UI.

CREATE TABLE subscription_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Tier Identity
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,

    -- Pricing (in cents to avoid floating-point issues)
    monthly_price_cents INTEGER NOT NULL,
    annual_price_cents INTEGER NOT NULL,

    -- Stripe Integration
    stripe_monthly_price_id TEXT,
    stripe_annual_price_id TEXT,

    -- Feature Flags & Limits
    features JSONB NOT NULL DEFAULT '{}',
    limits JSONB NOT NULL DEFAULT '{}',

    -- Display & Availability
    sort_order INTEGER NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT subscription_tiers_slug_format CHECK (slug ~ '^[a-z0-9-]+$'),
    CONSTRAINT subscription_tiers_positive_prices CHECK (
        monthly_price_cents >= 0 AND annual_price_cents >= 0
    )
);

-- Indexes for tier queries
CREATE INDEX idx_subscription_tiers_active ON subscription_tiers(active) WHERE active = TRUE;
CREATE INDEX idx_subscription_tiers_sort_order ON subscription_tiers(sort_order);

COMMENT ON TABLE subscription_tiers IS 'Pricing tier definitions with features and usage limits';
COMMENT ON COLUMN subscription_tiers.features IS 'Feature flags: {"payment_processing": true, "ai_agent": true}';
COMMENT ON COLUMN subscription_tiers.limits IS 'Usage limits: {"appointments_per_month": 500, "admin_users": 2}';
COMMENT ON COLUMN subscription_tiers.sort_order IS 'Display order (1=Starter, 2=Pro, 3=Enterprise)';

-- ---------------------------------------------------------------------
-- subscriptions
-- ---------------------------------------------------------------------
-- Per-business subscription records tracking billing, usage, and grace periods.
-- Synchronized with Stripe via webhooks. One subscription per business.

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relationships
    business_id UUID UNIQUE NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    tier_id UUID NOT NULL REFERENCES subscription_tiers(id) ON DELETE RESTRICT,

    -- Stripe Integration
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,

    -- Status & Billing
    status subscription_status NOT NULL DEFAULT 'trial',
    billing_period billing_period NOT NULL DEFAULT 'monthly',

    -- Billing Periods
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,

    -- Cancellation
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    cancelled_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,

    -- Scheduled Tier Changes
    next_tier_id UUID REFERENCES subscription_tiers(id) ON DELETE SET NULL,

    -- Grace Period Tracking
    grace_periods_used_this_year INTEGER NOT NULL DEFAULT 0,
    grace_periods_reset_at TIMESTAMPTZ NOT NULL,

    -- Usage Tracking
    current_usage JSONB NOT NULL DEFAULT '{}',
    overage_this_period BOOLEAN NOT NULL DEFAULT FALSE,
    last_overage_warning_sent_at TIMESTAMPTZ,

    -- Payment Information
    payment_method JSONB,
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT subscriptions_grace_periods_positive CHECK (grace_periods_used_this_year >= 0)
);

-- Indexes for subscription queries
CREATE INDEX idx_subscriptions_tier_id ON subscriptions(tier_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_current_period_end ON subscriptions(current_period_end)
    WHERE status IN ('active', 'trial');
CREATE INDEX idx_subscriptions_trial_end ON subscriptions(trial_end)
    WHERE trial_end IS NOT NULL AND status = 'trial';
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id)
    WHERE stripe_customer_id IS NOT NULL;

COMMENT ON TABLE subscriptions IS 'Per-business subscription billing and usage tracking';
COMMENT ON COLUMN subscriptions.business_id IS 'One subscription per business (unique constraint)';
COMMENT ON COLUMN subscriptions.current_usage IS 'Real-time usage: {"appointments": 347, "admin_users": 2}';
COMMENT ON COLUMN subscriptions.grace_periods_used_this_year IS 'Count of grace periods used (max 1/year)';
COMMENT ON COLUMN subscriptions.payment_method IS 'Card info from Stripe: {"brand": "visa", "last4": "4242"}';

-- ---------------------------------------------------------------------
-- platform_settings
-- ---------------------------------------------------------------------
-- Global configuration for SaaS operations (grace periods, trial length,
-- AI config, feature flags). Only accessible by super admins.

CREATE TABLE platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Setting Identity
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    setting_type setting_type NOT NULL,
    description TEXT,

    -- Audit Trail
    updated_by_id UUID,  -- FK to Person (super admin), added in later migration

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT platform_settings_key_format CHECK (setting_key ~ '^[a-z0-9_]+$')
);

-- Indexes for settings queries
CREATE INDEX idx_platform_settings_type ON platform_settings(setting_type);

COMMENT ON TABLE platform_settings IS 'Global SaaS configuration (grace periods, trials, AI config)';
COMMENT ON COLUMN platform_settings.setting_key IS 'Unique key like "grace_period_overage_threshold"';
COMMENT ON COLUMN platform_settings.setting_value IS 'Flexible JSON value: {"percentage": 10} or {"days": 14}';

-- ---------------------------------------------------------------------
-- audit_logs
-- ---------------------------------------------------------------------
-- Audit trail for all super admin actions. Append-only table (no updates/deletes).
-- Kept indefinitely for compliance.

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Actor
    admin_person_id UUID NOT NULL,  -- FK to Person (super admin), added in later migration

    -- Action Details
    action_type action_type NOT NULL,
    target_business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
    target_entity_type TEXT,
    target_entity_id UUID,
    action_details JSONB NOT NULL,

    -- Request Context
    ip_address INET,
    user_agent TEXT,

    -- Timestamp (no updated_at - append-only)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT audit_logs_entity_type_format CHECK (
        target_entity_type IS NULL OR target_entity_type ~ '^[a-z_]+$'
    )
);

-- Indexes for audit queries
CREATE INDEX idx_audit_logs_admin_person_id ON audit_logs(admin_person_id);
CREATE INDEX idx_audit_logs_target_business_id ON audit_logs(target_business_id)
    WHERE target_business_id IS NOT NULL;
CREATE INDEX idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX idx_audit_logs_created_at_desc ON audit_logs(created_at DESC);

COMMENT ON TABLE audit_logs IS 'Audit trail for super admin actions (append-only, kept indefinitely)';
COMMENT ON COLUMN audit_logs.action_details IS 'Full context: before/after values, reason, etc.';
COMMENT ON COLUMN audit_logs.target_entity_type IS 'Entity type like "subscription", "tier", etc.';

-- ---------------------------------------------------------------------
-- invoice_history
-- ---------------------------------------------------------------------
-- Record of all subscription invoices synchronized from Stripe via webhooks.
-- Used for billing history, dispute resolution, and financial reporting.

CREATE TABLE invoice_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relationships
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

    -- Stripe Integration
    stripe_invoice_id TEXT UNIQUE NOT NULL,
    stripe_payment_intent_id TEXT,
    invoice_number TEXT NOT NULL,

    -- Invoice Status & Amounts (in cents)
    status invoice_status NOT NULL,
    amount_due_cents INTEGER NOT NULL,
    amount_paid_cents INTEGER NOT NULL DEFAULT 0,
    amount_remaining_cents INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',

    -- Invoice Metadata
    billing_reason billing_reason NOT NULL,
    invoice_pdf_url TEXT,
    hosted_invoice_url TEXT,

    -- Billing Period
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,

    -- Important Dates
    due_date TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    finalized_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- Stripe creation time
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT invoice_history_amounts_non_negative CHECK (
        amount_due_cents >= 0 AND
        amount_paid_cents >= 0 AND
        amount_remaining_cents >= 0
    ),
    CONSTRAINT invoice_history_currency_format CHECK (LENGTH(currency) = 3)
);

-- Indexes for invoice queries
CREATE INDEX idx_invoice_history_subscription_id ON invoice_history(subscription_id);
CREATE INDEX idx_invoice_history_business_id ON invoice_history(business_id);
CREATE INDEX idx_invoice_history_status ON invoice_history(status);
CREATE INDEX idx_invoice_history_paid_at ON invoice_history(paid_at) WHERE paid_at IS NOT NULL;
CREATE INDEX idx_invoice_history_period_end ON invoice_history(period_end);

COMMENT ON TABLE invoice_history IS 'Subscription invoices synced from Stripe webhooks';
COMMENT ON COLUMN invoice_history.billing_reason IS 'Why invoice was created (cycle, update, manual)';
COMMENT ON COLUMN invoice_history.created_at IS 'Stripe invoice creation timestamp';

-- ---------------------------------------------------------------------
-- usage_events
-- ---------------------------------------------------------------------
-- Granular tracking of feature usage for analytics, overage detection,
-- and usage-based billing. Events are aggregated monthly in current_usage.

CREATE TABLE usage_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relationships
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,

    -- Event Details
    event_type event_type NOT NULL,
    event_details JSONB NOT NULL DEFAULT '{}',
    quantity INTEGER NOT NULL DEFAULT 1,

    -- Aggregation Helper
    period_month TEXT NOT NULL,  -- YYYY-MM format for fast aggregation

    -- Timestamp (no updated_at - immutable events)
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT usage_events_quantity_positive CHECK (quantity > 0),
    CONSTRAINT usage_events_period_month_format CHECK (period_month ~ '^\d{4}-\d{2}$')
);

-- Indexes for usage queries
CREATE INDEX idx_usage_events_business_id ON usage_events(business_id);
CREATE INDEX idx_usage_events_subscription_id ON usage_events(subscription_id);
CREATE INDEX idx_usage_events_event_type ON usage_events(event_type);
CREATE INDEX idx_usage_events_period_month ON usage_events(period_month);
CREATE INDEX idx_usage_events_recorded_at ON usage_events(recorded_at);
-- Composite index for common aggregation queries
CREATE INDEX idx_usage_events_aggregation ON usage_events(business_id, period_month, event_type);

COMMENT ON TABLE usage_events IS 'Granular feature usage tracking for analytics and limits';
COMMENT ON COLUMN usage_events.event_details IS 'Context: {"appointment_id": "uuid", "technician_id": "uuid"}';
COMMENT ON COLUMN usage_events.period_month IS 'YYYY-MM format for efficient monthly aggregation';
COMMENT ON COLUMN usage_events.quantity IS 'Quantity used (e.g., 1 appointment, 15 AI minutes)';

-- =====================================================================
-- TRIGGERS
-- =====================================================================

-- Universal update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically updates updated_at column on row modification';

-- Apply update timestamp triggers to all tables with updated_at
CREATE TRIGGER update_businesses_updated_at
    BEFORE UPDATE ON businesses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_tiers_updated_at
    BEFORE UPDATE ON subscription_tiers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_settings_updated_at
    BEFORE UPDATE ON platform_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_history_updated_at
    BEFORE UPDATE ON invoice_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Note: audit_logs and usage_events don't have updated_at (append-only tables)

-- =====================================================================
-- INITIAL DATA (Optional Seed Data)
-- =====================================================================

-- Create default subscription tiers
-- These can be customized by super admins later

INSERT INTO subscription_tiers (
    name, slug, display_name, description,
    monthly_price_cents, annual_price_cents,
    features, limits,
    sort_order, active, is_public
) VALUES
(
    'Starter',
    'starter',
    'Starter Plan',
    'Perfect for small businesses just getting started with appointment management',
    4900,  -- $49/month
    49900, -- $499/year (2 months free)
    '{"payment_processing": false, "ai_agent": false, "advanced_analytics": false, "custom_branding": false}',
    '{"appointments_per_month": 100, "admin_users": 1, "field_technicians": 3, "ai_voice_minutes": 0, "sms_messages": 100}',
    1,
    true,
    true
),
(
    'Professional',
    'professional',
    'Professional Plan',
    'Full-featured plan for growing businesses with AI-powered booking',
    14900, -- $149/month
    149900, -- $1499/year (2 months free)
    '{"payment_processing": true, "ai_agent": true, "advanced_analytics": true, "custom_branding": false}',
    '{"appointments_per_month": 500, "admin_users": 2, "field_technicians": 10, "ai_voice_minutes": 500, "sms_messages": 500}',
    2,
    true,
    true
),
(
    'Enterprise',
    'enterprise',
    'Enterprise Plan',
    'Unlimited scale with dedicated support and custom branding',
    29900, -- $299/month
    299900, -- $2999/year (2 months free)
    '{"payment_processing": true, "ai_agent": true, "advanced_analytics": true, "custom_branding": true, "dedicated_support": true, "api_access": true}',
    '{"appointments_per_month": -1, "admin_users": -1, "field_technicians": -1, "ai_voice_minutes": 2000, "sms_messages": 2000}',
    3,
    true,
    true
);

-- Create essential platform settings
INSERT INTO platform_settings (setting_key, setting_value, setting_type, description) VALUES
(
    'grace_period_overage_threshold',
    '{"percentage": 10}',
    'grace_period',
    'Percentage overage allowed before hard limits kick in (10% = 110% of limit)'
),
(
    'grace_periods_per_year',
    '{"count": 1}',
    'grace_period',
    'Number of grace periods allowed per business per year'
),
(
    'trial_length_days',
    '{"days": 14}',
    'trial_config',
    'Default trial period length in days'
),
(
    'trial_reminder_schedule',
    '{"days": [7, 12, 13]}',
    'trial_config',
    'Days before trial expiration to send reminder emails (7 days before, 2 days before, 1 day before)'
),
(
    'ai_global_llm_model',
    '{"provider": "anthropic", "model": "claude-sonnet-4"}',
    'ai_config',
    'Default LLM model for AI booking agents'
),
(
    'ai_voice_cost_per_minute_cents',
    '{"cents": 15}',
    'ai_config',
    'Cost per minute of AI voice calls for usage tracking ($0.15/min)'
);

COMMENT ON TABLE subscription_tiers IS 'Seeded with Starter ($49), Professional ($149), Enterprise ($299) tiers';
COMMENT ON TABLE platform_settings IS 'Seeded with grace period, trial, and AI configuration defaults';

-- =====================================================================
-- END OF MIGRATION
-- =====================================================================
