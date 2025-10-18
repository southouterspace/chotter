import type { Hono } from 'hono';

/**
 * Helper to make test requests to the API
 *
 * Usage:
 *   const res = await testRequest(app, '/health');
 */
export async function testRequest(
  app: Hono,
  path: string,
  options?: RequestInit
): Promise<Response> {
  const url = `http://localhost${path}`;
  const request = new Request(url, options);
  return app.fetch(request);
}

/**
 * Helper to make authenticated test requests
 *
 * Usage:
 *   const res = await testAuthRequest(app, '/protected', token);
 */
export async function testAuthRequest(
  app: Hono,
  path: string,
  token: string,
  options?: RequestInit
): Promise<Response> {
  const url = `http://localhost${path}`;
  const headers = new Headers(options?.headers);
  headers.set('Authorization', `Bearer ${token}`);

  const request = new Request(url, {
    ...options,
    headers,
  });

  return app.fetch(request);
}

/**
 * Helper to parse JSON response
 *
 * Usage:
 *   const data = await parseJSON(response);
 */
export async function parseJSON<T = any>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

/**
 * Helper to create a mock JWT token for testing
 * Note: This is NOT a real JWT, just for testing structure
 *
 * Usage:
 *   const token = createMockToken('user-123');
 */
export function createMockToken(userId: string): string {
  // This is just a mock for testing purposes
  // In real tests, you'd generate a proper JWT or use a test token from Supabase
  return `mock-token-${userId}`;
}

/**
 * Type for test health response
 */
export interface HealthResponse {
  status: string;
  timestamp: string;
  database: string;
  environment: string;
  responseTime: string;
  version: string;
  error?: string;
}

/**
 * Type for test error response
 */
export interface ErrorResponse {
  error: string;
  message?: string;
  details?: Array<{
    path: string;
    message: string;
  }>;
}
