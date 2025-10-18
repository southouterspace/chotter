# Quick Start: Admin Dashboard Testing

## TL;DR - Start Here

```bash
# 1. Reset database with seed data (REQUIRED - Currently in progress)
cd /Users/justinalvarado/GitHub/chotter
supabase db reset

# 2. Add Google Maps API key
echo "VITE_GOOGLE_MAPS_API_KEY=your_key_here" >> apps/web-admin/.env

# 3. Start dev server (Already running)
cd apps/web-admin
bun run dev

# 4. Open dashboard
# http://localhost:5173

# 5. Run data verification
bun /tmp/test_supabase_data.mjs
```

---

## Current Status (as of 2025-10-18 12:10 PM)

### ✅ What's Working
- Supabase is running (ports 54321, 54322, 54323)
- Dev server is running (http://localhost:5173)
- Environment variables configured
- All source code files present
- Code quality is excellent

### ⏳ What's In Progress
- **Database reset:** Running since ~12:06 PM
  - This applies migrations + seed.sql
  - Should complete in next few minutes
  - **DO NOT INTERRUPT**

### ⚠️ What's Missing
- **Google Maps API key** - Maps won't load without this
- **Test user** - Need to create for authentication testing
- **Completed seed data** - Waiting for reset to finish

---

## Three Ways to Test

### Option 1: Quick Smoke Test (5 minutes)
**After database reset completes:**

1. Open http://localhost:5173
2. Check for errors in console (F12)
3. Verify stats widgets show numbers
4. Verify activity feed has entries
5. Check map (will show error without API key - that's OK)

**Success Criteria:**
- No connection errors
- Stats show data
- Activity feed populated
- No TypeScript errors

---

### Option 2: Full Manual Test (30 minutes)
**Follow the comprehensive checklist:**

```bash
# Open this file:
/Users/justinalvarado/GitHub/chotter/apps/web-admin/MANUAL_TEST_CHECKLIST.md
```

**Tests 10 categories:**
1. Supabase Connection ✅
2. Environment Variables ⚠️
3. Dev Server ✅
4. Project Structure ✅
5. Stats Widgets ⏳
6. Google Maps ⏳
7. Activity Feed ⏳
8. Real-time Updates ⏳
9. Responsive Design ⏳
10. Console/Performance ⏳

---

### Option 3: Automated Data Test (2 minutes)
**After database reset completes:**

```bash
cd /Users/justinalvarado/GitHub/chotter/apps/web-admin
bun /tmp/test_supabase_data.mjs
```

**This script verifies:**
- Today's appointment count
- Active technician count
- Completion rate calculation
- Recent activity feed data
- Technician locations with coordinates

**Expected output:**
```
==========================================
ADMIN DASHBOARD DATA VERIFICATION
==========================================

TEST 1: Today's Stats
---------------------
✓ Today's appointments: 0-8
✓ Active technicians: 3
✓ Total tickets: 8
  - Completed: 3
  - Completion rate: 37%

TEST 2: Technician Locations
----------------------------
✓ Found 3 technicians
  📍 Mike Rodriguez - available
    Location: [-117.0839, 32.8153]
  📍 David Chen - available
    Location: [-117.1611, 32.7157]
  📍 Lisa Martinez - available
    Location: [-117.2340, 32.8328]

TEST 3: Recent Activity
----------------------
✓ Found 8 recent activities
  1. Robert Johnson - Emergency Service
     Status: pending | City: Coronado
  2. Jessica Brown - Heating Repair
     Status: pending | City: Hillcrest
  ...
```

---

## Common Issues & Fixes

### Issue: "Database connection error"
**Cause:** Database reset still in progress OR not started

**Fix:**
```bash
# Check if reset is complete:
ps aux | grep supabase

# If no reset running, start one:
cd /Users/justinalvarado/GitHub/chotter
supabase db reset
```

**Wait time:** 1-5 minutes

---

### Issue: Map shows "Google Maps API key not configured"
**Cause:** VITE_GOOGLE_MAPS_API_KEY is empty

**Fix:**
```bash
# Get API key from Google Cloud Console
# https://console.cloud.google.com/
# Enable "Maps JavaScript API"

# Add to .env:
cd /Users/justinalvarado/GitHub/chotter/apps/web-admin
echo "VITE_GOOGLE_MAPS_API_KEY=AIza..." >> .env

# Restart dev server:
# Press Ctrl+C in terminal running dev server
bun run dev
```

---

### Issue: Can't log in
**Cause:** No test user created

**Fix:**
```bash
# Option 1: Via Supabase Studio (EASIEST)
# 1. Open http://127.0.0.1:54323
# 2. Click "Authentication" in sidebar
# 3. Click "Users" tab
# 4. Click "Add user" button
# 5. Enter:
#    Email: admin@acmehvac.com
#    Password: password123
# 6. Click "Create user"
# 7. Return to dashboard and log in
```

---

### Issue: Stats show all zeros
**Cause:** Seed data not applied

**Fix:**
```bash
# Reset database (applies seed.sql):
cd /Users/justinalvarado/GitHub/chotter
supabase db reset

# Verify seed data:
bun /tmp/test_supabase_data.mjs
```

---

## Expected Data (After Seed)

### Acme HVAC (Business ID: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa)

**Technicians (3):**
- Mike Rodriguez (Senior) - Clairemont, SD
- David Chen (Intermediate) - Downtown SD
- Lisa Martinez - La Jolla

**Customers (8):**
- Downtown, La Jolla, Chula Vista, Point Loma
- Mission Valley, Pacific Beach, Hillcrest, Coronado

**Tickets (8):**
- 3 Completed
- 3 Scheduled
- 2 Pending

**Services (5):**
- AC Repair ($89)
- AC Installation ($4,500)
- Heating Repair ($79)
- Maintenance ($49)
- Emergency Service ($199)

---

## Next Steps After Database Reset

### Step 1: Verify Seed Data (2 min)
```bash
cd /Users/justinalvarado/GitHub/chotter/apps/web-admin
bun /tmp/test_supabase_data.mjs
```

**Look for:**
- ✓ Active technicians: 3
- ✓ Total tickets: 8
- ✓ Completion rate: 37%

---

### Step 2: Test Dashboard UI (5 min)
1. Open http://localhost:5173
2. Check stats widgets (should show numbers)
3. Scroll to activity feed (should show 8 entries)
4. Look at map (shows error - that's OK without API key)

---

### Step 3: Add Google Maps Key (10 min)
1. Go to https://console.cloud.google.com/
2. Create project (if needed)
3. Enable "Maps JavaScript API"
4. Create API key
5. Add to .env
6. Restart dev server
7. Refresh dashboard
8. Map should now load with 3 tech markers

---

### Step 4: Create Test User (2 min)
1. Open http://127.0.0.1:54323 (Supabase Studio)
2. Authentication > Users > Add user
3. Email: admin@acmehvac.com
4. Password: password123
5. Return to dashboard
6. Test login

---

### Step 5: Test Real-time Updates (3 min)
1. Open dashboard
2. Open Supabase Studio (http://127.0.0.1:54323)
3. Go to Table Editor > tickets
4. Update any ticket's status
5. Watch dashboard update automatically (no refresh!)

---

## File Locations

### Testing Documents
- **This file:** `/Users/justinalvarado/GitHub/chotter/apps/web-admin/QUICK_START_TESTING.md`
- **Full checklist:** `/Users/justinalvarado/GitHub/chotter/apps/web-admin/MANUAL_TEST_CHECKLIST.md`
- **Test report:** `/Users/justinalvarado/GitHub/chotter/apps/web-admin/TEST_REPORT.md`
- **Data test script:** `/tmp/test_supabase_data.mjs`

### Project Files
- **Dashboard code:** `/Users/justinalvarado/GitHub/chotter/apps/web-admin/src/`
- **Environment:** `/Users/justinalvarado/GitHub/chotter/apps/web-admin/.env`
- **Seed data:** `/Users/justinalvarado/GitHub/chotter/supabase/seed.sql`
- **Migrations:** `/Users/justinalvarado/GitHub/chotter/supabase/migrations/`

---

## URLs Reference

| Service | URL | Purpose |
|---------|-----|---------|
| Dashboard | http://localhost:5173 | Admin UI |
| Supabase API | http://127.0.0.1:54321 | REST API |
| Supabase Studio | http://127.0.0.1:54323 | Database admin |
| PostgreSQL | postgresql://postgres:postgres@127.0.0.1:54322/postgres | Direct DB access |

---

## Success Checklist

After database reset completes, verify these:

- [ ] Dev server running (http://localhost:5173)
- [ ] Supabase running (ports 54321, 54322, 54323)
- [ ] Seed data applied (run data test script)
- [ ] Stats widgets show: 3 techs, 8 tickets, 37% rate
- [ ] Activity feed shows 8 entries
- [ ] Map loads (with API key) or shows graceful error
- [ ] Real-time updates work
- [ ] No errors in browser console
- [ ] Can create and log in as test user

---

## Time Estimates

| Task | Time |
|------|------|
| Database reset | 1-5 min |
| Data verification | 2 min |
| Get Google Maps key | 10 min |
| Create test user | 2 min |
| Quick smoke test | 5 min |
| Full manual test | 30 min |
| **Total** | **~50 min** |

---

## Support

**Questions?** Check these files:
1. `MANUAL_TEST_CHECKLIST.md` - Detailed test steps
2. `TEST_REPORT.md` - Current test status
3. `/Users/justinalvarado/GitHub/chotter/docs/SEED_DATA.md` - Seed data reference

**Stuck?**
- Check Supabase logs: `supabase logs`
- Check dev server console
- Open browser console (F12)
- Review error messages carefully

---

**Last updated:** 2025-10-18 12:10 PM
**Test environment:** Local development (macOS)
**Status:** Database reset in progress, dev server ready
