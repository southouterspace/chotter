# Pre-Deployment Checklist

Complete this checklist before deploying to TestFlight or Google Play Internal Testing.

## Code Quality

- [ ] All E2E tests passing (`npm run test:e2e`)
- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] No console.log or debug statements remain
- [ ] No debugger statements present
- [ ] All TODOs resolved or documented
- [ ] Code reviewed by team member
- [ ] No sensitive data in code (API keys, tokens)
- [ ] Git history is clean

## Configuration

- [ ] `app.json` version updated to new version
- [ ] iOS `buildNumber` incremented
- [ ] Android `versionCode` incremented
- [ ] EAS project ID set in `app.json`
- [ ] `.env.production` configured with correct URLs
- [ ] Supabase URL is production URL
- [ ] Supabase anonymous key is production key
- [ ] Google Maps API key configured
- [ ] All required plugins in `app.json`

## Assets

- [ ] App icon exists (`assets/icon.png` - 1024x1024)
- [ ] Adaptive icon exists (`assets/adaptive-icon.png` - 1024x1024)
- [ ] Splash screen exists (`assets/splash.png` - 2048x2048 or 1284x2778)
- [ ] Notification icon exists (`assets/notification-icon.png` - 96x96)
- [ ] Favicon exists (`assets/favicon.png` - 48x48)
- [ ] All images are high quality
- [ ] Brand guidelines followed
- [ ] Icons render correctly on both platforms
- [ ] Splash screen displays properly

## Credentials & Secrets

- [ ] Apple Developer account access verified
- [ ] Apple Developer account in good standing
- [ ] Distribution certificate exists and is valid
- [ ] Provisioning profile created
- [ ] Google Play Developer account access verified
- [ ] Service account JSON downloaded (Android)
- [ ] Service account JSON placed in `secrets/` directory
- [ ] `secrets/` directory in `.gitignore`
- [ ] No credentials committed to git

## Environment Setup

- [ ] EAS CLI installed (`npm install -g eas-cli`)
- [ ] Expo CLI installed (`npm install -g expo-cli`)
- [ ] Logged into Expo account (`npx expo login`)
- [ ] EAS project initialized (`eas init`)
- [ ] iOS credentials configured (`eas credentials --platform ios`)
- [ ] Android credentials configured (`eas credentials --platform android`)
- [ ] All environment variables set in EAS dashboard if needed

## Testing

- [ ] App tested on iOS simulator
- [ ] App tested on Android emulator
- [ ] All screens load without errors
- [ ] Navigation works correctly
- [ ] Forms submit successfully
- [ ] API calls complete successfully
- [ ] Authentication flow works
- [ ] Location tracking functions
- [ ] Notifications display correctly
- [ ] Offline mode works if implemented
- [ ] Dark mode works correctly
- [ ] Camera and photo permissions work
- [ ] Performance is acceptable (no freezes or stutters)

## Functionality Verification

- [ ] User login works with test credentials
- [ ] Dashboard displays correctly
- [ ] Route information loads
- [ ] Appointments display
- [ ] Check-in/check-out functions
- [ ] Customer contact information displays
- [ ] Settings page accessible
- [ ] Profile page displays statistics
- [ ] Logout works correctly
- [ ] App handles network errors gracefully
- [ ] App handles no network (offline) gracefully

## Build Verification

- [ ] Preview build created successfully
- [ ] Preview build installs on device
- [ ] Preview build runs without crashes
- [ ] Preview build loads all data
- [ ] No errors in Xcode console (iOS)
- [ ] No errors in Android Studio console (Android)
- [ ] Build file sizes are reasonable

## Store Listings

- [ ] App name decided and finalized
- [ ] App description written (up to 4000 characters)
- [ ] Keyword tags selected for discoverability
- [ ] Privacy policy document ready
- [ ] Terms of service document ready
- [ ] Contact/support information prepared
- [ ] Screenshots captured in all required languages
- [ ] Screenshots display app functionality clearly
- [ ] Marketing materials reviewed

### iOS Specific

- [ ] Primary category selected
- [ ] Secondary category selected (if applicable)
- [ ] COPPA compliance verified (if applicable)
- [ ] Ratings/content descriptors verified
- [ ] Demo account credentials prepared
- [ ] Export compliance declaration complete
- [ ] End-user license agreement prepared

### Android Specific

