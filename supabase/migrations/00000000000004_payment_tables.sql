-- =============================================
-- Migration: P1.4 - Payment Tables
-- Description: Stripe Connect integration, pricing rules, payments, refunds
-- Created: 2025-10-17
-- =============================================

-- =============================================
-- ENUMS
-- =============================================

-- Payment timing options
CREATE TYPE payment_timing AS ENUM ('pre_service', 'post_service', 'flexible');

-- Pricing rule types
CREATE TYPE pricing_rule_type AS ENUM (
  'time_based',
  'priority_based',
  'fixed_fee',
  'percentage_markup'
);

-- Pricing value types
CREATE TYPE pricing_value_type AS ENUM ('percentage', 'fixed_cents');

-- Pricing rule scope
CREATE TYPE pricing_applies_to AS ENUM (
  'all_services',
  'specific_service',
  'emergency_only'
);

-- Stripe payment intent status
CREATE TYPE stripe_payment_status AS ENUM (
  'pending',
  'requires_action',
  'processing',
  'succeeded',
  'failed',
  'cancelled',
  'refunded'
);

-- Payment method types
CREATE TYPE payment_method_type AS ENUM (
  'card',
  'ach_debit',
  'apple_pay',
  'google_pay'
);

-- Refund status
CREATE TYPE refund_status AS ENUM (
  'pending',
  'succeeded',
  'failed',
  'cancelled'
);

-- Refund reasons
CREATE TYPE refund_reason AS ENUM (
  'duplicate',
  'fraudulent',
  'requested_by_customer',
  'service_not_completed'
);

-- =============================================
-- TABLES
-- =============================================

-- ---------------------------------------------
-- 1. PAYMENT_SETTINGS
-- Stripe Connect configuration per business
-- ---------------------------------------------
CREATE TABLE payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL UNIQUE REFERENCES businesses(id) ON DELETE RESTRICT,

  -- Master toggle
  payment_processing_enabled BOOLEAN NOT NULL DEFAULT false,

  -- Stripe Connect details
  stripe_account_id TEXT UNIQUE,
  stripe_onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  stripe_charges_enabled BOOLEAN NOT NULL DEFAULT false,
  stripe_payouts_enabled BOOLEAN NOT NULL DEFAULT false,
  stripe_connected_at TIMESTAMPTZ,
  stripe_details_submitted BOOLEAN NOT NULL DEFAULT false,
  stripe_requirements JSONB,

  -- Payment configuration
  default_payment_timing payment_timing NOT NULL DEFAULT 'post_service',
  accepted_payment_methods JSONB NOT NULL DEFAULT '["card"]'::jsonb,

  -- Refund policy
  refund_policy_days INTEGER CHECK (refund_policy_days IS NULL OR refund_policy_days > 0),
  refund_policy_text TEXT,

  -- Environment
  test_mode BOOLEAN NOT NULL DEFAULT true,
  webhook_secret TEXT,

  -- Additional metadata
  metadata JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for payment_settings
CREATE UNIQUE INDEX idx_payment_settings_business_id ON payment_settings(business_id);
CREATE UNIQUE INDEX idx_payment_settings_stripe_account ON payment_settings(stripe_account_id) WHERE stripe_account_id IS NOT NULL;

COMMENT ON TABLE payment_settings IS 'Stripe Connect configuration per business (Professional+ only)';
COMMENT ON COLUMN payment_settings.payment_processing_enabled IS 'Master toggle for payment features';
COMMENT ON COLUMN payment_settings.stripe_account_id IS 'Stripe Connect Express account ID';
COMMENT ON COLUMN payment_settings.stripe_requirements IS 'Currently due/eventually due fields from Stripe API';
COMMENT ON COLUMN payment_settings.accepted_payment_methods IS 'Array: ["card", "ach_debit", "apple_pay", "google_pay"]';
COMMENT ON COLUMN payment_settings.test_mode IS 'True for test mode, false for live payments';
COMMENT ON COLUMN payment_settings.webhook_secret IS 'Stripe webhook signing secret for signature verification';

