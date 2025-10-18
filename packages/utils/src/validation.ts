/**
 * Validation schemas using Zod
 */

import { z } from 'zod';

// ============================================================================
// Common Field Validators
// ============================================================================

/**
 * Email validation schema
 * Validates RFC 5322 email addresses with max length of 254
 */
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .max(254, 'Email must not exceed 254 characters')
  .toLowerCase();

/**
 * Phone number validation schema (E.164 format)
 * Format: +[country code][number] (e.g., +11234567890)
 */
export const phoneNumberSchema = z
  .string()
  .regex(/^\+[1-9]\d{1,14}$/, 'Phone number must be in E.164 format (e.g., +11234567890)');

/**
 * UUID validation schema (v4)
 */
export const uuidSchema = z
  .string()
  .uuid('Invalid UUID format');

/**
 * URL validation schema
 * Validates HTTP and HTTPS URLs
 */
export const urlSchema = z
  .string()
  .url('Invalid URL format')
  .refine((url) => url.startsWith('http://') || url.startsWith('https://'), {
    message: 'URL must use HTTP or HTTPS protocol',
  });

/**
 * Strong password validation schema
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .refine((password) => /[A-Z]/.test(password), {
    message: 'Password must contain at least one uppercase letter',
  })
  .refine((password) => /[a-z]/.test(password), {
    message: 'Password must contain at least one lowercase letter',
  })
  .refine((password) => /\d/.test(password), {
    message: 'Password must contain at least one number',
  })
  .refine((password) => /[!@#$%^&*(),.?":{}|<>]/.test(password), {
    message: 'Password must contain at least one special character',
  });

/**
 * Postal code validation schema (US ZIP code)
 * Supports 5-digit and ZIP+4 formats
 */
export const postalCodeSchema = z
  .string()
  .regex(/^\d{5}(-\d{4})?$/, 'Postal code must be in format 12345 or 12345-6789');

/**
 * State code validation schema (US states)
 */
export const stateCodeSchema = z
  .string()
  .length(2, 'State code must be 2 characters')
  .toUpperCase()
  .refine(
    (code) => {
      const validStates = [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
        'DC', // Washington D.C.
      ];
      return validStates.includes(code);
    },
    { message: 'Invalid US state code' }
  );

/**
 * Non-empty string schema
 */
export const nonEmptyStringSchema = z
  .string()
  .trim()
  .min(1, 'String cannot be empty');

/**
 * Positive integer schema
 */
export const positiveIntSchema = z
  .number()
  .int('Value must be an integer')
  .positive('Value must be positive');

/**
 * Non-negative integer schema (includes 0)
 */
export const nonNegativeIntSchema = z
  .number()
  .int('Value must be an integer')
  .nonnegative('Value must be non-negative');

/**
 * Currency amount schema (in cents)
 * Must be a non-negative integer
 */
export const currencyAmountSchema = nonNegativeIntSchema;

// ============================================================================
// Date & Time Validators
// ============================================================================

/**
 * ISO date string validation schema
 */
export const isoDateSchema = z
  .string()
  .datetime({ message: 'Invalid ISO date format' });

/**
 * Date in the past validation schema
 */
export const pastDateSchema = z
  .date()
  .refine((date) => date < new Date(), {
    message: 'Date must be in the past',
  });

/**
 * Date in the future validation schema
 */
export const futureDateSchema = z
  .date()
  .refine((date) => date > new Date(), {
    message: 'Date must be in the future',
  });

/**
 * Date range validation schema
 * Ensures end date is after start date
 */
export const dateRangeSchema = z
  .object({
    start: z.date(),
    end: z.date(),
  })
  .refine((data) => data.end > data.start, {
    message: 'End date must be after start date',
    path: ['end'],
  });

/**
 * ISO date range validation schema (string dates)
 */
