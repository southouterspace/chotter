# Seed Data Documentation

## Overview

The Chotter seed data provides comprehensive, realistic test data for development and testing environments. It creates a complete multi-tenant scenario with three sample businesses across different industries, complete with users, customers, appointments, routes, and payment configurations.

## Running Seed Data

### Apply Seed Data

```bash
# Reset database and apply all migrations + seed data
supabase db reset

# Or manually run seed file
psql $DATABASE_URL -f supabase/seed.sql
```

### Important Notes

- **All seed data is marked with `{"is_test_data": true}`** in metadata fields for easy identification
- Seed data is idempotent - safe to run multiple times (uses `ON CONFLICT DO NOTHING`)
- Fixed UUIDs are used for key entities to allow cross-referencing in scripts

## Seed Data Structure

### 1. Subscription Tiers

Three pricing tiers with realistic features and limits:

| Tier | Price/Month | Features | Limits |
|------|-------------|----------|--------|
| **Starter** | $49 | Basic features | 100 appointments/mo, 1 admin, 3 techs |
| **Professional** | $149 | Payment + AI agent | 500 appointments/mo, 2 admins, 10 techs, 500 AI mins |
| **Enterprise** | $299 | All features + white-label | 2000 appointments/mo, 10 admins, 50 techs, 2000 AI mins |

**Fixed UUIDs:**
- Starter: `11111111-1111-1111-1111-111111111111`
- Professional: `22222222-2222-2222-2222-222222222222`
- Enterprise: `33333333-3333-3333-3333-333333333333`

### 2. Platform Settings

Configuration settings for SaaS operations:

- **Grace Period Config:** 10% overage threshold, 1 per year, 7 days duration
- **Trial Config:** 14 days default, reminder schedule (7, 3, 1 days before end)
- **AI Config:** Claude Sonnet 4 model, $0.15/minute pricing
- **Feature Flags:** Beta advanced routing (50% rollout), predictive maintenance (disabled)
- **Notification Templates:** Appointment confirmation, technician en route

### 3. Sample Businesses

#### Business 1: Acme HVAC (San Diego, CA)
- **ID:** `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa`
- **Industry:** HVAC
- **Status:** Active (Professional tier)
- **Contact:** admin@acmehvac.com, +1 (619) 555-1001
- **Business Hours:** Mon-Fri 8am-5pm, Sat 9am-2pm
- **Team:**
  - 1 Admin: Sarah Johnson
  - 3 Technicians: Mike Rodriguez (senior), David Chen, Lisa Martinez
  - 8 Customers across San Diego area
- **Services:** AC Repair ($89), AC Installation ($4,500), Heating Repair ($79), Maintenance ($49), Emergency ($199)
- **Features:** Payment processing enabled, AI booking agent active
- **Sample Data:** 8 tickets (3 completed, 3 scheduled, 2 pending), 2 routes, payment records

#### Business 2: Quick Fix Plumbing (Austin, TX)
- **ID:** `bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb`
- **Industry:** Plumbing
- **Status:** Trial (14 days, started 1 day ago)
- **Contact:** owner@quickfixplumbing.com, +1 (512) 555-2001
- **Business Hours:** Mon-Sat 7am-7pm
- **Team:**
  - 1 Admin: Tom Wilson
  - 2 Technicians: Carlos Garcia (senior), Emma Thompson
  - 6 Customers across Austin area
- **Services:** Drain Cleaning ($129), Leak Repair ($159), Water Heater Installation ($1,800), Emergency ($250), Fixture Installation ($229)
- **Features:** Trial period, no payment processing
- **Sample Data:** 4 tickets (1 completed, 2 scheduled, 1 pending emergency), 1 route

#### Business 3: Elite Electric (Miami, FL)
- **ID:** `cccccccc-cccc-cccc-cccc-cccccccccccc`
- **Industry:** Electrical
- **Status:** Active (Starter tier)
- **Contact:** contact@eliteelectric.com, +1 (305) 555-3001
- **Business Hours:** Mon-Fri 8am-6pm
- **Team:** Minimal (owner only - can be expanded for testing)
- **Features:** Basic tier, no advanced features

