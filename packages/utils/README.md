# @chotter/utils

Shared utilities package for the Chotter application, providing type-safe utilities for date formatting, validation, currency formatting, phone number handling, and more.

## Features

- **Date Utilities** - Timezone-aware date formatting, parsing, and calculations
- **Format Utilities** - Currency, phone numbers, addresses, names, numbers, and strings
- **Validation Schemas** - Comprehensive Zod schemas for common validation patterns
- **Type Guards** - Runtime type checking with TypeScript type narrowing
- **100% TypeScript** - Full type safety with strict mode
- **Well-tested** - 97.5% test coverage with 149+ unit tests

## Installation

This package is part of the Chotter monorepo and is intended for internal use.

```bash
# From the monorepo root
bun install
```

## Usage

```typescript
import {
  formatCurrency,
  formatPhoneNumber,
  formatDate,
  emailSchema,
  isEmail,
  TimeZone,
  DateFormat,
} from '@chotter/utils';

// Format currency (cents to USD)
formatCurrency(1599); // "$15.99"

// Format phone numbers
formatPhoneNumber('+11234567890'); // "(123) 456-7890"

// Format dates with timezone awareness
formatDate(new Date(), DateFormat.US_DATETIME, TimeZone.PACIFIC);
// "10/17/2024 10:30 AM"

// Validate data with Zod
emailSchema.parse('user@example.com'); // "user@example.com"

// Type guards
if (isEmail(value)) {
  // TypeScript knows value is string & Email
}
```

## API Documentation

### Date Utilities (`date.ts`)

#### Formatting

```typescript
// Format dates with timezone support
formatDate(date: Date | string | number, format?: string, timezone?: string): string

// Format relative time ("2 hours ago")
formatRelativeDate(date: Date | string, now?: Date): string

// Format duration in minutes ("2h 30m")
formatDuration(minutes: number): string

// Constants
DateFormat.ISO           // "yyyy-MM-dd'T'HH:mm:ssXXX"
DateFormat.ISO_DATE      // "yyyy-MM-dd"
DateFormat.US            // "MM/dd/yyyy"
DateFormat.US_DATETIME   // "MM/dd/yyyy hh:mm a"
DateFormat.LONG          // "MMMM d, yyyy"
DateFormat.TIME          // "hh:mm a"
DateFormat.TIME_24       // "HH:mm"

TimeZone.UTC
TimeZone.PACIFIC         // "America/Los_Angeles"
TimeZone.MOUNTAIN        // "America/Denver"
TimeZone.CENTRAL         // "America/Chicago"
TimeZone.EASTERN         // "America/New_York"
```

#### Parsing

```typescript
// Parse date strings with timezone
parseDate(dateStr: string, timezone?: string): Date

// Convert to timezone
toTimeZone(date: Date | string, timezone: string): Date
```

#### Calculations

```typescript
// Calculate duration between dates (in minutes)
calculateDuration(start: Date | string, end: Date | string): number

// Add business days (excludes weekends)
addBusinessDays(date: Date | string, days: number): Date

// Add minutes/days
addMinutesToDate(date: Date | string, minutes: number): Date
addDaysToDate(date: Date | string, days: number): Date
```

#### Business Hours

```typescript
// Check if within business hours
isWithinBusinessHours(
  date: Date | string,
  businessHours: BusinessHours,
  timezone?: string
): boolean

// Get next business day
getNextBusinessDay(date: Date | string, businessHours?: BusinessHours): Date

interface BusinessHours {
  startHour: number;      // 0-23
  startMinute: number;    // 0-59
  endHour: number;        // 0-23
  endMinute: number;      // 0-59
  excludeDays?: number[]; // [0-6] (0=Sunday)
}
```

#### Date Comparison

```typescript
// Check if date is past/future
isPast(date: Date | string, reference?: Date): boolean
isFuture(date: Date | string, reference?: Date): boolean

// Check if same day
isSameDay(date1: Date | string, date2: Date | string, timezone?: string): boolean

// Check if weekend
isWeekendDay(date: Date | string): boolean

// Get start/end of day
getStartOfDay(date: Date | string, timezone?: string): Date
getEndOfDay(date: Date | string, timezone?: string): Date
```

