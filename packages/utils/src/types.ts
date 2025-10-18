/**
 * Type utilities, type guards, and branded types
 */

// ============================================================================
// Branded Types
// ============================================================================

/**
 * Branded type for email addresses
 * Ensures type safety for validated email strings
 */
export type Email = string & { readonly __brand: 'Email' };

/**
 * Branded type for phone numbers (E.164 format)
 * Ensures type safety for validated phone numbers
 */
export type PhoneNumber = string & { readonly __brand: 'PhoneNumber' };

/**
 * Branded type for UUIDs
 * Ensures type safety for validated UUID strings
 */
export type UUID = string & { readonly __brand: 'UUID' };

/**
 * Branded type for positive integers
 */
export type PositiveInt = number & { readonly __brand: 'PositiveInt' };

/**
 * Branded type for non-empty strings
 */
export type NonEmptyString = string & { readonly __brand: 'NonEmptyString' };

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Array with at least one element
 */
export type NonEmptyArray<T> = [T, ...T[]];

/**
 * Object with at least one property from T
 */
export type AtLeastOne<T> = {
  [K in keyof T]: Pick<T, K> & Partial<Pick<T, Exclude<keyof T, K>>>;
}[keyof T];

/**
 * Make specific keys required
 */
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Make specific keys optional
 */
export type PartialKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Recursive partial type
 */
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

/**
 * Recursive readonly type
 */
export type DeepReadonly<T> = T extends object
  ? {
      readonly [P in keyof T]: DeepReadonly<T[P]>;
    }
  : T;

/**
 * Extract keys of a specific type
 */
export type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard for UUID validation
 * @param value - Value to check
 * @returns True if value is a valid UUID
 */
export function isUUID(value: unknown): value is UUID {
  if (typeof value !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Type guard for email validation
 * @param value - Value to check
 * @returns True if value is a valid email
 */
export function isEmail(value: unknown): value is Email {
  if (typeof value !== 'string') return false;
  // RFC 5322 simplified email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(value) && value.length <= 254;
}

/**
 * Type guard for E.164 phone number validation
 * @param value - Value to check
 * @returns True if value is a valid E.164 phone number
 */
export function isPhoneNumber(value: unknown): value is PhoneNumber {
  if (typeof value !== 'string') return false;
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(value);
}

/**
 * Type guard for positive integer validation
 * @param value - Value to check
 * @returns True if value is a positive integer
 */
export function isPositiveInt(value: unknown): value is PositiveInt {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

/**
 * Type guard for non-empty string validation
 * @param value - Value to check
 * @returns True if value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is NonEmptyString {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Type guard for non-empty array validation
 * @param value - Value to check
 * @returns True if value is a non-empty array
 */
export function isNonEmptyArray<T>(value: unknown): value is NonEmptyArray<T> {
  return Array.isArray(value) && value.length > 0;
}

/**
 * Type guard for checking if value is defined (not null or undefined)
 * @param value - Value to check
 * @returns True if value is defined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard for checking if value is a plain object
 * @param value - Value to check
 * @returns True if value is a plain object
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.prototype.toString.call(value) === '[object Object]'
  );
}

/**
 * Type guard for URL validation
 * @param value - Value to check
 * @returns True if value is a valid URL
 */
export function isURL(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Type guard for date validation
 * @param value - Value to check
 * @returns True if value is a valid Date
 */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Asserts that a value is never reached (exhaustive type checking)
 * @param value - Value that should be never
 * @throws Error if reached
 */
export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}

/**
 * Safe type assertion with runtime check
 * @param value - Value to assert
 * @param guard - Type guard function
 * @param errorMessage - Custom error message
 * @returns The asserted value
 * @throws Error if assertion fails
 */
export function assertType<T>(
  value: unknown,
  guard: (v: unknown) => v is T,
  errorMessage?: string
): T {
  if (!guard(value)) {
    throw new Error(errorMessage || `Type assertion failed for value: ${JSON.stringify(value)}`);
  }
  return value;
}

/**
 * Creates a branded type from a value
 * @param value - Value to brand
 * @returns Branded value
 */
export function brand<T extends string | number>(value: T): T & { readonly __brand: string } {
  return value as T & { readonly __brand: string };
}

/**
 * Removes brand from a branded type
 * @param value - Branded value
 * @returns Unbranded value
 */
export function unbrand<T>(value: T & { readonly __brand: string }): T {
  return value as T;
}
