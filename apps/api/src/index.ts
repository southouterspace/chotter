import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { errorHandler } from './middleware/error';
import { healthRouter } from './routes/health';
import { env } from './lib/env';

// Initialize Hono app
const app = new Hono();

// Global middleware
app.use(
  '*',
  cors({
    origin: env.CORS_ORIGINS.split(','),
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use('*', logger());

// Routes
app.route('/health', healthRouter);

// Future routes (placeholders for Phase 2-9)
// app.route('/webhooks', webhooksRouter);
// app.route('/ai-agent', aiAgentRouter);
// app.route('/payments', paymentsRouter);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      error: 'Not Found',
      message: 'The requested endpoint does not exist',
      path: c.req.path,
    },
    404
  );
});

// Error handling (must be last)
app.onError(errorHandler);

// Export for Bun runtime
export default {
  port: env.PORT,
  fetch: app.fetch,
};

// Log startup
console.log(`
╔═══════════════════════════════════════════╗
║      🚀 Chotter API Server Started       ║
╚═══════════════════════════════════════════╝

Environment: ${env.NODE_ENV}
Port:        ${env.PORT}
CORS:        ${env.CORS_ORIGINS}
Database:    ${env.SUPABASE_URL}

Endpoints:
  - GET  /health          Health check
  - GET  /health/detailed Detailed health check

Ready to accept requests!
`);