-- ---------------------------------------------
-- 2. PRICING_RULES
-- Dynamic pricing for surcharges
-- ---------------------------------------------
CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,

  -- Rule definition
  rule_name TEXT NOT NULL,
  rule_type pricing_rule_type NOT NULL,

  -- Conditions (when rule applies)
  conditions JSONB NOT NULL,

  -- Value configuration
  value_type pricing_value_type NOT NULL,
  value INTEGER NOT NULL CHECK (value >= 0),

  -- Scope
  applies_to pricing_applies_to NOT NULL,
  priority INTEGER NOT NULL DEFAULT 1 CHECK (priority >= 1),

  -- Status
  active BOOLEAN NOT NULL DEFAULT true,

  -- Date range (optional)
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_date_range CHECK (valid_until IS NULL OR valid_from IS NULL OR valid_until > valid_from)
);

-- Indexes for pricing_rules
CREATE INDEX idx_pricing_rules_business_id ON pricing_rules(business_id);
CREATE INDEX idx_pricing_rules_service_id ON pricing_rules(service_id) WHERE service_id IS NOT NULL;
CREATE INDEX idx_pricing_rules_active ON pricing_rules(active) WHERE active = true;
CREATE INDEX idx_pricing_rules_applies_to ON pricing_rules(applies_to);

-- Composite index for rule evaluation
CREATE INDEX idx_pricing_rules_business_active_priority ON pricing_rules(business_id, active, priority) WHERE active = true;

COMMENT ON TABLE pricing_rules IS 'Dynamic pricing rules for surcharges (after-hours, emergency, weekend, etc.)';
COMMENT ON COLUMN pricing_rules.rule_type IS 'time_based, priority_based, fixed_fee, percentage_markup';
COMMENT ON COLUMN pricing_rules.conditions IS 'JSONB: {"days": ["saturday", "sunday"], "time_after": "17:00", "time_before": "08:00", "priority": "emergency"}';
COMMENT ON COLUMN pricing_rules.value IS 'Percentage (e.g., 50 for 50%) or cents (e.g., 3000 for $30.00)';
COMMENT ON COLUMN pricing_rules.priority IS 'Order of application when multiple rules match (lower = higher priority)';

-- Example pricing rules:
-- After-hours surcharge: {"rule_type": "time_based", "conditions": {"time_after": "17:00", "time_before": "08:00"}, "value_type": "fixed_cents", "value": 3000}
-- Emergency fee: {"rule_type": "priority_based", "conditions": {"priority": "emergency"}, "value_type": "percentage", "value": 50}
-- Weekend premium: {"rule_type": "time_based", "conditions": {"days": ["saturday", "sunday"]}, "value_type": "percentage", "value": 25}

-- ---------------------------------------------
-- 3. PAYMENTS
-- Customer payment transactions
-- ---------------------------------------------
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE RESTRICT,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,

  -- Stripe identifiers
  stripe_payment_intent_id TEXT NOT NULL UNIQUE,
  stripe_charge_id TEXT,

  -- Amount details
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency TEXT NOT NULL DEFAULT 'usd',

  -- Status tracking
  status stripe_payment_status NOT NULL DEFAULT 'pending',
  payment_method_type payment_method_type NOT NULL,
  payment_method_details JSONB,

  -- Payment flow
  payment_timing payment_timing NOT NULL,
  captured BOOLEAN NOT NULL DEFAULT false,
  captured_at TIMESTAMPTZ,

  -- Refund tracking
  refunded_amount_cents INTEGER NOT NULL DEFAULT 0 CHECK (refunded_amount_cents >= 0),

  -- Error handling
  failure_code TEXT,
  failure_message TEXT,

  -- Receipt and metadata
  receipt_url TEXT,
  metadata JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT refunded_not_more_than_amount CHECK (refunded_amount_cents <= amount_cents)
);

-- Indexes for payments
CREATE INDEX idx_payments_business_id ON payments(business_id);
CREATE INDEX idx_payments_ticket_id ON payments(ticket_id);
CREATE INDEX idx_payments_customer_id ON payments(customer_id);
CREATE UNIQUE INDEX idx_payments_stripe_payment_intent ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_stripe_charge_id ON payments(stripe_charge_id) WHERE stripe_charge_id IS NOT NULL;
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_captured_at ON payments(captured_at DESC) WHERE captured_at IS NOT NULL;
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX idx_payments_business_status ON payments(business_id, status);
CREATE INDEX idx_payments_customer_created ON payments(customer_id, created_at DESC);

