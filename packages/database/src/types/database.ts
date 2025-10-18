/**
 * Auto-generated TypeScript types for Chotter database schema
 * Generated from Supabase migrations (P1.1-P1.5)
 *
 * Run `bun run generate-types` to regenerate from live database
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// =====================================================================
// ENUMS
// =====================================================================

export type BusinessStatus =
  | 'trial'
  | 'active'
  | 'suspended'
  | 'cancelled'
  | 'past_due';

export type SubscriptionStatus =
  | 'trial'
  | 'active'
  | 'past_due'
  | 'cancelled'
  | 'incomplete'
  | 'incomplete_expired';

export type BillingPeriod = 'monthly' | 'annual';

export type Industry =
  | 'hvac'
  | 'plumbing'
  | 'electrical'
  | 'auto_repair'
  | 'general';

export type ActionType =
  | 'subscription_modified'
  | 'tier_created'
  | 'tier_updated'
  | 'business_suspended'
  | 'refund_issued'
  | 'limits_overridden'
  | 'impersonation_started'
  | 'impersonation_ended'
  | 'setting_changed';

export type InvoiceStatus =
  | 'draft'
  | 'open'
  | 'paid'
  | 'uncollectible'
  | 'void';

export type BillingReason =
  | 'subscription_create'
  | 'subscription_cycle'
  | 'subscription_update'
  | 'manual';

export type EventType =
  | 'appointment_created'
  | 'user_added'
  | 'user_removed'
  | 'ai_voice_minutes_used'
  | 'ai_voice_call_completed'
  | 'sms_sent'
  | 'inventory_tracked';

export type PersonRole =
  | 'platform_super_admin'
  | 'business_owner'
  | 'office_manager'
  | 'dispatcher'
  | 'technician';

export type TicketStatus =
  | 'pending'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type TicketPriority =
  | 'low'
  | 'normal'
  | 'high'
  | 'urgent';

export type TicketSource =
  | 'phone'
  | 'email'
  | 'web_form'
  | 'ai_voice_call'
  | 'mobile_app'
  | 'walk_in';

export type CustomerSource =
  | 'referral'
  | 'google_ads'
  | 'website'
  | 'repeat'
  | 'other';

export type CustomerStatus =
  | 'active'
  | 'inactive';

export type TagType =
  | 'skill'
  | 'badge'
  | 'equipment'
  | 'note';

export type EstimateStatus =
  | 'draft'
  | 'sent'
  | 'approved'
  | 'rejected'
  | 'expired';

export type PaymentStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'refunded';

export type PaymentMethod =
  | 'cash'
  | 'check'
  | 'credit_card'
  | 'debit_card'
  | 'ach'
  | 'stripe';

export type SmsStatus =
  | 'queued'
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'bounced';

export type SmsDirection = 'inbound' | 'outbound';

export type VoiceCallStatus =
  | 'queued'
  | 'ringing'
  | 'in_progress'
  | 'completed'
  | 'busy'
  | 'failed'
  | 'no_answer'
  | 'cancelled';

export type VoiceCallDirection = 'inbound' | 'outbound';

export type ConversationStatus =
  | 'active'
  | 'resolved'
  | 'abandoned';

export type AiAssistantType =
  | 'receptionist'
  | 'dispatcher'
  | 'scheduling_assistant'
  | 'customer_service';

// =====================================================================
// TABLES
// =====================================================================

export interface Database {
  public: {
    Tables: {
      // Platform-Owner Domain Tables (P1.1)
      businesses: {
        Row: {
          id: string;
          name: string;
          slug: string;
          industry: Industry;
          status: BusinessStatus;
          owner_id: string;
          phone: string | null;
          email: string | null;
          website: string | null;
          address: Json | null;
          logo_url: string | null;
          timezone: string;
          business_hours: Json | null;
          settings: Json;
          onboarding_completed_at: string | null;
          trial_ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          industry: Industry;
          status?: BusinessStatus;
          owner_id: string;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          address?: Json | null;
          logo_url?: string | null;
          timezone?: string;
          business_hours?: Json | null;
          settings?: Json;
          onboarding_completed_at?: string | null;
          trial_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          industry?: Industry;
          status?: BusinessStatus;
          owner_id?: string;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          address?: Json | null;
          logo_url?: string | null;
          timezone?: string;
          business_hours?: Json | null;
          settings?: Json;
          onboarding_completed_at?: string | null;
          trial_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscription_tiers: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          monthly_price_cents: number;
          annual_price_cents: number;
          features: Json;
          limits: Json;
          is_active: boolean;
          display_order: number;
          stripe_monthly_price_id: string | null;
          stripe_annual_price_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          monthly_price_cents: number;
          annual_price_cents: number;
          features: Json;
          limits: Json;
          is_active?: boolean;
          display_order?: number;
          stripe_monthly_price_id?: string | null;
          stripe_annual_price_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          monthly_price_cents?: number;
          annual_price_cents?: number;
          features?: Json;
          limits?: Json;
          is_active?: boolean;
          display_order?: number;
          stripe_monthly_price_id?: string | null;
          stripe_annual_price_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          business_id: string;
          tier_id: string;
          status: SubscriptionStatus;
          billing_period: BillingPeriod;
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end: boolean;
          cancelled_at: string | null;
          stripe_subscription_id: string | null;
          stripe_customer_id: string | null;
          trial_ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          tier_id: string;
          status?: SubscriptionStatus;
          billing_period: BillingPeriod;
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end?: boolean;
          cancelled_at?: string | null;
          stripe_subscription_id?: string | null;
          stripe_customer_id?: string | null;
          trial_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          tier_id?: string;
          status?: SubscriptionStatus;
          billing_period?: BillingPeriod;
          current_period_start?: string;
          current_period_end?: string;
          cancel_at_period_end?: boolean;
          cancelled_at?: string | null;
          stripe_subscription_id?: string | null;
          stripe_customer_id?: string | null;
          trial_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      platform_settings: {
        Row: {
          id: string;
          key: string;
          value: Json;
          description: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: Json;
          description?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: Json;
          description?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          admin_id: string;
          action: ActionType;
          entity_type: string | null;
          entity_id: string | null;
          metadata: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id: string;
          action: ActionType;
          entity_type?: string | null;
          entity_id?: string | null;
          metadata?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string;
          action?: ActionType;
          entity_type?: string | null;
          entity_id?: string | null;
          metadata?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      invoice_history: {
        Row: {
          id: string;
          business_id: string;
          stripe_invoice_id: string;
          status: InvoiceStatus;
          billing_reason: BillingReason;
          amount_due_cents: number;
          amount_paid_cents: number;
          tax_cents: number;
          invoice_pdf_url: string | null;
          hosted_invoice_url: string | null;
          due_date: string | null;
          paid_at: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          stripe_invoice_id: string;
          status: InvoiceStatus;
          billing_reason: BillingReason;
          amount_due_cents: number;
          amount_paid_cents?: number;
          tax_cents?: number;
          invoice_pdf_url?: string | null;
          hosted_invoice_url?: string | null;
          due_date?: string | null;
          paid_at?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          stripe_invoice_id?: string;
          status?: InvoiceStatus;
          billing_reason?: BillingReason;
          amount_due_cents?: number;
          amount_paid_cents?: number;
          tax_cents?: number;
          invoice_pdf_url?: string | null;
          hosted_invoice_url?: string | null;
          due_date?: string | null;
          paid_at?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      usage_events: {
        Row: {
          id: string;
          business_id: string;
          event_type: EventType;
          event_data: Json | null;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          event_type: EventType;
          event_data?: Json | null;
          user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          event_type?: EventType;
          event_data?: Json | null;
          user_id?: string | null;
          created_at?: string;
        };
      };

      // Business Core Tables (P1.2)
      persons: {
        Row: {
          id: string;
          business_id: string;
          auth_user_id: string;
          role: PersonRole;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          avatar_url: string | null;
          is_active: boolean;
          hourly_rate_cents: number | null;
          employment_start_date: string | null;
          employment_end_date: string | null;
          notes: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          auth_user_id: string;
          role: PersonRole;
          first_name: string;
          last_name: string;
          email: string;
          phone?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          hourly_rate_cents?: number | null;
          employment_start_date?: string | null;
          employment_end_date?: string | null;
          notes?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          auth_user_id?: string;
          role?: PersonRole;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          hourly_rate_cents?: number | null;
          employment_start_date?: string | null;
          employment_end_date?: string | null;
          notes?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          business_id: string;
          first_name: string;
          last_name: string;
          email: string | null;
          phone: string;
          company_name: string | null;
          source: CustomerSource | null;
          status: CustomerStatus;
          service_address: Json | null;
          billing_address: Json | null;
          tags: string[];
          notes: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          first_name: string;
          last_name: string;
          email?: string | null;
          phone: string;
          company_name?: string | null;
          source?: CustomerSource | null;
          status?: CustomerStatus;
          service_address?: Json | null;
          billing_address?: Json | null;
          tags?: string[];
          notes?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          first_name?: string;
          last_name?: string;
          email?: string | null;
          phone?: string;
          company_name?: string | null;
          source?: CustomerSource | null;
          status?: CustomerStatus;
          service_address?: Json | null;
          billing_address?: Json | null;
          tags?: string[];
          notes?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tickets: {
        Row: {
          id: string;
          business_id: string;
          customer_id: string;
          assigned_to: string | null;
          status: TicketStatus;
          priority: TicketPriority;
          source: TicketSource;
          title: string;
          description: string | null;
          service_address: Json | null;
          scheduled_for: string | null;
          completed_at: string | null;
          duration_minutes: number | null;
          total_amount_cents: number;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          customer_id: string;
          assigned_to?: string | null;
          status?: TicketStatus;
          priority?: TicketPriority;
          source: TicketSource;
          title: string;
          description?: string | null;
          service_address?: Json | null;
          scheduled_for?: string | null;
          completed_at?: string | null;
          duration_minutes?: number | null;
          total_amount_cents?: number;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          customer_id?: string;
          assigned_to?: string | null;
          status?: TicketStatus;
          priority?: TicketPriority;
          source?: TicketSource;
          title?: string;
          description?: string | null;
          service_address?: Json | null;
          scheduled_for?: string | null;
          completed_at?: string | null;
          duration_minutes?: number | null;
          total_amount_cents?: number;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      ticket_notes: {
        Row: {
          id: string;
          business_id: string;
          ticket_id: string;
          author_id: string;
          content: string;
          is_internal: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          ticket_id: string;
          author_id: string;
          content: string;
          is_internal?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          ticket_id?: string;
          author_id?: string;
          content?: string;
          is_internal?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      ticket_status_history: {
        Row: {
          id: string;
          business_id: string;
          ticket_id: string;
          old_status: TicketStatus | null;
          new_status: TicketStatus;
          changed_by: string;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          ticket_id: string;
          old_status?: TicketStatus | null;
          new_status: TicketStatus;
          changed_by: string;
          reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          ticket_id?: string;
          old_status?: TicketStatus | null;
          new_status?: TicketStatus;
          changed_by?: string;
          reason?: string | null;
          created_at?: string;
        };
      };

      // Supporting Tables (P1.3)
      technician_tags: {
        Row: {
          id: string;
          business_id: string;
          person_id: string;
          tag_type: TagType;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          person_id: string;
          tag_type: TagType;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          person_id?: string;
          tag_type?: TagType;
          name?: string;
          created_at?: string;
        };
      };
      technician_availability: {
        Row: {
          id: string;
          business_id: string;
          person_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          person_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          person_id?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      estimates: {
        Row: {
          id: string;
          business_id: string;
          customer_id: string;
          ticket_id: string | null;
          created_by: string;
          status: EstimateStatus;
          line_items: Json;
          subtotal_cents: number;
          tax_cents: number;
          total_cents: number;
          notes: string | null;
          valid_until: string | null;
          sent_at: string | null;
          approved_at: string | null;
          rejected_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          customer_id: string;
          ticket_id?: string | null;
          created_by: string;
          status?: EstimateStatus;
          line_items: Json;
          subtotal_cents: number;
          tax_cents?: number;
          total_cents: number;
          notes?: string | null;
          valid_until?: string | null;
          sent_at?: string | null;
          approved_at?: string | null;
          rejected_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          customer_id?: string;
          ticket_id?: string | null;
          created_by?: string;
          status?: EstimateStatus;
          line_items?: Json;
          subtotal_cents?: number;
          tax_cents?: number;
          total_cents?: number;
          notes?: string | null;
          valid_until?: string | null;
          sent_at?: string | null;
          approved_at?: string | null;
          rejected_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      service_areas: {
        Row: {
          id: string;
          business_id: string;
          zip_code: string;
          city: string | null;
          state: string | null;
          is_active: boolean;
          travel_fee_cents: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          zip_code: string;
          city?: string | null;
          state?: string | null;
          is_active?: boolean;
          travel_fee_cents?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          zip_code?: string;
          city?: string | null;
          state?: string | null;
          is_active?: boolean;
          travel_fee_cents?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      inventory_items: {
        Row: {
          id: string;
          business_id: string;
          sku: string | null;
          name: string;
          description: string | null;
          category: string | null;
          unit_price_cents: number;
          quantity_on_hand: number;
          reorder_point: number;
          is_active: boolean;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          sku?: string | null;
          name: string;
          description?: string | null;
          category?: string | null;
          unit_price_cents: number;
          quantity_on_hand?: number;
          reorder_point?: number;
          is_active?: boolean;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          sku?: string | null;
          name?: string;
          description?: string | null;
          category?: string | null;
          unit_price_cents?: number;
          quantity_on_hand?: number;
          reorder_point?: number;
          is_active?: boolean;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      ticket_inventory: {
        Row: {
          id: string;
          business_id: string;
          ticket_id: string;
          inventory_item_id: string;
          quantity_used: number;
          unit_price_cents: number;
          total_price_cents: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          ticket_id: string;
          inventory_item_id: string;
          quantity_used: number;
          unit_price_cents: number;
          total_price_cents: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          ticket_id?: string;
          inventory_item_id?: string;
          quantity_used?: number;
          unit_price_cents?: number;
          total_price_cents?: number;
          created_at?: string;
        };
      };

      // Payment Tables (P1.4)
      payments: {
        Row: {
          id: string;
          business_id: string;
          ticket_id: string | null;
          customer_id: string;
          amount_cents: number;
          status: PaymentStatus;
          payment_method: PaymentMethod;
          stripe_payment_intent_id: string | null;
          stripe_charge_id: string | null;
          receipt_url: string | null;
          refunded_amount_cents: number;
          metadata: Json | null;
          processed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          ticket_id?: string | null;
          customer_id: string;
          amount_cents: number;
          status?: PaymentStatus;
          payment_method: PaymentMethod;
          stripe_payment_intent_id?: string | null;
          stripe_charge_id?: string | null;
          receipt_url?: string | null;
          refunded_amount_cents?: number;
          metadata?: Json | null;
          processed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          ticket_id?: string | null;
          customer_id?: string;
          amount_cents?: number;
          status?: PaymentStatus;
          payment_method?: PaymentMethod;
          stripe_payment_intent_id?: string | null;
          stripe_charge_id?: string | null;
          receipt_url?: string | null;
          refunded_amount_cents?: number;
          metadata?: Json | null;
          processed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      sms_messages: {
        Row: {
          id: string;
          business_id: string;
          ticket_id: string | null;
          customer_id: string | null;
          direction: SmsDirection;
          from_number: string;
          to_number: string;
          body: string;
          status: SmsStatus;
          twilio_sid: string | null;
          error_message: string | null;
          sent_at: string | null;
          delivered_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          ticket_id?: string | null;
          customer_id?: string | null;
          direction: SmsDirection;
          from_number: string;
          to_number: string;
          body: string;
          status?: SmsStatus;
          twilio_sid?: string | null;
          error_message?: string | null;
          sent_at?: string | null;
          delivered_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          ticket_id?: string | null;
          customer_id?: string | null;
          direction?: SmsDirection;
          from_number?: string;
          to_number?: string;
          body?: string;
          status?: SmsStatus;
          twilio_sid?: string | null;
          error_message?: string | null;
          sent_at?: string | null;
          delivered_at?: string | null;
          created_at?: string;
        };
      };

      // AI Tables (P1.5)
      voice_calls: {
        Row: {
          id: string;
          business_id: string;
          ticket_id: string | null;
          customer_id: string | null;
          direction: VoiceCallDirection;
          from_number: string;
          to_number: string;
          status: VoiceCallStatus;
          duration_seconds: number;
          recording_url: string | null;
          transcription_text: string | null;
          ai_summary: string | null;
          twilio_sid: string | null;
          metadata: Json | null;
          started_at: string | null;
          ended_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          ticket_id?: string | null;
          customer_id?: string | null;
          direction: VoiceCallDirection;
          from_number: string;
          to_number: string;
          status?: VoiceCallStatus;
          duration_seconds?: number;
          recording_url?: string | null;
          transcription_text?: string | null;
          ai_summary?: string | null;
          twilio_sid?: string | null;
          metadata?: Json | null;
          started_at?: string | null;
          ended_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          ticket_id?: string | null;
          customer_id?: string | null;
          direction?: VoiceCallDirection;
          from_number?: string;
          to_number?: string;
          status?: VoiceCallStatus;
          duration_seconds?: number;
          recording_url?: string | null;
          transcription_text?: string | null;
          ai_summary?: string | null;
          twilio_sid?: string | null;
          metadata?: Json | null;
          started_at?: string | null;
          ended_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          business_id: string;
          customer_id: string | null;
          ticket_id: string | null;
          status: ConversationStatus;
          channel: string;
          metadata: Json | null;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          customer_id?: string | null;
          ticket_id?: string | null;
          status?: ConversationStatus;
          channel: string;
          metadata?: Json | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          customer_id?: string | null;
          ticket_id?: string | null;
          status?: ConversationStatus;
          channel?: string;
          metadata?: Json | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_assistant_configs: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          type: AiAssistantType;
          is_active: boolean;
          system_prompt: string;
          voice_settings: Json | null;
          behavior_settings: Json | null;
          knowledge_base: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          type: AiAssistantType;
          is_active?: boolean;
          system_prompt: string;
          voice_settings?: Json | null;
          behavior_settings?: Json | null;
          knowledge_base?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          type?: AiAssistantType;
          is_active?: boolean;
          system_prompt?: string;
          voice_settings?: Json | null;
          behavior_settings?: Json | null;
          knowledge_base?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      business_status: BusinessStatus;
      subscription_status: SubscriptionStatus;
      billing_period: BillingPeriod;
      industry: Industry;
      action_type: ActionType;
      invoice_status: InvoiceStatus;
      billing_reason: BillingReason;
      event_type: EventType;
      person_role: PersonRole;
      ticket_status: TicketStatus;
      ticket_priority: TicketPriority;
      ticket_source: TicketSource;
      customer_source: CustomerSource;
      customer_status: CustomerStatus;
      tag_type: TagType;
      estimate_status: EstimateStatus;
      payment_status: PaymentStatus;
      payment_method: PaymentMethod;
      sms_status: SmsStatus;
      sms_direction: SmsDirection;
      voice_call_status: VoiceCallStatus;
      voice_call_direction: VoiceCallDirection;
      conversation_status: ConversationStatus;
      ai_assistant_type: AiAssistantType;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