### 4. Persons & Users

#### Admins
- **Sarah Johnson** (Acme HVAC) - admin@acmehvac.com
- **Tom Wilson** (Quick Fix Plumbing) - owner@quickfixplumbing.com

#### Technicians

**Acme HVAC:**
- **Mike Rodriguez** (Senior HVAC Tech)
  - Skills: AC repair, heating, installation, maintenance, duct cleaning
  - Certifications: EPA 608 Universal, NATE Certified
  - Rate: $65/hour
  - Performance: 5.2 jobs/day avg, 4.8 rating, 96% on-time

- **David Chen** (Intermediate HVAC Tech)
  - Skills: AC repair, maintenance, basic installation
  - Certifications: EPA 608 Type II
  - Rate: $50/hour
  - Performance: 4.5 jobs/day avg, 4.6 rating, 92% on-time

- **Lisa Martinez** (HVAC Tech)
  - Skills: AC repair, maintenance, filter replacement
  - Certifications: EPA 608 Type I
  - Rate: $48/hour
  - Performance: 4.8 jobs/day avg, 4.7 rating, 94% on-time

**Quick Fix Plumbing:**
- **Carlos Garcia** (Master Plumber)
  - Skills: Drain cleaning, leak repair, water heater, pipe installation, emergency
  - Certifications: Master Plumber License, Backflow Prevention
  - Rate: $75/hour
  - Performance: 6.1 jobs/day avg, 4.9 rating, 95% on-time

- **Emma Thompson** (Journeyman Plumber)
  - Skills: Drain cleaning, leak repair, fixture installation
  - Certifications: Journeyman Plumber License
  - Rate: $55/hour
  - Performance: 5.3 jobs/day avg, 4.8 rating, 93% on-time

### 5. Customers with Geographic Data

#### Acme HVAC Customers (San Diego Area)
8 customers spread across different San Diego neighborhoods:
- Downtown (92101)
- La Jolla (92037)
- Chula Vista (91910)
- Point Loma (92106)
- Mission Valley (92108)
- Pacific Beach (92109)
- Hillcrest (92103)
- Coronado (92118)

All customers include:
- PostGIS geographic coordinates for proximity queries
- Realistic addresses and phone numbers
- Service history (1-5 appointments)
- Customer tags (VIP, Commercial, Residential, Priority, Recurring)

#### Quick Fix Plumbing Customers (Austin Area)
6 customers across Austin:
- Downtown (78701)
- North Austin (78758)
- East Austin (78702)
- South Austin (78704)
- West Austin (78746)
- Central Austin (78756)

### 6. Services

Each business has 4-5 service offerings with:
- Realistic pricing (stored in cents)
- Duration estimates and buffers
- Required skills for technician matching
- Service categories (Repair, Installation, Maintenance, Emergency)

### 7. Tickets (Appointments)

Tickets represent service appointments in various statuses:

#### Status Distribution
- **Completed:** Historical tickets (30-90 days ago) with ratings and reviews
- **Scheduled:** Future appointments (tomorrow, 2 days out) with assigned technicians
- **Pending:** Recent requests awaiting scheduling
- **Emergency:** High-priority urgent requests

#### Sample Ticket Data Includes
- Customer information and service details
- Time windows and scheduling preferences
- Assigned technician and route association
- Work notes, customer feedback, ratings
- Payment status and amounts
- AI booking attribution (some marked as AI-scheduled)

### 8. Routes

Daily optimized routes for technicians with:
- Planned routes for tomorrow
- Ticket sequences (ordered waypoints)
- Distance and duration estimates
- Start/end locations (technician home base)
- Optimization metadata (algorithm version, score)

### 9. Payment & AI Features (Professional Tier)

#### Payment Settings (Acme HVAC)
- Stripe Connect account configured (test mode)
- Payment processing enabled
- Accepted methods: Card, ACH, Apple Pay, Google Pay
- 7-day refund policy
- Pricing rules:
  - Weekend surcharge: +15%
  - After-hours fee: +$50

