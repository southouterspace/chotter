import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { requireAuth, optionalAuth } from '../../middleware/auth';
import { testRequest, testAuthRequest, parseJSON, type ErrorResponse } from '../helpers';

describe('Auth Middleware', () => {
  describe('requireAuth', () => {
    const app = new Hono();

    // Test endpoint that requires auth
    app.get('/protected', requireAuth, (c) => {
      const user = c.get('user');
      return c.json({ success: true, userId: user.id });
    });

    it('should return 401 when no Authorization header is provided', async () => {
      const res = await testRequest(app, '/protected');
      expect(res.status).toBe(401);
    });

    it('should return error message when no Authorization header is provided', async () => {
      const res = await testRequest(app, '/protected');
      const body = await parseJSON<ErrorResponse>(res);

      expect(body).toHaveProperty('error');
      expect(body.error).toContain('Authorization');
    });

    it('should return 401 when Authorization header does not start with "Bearer "', async () => {
      const res = await testRequest(app, '/protected', {
        headers: {
          Authorization: 'Basic invalid-token',
        },
      });

      expect(res.status).toBe(401);
    });

    it('should return 401 when token is invalid', async () => {
      const res = await testAuthRequest(app, '/protected', 'invalid-token');
      expect(res.status).toBe(401);
    });

    it('should return error message when token is invalid', async () => {
      const res = await testAuthRequest(app, '/protected', 'invalid-token');
      const body = await parseJSON<ErrorResponse>(res);

      expect(body).toHaveProperty('error');
      expect(body.error).toMatch(/invalid|expired|token/i);
    });

    it('should return 401 when token is empty', async () => {
      const res = await testAuthRequest(app, '/protected', '');
      expect(res.status).toBe(401);
    });

    // Note: Testing with valid tokens requires a real Supabase instance
    // For integration tests, you would:
    // 1. Create a test user in Supabase
    // 2. Get a valid JWT token
    // 3. Test successful authentication
    it.skip('should allow access with valid token', async () => {
      // This test requires a real Supabase token
      // In a real test environment, you would:
      // const validToken = await getTestToken();
      // const res = await testAuthRequest(app, '/protected', validToken);
      // expect(res.status).toBe(200);
    });
  });

  describe('optionalAuth', () => {
    const app = new Hono();

    // Test endpoint with optional auth
    app.get('/public', optionalAuth, (c) => {
      const user = c.get('user');
      return c.json({
        success: true,
        authenticated: !!user,
        userId: user?.id,
      });
    });

    it('should allow access without Authorization header', async () => {
      const res = await testRequest(app, '/public');
      expect(res.status).toBe(200);
    });

    it('should indicate not authenticated when no token provided', async () => {
      const res = await testRequest(app, '/public');
      const body = await parseJSON(res);

      expect(body.success).toBe(true);
      expect(body.authenticated).toBe(false);
      expect(body.userId).toBeUndefined();
    });

    it('should allow access with invalid token (does not fail)', async () => {
      const res = await testAuthRequest(app, '/public', 'invalid-token');
      expect(res.status).toBe(200);
    });

    it('should indicate not authenticated when token is invalid', async () => {
      const res = await testAuthRequest(app, '/public', 'invalid-token');
      const body = await parseJSON(res);

      expect(body.success).toBe(true);
      expect(body.authenticated).toBe(false);
    });

    // Note: Testing with valid tokens requires a real Supabase instance
    it.skip('should indicate authenticated with valid token', async () => {
      // This test requires a real Supabase token
      // const validToken = await getTestToken();
      // const res = await testAuthRequest(app, '/public', validToken);
      // const body = await parseJSON(res);
      // expect(body.authenticated).toBe(true);
      // expect(body.userId).toBeDefined();
    });
  });

  describe('Authorization header parsing', () => {
    const app = new Hono();
    app.get('/test', requireAuth, (c) => c.json({ success: true }));

    it('should reject when Authorization header is malformed', async () => {
      const res = await testRequest(app, '/test', {
        headers: {
          Authorization: 'Bearer',
        },
      });

      expect(res.status).toBe(401);
    });

    it('should reject when Authorization header has no token', async () => {
      const res = await testRequest(app, '/test', {
        headers: {
          Authorization: 'Bearer ',
        },
      });

      expect(res.status).toBe(401);
    });

    it('should handle tokens with special characters', async () => {
      const res = await testAuthRequest(app, '/test', 'token.with.dots');
      // Should still return 401 (invalid token), but shouldn't crash
      expect(res.status).toBe(401);
    });
  });
});
