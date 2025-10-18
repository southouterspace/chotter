import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { healthRouter } from '../../routes/health';
import { testRequest, parseJSON, type HealthResponse } from '../helpers';

describe('Health Endpoint', () => {
  // Create a test app with just the health router
  const app = new Hono();
  app.route('/health', healthRouter);

  describe('GET /health', () => {
    it('should return 200 OK', async () => {
      const res = await testRequest(app, '/health');
      expect(res.status).toBe(200);
    });

    it('should return correct response structure', async () => {
      const res = await testRequest(app, '/health');
      const body = await parseJSON<HealthResponse>(res);

      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('timestamp');
      expect(body).toHaveProperty('database');
      expect(body).toHaveProperty('environment');
      expect(body).toHaveProperty('responseTime');
      expect(body).toHaveProperty('version');
    });

    it('should have status "ok"', async () => {
      const res = await testRequest(app, '/health');
      const body = await parseJSON<HealthResponse>(res);

      expect(body.status).toBe('ok');
    });

    it('should check database connection status', async () => {
      const res = await testRequest(app, '/health');
      const body = await parseJSON<HealthResponse>(res);

      // Database should be either connected or disconnected
      expect(['connected', 'disconnected']).toContain(body.database);
    });

    it('should return valid ISO 8601 timestamp', async () => {
      const res = await testRequest(app, '/health');
      const body = await parseJSON<HealthResponse>(res);

      const timestamp = new Date(body.timestamp);
      expect(timestamp.toISOString()).toBe(body.timestamp);
      expect(timestamp.getTime()).toBeGreaterThan(Date.now() - 5000); // Within last 5 seconds
    });

    it('should return response time', async () => {
      const res = await testRequest(app, '/health');
      const body = await parseJSON<HealthResponse>(res);

      expect(body.responseTime).toMatch(/^\d+ms$/);
    });

    it('should return version', async () => {
      const res = await testRequest(app, '/health');
      const body = await parseJSON<HealthResponse>(res);

      expect(body.version).toBe('0.1.0');
    });

    it('should return environment', async () => {
      const res = await testRequest(app, '/health');
      const body = await parseJSON<HealthResponse>(res);

      expect(['development', 'test', 'production']).toContain(body.environment);
    });
  });

  describe('GET /health/detailed', () => {
    it('should return 200 OK', async () => {
      const res = await testRequest(app, '/health/detailed');
      expect(res.status).toBe(200);
    });

    it('should return detailed health information', async () => {
      const res = await testRequest(app, '/health/detailed');
      const body = await parseJSON(res);

      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('timestamp');
      expect(body).toHaveProperty('checks');
      expect(body.checks).toHaveProperty('database');
      expect(body.checks).toHaveProperty('environment');
    });

    it('should include database check details', async () => {
      const res = await testRequest(app, '/health/detailed');
      const body = await parseJSON(res);

      expect(body.checks.database).toHaveProperty('status');
      expect(body.checks.database).toHaveProperty('responseTime');
      expect(body.checks.database).toHaveProperty('message');
    });

    it('should include environment details', async () => {
      const res = await testRequest(app, '/health/detailed');
      const body = await parseJSON(res);

      expect(body.checks.environment).toHaveProperty('status');
      expect(body.checks.environment).toHaveProperty('nodeEnv');
      expect(body.checks.environment).toHaveProperty('port');
      expect(body.checks.environment).toHaveProperty('corsOrigins');
    });

    it('should return CORS origins as array', async () => {
      const res = await testRequest(app, '/health/detailed');
      const body = await parseJSON(res);

      expect(Array.isArray(body.checks.environment.corsOrigins)).toBe(true);
    });
  });
});
