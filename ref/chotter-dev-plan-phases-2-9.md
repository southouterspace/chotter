# Chotter Development Plan - Phases 2-9

**Continuation of Master Development Plan**

This document contains the detailed task breakdowns for Phases 2-9. Reference the main plan at `chotter-dev-plan.md` for:

- Overview & Principles
- Monorepo Structure
- Git Strategy
- Quality Gates
- Phase 0 & Phase 1

---

## Phase 2: Admin Dashboard (Weeks 3-4)

**Duration:** 2 weeks
**Goal:** Build React admin dashboard with scheduling, customer/technician management, and live tracking
**Branch:** `phase-2-admin-dashboard`
**Primary Agents:** `frontend-developer`, `backend-architect`

### Overview

The admin dashboard is the primary interface for business owners and dispatchers to manage their entire field service operation. It provides:

- Real-time scheduling and dispatch
- Customer and technician management
- Live technician tracking on map
- Service type configuration
- Basic analytics

**Architecture:**

- React + Vite + TypeScript
- Direct Supabase queries with RLS (60% of operations)
- Hono API for complex operations (40%)
- Tailwind CSS + @chotter/ui components
- React Router for navigation
- Tanstack Query for data fetching
- Zustand for state management

---

### Tasks

#### P2.1: Initialize Admin Dashboard App

**Primary Agent:** `frontend-developer`
**Supporting:** `dx-optimizer`

**Description:**
Set up React + Vite app with routing, authentication, and layout structure.

**Steps:**

1. Initialize `apps/web-admin` with Vite + React + TypeScript
2. Install dependencies: React Router, Tanstack Query, Zustand, Tailwind CSS
3. Configure Tailwind with @chotter/ui theme
4. Set up React Router with route structure
5. Create auth context with Supabase Auth
6. Create protected route wrapper
7. Create main layout component (sidebar, header, content area)

**Files to Create:**

- `/apps/web-admin/src/main.tsx`
- `/apps/web-admin/src/App.tsx`
- `/apps/web-admin/src/routes.tsx`
- `/apps/web-admin/src/contexts/AuthContext.tsx`
- `/apps/web-admin/src/components/Layout.tsx`
- `/apps/web-admin/src/components/ProtectedRoute.tsx`
- `/apps/web-admin/tailwind.config.js`
- `/apps/web-admin/vite.config.ts`

**Route Structure:**

```
/login
/dashboard (protected)
/schedule (protected)
/customers (protected)
/technicians (protected)
/services (protected)
/routes (protected)
/settings (protected)
```

**Acceptance Criteria:**

- [x] App runs with `bun run dev`
- [x] Can log in with Supabase Auth
- [x] Protected routes redirect to login
- [x] Layout renders with sidebar navigation
- [x] Tailwind CSS working
- [x] Type-safe routing
- [x] shadcn/ui components integrated
- [x] Vercel project created and linked

**Dependencies:** P1.9 (UI components), P1.7 (database types), P1.8 (auth)

**Validation:**

```bash
cd apps/web-admin && bun run dev
# Navigate to http://localhost:5173
# Test login flow
```

**Estimated Time:** 6 hours

---

#### P2.2: Dashboard Overview Page

**Primary Agent:** `frontend-developer`

**Description:**
Create main dashboard page with today's overview: appointment count, active techs, completion rate, live map.

**Steps:**

1. Create Dashboard page component
2. Fetch today's statistics via Supabase
3. Create stats widgets (appointments, techs, completion rate)
4. Add recent activity feed
5. Integrate Mapbox for live tech locations

**Files to Create:**

- `/apps/web-admin/src/pages/Dashboard.tsx`
- `/apps/web-admin/src/components/StatsWidget.tsx`
- `/apps/web-admin/src/components/LiveMap.tsx`
- `/apps/web-admin/src/hooks/useTodayStats.ts`

**Supabase Queries:**

```typescript
// Get today's appointments
const { data: appointments } = await supabase
  .from('tickets')
  .select('*')
  .eq('business_id', businessId)
  .eq('scheduled_date', today)
  .in('status', ['scheduled', 'en_route', 'in_progress']);

// Get active technicians with current location
const { data: technicians } = await supabase
  .from('technicians')
  .select('*, person:persons(*)')
  .eq('business_id', businessId)
  .eq('active', true);
```

**Acceptance Criteria:**

- [x] Stats widgets display correct counts
- [x] Live map shows technician locations
- [x] Activity feed shows recent updates
- [x] Real-time updates via Supabase Realtime
- [x] Responsive design
- [x] Google Maps integration with @vis.gl/react-google-maps
- [x] Color-coded technician markers
- [x] Interactive info windows
- [x] Loading states with skeletons

**Dependencies:** P2.1

