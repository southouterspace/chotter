# Chotter Mobile Technician App

React Native mobile app for field technicians to manage their daily routes and appointments.

## Features

- 📅 View daily route and appointments
- 📍 GPS navigation to job sites
- ✅ Check-in/check-out functionality
- 📞 Contact customers directly
- 📊 View performance statistics
- 🌙 Dark mode support
- 📴 Offline support

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- iOS Simulator (Xcode) or Android Emulator
- Expo Go app (for testing on physical devices)

### Installation

```bash
# Install dependencies
bun install

# Start development server
bun start
```

### Running the App

```bash
# Run on iOS Simulator
bun run ios

# Run on Android Emulator
bun run android

# Run in web browser
bun run web
```

## Testing

### E2E Tests with Maestro

This app uses [Maestro](https://maestro.mobile.dev) for end-to-end testing.

#### Install Maestro

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

#### Run E2E Tests

```bash
# Run all E2E tests
bun run test:e2e

# Run specific test suites
bun run test:e2e:auth       # Authentication tests
bun run test:e2e:route      # Route viewing tests
bun run test:e2e:checkin    # Check-in tests
bun run test:e2e:profile    # Profile tests

# Run complete user journey
bun run test:e2e:complete

# Platform-specific
bun run test:e2e:ios        # iOS only
bun run test:e2e:android    # Android only
```

See [E2E_TESTING.md](./E2E_TESTING.md) for detailed testing documentation.

## Project Structure

```
mobile-tech/
├── .maestro/              # E2E test suite
│   ├── flows/            # Test flows
│   ├── config.yaml       # Test configuration
│   └── setup.sh          # Test environment setup
├── app/                  # App source code
├── E2E_TESTING.md        # Testing documentation
└── package.json
```

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Testing**: Maestro (E2E)
- **Backend**: Supabase
- **Maps**: React Native Maps
- **Navigation**: Expo Router

## Development

### Code Quality

```bash
# Run linter
bun run lint

# Format code
bun run format
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Deployment

### Build for Production

```bash
# Build iOS
eas build --platform ios

# Build Android
eas build --platform android

# Build both
eas build --platform all
```

### Submit to App Stores

```bash
# Submit to Apple App Store
eas submit --platform ios

# Submit to Google Play Store
eas submit --platform android
```

## Documentation

- [E2E Testing Guide](./E2E_TESTING.md) - Comprehensive testing documentation
- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev)

## Support

For questions or issues:
1. Check the documentation
2. Review E2E test examples
3. Contact the development team
