# App Assets - Please Replace

This directory contains placeholder assets for the Chotter mobile app. You'll need to replace them with actual assets.

## Required Assets

### icon.png (1024x1024)
- App icon displayed on home screen
- Format: PNG with transparency
- Design: Chotter logo or app icon

### adaptive-icon.png (1024x1024)
- Android adaptive icon foreground
- Format: PNG with transparency
- Used by Android adaptive icon system

### splash.png (1284x2778 or 2048x2048)
- Splash screen shown on app launch
- Format: PNG
- Should display Chotter branding

### notification-icon.png (96x96)
- Icon used for push notifications
- Format: PNG
- Should be simple and recognizable

### favicon.png (48x48)
- Website favicon for web build
- Format: PNG
- Optional if not building for web

## How to Generate

You can use online tools to generate app icons from your logo:

1. **Icon generators:**
   - https://www.appicon.co
   - https://www.favicon-generator.org
   - https://icon.kitchen

2. **Splash screen generators:**
   - https://www.figma.com (design from scratch)
   - https://splash.screen.tools

3. **Design tips:**
   - Use Chotter's brand colors
   - Ensure good contrast for readability
   - Test on different screen sizes
   - Follow platform-specific guidelines

## Assets Location

```
apps/mobile-tech/assets/
├── icon.png              # App icon (1024x1024)
├── adaptive-icon.png     # Android adaptive icon (1024x1024)
├── splash.png            # Splash screen (1284x2778)
├── notification-icon.png # Notification icon (96x96)
└── favicon.png           # Web favicon (48x48)
```

## Next Steps

1. Replace placeholder icons with actual Chotter branding
2. Update app.json with correct asset references
3. Test on iOS and Android simulators
4. Verify splash screen displays correctly on launch

## Reference

- [Expo Assets Documentation](https://docs.expo.dev/guides/assets)
- [iOS App Icons Guide](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Android App Icons Guide](https://developer.android.com/guide/practices/ui_guidelines/icon_design_launcher)