**Validation:**

```bash
# Verify stats match database
# Verify map shows tech locations
# Verify realtime updates work
```

**Estimated Time:** 8 hours

---

#### P2.3: Schedule Calendar View

**Primary Agent:** `frontend-developer`
**Supporting:** `backend-architect`

**Description:**
Build calendar view for viewing and managing appointments across days/weeks.

**Steps:**

1. Install calendar library (FullCalendar or react-big-calendar)
2. Create Schedule page with calendar
3. Fetch appointments from Supabase
4. Display appointments on calendar (color-coded by status)
5. Add filters (technician, service type, status)
6. Add day/week/month views

**Files to Create:**

- `/apps/web-admin/src/pages/Schedule.tsx`
- `/apps/web-admin/src/components/AppointmentCalendar.tsx`
- `/apps/web-admin/src/hooks/useAppointments.ts`

**Acceptance Criteria:**

- [x] Calendar displays appointments
- [x] Can switch between day/week/month views
- [x] Appointments color-coded by status
- [x] Filters work correctly
- [x] Click appointment to view details

**Dependencies:** P2.2

**Validation:**

```bash
# Create test appointments
# Verify they appear on calendar
# Test filters
```

**Estimated Time:** 10 hours

---

#### P2.4: Create/Edit Appointment Modal

**Primary Agent:** `frontend-developer`
**Supporting:** `backend-architect`

**Description:**
Build modal for creating and editing appointments with customer selection, service selection, technician assignment, and time slot selection.

**Steps:**

1. Create AppointmentModal component
2. Add customer search/select (autocomplete)
3. Add service selection dropdown
4. Add technician selection (filtered by skills)
5. Add date and time selection
6. Implement form validation (Zod)
7. Submit to Supabase via direct insert/update

**Files to Create:**

- `/apps/web-admin/src/components/AppointmentModal.tsx`
- `/apps/web-admin/src/components/CustomerSearch.tsx`
- `/apps/web-admin/src/hooks/useCreateAppointment.ts`
- `/apps/web-admin/src/lib/validation/appointment.ts`

**Validation Schema:**

```typescript
import { z } from 'zod';

export const appointmentSchema = z.object({
  customer_id: z.string().uuid(),
  service_id: z.string().uuid(),
  assigned_technician_id: z.string().uuid().optional(),
  scheduled_date: z.date(),
  time_window_start: z.string().regex(/^\d{2}:\d{2}$/),
  time_window_end: z.string().regex(/^\d{2}:\d{2}$/),
  priority: z.enum(['emergency', 'urgent', 'normal', 'low']),
  customer_notes: z.string().optional(),
});
```

**Acceptance Criteria:**

- [x] Can create new appointment
- [x] Can edit existing appointment
- [x] Form validation works
- [x] Customer search autocomplete works
- [x] Technician filtered by service skills
- [x] Appointment appears on calendar after creation

**Dependencies:** P2.3

**Validation:**

```bash
# Create appointment via modal
# Verify in database
# Edit appointment
# Verify changes saved
```

**Estimated Time:** 12 hours

---

#### P2.5: Customer Management (List & CRUD)

**Primary Agent:** `frontend-developer`

**Description:**
Build customer management page with list view, search, and create/edit customer forms.

**Steps:**

1. Create Customers page with table/list view
2. Add search and filters
3. Create CustomerForm component
4. Implement address geocoding (Mapbox Geocoding API)
5. Add pagination
6. Add customer details view with appointment history

**Files to Create:**

- `/apps/web-admin/src/pages/Customers.tsx`
- `/apps/web-admin/src/components/CustomerTable.tsx`
- `/apps/web-admin/src/components/CustomerForm.tsx`
- `/apps/web-admin/src/components/CustomerDetail.tsx`
- `/apps/web-admin/src/hooks/useCustomers.ts`
- `/apps/web-admin/src/hooks/useGeocoding.ts`

**Geocoding Integration:**

