/**
 * Formatting utilities for currency, phone numbers, addresses, and more
 */

import { formatDuration as formatDurationUtil } from './date';

// ============================================================================
// Types
// ============================================================================

/**
 * Address components for formatting
 */
export interface Address {
  /** Street address line 1 */
  street1: string;
  /** Street address line 2 (optional) */
  street2?: string;
  /** City */
  city: string;
  /** State/Province (2-letter code or full name) */
  state: string;
  /** Postal/ZIP code */
  postalCode: string;
  /** Country (optional, defaults to US) */
  country?: string;
}

/**
 * Name components for formatting
 */
export interface Name {
  /** First name */
  firstName: string;
  /** Last name */
  lastName: string;
  /** Middle name (optional) */
  middleName?: string;
  /** Prefix (e.g., Dr., Mr., Mrs.) */
  prefix?: string;
  /** Suffix (e.g., Jr., Sr., III) */
  suffix?: string;
}

// ============================================================================
// Currency Formatting
// ============================================================================

/**
 * Format cents to currency string
 * @param cents - Amount in cents (e.g., 1599 = $15.99)
 * @param currency - Currency code (default: USD)
 * @param locale - Locale for formatting (default: en-US)
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(1599)
 * // => "$15.99"
 *
 * formatCurrency(1599, 'EUR', 'de-DE')
 * // => "15,99 €"
 */