- [ ] Content rating completed
- [ ] News apps declaration completed (if applicable)
- [ ] Advertising/analytics disclosure reviewed
- [ ] Target audience specified
- [ ] Content description finalized

## Documentation

- [ ] DEPLOYMENT.md reviewed and accurate
- [ ] PRE_DEPLOY_CHECKLIST.md completed
- [ ] TESTING_INSTRUCTIONS.md prepared
- [ ] Release notes written
- [ ] Known issues documented
- [ ] Troubleshooting guide current
- [ ] README.md updated if needed
- [ ] API documentation updated if changed

## Version & Release Info

- [ ] Version number follows semantic versioning
- [ ] Release notes prepared for testers
- [ ] Build number incremented correctly
- [ ] Changelog updated
- [ ] Git tags ready for release
- [ ] Commit message prepared
- [ ] PR description prepared if applicable

## Tester List

- [ ] Internal team member emails collected
- [ ] Tester count reasonable (start with 5-10)
- [ ] Testers have devices of appropriate OS
- [ ] Tester emails added to EAS project dashboard
- [ ] Welcome/instruction email prepared
- [ ] Feedback collection method decided
- [ ] Issue reporting process established

## Legal & Compliance

- [ ] Privacy policy up to date
- [ ] Data collection practices disclosed
- [ ] Third-party service terms accepted
- [ ] License agreements reviewed
- [ ] GDPR compliance verified (if applicable)
- [ ] CCPA compliance verified (if applicable)
- [ ] Accessibility standards checked
- [ ] No discriminatory content
- [ ] No restricted content

## Security

- [ ] No hardcoded secrets or API keys
- [ ] API endpoints use HTTPS
- [ ] Authentication tokens handled securely
- [ ] User data encrypted in transit
- [ ] Sensitive data not logged
- [ ] Third-party libraries up to date
- [ ] No known security vulnerabilities
- [ ] Permissions requested are necessary
- [ ] Deep links validated

## Performance

- [ ] App launches in under 3 seconds
- [ ] No memory leaks detected
- [ ] Bundle size is reasonable
- [ ] Images optimized
- [ ] Animations are smooth (60fps)
- [ ] Battery usage is acceptable
- [ ] Network requests are optimized
- [ ] Database queries are efficient

## Platform-Specific

### iOS

- [ ] Info.plist permissions documented
- [ ] App store icons match guidelines
- [ ] Safe area constraints respected
- [ ] Light status bar/dark status bar tested
- [ ] Simulator and device tested
- [ ] All iphone models tested if possible
- [ ] iPad layout functional if applicable

### Android

- [ ] Android manifest permissions complete
- [ ] Adaptive icons configured
- [ ] Night mode/dark theme tested
- [ ] Physical Android device tested
- [ ] Various Android versions tested
- [ ] Tablet layout functional if applicable
- [ ] Notch handling tested

## Post-Build Checklist

- [ ] Build created successfully
- [ ] Build download link verified
- [ ] Build file integrity verified
- [ ] Build size is expected
- [ ] Build expires in expected timeframe
- [ ] Build logs checked for warnings
- [ ] Build artifacts downloaded for backup
- [ ] Submission initiated
- [ ] Submission receipt received

## Sign-Off

- [ ] Lead developer approval: _______________ Date: ______
- [ ] QA approval: _______________ Date: ______
- [ ] Product manager approval: _______________ Date: ______

## Post-Deployment

- [ ] TestFlight/Play Store confirmation received
- [ ] Internal testers notified
- [ ] Monitoring setup complete
- [ ] Crash reporting enabled
- [ ] Analytics tracking verified
- [ ] Support channels prepared
- [ ] Issue tracking prepared for feedback
- [ ] Next release planning initiated

---

## Notes

Use this section to document any deviations or special considerations:

```
[Add any notes or special considerations here]
```

---

## Troubleshooting Quick Links

If issues occur during deployment:

1. **Build Failed**: See DEPLOYMENT.md > Troubleshooting
2. **Asset Issues**: Check ASSETS_README.md
3. **Credentials**: Run `eas credentials --platform ios/android`
4. **Version Conflict**: Increment build numbers higher
5. **Submission Blocked**: Check previous builds in console

## Questions?

Contact the team or refer to:
- DEPLOYMENT.md for detailed deployment guide
- TESTING_INSTRUCTIONS.md for tester instructions
- GitHub Wiki for common issues
- Expo Documentation: https://docs.expo.dev
