# Chotter Mobile App - Testing Instructions

Thank you for testing the Chotter mobile app! This guide will help you get started and understand what to test.

## Getting the App

### iOS (TestFlight)

1. **Install TestFlight** (if not already installed)
   - Open App Store on your iPhone
   - Search for "TestFlight"
   - Tap "Get" to install the TestFlight app

2. **Accept Invitation**
   - Check your email for invitation from App Store Connect
   - Click "View in TestFlight" link or open link on iPhone
   - Or tap the public test link if provided

3. **Install Chotter Tech**
   - Open TestFlight app
   - Navigate to "Chotter Tech" app
   - Tap "Install" or "Update"
   - Wait for installation to complete

4. **Open the App**
   - Tap "Open" in TestFlight or find app on home screen
   - First launch may take a moment

### Android (Google Play Internal Testing)

1. **Accept Invitation**
   - Check your email for test invitation
   - Click the test link or copy URL

2. **Install the App**
   - You'll be directed to Google Play Store
   - Tap "Install" to download and install

3. **Grant Permissions**
   - App will request several permissions
   - Review each permission request
   - Tap "Allow" to grant necessary permissions

4. **Open the App**
   - Tap "Open" after installation completes
   - First launch may take a moment

## Test Credentials

Use these credentials for testing:

**Email:** `test@chotter.com`
**Password:** `TestPassword123!`

Or contact the development team for additional test accounts.

## What to Test

### 1. Authentication Flow

- [ ] Login with test credentials
- [ ] Verify login error with wrong password
- [ ] Verify email validation (invalid emails rejected)
- [ ] Successfully logged-in state persists
- [ ] Logout from settings works
- [ ] After logout, login screen displays

### 2. Dashboard & Main Screen

- [ ] Dashboard loads within 2 seconds
- [ ] All information displays correctly
- [ ] No blank screens or loading errors
- [ ] Refresh button works
- [ ] Dashboard content is accurate
- [ ] All dates and times display correctly

### 3. Route Viewing

- [ ] Daily route displays all appointments
- [ ] Route is in correct chronological order
- [ ] Each appointment shows correct details:
  - Customer name
  - Address
  - Time window
  - Job type
  - Service area
- [ ] Route updates when refreshed
- [ ] Map displays appointments correctly
- [ ] Route navigation is smooth

### 4. Appointment Details

- [ ] Tapping appointment shows full details
- [ ] Details include:
  - Customer contact information
  - Service description
  - Address and location
  - Appointment time
  - Estimated duration
  - Special notes
- [ ] Closing details view works smoothly
- [ ] Navigation between appointments works

### 5. Navigation

- [ ] "Get Directions" button launches maps
- [ ] Navigation works with Apple Maps (iOS) or Google Maps (Android)
- [ ] Turn-by-turn directions display
- [ ] Estimated travel time is accurate
- [ ] Current location shows correctly

### 6. Check-In/Check-Out

- [ ] Check-in button is accessible from appointment
- [ ] Check-in confirmation displays address
- [ ] Check-in timestamp records correctly
- [ ] After check-in, status shows "In Progress"
- [ ] Check-out button appears after check-in
- [ ] Check-out timestamp records correctly
- [ ] Appointment status updates to "Completed"

### 7. Job Completion

- [ ] Can add notes to completed appointment
- [ ] Can take photo from camera (if permissions granted)
- [ ] Can attach photo from gallery
- [ ] Photos display correctly
- [ ] Can remove attached photos
- [ ] Completion saves successfully
- [ ] Completed jobs show in history

### 8. Location & GPS

- [ ] App requests location permission on first launch
- [ ] Location permission can be granted/denied
- [ ] Current location displays on map
- [ ] Location accuracy is reasonable
- [ ] Location updates as device moves
- [ ] Background location tracking works (if required)

**Note:** For accurate location testing, use a real device or location simulation in development tools.

### 9. Customer Contact

- [ ] Customer phone number displays
- [ ] "Call" button launches phone dialer
- [ ] Customer email displays
- [ ] "Email" button launches email app
- [ ] Customer address displays correctly
- [ ] Address can be copied to clipboard

### 10. Profile & Stats

- [ ] Profile page loads
- [ ] Shows current name and email
- [ ] Shows job statistics:
  - Total jobs completed
  - Jobs this week
  - Average rating (if applicable)
  - Hours worked
- [ ] Profile photo displays (if set)
- [ ] Settings menu accessible

### 11. Settings

- [ ] Navigate to Settings from profile
- [ ] Can update first and last name
- [ ] Changes save successfully
- [ ] Can toggle notifications (if applicable)
- [ ] Dark mode toggle works (if applicable)
- [ ] Version information displays
- [ ] Support email link works
- [ ] Privacy policy link works (if included)
- [ ] Logout button works and returns to login

### 12. Notifications

- [ ] Enable notifications in settings
- [ ] Notification arrives when appointment assigned
- [ ] Notification displays appointment details
- [ ] Tapping notification opens appointment
- [ ] Can dismiss notifications
- [ ] Notifications don't spam
- [ ] Disable notifications in settings