```typescript
// Hono API endpoint
app.post('/api/geocode', async (c) => {
  const { address } = await c.req.json();
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}`
  );
  const data = await response.json();
  return c.json({
    coordinates: data.features[0]?.geometry.coordinates,
    formatted_address: data.features[0]?.place_name,
  });
});
```

**Acceptance Criteria:**

- [x] Customer list displays all customers
- [x] Search works (name, phone, email)
- [x] Can create new customer
- [x] Address geocodes to coordinates
- [x] Can edit customer
- [x] Can view customer appointment history
- [x] Pagination works

**Dependencies:** P2.4

**Validation:**

```bash
# Create customer
# Verify geocoding worked (check location field)
# Search for customer
# View customer details
```

**Estimated Time:** 10 hours

---

#### P2.6: Technician Management (List & CRUD)

**Primary Agent:** `frontend-developer`

**Description:**
Build technician management page with list, create/edit forms, skills/certifications, and schedule configuration.

**Steps:**

1. Create Technicians page with list view
2. Create TechnicianForm component
3. Add skills management (multi-select tags)
4. Add certifications management (array of cert objects)
5. Add working hours configuration (per day schedule)
6. Add on-call schedule builder
7. Display technician metrics

**Files to Create:**

- `/apps/web-admin/src/pages/Technicians.tsx`
- `/apps/web-admin/src/components/TechnicianTable.tsx`
- `/apps/web-admin/src/components/TechnicianForm.tsx`
- `/apps/web-admin/src/components/SkillsInput.tsx`
- `/apps/web-admin/src/components/WorkingHoursEditor.tsx`
- `/apps/web-admin/src/hooks/useTechnicians.ts`

**Working Hours Editor:**

```typescript
interface WorkingHours {
  [day: string]: {
    start: string; // "08:00"
    end: string; // "17:00"
    breaks: Array<{ start: string; end: string }>;
  };
}
```

**Acceptance Criteria:**

- [x] Technician list displays all techs
- [x] Can create new technician
- [x] Skills saved as array in technician_tags table
- [ ] Certifications saved as array in technician_tags table (not implemented)
- [x] Working hours editor saves schedule to technician_availability table
- [ ] Can view technician performance metrics (not implemented)

**Dependencies:** P2.5

**Validation:**

```bash
# Create technician with skills
# Verify skills stored as JSONB
# Set working hours
# View metrics
```

**Estimated Time:** 12 hours

---

#### P2.7: Service Type Configuration

**Primary Agent:** `frontend-developer`

**Description:**
Build service type management page for creating and configuring bookable services.

**Steps:**

1. Create Services page with list view
2. Create ServiceForm component
3. Add pricing configuration (base price)
4. Add duration settings
5. Add required skills selection
6. Add active/inactive toggle
7. Add display order sorting (drag-and-drop)

**Files to Create:**

- `/apps/web-admin/src/pages/Services.tsx`
- `/apps/web-admin/src/components/ServiceTable.tsx`
- `/apps/web-admin/src/components/ServiceForm.tsx`
- `/apps/web-admin/src/hooks/useServices.ts`

**Acceptance Criteria:**

- [x] Service list displays all services
- [x] Can create new service with pricing
- [x] Required skills multi-select works
- [ ] Can reorder services via drag-and-drop (not implemented)
- [x] Active/inactive toggle works

**Dependencies:** P2.6

**Validation:**

```bash
# Create service
# Set required skills
# Reorder services
# Verify order saved
```

**Estimated Time:** 8 hours

---

#### P2.8: Live Technician Tracking Map

**Primary Agent:** `frontend-developer`
**Supporting:** `backend-architect`

**Description:**
Build live map view showing all active technician locations with real-time updates.

**Steps:**

1. Create Routes page with full-screen map
2. Integrate Mapbox GL JS
3. Fetch technician locations via Supabase
4. Subscribe to real-time location updates (Supabase Realtime)
5. Display tech markers on map with status
6. Show route polylines
7. Add tech info popup on marker click

**Files to Create:**

- `/apps/web-admin/src/pages/Routes.tsx`
- `/apps/web-admin/src/components/TechnicianMap.tsx`
- `/apps/web-admin/src/hooks/useTechnicianLocations.ts`

**Realtime Subscription:**

```typescript
const subscription = supabase
  .channel('location_updates')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'technicians',
      filter: `business_id=eq.${businessId}`,
    },
    (payload) => {
      updateTechnicianLocation(payload.new);
    }
  )
  .subscribe();
