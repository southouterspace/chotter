-- =============================================
-- Migration: P1.3 - Supporting Tables
-- Description: Media, notifications, location tracking, geofencing, audit trails, routes, on-call, emergency
-- Created: 2025-10-17
-- =============================================

-- =============================================
-- ENUMS
-- =============================================

-- Media types
CREATE TYPE media_type AS ENUM ('photo', 'video', 'document');

-- Media uploader roles
CREATE TYPE uploader_role AS ENUM ('customer', 'technician', 'admin');

-- Media upload methods
CREATE TYPE upload_method AS ENUM ('mms', 'sms_link', 'web_portal', 'technician_app');

-- Notification types
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

-- Notification delivery methods
CREATE TYPE delivery_method AS ENUM ('sms', 'email', 'push', 'voice');

-- Notification status
CREATE TYPE notification_status AS ENUM (
  'pending',
  'sent',
  'delivered',
  'failed',
  'customer_responded'
);

-- Location source
CREATE TYPE location_source AS ENUM ('mobile_app', 'browser', 'manual');

-- Geofence event types
CREATE TYPE geofence_event_type AS ENUM ('approaching', 'arrived', 'departed');

-- Route event types
CREATE TYPE route_event_type AS ENUM (
  'created',
  'optimized',
  'rebalanced',
  'manual_override',
  'ticket_added',
  'ticket_removed',
  'completed'
);

-- Emergency request status
CREATE TYPE emergency_status AS ENUM (
  'pending',
  'assigned',
  'en_route',
  'resolved',
  'escalated'
);

-- =============================================
-- TABLES
-- =============================================

-- ---------------------------------------------
-- 1. MEDIA
-- File attachments (photos, videos, documents)
-- ---------------------------------------------
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,

  -- Polymorphic relationship support
  entity_type TEXT NOT NULL CHECK (entity_type IN ('ticket', 'customer', 'service', 'technician')),
  entity_id UUID NOT NULL,

  -- Upload metadata
  uploaded_by_id UUID NOT NULL REFERENCES persons(id) ON DELETE RESTRICT,
  uploader_role uploader_role NOT NULL,

  -- File details
  media_type media_type NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0),
  mime_type TEXT NOT NULL,
  original_filename TEXT,
  caption TEXT,
  upload_method upload_method NOT NULL,

  -- Additional metadata (EXIF, location, device info)
  metadata JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for media
CREATE INDEX idx_media_business_id ON media(business_id);
CREATE INDEX idx_media_uploaded_by_id ON media(uploaded_by_id);
CREATE INDEX idx_media_created_at ON media(created_at DESC);
CREATE INDEX idx_media_media_type ON media(media_type);

-- Polymorphic indexes (partial indexes for each entity type)
CREATE INDEX idx_media_tickets ON media(entity_id) WHERE entity_type = 'ticket';
CREATE INDEX idx_media_customers ON media(entity_id) WHERE entity_type = 'customer';
CREATE INDEX idx_media_services ON media(entity_id) WHERE entity_type = 'service';
CREATE INDEX idx_media_technicians ON media(entity_id) WHERE entity_type = 'technician';

-- Composite index for entity lookups
CREATE INDEX idx_media_entity ON media(entity_type, entity_id);

COMMENT ON TABLE media IS 'File attachments uploaded by customers or technicians';
COMMENT ON COLUMN media.entity_type IS 'Type of entity this media belongs to (polymorphic)';
COMMENT ON COLUMN media.entity_id IS 'ID of the entity this media belongs to (polymorphic)';
COMMENT ON COLUMN media.metadata IS 'EXIF data, location, device info, etc.';

-- ---------------------------------------------
-- 2. NOTIFICATIONS
-- Multi-channel notification log
-- ---------------------------------------------
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
  ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
  recipient_id UUID NOT NULL REFERENCES persons(id) ON DELETE RESTRICT,

  -- Notification details
  notification_type notification_type NOT NULL,
  delivery_method delivery_method NOT NULL,
  status notification_status NOT NULL DEFAULT 'pending',

  -- Content
  subject TEXT,
  message_body TEXT NOT NULL,

  -- Status tracking
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,

  -- Two-way communication
  customer_response TEXT,
  customer_response_at TIMESTAMPTZ,

  -- External provider tracking
  external_id TEXT,
  error_message TEXT,
  cost_cents INTEGER CHECK (cost_cents >= 0),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for notifications
