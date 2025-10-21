# Chotter Mobile App Deployment Guide

This guide covers deploying the Chotter Technician App to TestFlight (iOS) and Google Play Store Internal Testing (Android).

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Environment Configuration](#environment-configuration)
4. [Building for iOS (TestFlight)](#building-for-ios-testflight)
5. [Building for Android (Google Play Internal)](#building-for-android-google-play-internal)
6. [Submitting to App Stores](#submitting-to-app-stores)
7. [Managing Testers](#managing-testers)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Apple Developer Account
- Active Apple Developer account ($99/year)
- Organization account recommended for team management
- Bundle ID: `com.chotter.tech`
- Certificates and provisioning profiles configured

### Google Play Console
- Google Play Developer account ($25 one-time)
- Organization console set up
- Package name: `com.chotter.tech`
- App created in Play Console
- Release signing key configured

### Expo Account
- Expo organization: Chotter
- Project created and configured
- Access to organization settings

### Local Tools
- Node.js 18+ or Bun runtime
- Expo CLI (`npm install -g expo-cli` or via EAS)
- EAS CLI (`npm install -g eas-cli`)
- Git for version control
- Xcode (for iOS builds, optional on CI/CD)
- Android SDK (for Android builds, optional on CI/CD)

## Initial Setup

### 1. Authenticate with Expo

```bash
cd apps/mobile-tech

# Login to Expo account
npx expo login

# Verify authentication
npx expo whoami
```

### 2. Initialize EAS Project

```bash
# Initialize EAS for this project
eas init

# This will:
# - Create/link EAS project
# - Update app.json with projectId
# - Configure build profiles
```

### 3. Update app.json with EAS Project ID

After initialization, update `app.json` with your EAS project ID:

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "your-eas-project-id-here"
      }
    }
  }
}
```

### 4. Configure Credentials

#### For iOS:

```bash
# Generate/use Apple certificate and provisioning profiles
eas credentials

# Or run a test build to prompt for credentials
eas build --platform ios --profile preview
```

This will guide you through:
- Apple Developer account login
- Creating distribution certificate
- Creating provisioning profile
- Storing credentials securely

#### For Android:

Create service account JSON for Google Play:

1. Go to Google Play Console
2. Settings > API access
3. Create service account
4. Download JSON key
5. Save to `secrets/google-play-service-account.json`

Update `eas.json` with path:

```json
{
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./secrets/google-play-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

## Environment Configuration

### Production Environment Variables

Create `.env.production` with production values:

```bash
# Copy template
cp .env.production.template .env.production

# Update with actual values:
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

These environment variables are automatically used during builds.

### Version Management

Update version numbers before each build:

```json
{
  "expo": {
    "version": "1.0.0",
    "ios": {
      "buildNumber": "1"
    },
    "android": {
      "versionCode": 1
    }
  }
}
```

Increment these for each release:
- `version`: Semantic versioning (1.0.0, 1.0.1, etc.)
- `buildNumber` (iOS): Sequential number (1, 2, 3, etc.)
- `versionCode` (Android): Sequential number (1, 2, 3, etc.)

## Building for iOS (TestFlight)

### Development Build

For testing with development client:

```bash
npm run build:ios:dev

# This creates a development APK with Expo Go capabilities
```

### Preview Build

For testing without development client:

```bash
npm run build:ios:preview

# Builds standalone app for internal testing
# Takes 10-15 minutes
```

### Production Build

For TestFlight submission:

```bash
npm run build:ios:prod

# Full production build with all optimizations
# Takes 15-20 minutes
```

### Build Process

The build will:

1. Validate app.json configuration
2. Check all required assets exist
3. Compile TypeScript and bundle code
4. Sign with distribution certificate
5. Create IPA file
6. Upload to EAS servers
7. Provide download link for testing

### Build Output

After successful build, you'll see:

```
Build created successfully! 🎉

Build ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Download: https://expo.dev/artifacts/eas/xxxxxxxx...
iOS: https://testflight.apple.com/join/...
```

## Building for Android (Google Play Internal)

### Development Build

For testing with Expo Go:

```bash
npm run build:android:dev

# Creates APK for Expo Go client
```

### Preview Build

For testing without Expo Go:

```bash
npm run build:android:preview

# Builds APK for internal testing
# Takes 10-15 minutes
```

### Production Build

For Google Play Store submission:

```bash
npm run build:android:prod

# Builds Android App Bundle (AAB)
# Required for Play Store submission
# Takes 15-20 minutes
```

### Build Process

The build will:

1. Validate app.json configuration
2. Check required assets
3. Compile and bundle code
4. Generate Android App Bundle
5. Sign with release key
6. Upload to EAS servers
7. Provide download link

## Submitting to App Stores

### Submit to TestFlight (iOS)

```bash
npm run submit:ios

# Or combined build + submit:
npm run deploy:testflight

# Interactive prompts will guide you through:
# - Selecting build to submit
# - Confirming Apple credentials
# - Monitoring upload progress
```

After submission:

1. Build processes in App Store Connect (30 minutes)
2. Internal testers get notification
3. Available in TestFlight immediately

### Submit to Google Play Internal (Android)

```bash
npm run submit:android

# Or combined build + submit:
npm run deploy:playstore-internal

# Will upload AAB to internal testing track
```

After submission:

1. Verifies APK/AAB integrity
2. Scans for malware
3. Available for internal testers immediately

### Manual Submission

If automated submission fails:

#### iOS:

1. Go to App Store Connect
2. Select app > TestFlight > iOS Builds
3. Manual build upload if needed
4. Add test information
5. Submit for review

#### Android:

1. Go to Google Play Console
2. Select app > Testing > Internal testing
3. Upload AAB file
4. Fill in release notes
5. Review and publish

## Managing Testers

### Adding iOS Testers (TestFlight)

1. Go to App Store Connect
2. Select app > TestFlight > Testers
3. Create test group (e.g., "Internal Team")
4. Add testers by email
5. Copy invitation link
6. Send to testers

Testers will:
- Receive email invitation
- Install TestFlight app
- Accept invitation
- Install Chotter Tech app from TestFlight

### Adding Android Testers (Google Play)

1. Go to Google Play Console
2. Select app > Testing > Internal testing
3. Add testers by email
4. Copy test link
5. Send to testers

Testers will:
- Accept email invitation
- Follow Play Store test link
- Opt-in to testing
- Download app from Play Store

### Revoking Tester Access

To remove testers:

**iOS:**
1. App Store Connect > Testers
2. Remove from test group

**Android:**
1. Google Play Console > Internal testing
2. Remove from tester list
3. They lose access in 48 hours

## Monitoring Builds

### View Build Status

```bash
# List recent builds
eas build:list

# View specific build details
eas build:view BUILD_ID

# Watch build progress
eas build --platform ios --profile production --monitor
```

### Build Logs

Access build logs:

1. Go to eas.dev dashboard
2. Select project
3. View build logs
4. Search for errors

Common issues:
- Missing or invalid certificates
- Icon/asset problems
- Environment variable issues
- Version conflicts

## Troubleshooting

### Build Failures

#### "Certificate not available"

```bash
# Reset credentials
eas credentials --platform ios --reset

# Re-run build to reconfigure
eas build --platform ios --profile production
```

#### "Invalid app.json"

Verify app.json syntax:
```bash
npx expo config
```

#### "Assets not found"

Check assets directory:
```bash
ls -la apps/mobile-tech/assets/
```

Ensure all required files exist with correct names.

### Submission Issues

#### "App already submitted"

Wait for previous build to process or:
1. Use different version number
2. Check App Store Connect for in-review builds

#### "Invalid signing"

For iOS:
```bash
# Regenerate provisioning profile
eas credentials --platform ios --reset
eas build --platform ios --profile production
```

For Android:
- Verify service account JSON is valid
- Check Play Console signing key configuration

### Tester Access Issues

#### iOS TestFlight Not Working

1. Verify tester email in App Store Connect
2. Check tester hasn't reached device limit (100 devices)
3. Resend TestFlight invitation
4. Ensure tester has iOS 13+

#### Android Not Showing in Play Store

1. Verify email in Play Console test group
2. Check user opted-in to testing
3. Try Google Play link again
4. Clear Play Store cache

### Performance Issues

If builds are slow:
- Check network connection
- Verify no certificate generation in progress
- Try building without simulators
- Check EAS service status

## Deployment Checklist

Before deploying:

- [ ] Version numbers updated
- [ ] Assets in place and valid
- [ ] Environment variables configured
- [ ] E2E tests passing
- [ ] No console errors
- [ ] Commit messages clean
- [ ] Feature complete for version
- [ ] Testing instructions prepared
- [ ] Tester list prepared
- [ ] Release notes written

## Support

For issues:

1. Check [Expo Documentation](https://docs.expo.dev)
2. Review [EAS Build Guide](https://docs.expo.dev/build/setup)
3. Check [TestFlight Guide](https://docs.expo.dev/build/internal-distribution/)
4. Contact Expo support at support@expo.dev
5. Check GitHub Issues in Chotter repo

## Next Steps

After deployment:

1. Send tester invitations
2. Monitor crash reports in TestFlight/Play Console
3. Gather user feedback
4. Prepare next version based on feedback
5. Update app for next release cycle
