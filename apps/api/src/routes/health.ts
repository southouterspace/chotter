import { Hono } from 'hono';
import { createSupabaseServerClient } from '../lib/supabase';
import { env } from '../lib/env';

export const healthRouter = new Hono();

/**
 * Basic health check endpoint
 * GET /health
 *
 * Returns:
 * - status: ok
 * - timestamp: current time
 * - database: connection status
 * - environment: current NODE_ENV
 */
healthRouter.get('/', async (c) => {
  const startTime = Date.now();

  try {
    // Check database connection by running a simple query
    const client = createSupabaseServerClient();
    const { error } = await client.from('businesses').select('count').limit(1).single();

    const responseTime = Date.now() - startTime;

    return c.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: error ? 'disconnected' : 'connected',
      environment: env.NODE_ENV,
      responseTime: `${responseTime}ms`,
      version: '0.1.0',
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return c.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'error',
        environment: env.NODE_ENV,
        responseTime: `${responseTime}ms`,
        version: '0.1.0',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      503
    );
  }
});

/**
 * Detailed health check (for monitoring)
 * GET /health/detailed
 *
 * Returns additional information about the service
 */
healthRouter.get('/detailed', async (c) => {
  const startTime = Date.now();

  try {
    const client = createSupabaseServerClient();

    // Check database connection
    const { error: dbError } = await client
      .from('businesses')
      .select('*', { count: 'exact', head: true });

    const responseTime = Date.now() - startTime;

    return c.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      version: '0.1.0',
      responseTime: `${responseTime}ms`,
      checks: {
        database: {
          status: dbError ? 'error' : 'ok',
          responseTime: `${responseTime}ms`,
          message: dbError ? dbError.message : 'Connected',
        },
        environment: {
          status: 'ok',
          nodeEnv: env.NODE_ENV,
          port: env.PORT,
          corsOrigins: env.CORS_ORIGINS.split(','),
        },
      },
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return c.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
        version: '0.1.0',
        responseTime: `${responseTime}ms`,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      503
    );
  }
});
