# Admin Dashboard Manual Test Checklist

## Pre-Test Setup

### 1. Start Supabase with Seed Data
```bash
cd /Users/justinalvarado/GitHub/chotter
supabase db reset  # This applies migrations + seed.sql
```

Wait for completion (may take 30-60 seconds).

### 2. Verify Supabase is Running
```bash
# Check ports are listening
netstat -an | grep -E "54321|54322|54323"

# Should see:
# tcp46  0  0  *.54321  *.*  LISTEN  (API)
# tcp46  0  0  *.54322  *.*  LISTEN  (PostgreSQL)
# tcp46  0  0  *.54323  *.*  LISTEN  (Studio)
```

### 3. Get Google Maps API Key (Required for Map Testing)
1. Go to https://console.cloud.google.com/
2. Enable Maps JavaScript API
3. Create API key
4. Add key to `/Users/justinalvarado/GitHub/chotter/apps/web-admin/.env`:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_key_here
   ```
5. Restart dev server after adding key

### 4. Start Dev Server
```bash
cd /Users/justinalvarado/GitHub/chotter/apps/web-admin
bun run dev
```

Server should start at http://localhost:5173

---

## Test Categories

### TEST 1: Verify Supabase Connection
**Status:** READY TO TEST
**Prerequisites:** Supabase running, seed data applied

**Steps:**
1. Open browser dev tools (F12)
2. Navigate to http://localhost:5173
3. Check console for errors
4. Look for Supabase connection logs

**Expected Results:**
- ✓ No connection errors in console
- ✓ No "Missing Supabase environment variables" error
- ✓ Supabase client initializes successfully

**Actual Results:**
- [ ] Pass / [ ] Fail
- Notes: ____________________

---

### TEST 2: Authentication Flow
**Status:** READY TO TEST
**Prerequisites:** Supabase running

**Steps:**
1. Navigate to http://localhost:5173
2. Should redirect to /login
3. Try logging in with test credentials:
   - Email: admin@acmehvac.com
   - Password: (create test user if not exists)

**To Create Test User (if needed):**
```bash
# Option 1: Via Supabase Studio
# Go to http://127.0.0.1:54323
# Navigate to Authentication > Users
# Create new user with email: admin@acmehvac.com

# Option 2: Via SQL (in Supabase Studio SQL Editor)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000000',
   uuid_generate_v4(),
   'authenticated',
   'authenticated',
   'admin@acmehvac.com',
   crypt('password123', gen_salt('bf')),
   now(),
   now(),
   now());
