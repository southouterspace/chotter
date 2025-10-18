# Chotter API

The backend API server for Chotter, built with Hono and Bun.

## Overview

This is a fast, lightweight API server that provides:

- **Health monitoring** endpoints for uptime checks
- **Authentication** middleware with JWT validation
- **Error handling** with structured error responses
- **CORS** configuration for web clients
- **Type-safe** Supabase integration

## Getting Started

### Prerequisites

- Bun runtime installed
- Supabase project credentials
- Environment variables configured

### Environment Variables

Create a `.env` file in the `apps/api` directory:

```env
# Server
PORT=3000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Stripe (optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OpenAI (optional)
OPENAI_API_KEY=sk-...
```

### Installation

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Run tests
bun test

# Run tests in watch mode
bun run test:watch

# Generate test coverage
bun run test:coverage
```

## Project Structure

```
apps/api/
├── src/
│   ├── index.ts              # Application entry point
│   ├── middleware/
│   │   ├── auth.ts           # JWT authentication middleware
│   │   └── error.ts          # Global error handler
│   ├── routes/
│   │   └── health.ts         # Health check endpoints
│   ├── lib/
│   │   ├── env.ts            # Environment variable validation
│   │   └── supabase.ts       # Supabase client helpers
│   └── test/
│       ├── setup.ts          # Test setup configuration
│       ├── helpers.ts        # Test utility functions
│       └── __tests__/
│           ├── health.test.ts    # Health endpoint tests
│           └── auth.test.ts      # Auth middleware tests
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## API Endpoints

### Health Checks

#### `GET /health`

Basic health check endpoint.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-10-17T12:00:00.000Z",
  "database": "connected",
  "environment": "development",
  "responseTime": "15ms",
  "version": "0.1.0"
}
```

#### `GET /health/detailed`

Detailed health check with additional information.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-10-17T12:00:00.000Z",
  "environment": "development",
  "version": "0.1.0",
  "responseTime": "20ms",
  "checks": {
    "database": {
      "status": "ok",
      "responseTime": "18ms",
      "message": "Connected"
    },
    "environment": {
      "status": "ok",
      "nodeEnv": "development",
      "port": "3000",
      "corsOrigins": ["http://localhost:5173", "http://localhost:3000"]
    }
  }
}
```

## Middleware

### Authentication

The API provides two authentication middleware functions:

#### `requireAuth`

Requires a valid JWT token in the Authorization header.

**Usage:**

```typescript
import { requireAuth } from './middleware/auth';

app.get('/protected', requireAuth, (c) => {
  const user = c.get('user'); // User object from JWT
  return c.json({ userId: user.id });
});
```

**Request:**

```bash
curl -H "Authorization: Bearer your-jwt-token" http://localhost:3000/protected
```

**Error Response (401):**

```json
{
  "error": "Missing or invalid Authorization header"
}
```

#### `optionalAuth`

Optionally authenticates if a token is provided, but doesn't fail if missing.

**Usage:**

```typescript
import { optionalAuth } from './middleware/auth';

app.get('/public', optionalAuth, (c) => {
  const user = c.get('user'); // May be undefined
  return c.json({ authenticated: !!user });
});
```

### Error Handling

Global error handler that catches:

- Zod validation errors (400)
- HTTP errors from Hono
- Unexpected errors (500)

**Validation Error Response:**

```json
{
  "error": "Validation error",
  "details": [
    {
      "path": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**Server Error Response (Development):**

```json
{
  "error": "Internal server error",
  "message": "Error details...",
  "stack": "Error stack trace..."
}
```

**Server Error Response (Production):**

```json
{
  "error": "Internal server error"
}
```

## Testing

The API uses Vitest for integration testing.

### Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun run test:watch

# Run with coverage
bun run test:coverage
```

### Test Structure

```typescript
import { describe, it, expect } from 'vitest';
import { testRequest, parseJSON } from '../helpers';

describe('My Endpoint', () => {
  it('should return 200', async () => {
    const res = await testRequest(app, '/my-endpoint');
    expect(res.status).toBe(200);
  });
});
```

### Test Helpers

- `testRequest(app, path, options?)` - Make a test request
- `testAuthRequest(app, path, token, options?)` - Make an authenticated request
- `parseJSON(response)` - Parse JSON response

## Development Guidelines

### Adding a New Route

1. Create route file in `src/routes/`
2. Define Hono router with endpoints
3. Add route to `src/index.ts`
4. Create tests in `src/test/__tests__/`

**Example:**

```typescript
// src/routes/example.ts
import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';

export const exampleRouter = new Hono();

exampleRouter.get('/', requireAuth, async (c) => {
  const user = c.get('user');
  return c.json({ message: 'Hello', userId: user.id });
});

// src/index.ts
import { exampleRouter } from './routes/example';

app.route('/example', exampleRouter);
```

### Adding Middleware

1. Create middleware file in `src/middleware/`
2. Use `createMiddleware` from Hono
3. Add to app in `src/index.ts` or route-specific

**Example:**

```typescript
// src/middleware/rate-limit.ts
import { createMiddleware } from 'hono/factory';

export const rateLimit = createMiddleware(async (c, next) => {
  // Rate limiting logic
  await next();
});

// src/index.ts
app.use('*', rateLimit);
```

## Deployment

### Building for Production

```bash
bun run build
```

### Running in Production

```bash
NODE_ENV=production bun run start
```

### Environment Variables

Ensure all required environment variables are set in your production environment:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CORS_ORIGINS`
- `PORT` (optional, defaults to 3000)

## Future Enhancements

The following routes are planned for future phases:

- `/webhooks` - Stripe webhook handlers (Phase 3)
- `/ai-agent` - AI booking assistant endpoints (Phase 4-6)
- `/payments` - Payment processing endpoints (Phase 3)
- `/appointments` - Appointment management (Phase 2)
- `/businesses` - Business management (Phase 2)

## License

Private - Chotter Project