### Format Utilities (`format.ts`)

#### Currency

```typescript
// Format cents to currency
formatCurrency(cents: number, currency?: string, locale?: string): string
formatCurrency(1599);           // "$15.99"
formatCurrency(1599, 'EUR', 'de-DE'); // "15,99 €"

// Format without cents
formatCurrencyWhole(cents: number, currency?: string, locale?: string): string
formatCurrencyWhole(1500);      // "$15"

// Parse currency string to cents
parseCurrency(currencyStr: string): number
parseCurrency("$15.99");        // 1599
```

#### Phone Numbers

```typescript
// Format E.164 to US format
formatPhoneNumber(phone: string): string
formatPhoneNumber("+11234567890"); // "(123) 456-7890"

// Format to E.164
formatPhoneE164(phone: string, countryCode?: number): string
formatPhoneE164("(123) 456-7890"); // "+11234567890"

// Parse to digits only
parsePhoneNumber(phone: string): string
parsePhoneNumber("(123) 456-7890"); // "1234567890"
```

#### Addresses

```typescript
// Format address (single line)
formatAddress(address: Address): string

// Format address (multi-line)
formatAddressMultiline(address: Address): string

interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
}
```

#### Names

```typescript
// Format full name
formatName(name: Name): string
formatName({ firstName: "John", lastName: "Doe" }); // "John Doe"

// Format as "Last, First"
formatNameLastFirst(name: Name): string

// Get initials
getInitials(name: Name): string
getInitials({ firstName: "John", lastName: "Doe" }); // "JD"
```

#### Numbers

```typescript
// Format with thousands separators
formatNumber(num: number, locale?: string): string
formatNumber(1234567); // "1,234,567"

// Format as percentage
formatPercent(value: number, decimals?: number, locale?: string): string
formatPercent(0.15);    // "15%"
formatPercent(0.1234, 2); // "12.34%"

// Compact notation (1.2K, 3.4M)
formatCompactNumber(num: number, locale?: string): string
formatCompactNumber(1234567); // "1.2M"

// Format bytes
formatBytes(bytes: number, decimals?: number): string
formatBytes(1048576); // "1.00 MB"
```

#### Strings

```typescript
// Capitalize first letter
capitalize(str: string): string
capitalize("hello"); // "Hello"

// Title case
titleCase(str: string): string
titleCase("hello world"); // "Hello World"

// Truncate with ellipsis
truncate(str: string, maxLength: number, ellipsis?: string): string
truncate("Hello world", 8); // "Hello..."

// Create URL-friendly slug
slugify(str: string): string
slugify("Hello World!"); // "hello-world"
```

#### Lists

```typescript
// Format array with conjunction
formatList(items: string[], conjunction?: string): string
formatList(["apple", "orange", "banana"]);
// "apple, orange, and banana"

// Using Intl.ListFormat
formatListIntl(items: string[], style?: 'long' | 'short' | 'narrow', ...): string
```

### Validation Schemas (`validation.ts`)

All schemas are Zod schemas that can be used with `.parse()` or `.safeParse()`.

#### Common Fields

```typescript
emailSchema              // RFC 5322 email, lowercase
phoneNumberSchema        // E.164 format (+11234567890)
uuidSchema               // UUID v4
urlSchema                // HTTP/HTTPS URLs only
passwordSchema           // Strong password (8+ chars, upper, lower, number, special)
postalCodeSchema         // US ZIP (12345 or 12345-6789)
stateCodeSchema          // US state codes (CA, NY, etc.)
nonEmptyStringSchema     // Non-empty, trimmed
positiveIntSchema        // Positive integer
nonNegativeIntSchema     // >= 0
currencyAmountSchema     // Currency in cents (>= 0)
```

#### Date & Time

```typescript
isoDateSchema            // ISO 8601 datetime string
pastDateSchema           // Date in the past
futureDateSchema         // Date in the future
dateRangeSchema          // { start: Date, end: Date }
isoDateRangeSchema       // { start: string, end: string }
businessHoursSchema      // Business hours config
```

#### Address & Location

```typescript
addressSchema            // Full address with validation
coordinatesSchema        // { latitude, longitude }
```

#### User Input