```

**Expected Results:**
- ✓ Login form displays
- ✓ Can enter credentials
- ✓ Redirects to /dashboard after successful login
- ✓ Auth session persists on page refresh

**Actual Results:**
- [ ] Pass / [ ] Fail
- Notes: ____________________

---

### TEST 3: Dashboard Stats Widgets
**Status:** REQUIRES DATABASE SEED
**Prerequisites:** Logged in, seed data applied

**Steps:**
1. Navigate to dashboard at http://localhost:5173/dashboard
2. Observe the 4 stat widgets at top of page
3. Compare values with seed data expectations

**Expected Results (from seed data for Acme HVAC):**

| Stat | Expected Value | Actual | Pass/Fail |
|------|---------------|--------|-----------|
| Total Appointments Today | Varies (depends on today's date in seed) | ____ | [ ] |
| Active Technicians | 3 (Mike, David, Lisa) | ____ | [ ] |
| Completion Rate | ~37-50% (3 completed out of 8 total) | ____ | [ ] |
| Pending Appointments | Varies (pending tickets today) | ____ | [ ] |

**Notes:**
- Completion rate is calculated from ALL tickets, not just today's
- From seed data: 3 completed, 3 scheduled, 2 pending = 8 total
- Expected completion rate: 3/8 = 37.5%

**Actual Results:**
- [ ] Pass / [ ] Fail
- Notes: ____________________

---

### TEST 4: Google Maps Integration
**Status:** REQUIRES GOOGLE MAPS API KEY
**Prerequisites:** Google Maps API key set, logged in, seed data applied

**Steps:**
1. Scroll down to "Live Technician Map" card
2. Wait for map to load (may take 2-3 seconds)
3. Check for technician markers

**Expected Results:**
- ✓ Map loads without errors
- ✓ Map centered on San Diego (32.7157, -117.1611)
- ✓ 3 technician markers visible:
  - **Mike Rodriguez** - Clairemont area (-117.0839, 32.8153)
  - **David Chen** - Downtown SD (-117.1611, 32.7157)
  - **Lisa Martinez** - La Jolla area (-117.2340, 32.8328)
- ✓ Markers are colored circles (color depends on status)
- ✓ Clicking marker shows info window with:
  - Technician name
  - Email address
  - Status badge

**Marker Color Legend:**
- Green: Available
- Blue: On Route
- Amber: Busy
- Gray: Off Duty

**If Map Doesn't Load:**
- Check console for "Google Maps API key not configured" message
- Verify VITE_GOOGLE_MAPS_API_KEY in .env file
- Restart dev server after adding key

**Actual Results:**
- [ ] Pass / [ ] Fail
- Technician count: ____
- Notes: ____________________

---

### TEST 5: Recent Activity Feed
**Status:** REQUIRES DATABASE SEED
**Prerequisites:** Logged in, seed data applied

**Steps:**
1. Scroll to "Recent Activity" card on right side
2. Check that activity items are displayed
3. Verify data matches seed data

**Expected Results:**
- ✓ Shows "Recent Activity" header with clock icon
- ✓ Displays last 10 tickets ordered by updated_at (descending)
- ✓ Each activity shows:
  - Customer name (e.g., "John Smith", "Emily Davis")
  - Service name (e.g., "AC Repair", "AC Installation")
  - Status badge (color-coded)
  - City name
  - Scheduled date
  - Relative time (e.g., "2d ago", "Just now")

**Sample Expected Activities (from seed data):**
1. **Robert Johnson** - Emergency Service - Status varies - Coronado
2. **Jessica Brown** - Heating Repair - Pending - Hillcrest
3. **David Martinez** - AC Installation - Scheduled - Pacific Beach
4. **Sarah Anderson** - Maintenance Service - Scheduled - Mission Valley
5. **Michael Wilson** - AC Repair - Completed - Point Loma
... (5 more)

**Status Badge Colors:**
- Pending: Gray/Secondary
- Scheduled: Blue/Default
- In Progress: Outlined
- Completed: Green/Default
- Cancelled: Red/Destructive

**Actual Results:**
- [ ] Pass / [ ] Fail
- Activity count: ____
- Notes: ____________________

---

### TEST 6: Real-time Updates
**Status:** REQUIRES DATABASE ACCESS
**Prerequisites:** Dashboard loaded, seed data applied

**Steps:**
1. Keep admin dashboard open in browser
2. Open Supabase Studio at http://127.0.0.1:54323
3. Navigate to Table Editor > tickets
4. Update a ticket's status:
   ```sql
   UPDATE tickets
   SET status = 'in_progress', updated_at = now()
   WHERE business_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
   LIMIT 1;
   ```
5. Watch dashboard WITHOUT refreshing

**Expected Results:**
- ✓ Stats widgets update automatically
- ✓ Recent activity feed updates and reorders
- ✓ No page refresh required
- ✓ Update happens within 1-2 seconds
- ✓ No console errors

**Actual Results:**
- [ ] Pass / [ ] Fail
- Update delay: ____ seconds
- Notes: ____________________

---

### TEST 7: Responsive Design
**Status:** READY TO TEST
**Prerequisites:** Dashboard loaded

**Steps:**
1. Open browser dev tools (F12)
2. Click responsive design mode (or Ctrl+Shift+M)
3. Test at different breakpoints:
   - Mobile: 375px width
   - Tablet: 768px width
   - Desktop: 1024px width
   - Large Desktop: 1440px width

**Expected Results:**

**Mobile (375px):**
- ✓ Stats widgets stack vertically (1 column)
- ✓ Map takes full width
- ✓ Activity feed below map (full width)
- ✓ All text readable
- ✓ No horizontal scroll

**Tablet (768px):**
- ✓ Stats widgets in 2 columns
- ✓ Map and activity side-by-side or stacked
- ✓ Navigation accessible

**Desktop (1024px+):**
- ✓ Stats widgets in 4 columns
- ✓ Map takes 2/3 width
- ✓ Activity feed takes 1/3 width
- ✓ Proper spacing and alignment

**Actual Results:**
- [ ] Pass / [ ] Fail
- Issues at breakpoint: ____
- Notes: ____________________

---

### TEST 8: Browser Console Check
**Status:** READY TO TEST
**Prerequisites:** Dashboard loaded

**Steps:**
1. Open browser dev tools (F12)
2. Navigate to Console tab
3. Clear console and refresh page
4. Review all messages

**Expected Results:**
- ✓ No errors (red messages)
- ✓ No TypeScript type errors
- ✓ No failed network requests
- ✓ Supabase realtime connection established
- ✓ No React warnings

**Common Acceptable Warnings:**
- React DevTools extension messages
- Source map warnings (development only)

**Unacceptable Errors:**
- "Missing Supabase environment variables"
- "Failed to fetch" errors
- TypeScript errors
- Uncaught exceptions
- CORS errors

**Actual Results:**
- [ ] Pass / [ ] Fail
- Error count: ____
- Notes: ____________________

---

### TEST 9: Network Performance
**Status:** READY TO TEST
**Prerequisites:** Dashboard loaded

**Steps:**
1. Open browser dev tools (F12)
2. Navigate to Network tab
3. Clear network log
4. Refresh page (Ctrl+R)
5. Wait for page to fully load
6. Review network requests

**Expected Results:**

**Initial Page Load:**
- ✓ HTML document < 10KB
- ✓ JavaScript bundle < 500KB (gzipped)
- ✓ CSS bundle < 50KB
- ✓ Total load time < 2 seconds (local dev)

**API Requests:**
- ✓ Supabase queries complete < 500ms each
- ✓ No failed requests (status 200)
- ✓ Realtime WebSocket connection established

**To Check:**
- Total requests: ____
- Total size: ____ MB
- Load time: ____ ms
- Failed requests: ____

**Actual Results:**
- [ ] Pass / [ ] Fail
- Notes: ____________________

---

### TEST 10: Data Accuracy Verification
**Status:** REQUIRES DATABASE ACCESS
**Prerequisites:** Seed data applied

**Steps:**
1. Open Supabase Studio at http://127.0.0.1:54323
2. Run these verification queries in SQL Editor:

```sql
-- Verify Acme HVAC business exists
SELECT id, name, business_name, industry
FROM businesses
WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- Count active technicians
SELECT COUNT(*) as active_tech_count
FROM technicians
WHERE business_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
AND active = true;

