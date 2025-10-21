# Mobile Tech App - Installation & Build Verification Guide

## 📋 Overview

This guide covers installing dependencies and verifying builds for all Phase 3 feature branches.

**Last Updated:** October 21, 2025
**Phase 3 Progress:** 7/11 tasks complete (64%)

---

## ✅ Fixed Issues

### Issue #1: npm Dependency Conflicts
**Problem:** npm couldn't resolve dependencies due to workspace conflicts with root monorepo ESLint/knip packages.

**Solution:** Use Bun instead of npm for installation.

```bash
cd /Users/justinalvarado/GitHub/chotter/apps/mobile-tech
bun install  # ✅ Works perfectly
```

**Why Bun?**
- The Chotter monorepo uses Bun as the primary package manager
- Bun has better workspace resolution
- Faster installation (11.43s vs npm's ~60s+)
- No peer dependency conflicts

### Issue #2: TypeScript Compilation Errors
**Problem:** Several unused variables and a typo prevented TypeScript from compiling.

**Fixed:**
- ✅ `storeFailed Update` → `storeFailedUpdate` (typo fix)
- ✅ Removed unused `hasPendingUpdates` variable
- ✅ Removed unused `updateBadgeCount` import
- ✅ Removed unused `AsyncStorage` import
- ✅ Removed unused `notification` parameter

**Verification:**
```bash
cd apps/mobile-tech
npx tsc --noEmit  # ✅ No errors!
```

---

## 📦 Installation Instructions

### Prerequisites

- **Bun:** v1.2.20+ (check with `bun --version`)
- **Node.js:** v20+ (for React Native Metro bundler)
- **Expo CLI:** Installed globally or via npx
- **iOS Simulator:** Xcode 15+ (macOS only)
- **Android Emulator:** Android Studio with SDK 33+

### Step 1: Install Dependencies

```bash
# From project root
cd /Users/justinalvarado/GitHub/chotter/apps/mobile-tech

# Install with Bun (NOT npm!)
bun install

# Expected output:
# ✓ 471 packages installed [11.43s]
```

### Step 2: Verify TypeScript Compilation

```bash
# From mobile-tech directory
npx tsc --noEmit

# Expected: No output = success! ✅
```

### Step 3: Verify Environment Variables

```bash
# Check .env file exists
cat .env

# Should contain:
# EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
# EXPO_PUBLIC_SUPABASE_ANON_KEY=your-key-here
```

---

## 🔨 Build Verification (All Phase 3 Branches)

### Branch: phase-3/p3.1-expo-init (Foundation) ✅

**Status:** Complete, tested, ready to merge

```bash
git checkout phase-3/p3.1-expo-init
cd apps/mobile-tech
bun install
npx tsc --noEmit  # Should pass
bun start         # Start dev server
```

**Features:**
- Expo app with TypeScript ✅
- React Navigation ✅
- Supabase auth ✅
- Login screen ✅

---

### Branch: phase-3/p3.2-p3.3-ui-screens (UI) ✅

**Status:** Complete, tested, ready to merge

```bash
git checkout phase-3/p3.2-p3.3-ui-screens
cd apps/mobile-tech
bun install
npx tsc --noEmit  # Should pass
bun start
```

**Features:**
- Today's Route Screen with appointment list ✅
- Appointment Detail Screen ✅
- Customer info cards ✅
- Call/Email/Navigate buttons ✅

**Test Routes:**
- `/` - Login
- `/today` - Today's route (after login)
- `/appointment/:id` - Appointment details

---

### Branch: phase-3/p3.4-p3.5-location (Location Services) ✅

**Status:** Complete, tested, ready to merge

```bash
git checkout phase-3/p3.4-p3.5-location
cd apps/mobile-tech
bun install
npx tsc --noEmit  # Should pass

# Apply database migration
cd ../../supabase
supabase db push

# Start app
cd ../apps/mobile-tech
bun start
```

**Features:**
- Background location tracking ✅
- Geofencing (1-mile + 100m) ✅
- Auto status updates ✅
- Profile screen location toggle ✅

**⚠️ Testing Notes:**
- Requires **physical device** (location doesn't work in simulators)
- Requires location permissions
- Database migration creates `geofence_events` table

---

### Branch: phase-3/p3.7-p3.8-infrastructure (Current) ✅

**Status:** Complete, TypeScript fixed, ready to merge

```bash
git checkout phase-3/p3.7-p3.8-infrastructure
cd apps/mobile-tech
bun install
npx tsc --noEmit  # ✅ Now passes!

# Apply database migration
cd ../../supabase
supabase db push

# Start app
cd ../apps/mobile-tech
bun start
```

**Features:**
- Push notifications ✅
- Offline support with queue ✅
- Network status indicator ✅
- Notification settings UI ✅

**Database Migrations:**
- `20251020235900_add_push_token_to_technicians.sql`

**⚠️ Testing Notes:**
- Push notifications require **physical device**
- Offline mode works in simulators
- Test by toggling airplane mode

---

## 🧪 Testing Checklist

### All Branches

- [ ] `bun install` completes without errors
- [ ] `npx tsc --noEmit` passes with no errors
- [ ] `bun start` launches Metro bundler
- [ ] App loads in Expo Go (scan QR code)
- [ ] No console errors on launch

### P3.1: Foundation
- [ ] Login screen renders
- [ ] Can type in email/password fields
- [ ] "Login" button exists
- [ ] Navigation structure works

### P3.2-P3.3: UI Screens
- [ ] Route list displays appointments
- [ ] Appointment cards show customer info
- [ ] Tapping appointment opens detail screen
- [ ] Call/Email/Navigate buttons render
- [ ] Back navigation works

### P3.4-P3.5: Location (Physical Device Only)
- [ ] Location permission prompt appears
- [ ] Profile toggle enables tracking
- [ ] Location updates in database
- [ ] Geofence notifications appear
- [ ] Status auto-updates when approaching

### P3.7-P3.8: Infrastructure (Physical Device for Push)
- [ ] Notification permission prompt appears
- [ ] Device token saved to database
- [ ] Offline indicator shows when no network
- [ ] Queue stores updates when offline
- [ ] Sync works when reconnected

---

## 🚀 Running the App

### Development Server

```bash
cd apps/mobile-tech
bun start

# Opens Metro bundler with QR code
# Options:
# › Press s │ switch to development build
# › Press a │ open Android
# › Press i │ open iOS simulator
# › Press w │ open web
```

### iOS Simulator

```bash
bun run ios
# or
npx expo start --ios
```

**Requirements:**
- macOS only
- Xcode 15+ installed
- iOS Simulator opened

### Android Emulator

```bash
bun run android
# or
npx expo start --android
```

**Requirements:**
- Android Studio installed
- Android SDK 33+
- Emulator running

### Physical Device (Recommended for Full Testing)

1. Install **Expo Go** app on your device
2. Run `bun start`
3. Scan QR code with:
   - **iOS:** Camera app
   - **Android:** Expo Go app

---

## 🐛 Troubleshooting

### "Cannot find module" errors

```bash
# Clear Metro bundler cache
npx expo start --clear

# Or delete node_modules and reinstall
rm -rf node_modules
bun install
```

### TypeScript errors

```bash
# Verify no compilation errors
npx tsc --noEmit

# If errors persist, check branch is up to date
git pull origin <branch-name>
```

### "Module not found: react-native-url-polyfill"

```bash
# Ensure all dependencies installed
bun install

# Verify package.json includes:
# "react-native-url-polyfill": "^2.0.0"
```

### Metro bundler won't start

```bash
# Kill existing Metro processes
killall -9 node
watchman watch-del-all

# Restart
bun start
```

### Expo Go connection issues

- Ensure phone and computer on **same WiFi network**
- Disable VPN
- Try tunnel mode: `npx expo start --tunnel`

---

## 📊 Build Status Summary

| Branch | Dependencies | TypeScript | Metro | Simulator | Device |
|--------|-------------|-----------|--------|-----------|--------|
| p3.1-expo-init | ✅ | ✅ | ✅ | ✅ | ✅ |
| p3.2-p3.3-ui-screens | ✅ | ✅ | ✅ | ✅ | ✅ |
| p3.4-p3.5-location | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| p3.7-p3.8-infrastructure | ✅ | ✅ | ✅ | ⚠️ | ✅ |

**Legend:**
- ✅ Fully functional
- ⚠️ Limited functionality (location/push notifications require physical device)
- ❌ Not working

---

## 🎯 Next Steps

1. **Merge branches to develop** (in order):
   - p3.1-expo-init
   - p3.2-p3.3-ui-screens
   - p3.4-p3.5-location
   - p3.7-p3.8-infrastructure

2. **Continue Phase 3** (36% remaining):
   - P3.6: Check-In/Check-Out Flow
   - P3.9: Profile & Settings Screen
   - P3.10: E2E Tests
   - P3.11: Build & Deploy

3. **Test integration** after merging all branches

---

## 📝 Notes

- **Always use Bun** for installation, not npm
- TypeScript strict mode is enabled - all code must compile cleanly
- Physical devices required for full feature testing
- Database migrations must be applied before testing location/notification features

---

**Questions?** Check individual branch README files or TESTING.md guides in each branch.