```

**Acceptance Criteria:**

- [ ] **MISSING: Dedicated live tracking page/route** - TechnicianMap component exists but not integrated as standalone page
- [x] Map component created (TechnicianMap.tsx) with technician markers
- [x] Real-time location updates work (useTechnicianLocations.ts with Realtime subscription)
- [x] Route polylines display correctly (RoutePolyline component in TechnicianMap.tsx)
- [x] Marker click shows tech info (TechnicianInfoWindow component)
- [ ] Map performance acceptable with 10+ techs (needs testing)
- [ ] **NOTE:** RoutesPage is for route management (P2.9), not live tracking. LiveTrackingPage.tsx was created but not integrated into routing.

**Dependencies:** P2.7

**Validation:**

```bash
# Open map
# Start mobile app and move technician
# Verify map updates in real-time
```

**Estimated Time:** 12 hours

---

#### P2.9: Route Visualization & Management

**Primary Agent:** `frontend-developer`
**Supporting:** `backend-architect`

**Description:**
Build route visualization showing daily routes for each technician with appointment sequence.

**Steps:**

1. Add route list view to Routes page
2. Display route details (sequence, distance, duration)
3. Add drag-and-drop reordering for manual route optimization
4. Add "Optimize Route" button (calls API)
5. Show before/after metrics

**Files to Create:**

- `/apps/web-admin/src/components/RouteList.tsx`
- `/apps/web-admin/src/components/RouteDetail.tsx`
- `/apps/web-admin/src/components/RouteReorderableList.tsx`
- `/apps/web-admin/src/hooks/useRoutes.ts`

**API Endpoint:**

```typescript
// POST /api/routes/:routeId/optimize
app.post('/api/routes/:routeId/optimize', async (c) => {
  const routeId = c.req.param('routeId');
  // Trigger route optimization worker
  // Return optimized sequence
});
```

**Acceptance Criteria:**

- [x] Route list shows all today's routes (RouteList.tsx)
- [x] Can reorder appointments via drag-and-drop (RouteReorderableList.tsx with @dnd-kit)
- [x] Manual reorder saves to database (implemented in RouteReorderableList)
- [ ] **MISSING: "Optimize Route" button** - useRouteOptimization.ts hook exists but not integrated in RouteDetail.tsx
- [ ] **MISSING: API endpoint POST /api/routes/:routeId/optimize** - Backend optimization not implemented
- [ ] **MISSING: Shows distance/time savings** - Metrics display not implemented

**Dependencies:** P2.8

**Validation:**

```bash
# View route
# Reorder appointments manually
# Click "Optimize Route"
# Verify optimized sequence returned
```

**Estimated Time:** 10 hours

---

#### P2.10: Basic Settings Page

**Primary Agent:** `frontend-developer`

**Description:**
Build settings page for business information, operating hours, and user management.

**Steps:**

1. Create Settings page with tabs
2. Add Business Information tab (name, address, contact info)
3. Add Operating Hours tab (schedule editor)
4. Add Users tab (list admins/techs with role management)
5. Implement form validation and save

**Files to Create:**

- `/apps/web-admin/src/pages/Settings.tsx`
- `/apps/web-admin/src/components/BusinessInfoForm.tsx`
- `/apps/web-admin/src/components/OperatingHoursEditor.tsx`
- `/apps/web-admin/src/components/UserManagement.tsx`

**Acceptance Criteria:**

- [x] Business info editable and saves (BusinessInfoForm.tsx implemented)
- [x] Operating hours editor works (OperatingHoursEditor.tsx implemented)
- [x] Can invite new admin users (UserManagement.tsx with invite dialog + useInviteAdmin hook)
- [x] Can view all users with roles (UserManagement.tsx displays users with role badges)

**Dependencies:** P2.9

**Validation:**

```bash
# Edit business info
# Verify saved to database
# Set operating hours
# Invite admin user
```

**Estimated Time:** 8 hours

---

#### P2.11: Admin Dashboard E2E Tests

**Primary Agent:** `test-automator`
**Supporting:** `frontend-developer`

**Description:**
Create E2E test suite for admin dashboard critical flows using Playwright.

**Steps:**

1. Set up Playwright
2. Create test for login flow
3. Create test for creating appointment
4. Create test for creating customer
5. Create test for creating technician
6. Create test for creating service
7. Create test for viewing dashboard

**Files to Create:**

- `/apps/web-admin/e2e/auth.spec.ts`
- `/apps/web-admin/e2e/appointments.spec.ts`
- `/apps/web-admin/e2e/customers.spec.ts`
- `/apps/web-admin/e2e/technicians.spec.ts`
- `/apps/web-admin/playwright.config.ts`

**Example Test:**

```typescript
import { test, expect } from '@playwright/test';

