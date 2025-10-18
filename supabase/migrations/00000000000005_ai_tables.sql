-- =============================================
-- Migration: P1.4 - AI Tables
-- Description: ElevenLabs AI booking agent configuration, conversations, usage tracking
-- Created: 2025-10-17
-- =============================================

-- =============================================
-- ENUMS
-- =============================================

-- AI agent status
CREATE TYPE ai_agent_status AS ENUM ('active', 'paused', 'suspended');

-- AI agent tone
CREATE TYPE ai_agent_tone AS ENUM ('professional', 'friendly', 'casual');

-- AI escalation methods
CREATE TYPE ai_escalation_method AS ENUM (
  'phone_transfer',
  'support_ticket',
  'sms_handoff',
  'all'
);

-- AI conversation channels
CREATE TYPE ai_conversation_channel AS ENUM ('voice', 'sms', 'web_widget');

-- AI conversation outcomes
CREATE TYPE ai_conversation_outcome AS ENUM (
  'booking_completed',
  'quote_provided',
  'escalated',
  'abandoned',
  'error'
);

-- AI usage event types
CREATE TYPE ai_usage_event_type AS ENUM (
  'voice_minutes',
  'sms_message',
  'web_message',
  'tool_call',
  'escalation'
);

-- =============================================
-- TABLES
-- =============================================

-- ---------------------------------------------
-- 1. AI_AGENTS
-- Per-business AI booking agent configuration
-- ---------------------------------------------
CREATE TABLE ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL UNIQUE REFERENCES businesses(id) ON DELETE RESTRICT,

  -- Agent identity
  agent_name TEXT NOT NULL,
  status ai_agent_status NOT NULL DEFAULT 'paused',

  -- External service IDs
  elevenlabs_agent_id TEXT,
  twilio_phone_number TEXT,
  twilio_phone_sid TEXT,

  -- Agent configuration
  greeting_message TEXT NOT NULL,
  business_description TEXT NOT NULL,
  tone ai_agent_tone NOT NULL DEFAULT 'friendly',

  -- Capabilities
  capabilities JSONB NOT NULL DEFAULT '{"allow_rescheduling": true, "allow_cancellations": false, "answer_questions": true}'::jsonb,

  -- Escalation configuration
  escalation_method ai_escalation_method NOT NULL DEFAULT 'support_ticket',
  escalation_phone TEXT,
  escalation_sms TEXT,
  escalation_keywords JSONB DEFAULT '["manager", "human", "speak to someone"]'::jsonb,

  -- Usage limits (from subscription tier)
  usage_limit_minutes INTEGER NOT NULL CHECK (usage_limit_minutes >= 0),
  usage_this_period_minutes INTEGER NOT NULL DEFAULT 0 CHECK (usage_this_period_minutes >= 0),
  usage_period_start TIMESTAMPTZ NOT NULL,
  usage_period_end TIMESTAMPTZ NOT NULL,

  -- Web widget configuration
  web_widget_enabled BOOLEAN NOT NULL DEFAULT true,
  web_widget_embed_code TEXT,

  -- Custom instructions
  custom_instructions TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  activated_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_usage_period CHECK (usage_period_end > usage_period_start),
  CONSTRAINT usage_within_limit CHECK (usage_this_period_minutes <= usage_limit_minutes)
);

-- Indexes for ai_agents
CREATE UNIQUE INDEX idx_ai_agents_business_id ON ai_agents(business_id);
CREATE UNIQUE INDEX idx_ai_agents_twilio_phone ON ai_agents(twilio_phone_number) WHERE twilio_phone_number IS NOT NULL;
CREATE INDEX idx_ai_agents_status ON ai_agents(status);
CREATE INDEX idx_ai_agents_elevenlabs_id ON ai_agents(elevenlabs_agent_id) WHERE elevenlabs_agent_id IS NOT NULL;

