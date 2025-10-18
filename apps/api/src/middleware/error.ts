import type { ErrorHandler } from 'hono';
import { ZodError } from 'zod';
import { env } from '../lib/env';

/**
 * Global error handler for the API
 *
 * Handles:
 * - Zod validation errors
 * - HTTP errors from Hono
 * - Unexpected errors
 */
export const errorHandler: ErrorHandler = (err, c) => {
  console.error('Error:', err);

  // Zod validation errors
  if (err instanceof ZodError) {
    return c.json(
      {
        error: 'Validation error',
        details: err.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      },
      400
    );
  }

  // HTTP errors from Hono
  if ('status' in err && typeof err.status === 'number') {
    return c.json(
      {
        error: err.message || 'An error occurred',
      },
      err.status
    );
  }

  // Unexpected errors
  const isDevelopment = env.NODE_ENV === 'development';

  return c.json(
    {
      error: 'Internal server error',
      ...(isDevelopment && {
        message: err.message,
        stack: err.stack,
      }),
    },
    500
  );
};

/**
 * Custom API error class
 *
 * Usage:
 *   throw new ApiError('User not found', 404);
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 500
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