test('create appointment flow', async ({ page }) => {
  await page.goto('/schedule');
  await page.click('button:has-text("New Appointment")');

  // Fill form
  await page.fill('[name="customer"]', 'John Doe');
  await page.selectOption('[name="service"]', 'Oil Change');
  await page.fill('[name="scheduled_date"]', '2025-10-20');

  await page.click('button:has-text("Create")');

  // Verify appointment created
  await expect(page.locator('.calendar')).toContainText('John Doe');
});
```

**Acceptance Criteria:**

- [x] All E2E tests pass
- [x] Tests cover critical user flows
- [x] Tests run in CI pipeline (GitHub Actions configured)
- [x] Test coverage > 80% of user journeys

**Dependencies:** P2.10

**Validation:**

```bash
cd apps/web-admin && bun run test:e2e
```

**Estimated Time:** 10 hours

---

#### P2.12: Deploy Admin Dashboard to Staging

**Primary Agent:** `deployment-engineer`
**Supporting:** `debugger`

**Description:**
Deploy admin dashboard to Vercel staging environment and verify all features work.

**Steps:**

1. Configure Vercel project for web-admin
2. Set environment variables
3. Deploy to staging
4. Run smoke tests
5. Verify Supabase connection
6. Test all critical flows

**Acceptance Criteria:**

- [x] Deployed to Vercel staging
- [x] Environment variables set correctly
- [x] Can log in
- [x] All pages load
- [x] Can create appointment
- [x] Maps work correctly

**Dependencies:** P2.11

**Validation:**

```bash
vercel deploy --prod
# Open staging URL
# Run smoke tests
```

**Estimated Time:** 3 hours

---

### Phase 2 Summary

**Total Tasks:** 12
**Estimated Duration:** 2 weeks (96 hours)
**Actual Duration:** ~4 days (October 17-20, 2025)
**Completion Criteria:**

- [x] Admin dashboard deployed and accessible
- [x] Can manage customers, technicians, services
- [x] Can create and view appointments
- [x] Live map shows technician locations
- [x] Route management works
- [x] Settings page functional
- [x] E2E tests pass
- [x] Deployed to staging (Vercel)

**Phase 2 Status:** ✅ 100% COMPLETE

**Next Phase:** Phase 3 - Technician Mobile App (Expo, Location Tracking, Offline Support)

---

## Phase 3: Technician Mobile App (Weeks 5-7)

**Duration:** 3 weeks
**Goal:** Build Expo mobile app for technicians with route viewing, navigation, location tracking, and job management
**Branch:** `phase-3-mobile-app`
**Primary Agent:** `mobile-developer`

### Overview

The technician mobile app is the primary interface for field technicians to:

- View their daily route and appointments
- Navigate to job sites
- Check in/out of appointments
- Update appointment status
- View customer information and notes
- Upload photos (future phase)

**Tech Stack:**

- Expo (React Native)
- TypeScript
- React Navigation
- Expo Location (background tracking)
- Expo Notifications (push notifications)
- Mapbox Maps SDK
- Tanstack Query (data fetching)
- Zustand (state management)
- Direct Supabase access with RLS

---

### Tasks

#### P3.1: Initialize Expo Mobile App

**Primary Agent:** `mobile-developer`

**Description:**
Set up Expo app with TypeScript, navigation, authentication, and basic structure.

**Steps:**

1. Initialize `apps/mobile-tech` with Expo
2. Install dependencies: React Navigation, Expo modules
3. Configure TypeScript
4. Set up navigation structure (stack + bottom tabs)
5. Create auth flow (login screen)
6. Integrate Supabase Auth
7. Configure app.json and eas.json

**Files to Create:**

- `/apps/mobile-tech/App.tsx`
- `/apps/mobile-tech/app.json`
- `/apps/mobile-tech/eas.json`
- `/apps/mobile-tech/src/navigation/RootNavigator.tsx`
- `/apps/mobile-tech/src/screens/LoginScreen.tsx`
- `/apps/mobile-tech/src/contexts/AuthContext.tsx`

**Navigation Structure:**

```
AuthStack (if not logged in)
  - Login

MainStack (if logged in)
  - Tabs
    - Today (route/appointments)
    - Profile
```

**Acceptance Criteria:**

- [ ] App runs on iOS simulator (`bun run ios`)
- [ ] App runs on Android emulator (`bun run android`)
- [ ] Can log in with email/password
- [ ] Navigation works
- [ ] Auth persists (AsyncStorage)

**Dependencies:** P1.8 (auth setup)

**Validation:**

```bash
cd apps/mobile-tech
bun run ios
# Test login
# Verify navigation
```

**Estimated Time:** 8 hours

---

#### P3.2: Today's Route Screen

**Primary Agent:** `mobile-developer`

**Description:**
Build main screen showing today's route with appointment list and navigation.

**Steps:**

1. Create TodayScreen with appointment list
2. Fetch today's route from Supabase
3. Display appointments in order
4. Show current appointment highlighted
5. Add "Navigate" button for each appointment
6. Show route summary (total stops, estimated completion)

**Files to Create:**

- `/apps/mobile-tech/src/screens/TodayScreen.tsx`
- `/apps/mobile-tech/src/components/AppointmentCard.tsx`
- `/apps/mobile-tech/src/hooks/useTodayRoute.ts`

**Supabase Query:**

```typescript
const { data: route } = await supabase
  .from('routes')
  .select(
    `
    *,
    tickets (
      *,
      customer:customers (
        *,
        person:persons (*)
      ),
      service:services (*)
    )
  `
  )
  .eq('technician_id', technicianId)
  .eq('date', today)
  .single();