COMMENT ON TABLE ai_agents IS 'Per-business AI booking agent configuration (Professional+ only)';
COMMENT ON COLUMN ai_agents.agent_name IS 'Display name (e.g., "Acme HVAC Booking Assistant")';
COMMENT ON COLUMN ai_agents.elevenlabs_agent_id IS 'ElevenLabs agent ID for conversation processing';
COMMENT ON COLUMN ai_agents.twilio_phone_number IS 'E.164 format dedicated booking number';
COMMENT ON COLUMN ai_agents.greeting_message IS 'AI agent opening message when conversation starts';
COMMENT ON COLUMN ai_agents.business_description IS 'Context for AI: "We provide HVAC services in Austin, TX..."';
COMMENT ON COLUMN ai_agents.capabilities IS 'Feature toggles: {"allow_rescheduling": true, "allow_cancellations": false}';
COMMENT ON COLUMN ai_agents.escalation_keywords IS 'Trigger words for human handoff: ["manager", "human", "speak to someone"]';
COMMENT ON COLUMN ai_agents.usage_limit_minutes IS 'Monthly voice minutes from subscription tier (e.g., 500)';
COMMENT ON COLUMN ai_agents.usage_this_period_minutes IS 'Voice minutes consumed this billing period (resets monthly)';
COMMENT ON COLUMN ai_agents.web_widget_embed_code IS 'Generated <script> tag for website embedding';

-- ---------------------------------------------
-- 2. AI_CONVERSATIONS
-- AI booking agent conversation summaries
-- ---------------------------------------------
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
  ai_agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE RESTRICT,

  -- Related entities
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,

  -- Session tracking
  session_id TEXT NOT NULL UNIQUE,
  channel ai_conversation_channel NOT NULL,
  phone_number TEXT,

  -- Outcome tracking
  conversation_outcome ai_conversation_outcome NOT NULL,
  booking_completed BOOLEAN NOT NULL DEFAULT false,
  escalation_triggered BOOLEAN NOT NULL DEFAULT false,
  escalation_reason TEXT,

  -- Booking flow metrics
  slots_suggested_count INTEGER DEFAULT 0 CHECK (slots_suggested_count >= 0),

  -- Duration/volume tracking
  duration_seconds INTEGER CHECK (duration_seconds IS NULL OR duration_seconds > 0),
  message_count INTEGER DEFAULT 0 CHECK (message_count >= 0),

  -- Quality metrics
  customer_satisfaction_rating INTEGER CHECK (customer_satisfaction_rating IS NULL OR (customer_satisfaction_rating >= 1 AND customer_satisfaction_rating <= 5)),
  conversation_summary TEXT,

  -- Timestamps
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_conversation_duration CHECK (ended_at IS NULL OR ended_at > started_at),
  CONSTRAINT duration_only_for_voice CHECK (
    (channel = 'voice' AND duration_seconds IS NOT NULL) OR
    (channel != 'voice' AND duration_seconds IS NULL)
  )
);