CREATE INDEX idx_notifications_business_id ON notifications(business_id);
CREATE INDEX idx_notifications_ticket_id ON notifications(ticket_id) WHERE ticket_id IS NOT NULL;
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_notification_type ON notifications(notification_type);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_sent_at ON notifications(sent_at DESC) WHERE sent_at IS NOT NULL;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX idx_notifications_recipient_status ON notifications(recipient_id, status);
CREATE INDEX idx_notifications_business_status ON notifications(business_id, status);

COMMENT ON TABLE notifications IS 'Communication log for automated and manual messages';
COMMENT ON COLUMN notifications.external_id IS 'Twilio SID, SendGrid ID, or other provider identifier';
COMMENT ON COLUMN notifications.cost_cents IS 'SMS/communication cost in cents';

-- ---------------------------------------------
-- 3. LOCATION_HISTORY
-- GPS breadcrumb trail (time-series data)
-- ---------------------------------------------
CREATE TABLE location_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
  technician_id UUID NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,

  -- Location data (using PostGIS point type)
  location POINT NOT NULL,
  accuracy_meters DECIMAL(10,2) CHECK (accuracy_meters >= 0),
  speed_mph DECIMAL(6,2) CHECK (speed_mph IS NULL OR speed_mph >= 0),
  heading_degrees INTEGER CHECK (heading_degrees IS NULL OR (heading_degrees >= 0 AND heading_degrees <= 359)),

  -- Device metadata
  battery_level INTEGER CHECK (battery_level IS NULL OR (battery_level >= 0 AND battery_level <= 100)),
  is_moving BOOLEAN NOT NULL DEFAULT false,
  source location_source NOT NULL,

  -- Timestamps
  recorded_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for location_history (optimized for time-series queries)
CREATE INDEX idx_location_history_business_id ON location_history(business_id);
CREATE INDEX idx_location_history_technician_id ON location_history(technician_id);
CREATE INDEX idx_location_history_recorded_at ON location_history(recorded_at DESC);

-- Composite index for latest location queries
CREATE INDEX idx_location_history_technician_recorded ON location_history(technician_id, recorded_at DESC);

-- Spatial index for location-based queries
-- Note: Requires PostGIS extension (enabled in P1.1)
CREATE INDEX idx_location_history_location ON location_history USING GIST(location);

COMMENT ON TABLE location_history IS 'Real-time and historical technician location tracking (90-day retention)';
COMMENT ON COLUMN location_history.recorded_at IS 'Device timestamp (when location was recorded)';
COMMENT ON COLUMN location_history.created_at IS 'Server timestamp (when record was received)';
COMMENT ON COLUMN location_history.location IS 'PostGIS point geometry';

-- ---------------------------------------------
-- 4. GEOFENCE_EVENTS
-- Location-based arrival/departure triggers
-- ---------------------------------------------
CREATE TABLE geofence_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
  technician_id UUID NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,

  -- Event details
  event_type geofence_event_type NOT NULL,
  geofence_radius_meters INTEGER NOT NULL CHECK (geofence_radius_meters > 0),
  distance_meters DECIMAL(10,2) NOT NULL CHECK (distance_meters >= 0),
  location POINT NOT NULL,

  -- Notification tracking
  notification_sent BOOLEAN NOT NULL DEFAULT false,
  notification_id UUID REFERENCES notifications(id) ON DELETE SET NULL,

  -- Timestamp (append-only, no updated_at)
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for geofence_events
CREATE INDEX idx_geofence_events_business_id ON geofence_events(business_id);
CREATE INDEX idx_geofence_events_technician_id ON geofence_events(technician_id);
CREATE INDEX idx_geofence_events_ticket_id ON geofence_events(ticket_id);
CREATE INDEX idx_geofence_events_event_type ON geofence_events(event_type);
CREATE INDEX idx_geofence_events_triggered_at ON geofence_events(triggered_at DESC);

