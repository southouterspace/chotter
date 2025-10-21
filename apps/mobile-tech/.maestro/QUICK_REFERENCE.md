# Maestro Quick Reference Guide

Quick reference for writing and running Maestro E2E tests.

## Running Tests

```bash
# Run all tests
maestro test .maestro/flows

# Run specific file
maestro test .maestro/flows/auth/login.yaml

# Run with specific platform
maestro test --platform iOS .maestro/flows
maestro test --platform Android .maestro/flows

# Generate JUnit report
maestro test --format junit --output results.xml .maestro/flows

# Run in continuous mode (auto-retry)
maestro test --continuous .maestro/flows
```

## Common Commands

### App Control

```yaml
# Launch app
- launchApp

# Clear app state
- clearState

# Clear keychain (iOS)
- clearKeychain

# Stop app
- stopApp

# Open link
- openLink: https://example.com
```

### Interactions

```yaml
# Tap by text
- tapOn: "Button Text"

# Tap by ID
- tapOn:
    id: "button-id"

# Tap by index
- tapOn:
    text: "Item"
    index: 0

# Tap coordinates
- tapOn:
    point: "50%,50%"

# Long press
- longPressOn: "Button"

# Scroll
- scroll

# Scroll to element
- scrollUntilVisible:
    element: "Text to find"

# Swipe
- swipe:
    direction: UP

# Back button
- back
```

### Input

```yaml
# Type text
- inputText: "Hello World"

# Use environment variable
- inputText: "${ENV_VAR}"

# Paste text
- inputText: "Text"
  paste: true

# Clear text
- eraseText

# Select text
- selectText
```

### Assertions

```yaml
# Assert visible
- assertVisible: "Text"

# Assert with regex
- assertVisible:
    text: "\\d+ items"
    regex: true

# Assert by ID
- assertVisible:
    id: "element-id"

# Assert not visible
- assertNotVisible: "Text"

# Assert true/false
- assertTrue: ${CONDITION}
```

### Utilities

```yaml
# Wait
- wait:
    milliseconds: 2000

# Take screenshot
- takeScreenshot: "screenshot-name"

# Set location
- setLocation:
    latitude: 37.7749
    longitude: -122.4194

# Run another flow
- runFlow: path/to/flow.yaml

# Repeat commands
- repeat:
    times: 3
    commands:
      - tapOn: "Next"

# Conditional execution
- runFlow:
    when:
      visible: "Skip"
    file: skip-flow.yaml
```

### Device Actions

```yaml
# Hide keyboard
- hideKeyboard

# Rotate device
- rotate

# Take screenshot on failure
- takeScreenshot:
    onFailure: true

# Set airplane mode (requires root)
- setAirplaneMode: true
```

## Selectors

### Text Matching

```yaml
# Exact match
- tapOn: "Login"

# Contains
- tapOn: "Log"

# Regex
- tapOn:
    text: "Log.*"
    regex: true

# Case insensitive
- tapOn:
    text: "login"
    ignoreCase: true
```

### Element Selection

```yaml
# By ID
- tapOn:
    id: "login-button"

# By index
- tapOn:
    text: "Item"
    index: 2

# By below/above/leftOf/rightOf
- tapOn:
    text: "Submit"
    below: "Email Input"

# Multiple conditions
- tapOn:
    text: "Submit"
    below: "Email"
    enabled: true
```

## Environment Variables

### Define in config.yaml

```yaml
appId: com.example.app
env:
  USERNAME: test@example.com
  PASSWORD: password123
  API_URL: https://api.example.com
```

### Use in tests

```yaml
- inputText: "${USERNAME}"
- inputText: "${PASSWORD}"
```

## Best Practices

### 1. Use Clear Element Identifiers

```yaml
# Good - specific ID
- tapOn:
    id: "login-submit-button"

# Okay - unique text
- tapOn: "Login to Account"

# Avoid - ambiguous
- tapOn: "Submit"
```

### 2. Add Waits for Dynamic Content

```yaml
# Wait for element
- assertVisible: "Loading..."
- assertVisible: "Content Loaded"

# Or explicit wait
- wait:
    milliseconds: 1000
```

### 3. Take Screenshots at Key Points

```yaml
- tapOn: "Submit"
- takeScreenshot: "after-submit"
- assertVisible: "Success"
- takeScreenshot: "success-message"
```

### 4. Use Descriptive Flow Names

```yaml
# Good
- runFlow: auth/login-with-valid-credentials.yaml

# Bad
- runFlow: test1.yaml
```

### 5. Keep Tests Atomic

Each test should be independent and not rely on state from other tests.

### 6. Use Comments

```yaml
# Verify user is logged in
- assertVisible: "Welcome"

# Navigate to profile
- tapOn: "Profile"
```

## Debugging

### Enable Debug Logging

```bash
maestro test --debug .maestro/flows/test.yaml
```

### View Element Hierarchy

```bash
maestro hierarchy
```

### Interactive Mode

```bash
maestro studio
```

## Common Patterns

### Login Flow

```yaml
- launchApp
- tapOn: "Email"
- inputText: "${TEST_EMAIL}"
- tapOn: "Password"
- inputText: "${TEST_PASSWORD}"
- tapOn: "Login"
- assertVisible: "Welcome"
```

### List Navigation

```yaml
- assertVisible: "Item List"
- tapOn:
    text: ".*Item.*"
    index: 0
- assertVisible: "Item Details"
```

### Form Submission

```yaml
- tapOn: "Name Input"
- inputText: "John Doe"
- tapOn: "Email Input"
- inputText: "john@example.com"
- tapOn: "Submit"
- assertVisible: "Success"
```

### Scroll to Bottom

```yaml
- repeat:
    times: 5
    commands:
      - scroll
- assertVisible: "Footer"
```

## Troubleshooting

### Element Not Found

```yaml
# Add wait
- wait:
    milliseconds: 2000
- tapOn: "Button"

# Or wait for element
- assertVisible: "Button"
- tapOn: "Button"
```

### Flaky Tests

```yaml
# Use more specific selectors
- tapOn:
    id: "specific-id"

# Add waits
- wait:
    milliseconds: 1000
```

### Platform-Specific Behavior

```yaml
# iOS only
- runFlow:
    when:
      platform: iOS
    file: ios-specific.yaml

# Android only
- runFlow:
    when:
      platform: Android
    file: android-specific.yaml
```

## Resources

- [Maestro Documentation](https://maestro.mobile.dev/docs)
- [Maestro GitHub](https://github.com/mobile-dev-inc/maestro)
- [Maestro Discord](https://discord.gg/maestro)