```

**Acceptance Criteria:**

- [ ] Route displays all appointments in order
- [ ] Current appointment highlighted
- [ ] Route summary shows total stops
- [ ] Swipe to refresh works

**Dependencies:** P3.1

**Validation:**

```bash
# Create test route in database
# Open app
# Verify route displays
```

**Estimated Time:** 8 hours

---

#### P3.3: Appointment Detail Screen

**Primary Agent:** `mobile-developer`

**Description:**
Build appointment detail screen with customer info, service details, and action buttons.

**Steps:**

1. Create AppointmentDetailScreen
2. Display customer information (name, phone, address)
3. Display service information (type, duration, notes)
4. Add "Call Customer" button (opens phone dialer)
5. Add "Navigate" button (opens Maps app)
6. Add "Check In" button
7. Add "Complete Job" button

**Files to Create:**

- `/apps/mobile-tech/src/screens/AppointmentDetailScreen.tsx`
- `/apps/mobile-tech/src/components/CustomerInfoCard.tsx`
- `/apps/mobile-tech/src/components/ActionButtons.tsx`

**Deep Linking to Maps:**

```typescript
import * as Linking from 'expo-linking';

const openNavigation = (address: string) => {
  const url = Platform.select({
    ios: `maps://app?daddr=${encodeURIComponent(address)}`,
    android: `google.navigation:q=${encodeURIComponent(address)}`,
  });
  Linking.openURL(url);
};
```

**Acceptance Criteria:**

- [ ] Customer info displays correctly
- [ ] "Call Customer" opens phone app
- [ ] "Navigate" opens Maps with destination
- [ ] Buttons enabled/disabled based on status

**Dependencies:** P3.2

**Validation:**

```bash
# Click appointment
# Verify details display
# Test navigation button
# Test call button
```

**Estimated Time:** 6 hours

---

#### P3.4: Location Tracking Setup

**Primary Agent:** `mobile-developer`
**Supporting:** `backend-architect`

**Description:**
Implement background location tracking for real-time technician position updates.

**Steps:**

1. Install and configure Expo Location
2. Request location permissions
3. Set up background location task
4. Update technician location in Supabase every 30 seconds
5. Handle battery optimization
6. Add location accuracy settings

**Files to Create:**

- `/apps/mobile-tech/src/services/location.ts`
- `/apps/mobile-tech/src/hooks/useLocationTracking.ts`

**Background Location Task:**

```typescript
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error(error);
    return;
  }
  if (data) {
    const { locations } = data as any;
    const location = locations[0];

    // Update technician location in Supabase
    await supabase
      .from('technicians')
      .update({
        current_location: `POINT(${location.coords.longitude} ${location.coords.latitude})`,
        current_location_updated_at: new Date().toISOString(),
      })
      .eq('person_id', technicianPersonId);
  }
});