-- Composite index for technician event history
CREATE INDEX idx_geofence_events_tech_triggered ON geofence_events(technician_id, triggered_at DESC);

-- Spatial index
CREATE INDEX idx_geofence_events_location ON geofence_events USING GIST(location);

COMMENT ON TABLE geofence_events IS 'Triggered events when technicians enter/exit geofences around appointments (append-only)';
COMMENT ON COLUMN geofence_events.geofence_radius_meters IS 'E.g., 1609 for 1 mile radius';
COMMENT ON COLUMN geofence_events.distance_meters IS 'Distance from ticket location at trigger time';

-- ---------------------------------------------
-- 5. STATUS_HISTORY
-- Audit trail for ticket status changes
-- ---------------------------------------------
CREATE TABLE status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,

  -- Status change details
  from_status ticket_status,
  to_status ticket_status NOT NULL,

  -- Who made the change
  changed_by_id UUID REFERENCES persons(id) ON DELETE SET NULL,
  changed_by_role person_role NOT NULL,
  reason TEXT,

  -- Timestamp (append-only, no updated_at)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for status_history (time-series queries)
CREATE INDEX idx_status_history_business_id ON status_history(business_id);
CREATE INDEX idx_status_history_ticket_id ON status_history(ticket_id);
CREATE INDEX idx_status_history_created_at ON status_history(created_at DESC);

-- Composite index for ticket status timeline
CREATE INDEX idx_status_history_ticket_created ON status_history(ticket_id, created_at DESC);

COMMENT ON TABLE status_history IS 'Immutable audit trail for ticket status changes (append-only)';
COMMENT ON COLUMN status_history.from_status IS 'Previous status (NULL for initial status)';
COMMENT ON COLUMN status_history.changed_by_role IS 'Role of the person who changed status (customer, technician, admin, system)';

-- ---------------------------------------------
-- 6. ROUTE_EVENTS
-- Route optimization audit trail
-- ---------------------------------------------
CREATE TABLE route_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,

  -- Event details
  event_type route_event_type NOT NULL,

  -- Sequence tracking
  previous_sequence JSONB,
  new_sequence JSONB,

  -- Trigger information
  triggered_by_id UUID REFERENCES persons(id) ON DELETE SET NULL,
  trigger_reason TEXT,

  -- Optimization metrics
  optimization_improvement JSONB,

  -- Timestamp (append-only, no updated_at)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for route_events
CREATE INDEX idx_route_events_business_id ON route_events(business_id);
CREATE INDEX idx_route_events_route_id ON route_events(route_id);
CREATE INDEX idx_route_events_event_type ON route_events(event_type);
CREATE INDEX idx_route_events_created_at ON route_events(created_at DESC);

-- Composite index for route history
CREATE INDEX idx_route_events_route_created ON route_events(route_id, created_at DESC);

COMMENT ON TABLE route_events IS 'Audit trail for route optimization and rebalancing (append-only)';
COMMENT ON COLUMN route_events.previous_sequence IS 'Array of ticket IDs before change';
COMMENT ON COLUMN route_events.new_sequence IS 'Array of ticket IDs after change';
COMMENT ON COLUMN route_events.optimization_improvement IS 'Metrics like {"distance_saved_miles": 5.2, "time_saved_minutes": 15}';

