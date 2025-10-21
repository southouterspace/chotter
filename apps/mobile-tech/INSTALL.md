# Installation Instructions

## Dependencies Installation

Due to peer dependency conflicts in the monorepo, install dependencies using:

```bash
cd apps/mobile-tech
npm install --legacy-peer-deps
```

Alternatively, if you continue to have issues:

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock
rm -rf node_modules package-lock.json

# Install with legacy peer deps
npm install --legacy-peer-deps
```

## Verifying Installation

After successful installation, verify by running:

```bash
npm start
```

You should see the Expo dev server start without errors.

## Common Issues

### Issue: Peer dependency conflicts
**Solution**: Use `--legacy-peer-deps` flag

### Issue: Cannot read properties of null
**Solution**: Clear npm cache and retry:
```bash
npm cache clean --force
rm -rf node_modules
npm install --legacy-peer-deps
```

### Issue: Expo CLI not found
**Solution**: Install Expo CLI globally (optional):
```bash
npm install -g expo-cli
```

## Next Steps

After installation:
1. Configure environment variables (see `.env` file)
2. Start Supabase: `supabase start`
3. Apply migrations: `supabase db push`
4. Start Expo: `npm start`
5. Scan QR code with Expo Go app