```typescript
nameSchema               // { firstName, lastName, ... }
usernameSchema           // 3-30 chars, alphanumeric + _ -
searchQuerySchema        // 1-200 chars
```

#### Pagination

```typescript
paginationSchema         // { page, limit } (default 1, 20)
cursorPaginationSchema   // { cursor?, limit }
```

#### Custom Validators

```typescript
creditCardSchema         // Luhn check
hexColorSchema           // #FF0000 or #F00
slugSchema               // URL-friendly slug
jsonStringSchema         // Valid JSON string
```

#### Array Validators

```typescript
// Non-empty array
const schema = nonEmptyArraySchema(z.string());

// Unique values
const schema = uniqueArraySchema(z.number());
```

#### Helper Functions

```typescript
// Validate and throw on error
validate(schema, data): T

// Safe validation
validateSafe(schema, data): SafeParseReturnType<T>

// Create partial/required schemas
createPartialSchema(schema)
createRequiredSchema(schema)

// Merge schemas
mergeSchemas(schema1, schema2, ...)
```

### Type Guards & Utilities (`types.ts`)

#### Branded Types

```typescript
type Email = string & { readonly __brand: 'Email' };
type PhoneNumber = string & { readonly __brand: 'PhoneNumber' };
type UUID = string & { readonly __brand: 'UUID' };
type PositiveInt = number & { readonly __brand: 'PositiveInt' };
type NonEmptyString = string & { readonly __brand: 'NonEmptyString' };
```

#### Utility Types

```typescript
NonEmptyArray<T>         // Array with at least one element
AtLeastOne<T>            // Object with at least one property
RequireKeys<T, K>        // Make specific keys required
PartialKeys<T, K>        // Make specific keys optional
DeepPartial<T>           // Recursive partial
DeepReadonly<T>          // Recursive readonly
KeysOfType<T, V>         // Extract keys of specific type
```

#### Type Guards

```typescript
isUUID(value): value is UUID
isEmail(value): value is Email
isPhoneNumber(value): value is PhoneNumber
isPositiveInt(value): value is PositiveInt
isNonEmptyString(value): value is NonEmptyString
isNonEmptyArray(value): value is NonEmptyArray<T>
isDefined(value): value is T
isPlainObject(value): value is Record<string, unknown>
isURL(value): value is string
isValidDate(value): value is Date
```

#### Utility Functions

```typescript
// Assert type with runtime check
assertType<T>(value, guard, errorMessage?): T

// Exhaustive type checking
assertNever(value: never): never

// Brand/unbrand values
brand<T>(value: T): Branded<T>
unbrand<T>(value: Branded<T>): T
```

## Testing

```bash
# Run tests
bun test

# Run with coverage
bun test --coverage

# Watch mode
bun test --watch
```

## Type Checking

```bash
bun run type-check
```

## Building

```bash
bun run build
```

## Design Decisions

### Date Utilities
- **Timezone-aware by default**: All date functions support timezone parameters to prevent common timezone bugs
- **date-fns integration**: Leverages battle-tested date-fns library for reliability
- **Business day calculations**: Built-in support for business hours and excluding weekends

### Format Utilities
- **Intl API usage**: Uses native Intl APIs for currency, numbers, and lists for better i18n support
- **Cents-based currency**: All currency stored as integer cents to avoid floating-point issues
- **E.164 phone standard**: Enforces E.164 format for international compatibility

### Validation
- **Zod-based**: Type-safe validation with automatic TypeScript type inference
- **Reusable schemas**: Common patterns extracted as reusable schemas
- **Comprehensive validation**: Includes password strength, credit cards (Luhn), etc.

### Type Safety
- **Branded types**: Prevent mixing validated and unvalidated values
- **Type guards**: Runtime validation with TypeScript type narrowing
- **Strict mode**: All code uses TypeScript strict mode

## Coverage Report

```
-------------------|---------|---------|
File               | % Funcs | % Lines |
-------------------|---------|---------|
All files          |   93.75 |   97.50 |
 src/date.ts       |  100.00 |   97.62 |
 src/format.ts     |  100.00 |   93.71 |
 src/types.ts      |  100.00 |  100.00 |
 src/validation.ts |   75.00 |   98.68 |
-------------------|---------|---------|
```

## License

Private - Internal use only