-- ---------------------------------------------
-- 7. ON_CALL_SCHEDULES
-- Technician availability for emergency response
-- ---------------------------------------------
CREATE TABLE on_call_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
  technician_id UUID NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,

  -- Schedule window
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,

  -- Priority and capacity
  priority INTEGER NOT NULL DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  max_emergency_tickets INTEGER NOT NULL DEFAULT 3 CHECK (max_emergency_tickets > 0),
  response_time_minutes INTEGER NOT NULL CHECK (response_time_minutes > 0),

  -- Audit
  created_by_id UUID NOT NULL REFERENCES persons(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Indexes for on_call_schedules
CREATE INDEX idx_on_call_business_id ON on_call_schedules(business_id);
CREATE INDEX idx_on_call_technician_id ON on_call_schedules(technician_id);
CREATE INDEX idx_on_call_start_time ON on_call_schedules(start_time);
CREATE INDEX idx_on_call_end_time ON on_call_schedules(end_time);

-- GIST index for overlapping time range queries
CREATE INDEX idx_on_call_time_range ON on_call_schedules USING GIST(tstzrange(start_time, end_time));

-- Composite index for active schedules
CREATE INDEX idx_on_call_tech_time ON on_call_schedules(technician_id, start_time, end_time);

COMMENT ON TABLE on_call_schedules IS 'Defines emergency/on-call technician availability windows';
COMMENT ON COLUMN on_call_schedules.priority IS '1-10, lower number = higher priority when multiple techs on-call';
COMMENT ON COLUMN on_call_schedules.response_time_minutes IS 'SLA for emergency response time';

-- ---------------------------------------------
-- 8. EMERGENCY_REQUESTS
-- After-hours emergency handling
-- ---------------------------------------------
CREATE TABLE emergency_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
  ticket_id UUID NOT NULL UNIQUE REFERENCES tickets(id) ON DELETE CASCADE,

  -- Request details
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_technician_id UUID REFERENCES technicians(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,
  response_deadline TIMESTAMPTZ NOT NULL,

  -- Contact and urgency
  customer_callback_number TEXT NOT NULL,
  urgency_reason TEXT NOT NULL,

  -- Assignment tracking
  auto_assigned BOOLEAN NOT NULL DEFAULT false,
  status emergency_status NOT NULL DEFAULT 'pending',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for emergency_requests
CREATE INDEX idx_emergency_requests_business_id ON emergency_requests(business_id);
CREATE INDEX idx_emergency_requests_ticket_id ON emergency_requests(ticket_id);
CREATE INDEX idx_emergency_requests_assigned_tech_id ON emergency_requests(assigned_technician_id) WHERE assigned_technician_id IS NOT NULL;
CREATE INDEX idx_emergency_requests_status ON emergency_requests(status);
CREATE INDEX idx_emergency_requests_requested_at ON emergency_requests(requested_at DESC);
CREATE INDEX idx_emergency_requests_response_deadline ON emergency_requests(response_deadline);

-- Composite index for active emergency requests
CREATE INDEX idx_emergency_requests_status_deadline ON emergency_requests(status, response_deadline) WHERE status IN ('pending', 'assigned');

COMMENT ON TABLE emergency_requests IS 'Tracks emergency/urgent service requests outside business hours';
COMMENT ON COLUMN emergency_requests.customer_callback_number IS 'May differ from customer.phone for emergency contact';
COMMENT ON COLUMN emergency_requests.auto_assigned IS 'True if AI assigned, false if manual assignment';

-- =============================================
-- TRIGGERS
-- =============================================

-- Updated_at triggers (only for mutable tables)
CREATE TRIGGER set_updated_at_notifications
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_on_call_schedules
  BEFORE UPDATE ON on_call_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_emergency_requests
  BEFORE UPDATE ON emergency_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Note: No updated_at triggers for append-only tables:
-- - location_history
-- - geofence_events
-- - status_history
-- - route_events

-- =============================================
-- RETENTION POLICY DOCUMENTATION
-- =============================================

-- RETENTION POLICIES (to be implemented in Phase 5):
--
-- location_history: Delete records older than 90 days (GDPR compliance)
-- Example implementation:
-- DELETE FROM location_history WHERE recorded_at < now() - interval '90 days';
--
-- status_history: Retain indefinitely for audit purposes
--
-- geofence_events: Retain for 1 year, then archive or delete
--
-- route_events: Retain for 2 years for analytics
--
-- notifications: Retain for 1 year, then archive or delete
--
-- These policies will be enforced via pg_cron jobs or application-level cleanup.