COMMENT ON TABLE payments IS 'Customer payment transactions via Stripe Connect';
COMMENT ON COLUMN payments.stripe_payment_intent_id IS 'Stripe PaymentIntent ID (unique)';
COMMENT ON COLUMN payments.stripe_charge_id IS 'Stripe Charge ID (after capture)';
COMMENT ON COLUMN payments.amount_cents IS 'Total amount charged in cents';
COMMENT ON COLUMN payments.payment_method_details IS 'Card brand, last4, etc. from Stripe';
COMMENT ON COLUMN payments.payment_timing IS 'pre_service (authorize then capture) or post_service (immediate capture)';
COMMENT ON COLUMN payments.captured IS 'False for authorized only, true for captured';
COMMENT ON COLUMN payments.metadata IS 'Breakdown, line items, additional details';

-- ---------------------------------------------
-- 4. REFUNDS
-- Refund transactions
-- ---------------------------------------------
CREATE TABLE refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE RESTRICT,

  -- Stripe identifier
  stripe_refund_id TEXT NOT NULL UNIQUE,

  -- Amount details
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency TEXT NOT NULL DEFAULT 'usd',

  -- Status and reason
  status refund_status NOT NULL DEFAULT 'pending',
  reason refund_reason NOT NULL,
  reason_details TEXT,

  -- Audit trail
  requested_by_id UUID NOT NULL REFERENCES persons(id) ON DELETE RESTRICT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,

  -- Error handling
  failure_reason TEXT,

  -- Additional metadata
  metadata JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for refunds
CREATE INDEX idx_refunds_business_id ON refunds(business_id);
CREATE INDEX idx_refunds_payment_id ON refunds(payment_id);
CREATE INDEX idx_refunds_ticket_id ON refunds(ticket_id);
CREATE UNIQUE INDEX idx_refunds_stripe_refund_id ON refunds(stripe_refund_id);
CREATE INDEX idx_refunds_status ON refunds(status);
CREATE INDEX idx_refunds_requested_by_id ON refunds(requested_by_id);
CREATE INDEX idx_refunds_requested_at ON refunds(requested_at DESC);
CREATE INDEX idx_refunds_processed_at ON refunds(processed_at DESC) WHERE processed_at IS NOT NULL;

-- Composite index for payment refund history
CREATE INDEX idx_refunds_payment_requested ON refunds(payment_id, requested_at DESC);

COMMENT ON TABLE refunds IS 'Refund transactions via Stripe Connect';
COMMENT ON COLUMN refunds.stripe_refund_id IS 'Stripe Refund ID (unique)';
COMMENT ON COLUMN refunds.amount_cents IS 'Refund amount in cents (partial or full)';
COMMENT ON COLUMN refunds.reason IS 'Standardized refund reason code';
COMMENT ON COLUMN refunds.requested_by_id IS 'Person who initiated the refund (admin/technician)';

-- =============================================
-- TRIGGERS
-- =============================================

-- Updated_at triggers
CREATE TRIGGER set_updated_at_payment_settings
  BEFORE UPDATE ON payment_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_pricing_rules
  BEFORE UPDATE ON pricing_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_payments
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_refunds
  BEFORE UPDATE ON refunds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SECURITY NOTES
-- =============================================

-- IMPORTANT SECURITY CONSIDERATIONS:
--
-- 1. NEVER store raw card numbers - use Stripe's customer IDs and payment method tokens
-- 2. NEVER log full payment details - only store Stripe IDs for reference
-- 3. All payments are processed via Stripe Connect on behalf of connected accounts
-- 4. Webhook signature verification must be implemented in API layer using webhook_secret
-- 5. Test mode vs live mode controlled by payment_settings.test_mode
-- 6. PCI compliance: We don't handle card data directly, Stripe does
--
-- RLS policies will be added in P1.5 and P1.6 to ensure:
-- - Customers can only see their own payments
-- - Admins can see all payments within their business
-- - Super admins have full visibility for platform management