export async function startLocationTracking() {
  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: 30000, // 30 seconds
    distanceInterval: 50, // 50 meters
    foregroundService: {
      notificationTitle: 'Chotter is tracking your location',
      notificationBody: 'Location updates active for route optimization',
    },
  });
}
```

**Acceptance Criteria:**

- [ ] Location permissions requested
- [ ] Background tracking starts when on route
- [ ] Location updates every 30 seconds
- [ ] Admin dashboard sees real-time updates
- [ ] Battery impact acceptable

**Dependencies:** P3.3, P2.8 (admin map)

**Validation:**

```bash
# Start location tracking
# Check admin dashboard map
# Verify tech marker moves
```

**Estimated Time:** 10 hours

---

#### P3.5: Geofencing for Arrival Detection

**Primary Agent:** `mobile-developer`
**Supporting:** `backend-architect`

**Description:**
Implement geofencing to automatically detect when technician arrives at job site.

**Steps:**

1. Set up geofencing with Expo Location
2. Create geofence around each appointment location (1-mile radius)
3. Trigger notification when entering geofence
4. Auto-update appointment status to "en_route" when approaching
5. Auto-update to "arrived" when entering geofence
6. Create geofence event record in database

**Files to Create:**

- `/apps/mobile-tech/src/services/geofencing.ts`
- `/apps/mobile-tech/src/hooks/useGeofencing.ts`

**Geofencing Setup:**

```typescript
await Location.startGeofencingAsync(
  'geofence-task',
  route.tickets.map((ticket) => ({
    identifier: ticket.id,
    latitude: ticket.customer.location.coordinates[1],
    longitude: ticket.customer.location.coordinates[0],
    radius: 1609, // 1 mile in meters
    notifyOnEnter: true,
    notifyOnExit: true,
  }))
);
```

**Acceptance Criteria:**

- [ ] Geofences created for all appointments
- [ ] "Approaching" notification when 1 mile away
- [ ] "Arrived" status when at location
- [ ] Geofence events logged to database
- [ ] Customer receives "tech arriving soon" notification

**Dependencies:** P3.4

**Validation:**

```bash
# Navigate to appointment location
# Verify "approaching" triggers at 1 mile
# Verify "arrived" triggers at location
```

**Estimated Time:** 8 hours

---

#### P3.6: Check-In / Check-Out Flow

**Primary Agent:** `mobile-developer`

**Description:**
Implement check-in and check-out functionality with location verification and status updates.

**Steps:**

1. Add "Check In" button on appointment detail
2. Verify technician is at job site (within 500m)
3. Update appointment status to "in_progress"
4. Record check-in time and location
5. Add "Complete Job" button
6. Update status to "completed" on check-out
7. Record check-out time and location

**Files to Create:**

- `/apps/mobile-tech/src/components/CheckInButton.tsx`
- `/apps/mobile-tech/src/components/CompleteJobButton.tsx`
- `/apps/mobile-tech/src/hooks/useCheckIn.ts`

**Location Verification:**

```typescript
const verifyLocation = async (appointmentLocation: Point) => {
  const currentLocation = await Location.getCurrentPositionAsync();
  const distance = calculateDistance(currentLocation.coords, appointmentLocation.coordinates);

  if (distance > 500) {
    // 500 meters
    Alert.alert('Too Far From Job Site', 'You must be within 500 meters to check in.');
    return false;
  }
  return true;
};
```

**Acceptance Criteria:**

- [x] Check-in requires location proximity
- [x] Check-in updates status to "in_progress"
- [x] Check-in location recorded
- [x] Complete job updates status to "completed"
- [x] Check-out location recorded
- [x] Times recorded accurately

**Dependencies:** P3.5

**Validation:**

```bash
# Navigate to job site
# Check in (should succeed)
# Move away and try to check in (should fail)
# Complete job
# Verify status updated
```

**Estimated Time:** 8 hours

---

#### P3.7: Push Notifications Setup

**Primary Agent:** `mobile-developer`
**Supporting:** `backend-architect`

**Description:**
Set up push notifications for route updates, delays, and new appointments.

**Steps:**

1. Configure Expo Notifications
2. Request notification permissions
3. Register device token with Supabase (store in technician record)
4. Create notification handler
5. Handle notification when app in foreground/background
6. Add notification settings

**Files to Create:**

- `/apps/mobile-tech/src/services/notifications.ts`
- `/apps/mobile-tech/src/hooks/useNotifications.ts`

**Register Device Token:**

```typescript
import * as Notifications from 'expo-notifications';

export async function registerForPushNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    return;
  }

  const token = await Notifications.getExpoPushTokenAsync();

  // Save token to technician record
  await supabase
    .from('technicians')
    .update({ push_token: token.data })
    .eq('person_id', technicianPersonId);
}
```

**Notification Types:**

- Route updated
- New appointment added
- Appointment cancelled
- Delay alert
- Emergency request

**Acceptance Criteria:**

- [x] Notifications requested on first launch
- [x] Device token saved to database
- [x] Notifications received when app in background
- [x] Notifications displayed when app in foreground
- [x] Tapping notification opens relevant screen
- [x] Settings toggle for notifications
- [x] Android notification channels configured

**Dependencies:** P3.6

**Validation:**

```bash
# Send test notification from admin dashboard
# Verify received on device
# Tap notification, verify navigation
```

**Estimated Time:** 6 hours

---

#### P3.8: Offline Support (Basic)

**Primary Agent:** `mobile-developer`

**Description:**
Implement basic offline support for viewing appointments and caching data.

**Steps:**

1. Set up Tanstack Query with persistent cache
2. Cache today's route on app load
3. Enable offline viewing of appointments
4. Queue status updates when offline
5. Sync queued updates when connection restored
6. Show offline indicator in UI

**Files to Create:**

- `/apps/mobile-tech/src/lib/queryClient.ts`
- `/apps/mobile-tech/src/hooks/useOfflineSync.ts`
- `/apps/mobile-tech/src/components/OfflineIndicator.tsx`

**Offline Queue:**

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const OFFLINE_QUEUE_KEY = 'offline_queue';

export async function queueUpdate(update: any) {
  const queue = await getQueue();
  queue.push(update);
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

export async function syncQueue() {
  const queue = await getQueue();
  for (const update of queue) {
    await supabase.from(update.table).update(update.data).eq('id', update.id);
  }
  await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
}
```

**Acceptance Criteria:**

- [x] Can view appointments offline
- [x] Status updates queued when offline
- [x] Queued updates sync when online
- [x] Offline indicator displays
- [x] No crashes when offline
- [x] Data persists between app restarts
- [x] Network state changes handled gracefully