export const isoDateRangeSchema = z
  .object({
    start: isoDateSchema,
    end: isoDateSchema,
  })
  .refine(
    (data) => new Date(data.end) > new Date(data.start),
    {
      message: 'End date must be after start date',
      path: ['end'],
    }
  );

/**
 * Business hours validation schema
 */
export const businessHoursSchema = z
  .object({
    startHour: z.number().int().min(0).max(23),
    startMinute: z.number().int().min(0).max(59),
    endHour: z.number().int().min(0).max(23),
    endMinute: z.number().int().min(0).max(59),
    excludeDays: z.array(z.number().int().min(0).max(6)).optional(),
  })
  .refine(
    (data) => {
      const startMinutes = data.startHour * 60 + data.startMinute;
      const endMinutes = data.endHour * 60 + data.endMinute;
      return endMinutes > startMinutes;
    },
    {
      message: 'End time must be after start time',
      path: ['endHour'],
    }
  );

// ============================================================================
// Address & Location Validators
// ============================================================================

/**
 * Address validation schema
 */
export const addressSchema = z.object({
  street1: nonEmptyStringSchema,
  street2: z.string().optional(),
  city: nonEmptyStringSchema,
  state: stateCodeSchema,
  postalCode: postalCodeSchema,
  country: z.string().length(2).toUpperCase().optional().default('US'),
});

/**
 * Coordinates validation schema (latitude/longitude)
 */
export const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

// ============================================================================
// User Input Validators
// ============================================================================

/**
 * Name validation schema
 */
export const nameSchema = z.object({
  firstName: nonEmptyStringSchema.max(50),
  lastName: nonEmptyStringSchema.max(50),
  middleName: z.string().max(50).optional(),
  prefix: z.string().max(10).optional(),
  suffix: z.string().max(10).optional(),
});

/**
 * Username validation schema
 * Allows alphanumeric characters, underscores, and hyphens
 */
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must not exceed 30 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
  .toLowerCase();

/**
 * Search query validation schema
 */
export const searchQuerySchema = z
  .string()
  .trim()
  .min(1, 'Search query cannot be empty')
  .max(200, 'Search query must not exceed 200 characters');

// ============================================================================
// Pagination Validators
// ============================================================================

/**
 * Pagination parameters schema
 */
export const paginationSchema = z.object({
  page: positiveIntSchema.default(1),
  limit: positiveIntSchema.max(100, 'Limit must not exceed 100').default(20),
});

/**
 * Cursor-based pagination schema
 */
export const cursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: positiveIntSchema.max(100, 'Limit must not exceed 100').default(20),
});

// ============================================================================
// File Validators
// ============================================================================

/**
 * File size validation schema (in bytes)
 * Max 10MB by default
 */
export const fileSizeSchema = (maxSizeBytes: number = 10 * 1024 * 1024) =>
  z.number().int().positive().max(maxSizeBytes, `File size must not exceed ${maxSizeBytes} bytes`);

/**
 * MIME type validation schema
 */
export const mimeTypeSchema = (allowedTypes: string[]) =>
  z
    .string()
    .refine((type) => allowedTypes.includes(type), {
      message: `MIME type must be one of: ${allowedTypes.join(', ')}`,
    });

/**
 * Image file validation schema
 */
export const imageFileSchema = z.object({
  filename: nonEmptyStringSchema,
  mimeType: mimeTypeSchema(['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  size: fileSizeSchema(5 * 1024 * 1024), // 5MB
});

// ============================================================================
// Array Validators
// ============================================================================

/**
 * Non-empty array schema
 */
export const nonEmptyArraySchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.array(schema).min(1, 'Array must contain at least one item');

/**
 * Unique array schema (no duplicates)
 */
export const uniqueArraySchema = <T extends z.ZodTypeAny>(schema: T) =>
  z
    .array(schema)
    .refine((arr) => new Set(arr).size === arr.length, {
      message: 'Array must contain unique values',
    });

// ============================================================================
// Custom Validators
// ============================================================================

/**
 * Credit card number validation schema (basic Luhn check)
 */
export const creditCardSchema = z
  .string()
  .regex(/^\d{13,19}$/, 'Credit card number must be 13-19 digits')
  .refine(
    (cardNumber) => {
      // Luhn algorithm
      let sum = 0;
      let isEven = false;

      for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber[i], 10);

        if (isEven) {
          digit *= 2;
          if (digit > 9) {
            digit -= 9;
          }
        }

        sum += digit;
        isEven = !isEven;
      }

      return sum % 10 === 0;
    },
    { message: 'Invalid credit card number' }
  );

