/**
 * Date utilities with timezone support
 */

import {
  format,
  parseISO,
  addDays,
  addMinutes,
  differenceInMinutes,
  isWithinInterval,
  startOfDay,
  endOfDay,
  isWeekend,
  setHours,
  setMinutes,
  isBefore,
  isAfter,
  addBusinessDays as dateFnsAddBusinessDays,
} from 'date-fns';
import { formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz';

// ============================================================================
// Types
// ============================================================================

/**
 * Business hours configuration
 */
export interface BusinessHours {
  /** Start hour (24-hour format, 0-23) */
  startHour: number;
  /** Start minute (0-59) */
  startMinute: number;
  /** End hour (24-hour format, 0-23) */
  endHour: number;
  /** End minute (0-59) */
  endMinute: number;
  /** Days to exclude (0 = Sunday, 6 = Saturday) */
  excludeDays?: number[];
}

/**
 * Common date format strings
 */
export const DateFormat = {
  /** ISO 8601: 2024-10-17T10:30:00-07:00 */
  ISO: "yyyy-MM-dd'T'HH:mm:ssXXX",
  /** ISO Date only: 2024-10-17 */
  ISO_DATE: 'yyyy-MM-dd',
  /** US Format: 10/17/2024 */
  US: 'MM/dd/yyyy',
  /** US with time: 10/17/2024 10:30 AM */
  US_DATETIME: 'MM/dd/yyyy hh:mm a',
  /** Long format: October 17, 2024 */
  LONG: 'MMMM d, yyyy',
  /** Long with time: October 17, 2024 at 10:30 AM */
  LONG_DATETIME: 'MMMM d, yyyy \'at\' hh:mm a',
  /** Time only: 10:30 AM */
  TIME: 'hh:mm a',
  /** 24-hour time: 10:30 */
  TIME_24: 'HH:mm',
} as const;

/**
 * Common timezones
 */
export const TimeZone = {
  UTC: 'UTC',
  PACIFIC: 'America/Los_Angeles',
  MOUNTAIN: 'America/Denver',
  CENTRAL: 'America/Chicago',
  EASTERN: 'America/New_York',
} as const;

// ============================================================================
// Date Formatting
// ============================================================================

/**
 * Format a date with timezone awareness
 * @param date - Date to format
 * @param formatStr - Format string (uses date-fns format tokens)
 * @param timezone - Target timezone (defaults to UTC)
 * @returns Formatted date string
 *
 * @example
 * formatDate(new Date(), DateFormat.US_DATETIME, TimeZone.PACIFIC)
 * // => "10/17/2024 10:30 AM"
 */
export function formatDate(
  date: Date | string | number,
  formatStr: string = DateFormat.ISO,
  timezone: string = TimeZone.UTC
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
  return formatInTimeZone(dateObj, timezone, formatStr);
}

/**
 * Format a date relative to now (e.g., "2 hours ago", "in 3 days")
 * @param date - Date to format
 * @param now - Reference date (defaults to current time)
 * @returns Relative time string
 *
 * @example
 * formatRelativeDate(addMinutes(new Date(), -30))
 * // => "30 minutes ago"
 */
export function formatRelativeDate(date: Date | string, now: Date = new Date()): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const diffMinutes = differenceInMinutes(dateObj, now);

  const abs = Math.abs(diffMinutes);
  const suffix = diffMinutes > 0 ? 'from now' : 'ago';

  if (abs < 1) return 'just now';
  if (abs < 60) return `${abs} minute${abs === 1 ? '' : 's'} ${suffix}`;

  const hours = Math.floor(abs / 60);
  if (abs < 1440) return `${hours} hour${hours === 1 ? '' : 's'} ${suffix}`;

  const days = Math.floor(abs / 1440);
  if (abs < 43200) return `${days} day${days === 1 ? '' : 's'} ${suffix}`;

  const months = Math.floor(abs / 43200);
  if (abs < 525600) return `${months} month${months === 1 ? '' : 's'} ${suffix}`;

  const years = Math.floor(abs / 525600);
  return `${years} year${years === 1 ? '' : 's'} ${suffix}`;
}

/**
 * Format duration in minutes to human-readable string
 * @param minutes - Duration in minutes
 * @returns Formatted duration (e.g., "2h 30m")
 *
 * @example
 * formatDuration(150)
 * // => "2h 30m"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 0) throw new Error('Duration must be non-negative');

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

// ============================================================================
// Date Parsing
// ============================================================================

/**
 * Parse a date string with timezone support
 * @param dateStr - ISO date string
 * @param timezone - Source timezone
 * @returns Date object in UTC
 *
 * @example
 * parseDate("2024-10-17T10:30:00", TimeZone.PACIFIC)
 * // => Date object representing 2024-10-17 17:30:00 UTC
 */
export function parseDate(dateStr: string, timezone: string = TimeZone.UTC): Date {
  return fromZonedTime(dateStr, timezone);
}

/**
 * Convert a date to a specific timezone
 * @param date - Date to convert
 * @param timezone - Target timezone
 * @returns Date adjusted to timezone
 *
 * @example
 * toTimeZone(new Date(), TimeZone.PACIFIC)
 */
export function toTimeZone(date: Date | string, timezone: string): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return toZonedTime(dateObj, timezone);
}