-- Count total tickets
SELECT COUNT(*) as total_tickets
FROM tickets
WHERE business_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- Count completed tickets
SELECT COUNT(*) as completed_tickets
FROM tickets
WHERE business_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
AND status = 'completed';

-- List technicians with locations
SELECT
  p.first_name,
  p.last_name,
  t.status,
  t.current_location
FROM technicians t
JOIN persons p ON t.person_id = p.id
WHERE t.business_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
AND t.active = true;
```

3. Compare query results with dashboard display

**Expected Query Results:**
- Business exists: ✓ (Acme HVAC)
- Active technicians: 3
- Total tickets: 8
- Completed tickets: 3
- Completion rate: 37.5%

**Expected Technicians:**
1. Mike Rodriguez - with location
2. David Chen - with location
3. Lisa Martinez - with location

**Actual Results:**
- [ ] Pass / [ ] Fail
- Business found: [ ] Yes / [ ] No
- Technician count matches: [ ] Yes / [ ] No
- Ticket counts match: [ ] Yes / [ ] No
- Notes: ____________________

---

## Critical Issues Encountered

### Issue 1: Supabase Not Running
**Symptom:** Can't access http://localhost:5173 or dashboard shows connection errors

**Solution:**
```bash
supabase start
```

Wait for all services to start, then refresh browser.

---

### Issue 2: Missing Seed Data
**Symptom:** Dashboard shows 0 for all stats, no technicians on map, empty activity feed

**Solution:**
```bash
supabase db reset
```

This resets database and applies all migrations + seed.sql.
**Warning:** This deletes all existing data!

---

### Issue 3: Google Maps Not Loading
**Symptom:** Map shows error message or doesn't render

**Solutions:**
1. **Missing API Key:**
   - Add `VITE_GOOGLE_MAPS_API_KEY=your_key` to `.env`
   - Restart dev server

2. **Invalid API Key:**
   - Check key has Maps JavaScript API enabled
   - Verify no usage limits exceeded

3. **Wrong URL:**
   - Ensure accessing http://localhost:5173 (not 127.0.0.1)

---

### Issue 4: Authentication Not Working
**Symptom:** Can't log in, or login form doesn't appear

**Solutions:**
1. **Create test user:**
   ```bash
   # Via Supabase Studio
   # Go to http://127.0.0.1:54323
   # Authentication > Users > Create User
   # Email: admin@acmehvac.com
   # Password: password123
   ```

2. **Clear browser data:**
   - Clear localStorage
   - Clear cookies
   - Hard refresh (Ctrl+Shift+R)

---

### Issue 5: Real-time Updates Not Working
**Symptom:** Dashboard doesn't update when database changes

**Solutions:**
1. **Check Supabase Realtime:**
   - Ensure Realtime is enabled in Supabase config
   - Check browser console for WebSocket errors

2. **Verify RLS Policies:**
   - RLS may be blocking updates
   - Check that user has permission to read tickets, technicians tables

---

## Performance Metrics

| Metric | Target | Actual | Pass/Fail |
|--------|--------|--------|-----------|
| Initial Load Time | < 2s | ____ | [ ] |
| Time to Interactive | < 3s | ____ | [ ] |
| Bundle Size (gzipped) | < 500KB | ____ | [ ] |
| API Response Time | < 500ms | ____ | [ ] |
| Realtime Update Delay | < 2s | ____ | [ ] |

---

## Browser Compatibility

Test in multiple browsers:

| Browser | Version | Pass/Fail | Notes |
|---------|---------|-----------|-------|
| Chrome | Latest | [ ] | _____ |
| Firefox | Latest | [ ] | _____ |
| Safari | Latest | [ ] | _____ |
| Edge | Latest | [ ] | _____ |

---

## Final Checklist

Before marking testing complete, verify:

- [ ] All 10 test categories completed
- [ ] No critical errors in browser console
- [ ] Real-time updates working
- [ ] Google Maps loads (if API key provided)
- [ ] Stats widgets show correct data
- [ ] Activity feed populated
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Authentication flow works
- [ ] Performance metrics within targets
- [ ] No data accuracy issues

---

## Additional Notes

Document any other observations, bugs, or recommendations:

```
(Add notes here)
```

---

## Test Summary

**Tested by:** ____________________
**Date:** ____________________
**Overall Status:** [ ] Pass / [ ] Fail / [ ] Partial

**Critical Issues Found:** ____

**Recommendations:**
1. ____________________
2. ____________________
3. ____________________