### 13. Offline Functionality

- [ ] App works without internet initially
- [ ] Previously loaded data displays offline
- [ ] Offline badge shows when no connection
- [ ] Cannot perform actions requiring internet
- [ ] Restore internet connection
- [ ] Data syncs when connection returns
- [ ] No data loss during offline period

### 14. Performance

- [ ] App launches quickly (under 3 seconds)
- [ ] No freezes or stuttering
- [ ] Screen transitions are smooth
- [ ] List scrolling is smooth
- [ ] Maps load and pan smoothly
- [ ] Animations are not choppy
- [ ] No unexpected crashes
- [ ] Battery usage is reasonable

### 15. UI/UX

- [ ] All buttons are easily tappable
- [ ] Text is readable and properly sized
- [ ] Colors match dark/light theme
- [ ] Layout works in both orientations (if applicable)
- [ ] No overlapping elements
- [ ] Keyboard doesn't cover important fields
- [ ] Error messages are clear
- [ ] Success messages appear appropriately

### 16. Permissions

Test all required permissions:

**iOS:**
- [ ] Location Always & When In Use
- [ ] Camera
- [ ] Photo Library
- [ ] Contacts (if applicable)
- [ ] Notifications

**Android:**
- [ ] ACCESS_FINE_LOCATION
- [ ] ACCESS_COARSE_LOCATION
- [ ] CAMERA
- [ ] READ_EXTERNAL_STORAGE
- [ ] WRITE_EXTERNAL_STORAGE
- [ ] POST_NOTIFICATIONS

### 17. Error Handling

- [ ] App handles network errors gracefully
- [ ] Error messages are helpful
- [ ] App doesn't crash on error
- [ ] Can retry after error
- [ ] Permission denial is handled
- [ ] Invalid input shows validation error
- [ ] Timeout errors display correctly

### 18. Data Accuracy

- [ ] Appointments match daily schedule
- [ ] Customer information is correct
- [ ] Addresses are accurate
- [ ] Times and dates are correct
- [ ] Service descriptions match expectations
- [ ] Completed jobs are recorded
- [ ] Time tracking is accurate

## Reporting Issues

When you find a bug or issue, please report it with:

### Issue Report Template

**Platform:** iOS / Android

**Device:** iPhone X / Samsung Galaxy S21 (etc.)

**OS Version:** iOS 17.0 / Android 14

**App Version:** 1.0.0

**Steps to Reproduce:**
1. First step
2. Second step
3. Third step

**Expected Result:**
What should happen?

**Actual Result:**
What actually happened?

**Screenshots/Video:**
Attach screenshots or videos if helpful

**Additional Notes:**
Any other relevant information

### How to Report

Report issues through:
1. **TestFlight** (iOS): Use the built-in feedback feature
   - Shake device to send feedback
   - Or use "Send Test Session Feedback" option

2. **Google Play** (Android): Use the in-app feedback option
   - Or reply to the invitation email

3. **Direct Contact:** Email support@chotter.com
   - Include issue report template above
   - Send screenshots if applicable

4. **Chat/Messaging:** Contact development team directly if needed

## Feedback

We'd love to hear your feedback! Please share:

- [ ] What works well?
- [ ] What's confusing?
- [ ] What features would help you?
- [ ] Performance observations
- [ ] Usability suggestions
- [ ] Any other comments

## Testing Timeframe

- [ ] Initial testing: Complete within 24 hours
- [ ] Bug reporting: Report within 2 hours of discovery
- [ ] Response time: Team will respond within 24 hours
- [ ] Final feedback: Complete all testing by [DATE]

## Common Issues

### App Won't Install

**iOS:**
- Ensure TestFlight app is installed
- Check you accepted the invitation
- Try removing and re-accepting invitation

**Android:**
- Ensure you accepted test email invitation
- Check device has enough storage
- Try clearing Play Store cache

### App Crashes on Launch

- Try reinstalling the app
- Clear app data/cache (be careful not to lose data)
- Report the crash with device and OS version

### Can't Log In

- Verify test credentials are correct
- Check device has internet connection
- Try resetting password if available
- Contact team if issue persists

### Location Not Working

- Verify location permission granted
- Enable location in device settings
- Try moving to outdoor area with clear sky
- Restart app and try again

### Notifications Not Working

- Enable notifications in app settings
- Check device notification settings
- Ensure app has notification permission
- Try disabling and re-enabling notifications

## Questions?

If you have questions:

1. Review this guide again
2. Check DEPLOYMENT.md for technical details
3. Contact the development team
4. Email support@chotter.com

## Thank You!

Your testing is invaluable in making Chotter a great product. We appreciate your time and feedback!

---

**App Version:** 1.0.0
**Testing Period:** [Start Date] - [End Date]
**Platform:** iOS 13+ / Android 8+
**Test Group:** Internal Testing
