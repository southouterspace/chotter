import { createMiddleware } from 'hono/factory';
import type { User } from '@supabase/supabase-js';
import { createSupabaseClient } from '../lib/supabase';

// Extend Hono's context with user
type Variables = {
  user: User;
};

/**
 * Authentication middleware that validates JWT tokens
 *
 * Usage:
 *   app.get('/protected', requireAuth, (c) => {
 *     const user = c.get('user');
 *     return c.json({ userId: user.id });
 *   });
 */
export const requireAuth = createMiddleware<{ Variables: Variables }>(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid Authorization header' }, 401);
  }

  const token = authHeader.substring(7);

  try {
    const supabase = createSupabaseClient(token);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return c.json({ error: 'Invalid or expired token' }, 401);
    }

    // Add user to context
    c.set('user', user);
    return await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json({ error: 'Authentication failed' }, 401);
  }
});

/**
 * Optional authentication middleware
 * Adds user to context if token is valid, but doesn't fail if missing
 *
 * Usage:
 *   app.get('/public-or-private', optionalAuth, (c) => {
 *     const user = c.get('user'); // May be undefined
 *     return c.json({ isAuthenticated: !!user });
 *   });
 */
export const optionalAuth = createMiddleware<{ Variables: Variables }>(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);

    try {
      const supabase = createSupabaseClient(token);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        c.set('user', user);
      }
    } catch (error) {
      // Ignore errors for optional auth
      console.debug('Optional auth failed:', error);
    }
  }

  await next();
});