-- Indexes for ai_conversations
CREATE INDEX idx_ai_conversations_business_id ON ai_conversations(business_id);
CREATE INDEX idx_ai_conversations_ai_agent_id ON ai_conversations(ai_agent_id);
CREATE INDEX idx_ai_conversations_customer_id ON ai_conversations(customer_id) WHERE customer_id IS NOT NULL;
CREATE INDEX idx_ai_conversations_ticket_id ON ai_conversations(ticket_id) WHERE ticket_id IS NOT NULL;
CREATE UNIQUE INDEX idx_ai_conversations_session_id ON ai_conversations(session_id);
CREATE INDEX idx_ai_conversations_channel ON ai_conversations(channel);
CREATE INDEX idx_ai_conversations_outcome ON ai_conversations(conversation_outcome);
CREATE INDEX idx_ai_conversations_started_at ON ai_conversations(started_at DESC);
CREATE INDEX idx_ai_conversations_created_at ON ai_conversations(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX idx_ai_conversations_agent_started ON ai_conversations(ai_agent_id, started_at DESC);
CREATE INDEX idx_ai_conversations_business_outcome ON ai_conversations(business_id, conversation_outcome);

COMMENT ON TABLE ai_conversations IS 'Summary of AI booking agent conversations (full transcripts in ElevenLabs)';
COMMENT ON COLUMN ai_conversations.session_id IS 'ElevenLabs conversation/session ID (unique)';
COMMENT ON COLUMN ai_conversations.customer_id IS 'Nullable if new customer not yet created';
COMMENT ON COLUMN ai_conversations.ticket_id IS 'Nullable until booking confirmed';
COMMENT ON COLUMN ai_conversations.slots_suggested_count IS 'Number of time slot options shown to customer';
COMMENT ON COLUMN ai_conversations.duration_seconds IS 'Voice call duration (voice channel only)';
COMMENT ON COLUMN ai_conversations.message_count IS 'Number of messages exchanged (SMS/web channels)';
COMMENT ON COLUMN ai_conversations.customer_satisfaction_rating IS 'Optional 1-5 rating from post-conversation survey';
COMMENT ON COLUMN ai_conversations.conversation_summary IS 'AI-generated summary of conversation';

-- ---------------------------------------------
-- 3. AI_USAGE_EVENTS
-- Granular AI agent usage tracking
-- ---------------------------------------------
CREATE TABLE ai_usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
  ai_agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE RESTRICT,
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,

  -- Event details
  event_type ai_usage_event_type NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  cost_cents INTEGER CHECK (cost_cents IS NULL OR cost_cents >= 0),

  -- Timestamp (append-only, no updated_at)
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for ai_usage_events (optimized for billing queries)
CREATE INDEX idx_ai_usage_business_id ON ai_usage_events(business_id);
CREATE INDEX idx_ai_usage_ai_agent_id ON ai_usage_events(ai_agent_id);
CREATE INDEX idx_ai_usage_conversation_id ON ai_usage_events(conversation_id);
CREATE INDEX idx_ai_usage_event_type ON ai_usage_events(event_type);
CREATE INDEX idx_ai_usage_recorded_at ON ai_usage_events(recorded_at DESC);

-- Composite indexes for aggregation queries
CREATE INDEX idx_ai_usage_business_recorded ON ai_usage_events(business_id, recorded_at DESC);
CREATE INDEX idx_ai_usage_agent_type_recorded ON ai_usage_events(ai_agent_id, event_type, recorded_at DESC);

-- Partial index for billable voice minutes
CREATE INDEX idx_ai_usage_voice_minutes ON ai_usage_events(ai_agent_id, recorded_at DESC) WHERE event_type = 'voice_minutes';

COMMENT ON TABLE ai_usage_events IS 'Granular AI agent usage tracking for billing and analytics (append-only)';
COMMENT ON COLUMN ai_usage_events.event_type IS 'voice_minutes, sms_message, web_message, tool_call, escalation';
COMMENT ON COLUMN ai_usage_events.quantity IS 'Minutes for voice, count for messages/tools/escalations';
COMMENT ON COLUMN ai_usage_events.cost_cents IS 'Optional cost tracking in cents';

-- =============================================
-- TRIGGERS
-- =============================================

-- Updated_at triggers (only for mutable tables)
CREATE TRIGGER set_updated_at_ai_agents
  BEFORE UPDATE ON ai_agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Note: No updated_at for ai_conversations or ai_usage_events
-- ai_conversations are created and rarely updated
-- ai_usage_events is append-only

-- =============================================
-- RETENTION POLICY DOCUMENTATION
-- =============================================

-- RETENTION POLICIES (to be implemented in Phase 5):
--
-- ai_conversations: Retain for 24 months for quality/training purposes
-- Consider GDPR compliance for transcript data (stored in ElevenLabs)
--
-- ai_usage_events: Keep 24 months, then aggregate for historical reporting
-- Example aggregation: Monthly totals by business_id and event_type
--
-- GDPR Considerations:
-- - Transcripts stored externally in ElevenLabs (not in our DB)
-- - Customer PII in conversation_summary should be minimal
-- - Support data deletion requests via ElevenLabs API integration
-- - Link conversations to tickets for business context retention

-- =============================================
-- USAGE TRACKING HELPER NOTES
-- =============================================

-- Usage tracking workflow:
--
-- 1. When conversation starts, create ai_conversations record
-- 2. During conversation, create ai_usage_events for each billable action:
--    - voice_minutes: Track per-minute voice usage
--    - sms_message: Track outbound SMS
--    - web_message: Track web widget messages
--    - tool_call: Track API calls (booking, rescheduling, etc.)
--    - escalation: Track human handoffs
--
-- 3. When conversation ends, update ai_conversations with outcome
-- 4. Aggregate ai_usage_events to update ai_agents.usage_this_period_minutes
-- 5. When usage_period_end is reached, reset usage counter for new period
--
-- Billing integration:
-- - Link to subscriptions.ai_minutes_limit for enforcement
-- - Generate overages when usage_this_period_minutes > usage_limit_minutes
-- - Track costs in ai_usage_events.cost_cents for platform cost analysis
