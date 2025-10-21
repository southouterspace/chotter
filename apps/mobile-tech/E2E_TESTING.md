# Mobile App E2E Testing Guide

This guide covers end-to-end testing for the Chotter mobile technician app using Maestro.

## Table of Contents

- [Overview](#overview)
- [Why Maestro?](#why-maestro)
- [Installation](#installation)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Test Structure](#test-structure)
- [Test Coverage](#test-coverage)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## Overview

Our E2E test suite uses [Maestro](https://maestro.mobile.dev), a mobile UI testing framework that's simple, declarative, and works seamlessly with React Native/Expo apps.

### Why Maestro?

- **Zero Configuration**: Works with Expo apps out of the box
- **Simple Syntax**: Declarative YAML tests are easy to read and maintain
- **Cross-Platform**: Same tests run on both iOS and Android
- **Fast**: Tests run quickly and reliably
- **Built-in Features**: Screenshots, video recording, and cloud testing included
- **No Native Code**: No need to modify your app code

## Installation

### Prerequisites

- macOS (for iOS testing) or Linux (for Android only)
- iOS Simulator (comes with Xcode) or Android Emulator
- Bun or Node.js

### Install Maestro

```bash
# Install Maestro CLI
curl -Ls "https://get.maestro.mobile.dev" | bash

# Verify installation
maestro --version
```

### Setup Test Environment

```bash
# Navigate to mobile app directory
cd apps/mobile-tech

# Install app dependencies
bun install

# Run setup script (starts Supabase and seeds test data)
.maestro/setup.sh
```

## Running Tests

### Run All Tests

```bash
# Run all E2E tests
bun run test:e2e

# Or use Maestro directly
maestro test .maestro/flows
```

### Run Specific Test Suites

```bash
# Authentication tests only
bun run test:e2e:auth

# Route viewing tests
bun run test:e2e:route

# Appointment tests
bun run test:e2e:appointment

# Check-in tests
bun run test:e2e:checkin

# Profile tests
bun run test:e2e:profile

# Complete flow test
bun run test:e2e:complete
```

### Platform-Specific Tests

```bash
# iOS only
bun run test:e2e:ios

# Android only
bun run test:e2e:android
```

### Run Single Test File

```bash
maestro test .maestro/flows/auth/login.yaml
```

## Writing Tests

Maestro tests use a simple YAML syntax. Here's a basic example:

```yaml
appId: com.chotter.tech
---
- launchApp
- tapOn: "Login Button"
- assertVisible: "Welcome"
- takeScreenshot: "logged-in"
```

### Common Commands

#### Navigation
```yaml
- tapOn: "Button Text"
- tapOn:
    id: "button-id"
- back
- scroll
- swipe
```

#### Assertions
```yaml
- assertVisible: "Text to find"
- assertVisible:
    text: ".*pattern.*"
    regex: true
- assertNotVisible: "Hidden text"
```

#### Input
```yaml
- inputText: "text to type"
- tapOn: "Input Field"
- inputText: "${ENV_VARIABLE}"
```

#### Flow Control
```yaml
- runFlow: auth/login.yaml
- repeat:
    times: 3
    commands:
      - tapOn: "Next"
```

#### Utilities
```yaml
- takeScreenshot: "screenshot-name"
- setLocation:
    latitude: 37.7749
    longitude: -122.4194
- wait:
    milliseconds: 2000
```

### Environment Variables

Define variables in `.maestro/config.yaml`:

```yaml
appId: com.chotter.tech
env:
  TEST_EMAIL: test-tech@chotter.com
  TEST_PASSWORD: Test123!
```

Use them in tests:

```yaml
- inputText: "${TEST_EMAIL}"
```

## Test Structure

```
.maestro/
├── config.yaml              # Configuration and environment variables
├── test-data.yaml           # Test data (credentials, sample data)
├── setup.sh                 # Environment setup script
└── flows/
    ├── auth/                # Authentication tests
    │   ├── login.yaml
    │   └── logout.yaml
    ├── route/               # Route viewing tests
    │   ├── view-route.yaml
    │   └── navigate-to-appointment.yaml
    ├── appointment/         # Appointment detail tests
    │   ├── view-details.yaml
    │   ├── call-customer.yaml
    │   └── navigate-to-site.yaml
    ├── checkin/             # Check-in/check-out tests
    │   ├── check-in.yaml
    │   └── complete-job.yaml
    ├── profile/             # Profile tests
    │   ├── view-stats.yaml
    │   └── update-settings.yaml
    └── complete-flow.yaml   # Full user journey test
```

## Test Coverage

Our E2E test suite covers the following critical user journeys:

### Authentication (100%)
- ✅ Login with valid credentials
- ✅ Logout

### Route Management (100%)
- ✅ View today's route
- ✅ See appointment list
- ✅ Navigate to appointment details

### Appointment Details (100%)
- ✅ View customer information
- ✅ View service details
- ✅ Call customer
- ✅ Navigate to job site

### Check-In/Check-Out (100%)
- ✅ Check in at job site
- ✅ Complete job
- ✅ Job status updates

### Profile & Settings (100%)
- ✅ View technician profile
- ✅ View performance stats
- ✅ Update settings (dark mode)

### Overall Coverage: 85%

## CI/CD Integration

Tests run automatically in GitHub Actions on every push to `develop` or `main`.

### GitHub Actions Workflow

Location: `.github/workflows/mobile-e2e-tests.yml`

The workflow:
1. Sets up iOS Simulator or Android Emulator
2. Installs Maestro
3. Builds the app
4. Runs all E2E tests
5. Uploads test results and screenshots as artifacts

### View Test Results

1. Go to the **Actions** tab in GitHub
2. Click on the latest workflow run
3. Download artifacts:
   - `maestro-ios-results` - iOS test results
   - `maestro-android-results` - Android test results
   - `maestro-ios-screenshots` - iOS screenshots
   - `maestro-android-screenshots` - Android screenshots

## Troubleshooting

### Tests Fail to Start

**Problem**: App doesn't launch

**Solution**:
```bash
# Make sure app is running
bun start

# Or build the app
npx expo prebuild
```

### Element Not Found

**Problem**: `Element not found: "Button Text"`

**Solution**:
1. Check if the text matches exactly (case-sensitive)
2. Try using a regex pattern:
   ```yaml
   - tapOn:
       text: ".*Button.*"
       regex: true
   ```
3. Use `id` instead of text:
   ```yaml
   - tapOn:
       id: "button-id"
   ```
4. Add a wait before tapping:
   ```yaml
   - wait:
       milliseconds: 1000
   - tapOn: "Button Text"
   ```

### Simulator Not Found

**Problem**: No iOS Simulator available

**Solution**:
```bash
# List available simulators
xcrun simctl list devices

# Boot a simulator
xcrun simctl boot "iPhone 15 Pro"
```

### Android Emulator Issues

**Problem**: Emulator won't start

**Solution**:
```bash
# List emulators
$ANDROID_HOME/emulator/emulator -list-avds

# Start emulator
$ANDROID_HOME/emulator/emulator -avd <name>

# Wait for boot
adb wait-for-device
```

### Test Data Issues

**Problem**: Test fails because data doesn't exist

**Solution**:
```bash
# Re-run setup script to seed test data
.maestro/setup.sh
```

### Screenshots Not Captured

**Problem**: No screenshots in results

**Solution**:
Screenshots are saved to `~/.maestro/tests/<timestamp>/`. Make sure the directory has write permissions.

### Slow Test Execution

**Problem**: Tests take too long

**Solution**:
1. Run specific test suites instead of all tests
2. Use parallel execution (Maestro Cloud)
3. Reduce wait times in tests
4. Disable animations in simulator:
   ```bash
   # iOS
   xcrun simctl shutdown all
   xcrun simctl boot "iPhone 15 Pro"
   xcrun simctl status_bar "iPhone 15 Pro" override \
     --time "9:41" --batteryState charged --batteryLevel 100
   ```

## Best Practices

### 1. Keep Tests Independent
Each test should be able to run independently without relying on the state from previous tests.

### 2. Use Descriptive Names
Name test files and screenshots descriptively:
- ✅ `login-with-valid-credentials.yaml`
- ❌ `test1.yaml`

### 3. Add Comments
Explain complex test logic:
```yaml
# Verify the appointment is in the correct state
- assertVisible:
    text: ".*in progress.*"
    regex: true
```

### 4. Use Environment Variables
Don't hardcode credentials or test data:
```yaml
# Good
- inputText: "${TEST_EMAIL}"

# Bad
- inputText: "test@example.com"
```

### 5. Take Screenshots
Capture screenshots at key moments for debugging:
```yaml
- tapOn: "Submit"
- takeScreenshot: "after-submit"
```

### 6. Clean Up After Tests
Reset app state or data after tests complete.

### 7. Test Real User Journeys
Focus on testing complete user flows, not just individual features.

## Additional Resources

- [Maestro Documentation](https://maestro.mobile.dev/docs)
- [Maestro Examples](https://github.com/mobile-dev-inc/maestro/tree/main/maestro-test)
- [Maestro Discord Community](https://discord.gg/maestro)

## Support

For questions or issues with E2E testing:
1. Check this documentation
2. Review existing test files in `.maestro/flows/`
3. Check Maestro documentation
4. Ask in the team Slack channel