export function formatCurrency(
  cents: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  if (!Number.isFinite(cents)) {
    throw new Error('Amount must be a finite number');
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

/**
 * Format currency without decimal places (for whole dollar amounts)
 * @param cents - Amount in cents
 * @param currency - Currency code (default: USD)
 * @param locale - Locale for formatting (default: en-US)
 * @returns Formatted currency string without cents
 *
 * @example
 * formatCurrencyWhole(1500)
 * // => "$15"
 */
export function formatCurrencyWhole(
  cents: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  if (!Number.isFinite(cents)) {
    throw new Error('Amount must be a finite number');
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/**
 * Parse currency string to cents
 * @param currencyStr - Currency string (e.g., "$15.99", "15.99")
 * @returns Amount in cents
 *
 * @example
 * parseCurrency("$15.99")
 * // => 1599
 */
export function parseCurrency(currencyStr: string): number {
  // Remove currency symbols and thousands separators
  const cleaned = currencyStr.replace(/[$,€£¥]/g, '').trim();
  const amount = parseFloat(cleaned);

  if (isNaN(amount)) {
    throw new Error(`Invalid currency string: ${currencyStr}`);
  }

  return Math.round(amount * 100);
}

// ============================================================================
// Phone Number Formatting
// ============================================================================

/**
 * Format E.164 phone number to US format: (123) 456-7890
 * @param phone - Phone number in E.164 format (+11234567890) or digits only
 * @returns Formatted phone number
 *
 * @example
 * formatPhoneNumber("+11234567890")
 * // => "(123) 456-7890"
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Match US phone number (10 or 11 digits, optionally starting with 1)
  const match = cleaned.match(/^1?(\d{3})(\d{3})(\d{4})$/);

  if (!match) {
    // Return original if it doesn't match expected format
    return phone;
  }

  return `(${match[1]}) ${match[2]}-${match[3]}`;
}

/**
 * Format phone number to E.164 format
 * @param phone - Phone number in any format
 * @param countryCode - Country code (default: 1 for US)
 * @returns E.164 formatted phone number
 *
 * @example
 * formatPhoneE164("(123) 456-7890")
 * // => "+11234567890"
 */
export function formatPhoneE164(phone: string, countryCode: number = 1): string {
  const cleaned = phone.replace(/\D/g, '');

  // For US/Canada (country code 1): 11 digits means it already has country code
  // For 10 digits, add country code even if first digit is 1
  if (countryCode === 1) {
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    } else if (cleaned.length === 10) {
      return `+1${cleaned}`;
    }
  }

  // For other country codes, check if it already starts with the country code
  const countryCodeStr = String(countryCode);
  if (cleaned.startsWith(countryCodeStr)) {
    return `+${cleaned}`;
  }

  // Add country code
  return `+${countryCode}${cleaned}`;
}

/**
 * Parse phone number to digits only
 * @param phone - Phone number in any format
 * @returns Digits only
 */
export function parsePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

// ============================================================================
// Address Formatting
// ============================================================================

/**
 * Format address components to a single-line string
 * @param address - Address components
 * @returns Formatted address string
 *
 * @example
 * formatAddress({
 *   street1: "123 Main St",
 *   city: "San Francisco",
 *   state: "CA",
 *   postalCode: "94105"
 * })
 * // => "123 Main St, San Francisco, CA 94105"
 */
export function formatAddress(address: Address): string {
  const parts: string[] = [];

  // Add street lines
  parts.push(address.street1);
  if (address.street2) {
    parts.push(address.street2);
  }

  // Add city, state, zip
  const cityStateZip = `${address.city}, ${address.state} ${address.postalCode}`;
  parts.push(cityStateZip);

  // Add country if specified and not US
  if (address.country && address.country !== 'US') {
    parts.push(address.country);
  }

  return parts.join(', ');
}

/**
 * Format address components to multi-line string
 * @param address - Address components
 * @returns Multi-line formatted address
 *
 * @example
 * formatAddressMultiline({
 *   street1: "123 Main St",
 *   city: "San Francisco",
 *   state: "CA",
 *   postalCode: "94105"
 * })
 * // => "123 Main St\nSan Francisco, CA 94105"
 */
export function formatAddressMultiline(address: Address): string {
  const lines: string[] = [];

  lines.push(address.street1);
  if (address.street2) {
    lines.push(address.street2);
  }

  const cityStateZip = `${address.city}, ${address.state} ${address.postalCode}`;
  lines.push(cityStateZip);

  if (address.country && address.country !== 'US') {
    lines.push(address.country);
  }

  return lines.join('\n');
}

// ============================================================================
// Name Formatting
// ============================================================================

/**
 * Format name components to full name
 * @param name - Name components
 * @returns Formatted full name
 *
 * @example
 * formatName({ firstName: "John", lastName: "Doe" })
 * // => "John Doe"
 *
 * formatName({ firstName: "John", middleName: "Q", lastName: "Doe", prefix: "Dr." })
 * // => "Dr. John Q Doe"
 */
export function formatName(name: Name): string {
  const parts: string[] = [];

  if (name.prefix) {
    parts.push(name.prefix);
  }

  parts.push(name.firstName);

  if (name.middleName) {
    parts.push(name.middleName);
  }

  parts.push(name.lastName);

  if (name.suffix) {
    parts.push(name.suffix);
  }

  return parts.join(' ');
}

/**
 * Format name as "Last, First"
 * @param name - Name components
 * @returns Formatted name
 *
 * @example
 * formatNameLastFirst({ firstName: "John", lastName: "Doe" })
 * // => "Doe, John"
 */
export function formatNameLastFirst(name: Name): string {
  return `${name.lastName}, ${name.firstName}`;
}

/**
 * Get initials from name
 * @param name - Name components
 * @returns Initials (e.g., "JD")
 *
 * @example
 * getInitials({ firstName: "John", lastName: "Doe" })
 * // => "JD"
 */
export function getInitials(name: Name): string {
  const firstInitial = name.firstName.charAt(0).toUpperCase();
  const lastInitial = name.lastName.charAt(0).toUpperCase();
  return `${firstInitial}${lastInitial}`;
}

// ============================================================================
// Number Formatting
// ============================================================================

/**
 * Format number with thousands separators
 * @param num - Number to format
 * @param locale - Locale for formatting (default: en-US)
 * @returns Formatted number string
 *
 * @example
 * formatNumber(1234567)
 * // => "1,234,567"
 */
export function formatNumber(num: number, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Format number as percentage
 * @param value - Decimal value (e.g., 0.15 = 15%)
 * @param decimals - Number of decimal places (default: 0)
 * @param locale - Locale for formatting (default: en-US)
 * @returns Formatted percentage string
 *
 * @example
 * formatPercent(0.15)
 * // => "15%"
 *
 * formatPercent(0.1234, 2)
 * // => "12.34%"
 */
export function formatPercent(
  value: number,
  decimals: number = 0,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format number in compact notation (e.g., 1.2K, 3.4M)
 * @param num - Number to format
 * @param locale - Locale for formatting (default: en-US)
 * @returns Compact formatted number
 *
 * @example
 * formatCompactNumber(1234)
 * // => "1.2K"
 *
 * formatCompactNumber(1234567)
 * // => "1.2M"
 */
export function formatCompactNumber(num: number, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num);
}

/**
 * Format bytes to human-readable size
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted size string
 *
 * @example
 * formatBytes(1024)
 * // => "1.00 KB"
 *
 * formatBytes(1234567)
 * // => "1.18 MB"
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(decimals)} ${sizes[i]}`;
}

// ============================================================================
// String Formatting
// ============================================================================

/**
 * Capitalize first letter of a string
 * @param str - String to capitalize
 * @returns Capitalized string
 *
 * @example
 * capitalize("hello world")
 * // => "Hello world"
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert string to title case
 * @param str - String to convert
 * @returns Title case string
 *
 * @example
 * titleCase("hello world")
 * // => "Hello World"
 */
export function titleCase(str: string): string {
  if (!str) return str;
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Truncate string to specified length with ellipsis
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @param ellipsis - Ellipsis string (default: "...")
 * @returns Truncated string
 *
 * @example
 * truncate("Hello world", 8)
 * // => "Hello..."
 */
export function truncate(str: string, maxLength: number, ellipsis: string = '...'): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Convert string to slug (URL-friendly)
 * @param str - String to convert
 * @returns Slug string
 *
 * @example
 * slugify("Hello World!")
 * // => "hello-world"
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ============================================================================
// Duration Formatting
// ============================================================================

/**
 * Format duration in minutes to human-readable string
 * Re-export from date utils for convenience
 */
export const formatDuration = formatDurationUtil;

// ============================================================================
// List Formatting
// ============================================================================

/**
 * Format array as comma-separated list with "and"
 * @param items - Array of items
 * @param conjunction - Conjunction word (default: "and")
 * @returns Formatted list string
 *
 * @example
 * formatList(["apples", "oranges", "bananas"])
 * // => "apples, oranges, and bananas"
 *
 * formatList(["apples", "oranges"], "or")
 * // => "apples or oranges"
 */
export function formatList(items: string[], conjunction: string = 'and'): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;

  const allButLast = items.slice(0, -1).join(', ');
  const last = items[items.length - 1];
  return `${allButLast}, ${conjunction} ${last}`;
}

/**
 * Format array using Intl.ListFormat
 * @param items - Array of items
 * @param style - List style (default: "long")
 * @param type - List type (default: "conjunction")
 * @param locale - Locale for formatting (default: en-US)
 * @returns Formatted list string
 *
 * @example
 * formatListIntl(["apples", "oranges", "bananas"])
 * // => "apples, oranges, and bananas"
 */
export function formatListIntl(
  items: string[],
  style: 'long' | 'short' | 'narrow' = 'long',
  type: 'conjunction' | 'disjunction' | 'unit' = 'conjunction',
  locale: string = 'en-US'
): string {
  return new Intl.ListFormat(locale, { style, type }).format(items);
}