**Dependencies:** P3.7

**Validation:**

```bash
# Turn off WiFi and cellular
# View appointments (should work)
# Check in (should queue)
# Turn on connection
# Verify update synced
```

**Estimated Time:** 8 hours

---

#### P3.9: Profile & Settings Screen

**Primary Agent:** `mobile-developer`

**Description:**
Build profile screen showing technician info, stats, and app settings.

**Steps:**

1. Create ProfileScreen
2. Display technician information (name, photo, skills)
3. Show today's stats (appointments completed, on-time percentage)
4. Add app settings (notifications, location tracking)
5. Add logout button

**Files to Create:**

- `/apps/mobile-tech/src/screens/ProfileScreen.tsx`
- `/apps/mobile-tech/src/components/TechStats.tsx`
- `/apps/mobile-tech/src/components/AppSettings.tsx`

**Acceptance Criteria:**

- [ ] Profile displays tech info
- [ ] Stats show today's metrics
- [ ] Can toggle notifications on/off
- [ ] Can toggle location tracking on/off
- [ ] Logout works

**Dependencies:** P3.8

**Validation:**

```bash
# Open profile
# Verify stats display
# Toggle settings
# Logout, verify returns to login
```

**Estimated Time:** 6 hours

---

#### P3.10: Mobile App E2E Tests

**Primary Agent:** `test-automator`
**Supporting:** `mobile-developer`

**Description:**
Create E2E test suite for mobile app using Detox or Maestro.

**Steps:**

1. Set up Detox for Expo
2. Create test for login flow
3. Create test for viewing route
4. Create test for check-in/check-out
5. Create test for navigation

**Files to Create:**

- `/apps/mobile-tech/e2e/auth.e2e.ts`
- `/apps/mobile-tech/e2e/route.e2e.ts`
- `/apps/mobile-tech/e2e/checkin.e2e.ts`
- `/apps/mobile-tech/.detoxrc.json`

**Example Test:**

```typescript
describe('Route Flow', () => {
  it("should display today's route", async () => {
    await element(by.id('today-tab')).tap();
    await expect(element(by.id('route-list'))).toBeVisible();
    await expect(element(by.text('John Doe'))).toBeVisible();
  });

  it('should navigate to appointment detail', async () => {
    await element(by.text('John Doe')).tap();
    await expect(element(by.id('appointment-detail'))).toBeVisible();
    await expect(element(by.text('Oil Change'))).toBeVisible();
  });
});
```

**Acceptance Criteria:**

- [ ] All E2E tests pass on iOS
- [ ] All E2E tests pass on Android
- [ ] Tests cover critical flows
- [ ] Tests run in CI

**Dependencies:** P3.9

**Validation:**

```bash
cd apps/mobile-tech && bun run test:e2e:ios
bun run test:e2e:android
```

**Estimated Time:** 10 hours

---

#### P3.11: Build & Deploy Mobile App (TestFlight/Internal Testing)

**Primary Agent:** `deployment-engineer`
**Supporting:** `mobile-developer`

**Description:**
Build and deploy mobile app to TestFlight (iOS) and Google Play Internal Testing (Android).

**Steps:**

1. Configure EAS Build
2. Set up Apple Developer account
3. Set up Google Play Console
4. Build iOS app for TestFlight
5. Build Android app for Internal Testing
6. Upload to TestFlight
7. Upload to Google Play Internal Testing
8. Invite testers

**Files to Update:**

- `/apps/mobile-tech/eas.json`
- `/apps/mobile-tech/app.json`

**EAS Build Command:**

```bash
eas build --platform ios --profile preview
eas build --platform android --profile preview
eas submit --platform ios
eas submit --platform android
```

**Acceptance Criteria:**

- [ ] iOS app built successfully
- [ ] Android app built successfully
- [ ] App uploaded to TestFlight
- [ ] App uploaded to Google Play Internal
- [ ] Testers can install and run app

**Dependencies:** P3.10

**Validation:**

```bash
# Install from TestFlight
# Install from Google Play
# Verify app works
```

**Estimated Time:** 8 hours

---

### Phase 3 Summary

**Total Tasks:** 11
**Estimated Duration:** 3 weeks (88 hours)
**Completion Criteria:**

- [ ] Mobile app runs on iOS and Android
- [ ] Technicians can view route
- [ ] Location tracking works
- [ ] Geofencing triggers correctly
- [ ] Check-in/check-out functional
- [ ] Push notifications work
- [ ] Basic offline support implemented
- [ ] E2E tests pass
- [ ] Deployed to TestFlight and Google Play Internal

**Next Phase:** Phase 4 - AI Booking Agent (ElevenLabs, Twilio, Conversation Flows)

---

_Continued in next section..._