#### AI Agent (Acme HVAC)
- **Name:** Acme HVAC Booking Assistant
- **Phone:** +1 (619) 555-9999
- **Model:** Claude Sonnet 4
- **Features:**
  - Voice booking with natural conversation
  - Auto-assigns technicians
  - Sends confirmation SMS
  - Escalates to human for complex issues
- **Sample Conversation:** Included with transcript and sentiment analysis

#### Payment Records
- Sample completed payments with Stripe payment intents
- Captured amounts matching ticket totals
- Card payment methods with test data

## Test Data Markers

All seed data includes `{"is_test_data": true}` in metadata/settings fields for:
- Easy identification
- Automated cleanup scripts
- Filtering in production queries

## Geographic Queries

The seed data enables testing of geographic features:

```sql
-- Find customers within 5km of downtown San Diego
SELECT * FROM customers
WHERE business_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
AND ST_DWithin(
  location,
  ST_SetSRID(ST_MakePoint(-117.1611, 32.7157), 4326)::geography,
  5000
);

-- Find nearest technician to a customer
SELECT t.*, p.first_name, p.last_name,
       ST_Distance(t.current_location, c.location) as distance_meters
FROM technicians t
JOIN persons p ON t.person_id = p.id
JOIN customers c ON c.id = 'customer-id-here'
WHERE t.business_id = c.business_id
ORDER BY t.current_location <-> c.location
LIMIT 1;
```

## Usage Scenarios

### Development
- Test multi-tenant isolation
- Verify RLS policies work correctly
- Test geographic queries and routing
- Develop dashboard UI with realistic data

### Testing
- Integration tests with consistent data
- Test payment processing workflows
- Verify AI booking agent integration
- Test notification and communication flows

### Demo
- Show complete business workflows
- Demonstrate different subscription tiers
- Present geographic routing features
- Showcase AI booking capabilities

## Cleanup

To remove seed data and start fresh:

```bash
# Reset database (removes all data, reapplies migrations)
supabase db reset

# Or target cleanup (if you want to keep migrations)
DELETE FROM businesses WHERE settings->>'is_test_data' = 'true';
DELETE FROM platform_settings WHERE setting_value->>'is_test_data' = 'true';
```

## Extending Seed Data

To add more test data:

1. **Follow existing patterns** - Use consistent naming and structure
2. **Use fixed UUIDs** - For entities you'll reference in tests
3. **Add test markers** - Include `{"is_test_data": true}` in metadata
4. **Maintain geography** - Use realistic coordinates for each city
5. **Update documentation** - Document new seed data here

## Known IDs for Testing

### Businesses
- Acme HVAC: `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa`
- Quick Fix Plumbing: `bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb`
- Elite Electric: `cccccccc-cccc-cccc-cccc-cccccccccccc`

### Subscription Tiers
- Starter: `11111111-1111-1111-1111-111111111111`
- Professional: `22222222-2222-2222-2222-222222222222`
- Enterprise: `33333333-3333-3333-3333-333333333333`

### Persons (for quick lookup)
- Sarah Johnson (Acme Admin): `a0000000-0000-0000-0000-000000000001`
- Mike Rodriguez (Acme Tech): `a0000000-0000-0000-0000-000000000002`
- David Chen (Acme Tech): `a0000000-0000-0000-0000-000000000003`
- Lisa Martinez (Acme Tech): `a0000000-0000-0000-0000-000000000004`
- Tom Wilson (Quick Fix Admin): `b0000000-0000-0000-0000-000000000001`
- Carlos Garcia (Quick Fix Tech): `b0000000-0000-0000-0000-000000000002`
- Emma Thompson (Quick Fix Tech): `b0000000-0000-0000-0000-000000000003`

### Customers (first 3 per business)
- Acme customers: `a1000000-0000-0000-0000-00000000000X`
- Quick Fix customers: `b1000000-0000-0000-0000-00000000000X`

## Contact

For questions about seed data or to request additional test scenarios, contact the database-architect agent.