// ============================================================================
// Date Calculations
// ============================================================================

/**
 * Calculate duration between two dates in minutes
 * @param start - Start date
 * @param end - End date
 * @returns Duration in minutes (positive if end is after start)
 *
 * @example
 * calculateDuration(new Date('2024-10-17T10:00:00'), new Date('2024-10-17T12:30:00'))
 * // => 150
 */
export function calculateDuration(start: Date | string, end: Date | string): number {
  const startDate = typeof start === 'string' ? parseISO(start) : start;
  const endDate = typeof end === 'string' ? parseISO(end) : end;
  return differenceInMinutes(endDate, startDate);
}

/**
 * Add business days to a date (excluding weekends)
 * @param date - Starting date
 * @param days - Number of business days to add (can be negative)
 * @returns New date
 *
 * @example
 * addBusinessDays(new Date('2024-10-17'), 5)
 * // => Date 5 business days later
 */
export function addBusinessDays(date: Date | string, days: number): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateFnsAddBusinessDays(dateObj, days);
}

/**
 * Add minutes to a date
 * @param date - Starting date
 * @param minutes - Number of minutes to add
 * @returns New date
 */
export function addMinutesToDate(date: Date | string, minutes: number): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return addMinutes(dateObj, minutes);
}

/**
 * Add days to a date
 * @param date - Starting date
 * @param days - Number of days to add
 * @returns New date
 */
export function addDaysToDate(date: Date | string, days: number): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return addDays(dateObj, days);
}

// ============================================================================
// Business Hours
// ============================================================================

/**
 * Check if a date falls within business hours
 * @param date - Date to check
 * @param businessHours - Business hours configuration
 * @param timezone - Timezone for the check
 * @returns True if within business hours
 *
 * @example
 * isWithinBusinessHours(
 *   new Date('2024-10-17T14:00:00Z'),
 *   { startHour: 9, startMinute: 0, endHour: 17, endMinute: 0 },
 *   TimeZone.PACIFIC
 * )
 */
export function isWithinBusinessHours(
  date: Date | string,
  businessHours: BusinessHours,
  timezone: string = TimeZone.UTC
): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const zonedDate = toZonedTime(dateObj, timezone);

  // Check if it's a weekend or excluded day
  const dayOfWeek = zonedDate.getDay();
  const excludeDays = businessHours.excludeDays || [0, 6]; // Default to exclude weekends
  if (excludeDays.includes(dayOfWeek)) {
    return false;
  }

  // Create start and end times for the day
  const dayStart = setMinutes(
    setHours(startOfDay(zonedDate), businessHours.startHour),
    businessHours.startMinute
  );
  const dayEnd = setMinutes(
    setHours(startOfDay(zonedDate), businessHours.endHour),
    businessHours.endMinute
  );

  return isWithinInterval(zonedDate, { start: dayStart, end: dayEnd });
}

/**
 * Get the next business day from a given date
 * @param date - Starting date
 * @param businessHours - Business hours configuration (for excluded days)
 * @returns Next business day
 */
export function getNextBusinessDay(
  date: Date | string,
  businessHours?: BusinessHours
): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const excludeDays = businessHours?.excludeDays || [0, 6];

  let nextDay = addDays(dateObj, 1);
  while (excludeDays.includes(nextDay.getDay())) {
    nextDay = addDays(nextDay, 1);
  }

  return nextDay;
}

// ============================================================================
// Date Validation & Comparison
// ============================================================================

/**
 * Check if a date is in the past
 * @param date - Date to check
 * @param reference - Reference date (defaults to now)
 * @returns True if date is before reference
 */
export function isPast(date: Date | string, reference: Date = new Date()): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isBefore(dateObj, reference);
}

/**
 * Check if a date is in the future
 * @param date - Date to check
 * @param reference - Reference date (defaults to now)
 * @returns True if date is after reference
 */
export function isFuture(date: Date | string, reference: Date = new Date()): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isAfter(dateObj, reference);
}

/**
 * Check if two dates are on the same day
 * @param date1 - First date
 * @param date2 - Second date
 * @param timezone - Timezone for comparison
 * @returns True if same day
 */
export function isSameDay(
  date1: Date | string,
  date2: Date | string,
  timezone: string = TimeZone.UTC
): boolean {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;

  const formatted1 = formatInTimeZone(d1, timezone, DateFormat.ISO_DATE);
  const formatted2 = formatInTimeZone(d2, timezone, DateFormat.ISO_DATE);

  return formatted1 === formatted2;
}

/**
 * Check if a date is a weekend
 * @param date - Date to check
 * @returns True if Saturday or Sunday
 */
export function isWeekendDay(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isWeekend(dateObj);
}

/**
 * Get start of day in a specific timezone
 * @param date - Date
 * @param timezone - Timezone
 * @returns Start of day
 */
export function getStartOfDay(date: Date | string, timezone: string = TimeZone.UTC): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const zoned = toZonedTime(dateObj, timezone);
  return startOfDay(zoned);
}

/**
 * Get end of day in a specific timezone
 * @param date - Date
 * @param timezone - Timezone
 * @returns End of day
 */
export function getEndOfDay(date: Date | string, timezone: string = TimeZone.UTC): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const zoned = toZonedTime(dateObj, timezone);
  return endOfDay(zoned);
}