/**
 * Hex color validation schema
 */
export const hexColorSchema = z
  .string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color format (e.g., #FF0000 or #F00)');

/**
 * Slug validation schema (URL-friendly strings)
 */
export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens');

/**
 * JSON string validation schema
 */
export const jsonStringSchema = z.string().refine(
  (str) => {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  },
  { message: 'Invalid JSON string' }
);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validate data against a schema
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Parsed and validated data
 * @throws ZodError if validation fails
 */
export function validate<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.infer<T> {
  return schema.parse(data);
}

/**
 * Safely validate data against a schema
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Success object with parsed data or error object
 */
export function validateSafe<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.SafeParseReturnType<unknown, z.infer<T>> {
  return schema.safeParse(data);
}

/**
 * Create a partial version of a schema (all fields optional)
 * @param schema - Zod object schema
 * @returns Partial schema
 */
export function createPartialSchema<T extends z.ZodObject<any>>(schema: T) {
  return schema.partial();
}

/**
 * Create a required version of a schema (all fields required)
 * @param schema - Zod object schema
 * @returns Required schema
 */
export function createRequiredSchema<T extends z.ZodObject<any>>(schema: T) {
  return schema.required();
}

/**
 * Merge multiple schemas
 * @param schemas - Schemas to merge
 * @returns Merged schema
 */
export function mergeSchemas<T extends z.ZodObject<any>[]>(...schemas: T) {
  return schemas.reduce((acc, schema) => acc.merge(schema));
}

// ============================================================================
// Export Schema Types
// ============================================================================

// Export inferred types for convenience
export type Email = z.infer<typeof emailSchema>;
export type PhoneNumber = z.infer<typeof phoneNumberSchema>;
export type UUID = z.infer<typeof uuidSchema>;
export type URL = z.infer<typeof urlSchema>;
export type Password = z.infer<typeof passwordSchema>;
export type PostalCode = z.infer<typeof postalCodeSchema>;
export type StateCode = z.infer<typeof stateCodeSchema>;
export type NonEmptyString = z.infer<typeof nonEmptyStringSchema>;
export type PositiveInt = z.infer<typeof positiveIntSchema>;
export type NonNegativeInt = z.infer<typeof nonNegativeIntSchema>;
export type CurrencyAmount = z.infer<typeof currencyAmountSchema>;
export type ISODate = z.infer<typeof isoDateSchema>;
export type PastDate = z.infer<typeof pastDateSchema>;
export type FutureDate = z.infer<typeof futureDateSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;
export type ISODateRange = z.infer<typeof isoDateRangeSchema>;
export type BusinessHours = z.infer<typeof businessHoursSchema>;
export type Address = z.infer<typeof addressSchema>;
export type Coordinates = z.infer<typeof coordinatesSchema>;
export type Name = z.infer<typeof nameSchema>;
export type Username = z.infer<typeof usernameSchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type CursorPagination = z.infer<typeof cursorPaginationSchema>;
export type ImageFile = z.infer<typeof imageFileSchema>;
export type CreditCard = z.infer<typeof creditCardSchema>;
export type HexColor = z.infer<typeof hexColorSchema>;
export type Slug = z.infer<typeof slugSchema>;
export type JSONString = z.infer<typeof jsonStringSchema>;
