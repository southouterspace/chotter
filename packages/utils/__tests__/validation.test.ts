import { describe, it, expect } from 'vitest';
import {
  emailSchema,
  phoneNumberSchema,
  uuidSchema,
  urlSchema,
  passwordSchema,
  postalCodeSchema,
  stateCodeSchema,
  nonEmptyStringSchema,
  positiveIntSchema,
  nonNegativeIntSchema,
  currencyAmountSchema,
  isoDateSchema,
  dateRangeSchema,
  isoDateRangeSchema,
  businessHoursSchema,
  addressSchema,
  coordinatesSchema,
  nameSchema,
  usernameSchema,
  paginationSchema,
  cursorPaginationSchema,
  creditCardSchema,
  hexColorSchema,
  slugSchema,
  jsonStringSchema,
  validate,
  validateSafe,
  nonEmptyArraySchema,
  uniqueArraySchema,
} from '../src/validation';
import { z } from 'zod';

describe('Common Field Validators', () => {
  describe('emailSchema', () => {
    it('should validate valid emails', () => {
      expect(emailSchema.parse('test@example.com')).toBe('test@example.com');
      expect(emailSchema.parse('User@Example.COM')).toBe('user@example.com'); // Lowercase
    });

    it('should reject invalid emails', () => {
      expect(() => emailSchema.parse('invalid')).toThrow();
      expect(() => emailSchema.parse('@example.com')).toThrow();
    });
  });

  describe('phoneNumberSchema', () => {
    it('should validate E.164 phone numbers', () => {
      expect(phoneNumberSchema.parse('+11234567890')).toBe('+11234567890');
      expect(phoneNumberSchema.parse('+442071234567')).toBe('+442071234567');
    });

    it('should reject invalid phone numbers', () => {
      expect(() => phoneNumberSchema.parse('1234567890')).toThrow();
      expect(() => phoneNumberSchema.parse('+0123456789')).toThrow();
    });
  });

  describe('uuidSchema', () => {
    it('should validate UUIDs', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      expect(uuidSchema.parse(uuid)).toBe(uuid);
    });

    it('should reject invalid UUIDs', () => {
      expect(() => uuidSchema.parse('not-a-uuid')).toThrow();
    });
  });

  describe('urlSchema', () => {
    it('should validate URLs', () => {
      expect(urlSchema.parse('https://example.com')).toBe('https://example.com');
      expect(urlSchema.parse('http://test.com/path')).toBe('http://test.com/path');
    });

    it('should reject invalid URLs', () => {
      expect(() => urlSchema.parse('not-a-url')).toThrow();
      expect(() => urlSchema.parse('ftp://example.com')).toThrow(); // Only HTTP(S)
    });
  });

  describe('passwordSchema', () => {
    it('should validate strong passwords', () => {
      expect(passwordSchema.parse('Test123!')).toBe('Test123!');
      expect(passwordSchema.parse('MyP@ssw0rd')).toBe('MyP@ssw0rd');
    });

    it('should reject weak passwords', () => {
      expect(() => passwordSchema.parse('short')).toThrow(); // Too short
      expect(() => passwordSchema.parse('alllowercase123!')).toThrow(); // No uppercase
      expect(() => passwordSchema.parse('ALLUPPERCASE123!')).toThrow(); // No lowercase
      expect(() => passwordSchema.parse('NoNumbers!')).toThrow(); // No numbers
      expect(() => passwordSchema.parse('NoSpecial123')).toThrow(); // No special chars
    });
  });

  describe('postalCodeSchema', () => {
    it('should validate postal codes', () => {
      expect(postalCodeSchema.parse('12345')).toBe('12345');
      expect(postalCodeSchema.parse('12345-6789')).toBe('12345-6789');
    });

    it('should reject invalid postal codes', () => {
      expect(() => postalCodeSchema.parse('123')).toThrow();
      expect(() => postalCodeSchema.parse('ABCDE')).toThrow();
    });
  });

  describe('stateCodeSchema', () => {
    it('should validate state codes', () => {
      expect(stateCodeSchema.parse('CA')).toBe('CA');
      expect(stateCodeSchema.parse('ca')).toBe('CA'); // Uppercase
      expect(stateCodeSchema.parse('NY')).toBe('NY');
    });

    it('should reject invalid state codes', () => {
      expect(() => stateCodeSchema.parse('XX')).toThrow();
      expect(() => stateCodeSchema.parse('C')).toThrow();
    });
  });

  describe('nonEmptyStringSchema', () => {
    it('should validate non-empty strings', () => {
      expect(nonEmptyStringSchema.parse('hello')).toBe('hello');
      expect(nonEmptyStringSchema.parse('  test  ')).toBe('test'); // Trimmed
    });

    it('should reject empty strings', () => {
      expect(() => nonEmptyStringSchema.parse('')).toThrow();
      expect(() => nonEmptyStringSchema.parse('   ')).toThrow();
    });
  });

  describe('positiveIntSchema', () => {
    it('should validate positive integers', () => {
      expect(positiveIntSchema.parse(1)).toBe(1);
      expect(positiveIntSchema.parse(100)).toBe(100);
    });

    it('should reject non-positive integers', () => {
      expect(() => positiveIntSchema.parse(0)).toThrow();
      expect(() => positiveIntSchema.parse(-1)).toThrow();
      expect(() => positiveIntSchema.parse(1.5)).toThrow();
    });
  });

  describe('nonNegativeIntSchema', () => {
    it('should validate non-negative integers', () => {
      expect(nonNegativeIntSchema.parse(0)).toBe(0);
      expect(nonNegativeIntSchema.parse(100)).toBe(100);
    });

    it('should reject negative integers', () => {
      expect(() => nonNegativeIntSchema.parse(-1)).toThrow();
    });
  });
});

describe('Date & Time Validators', () => {
  describe('isoDateSchema', () => {
    it('should validate ISO date strings', () => {
      const date = '2024-10-17T12:00:00Z';
      expect(isoDateSchema.parse(date)).toBe(date);
    });

    it('should reject invalid date strings', () => {
      expect(() => isoDateSchema.parse('not-a-date')).toThrow();
      expect(() => isoDateSchema.parse('2024-10-17')).toThrow(); // Missing time
    });
  });

  describe('dateRangeSchema', () => {
    it('should validate valid date ranges', () => {
      const range = {
        start: new Date('2024-10-17'),
        end: new Date('2024-10-18'),
      };
      expect(dateRangeSchema.parse(range)).toEqual(range);
    });

    it('should reject invalid date ranges', () => {
      expect(() =>
        dateRangeSchema.parse({
          start: new Date('2024-10-18'),
          end: new Date('2024-10-17'),
        })
      ).toThrow();
    });
  });

  describe('isoDateRangeSchema', () => {
    it('should validate ISO date ranges', () => {
      const range = {
        start: '2024-10-17T12:00:00Z',
        end: '2024-10-18T12:00:00Z',
      };
      expect(isoDateRangeSchema.parse(range)).toEqual(range);
    });
  });

  describe('businessHoursSchema', () => {
    it('should validate business hours', () => {
      const hours = {
        startHour: 9,
        startMinute: 0,
        endHour: 17,
        endMinute: 0,
      };
      expect(businessHoursSchema.parse(hours)).toEqual(hours);
    });

    it('should reject invalid business hours', () => {
      expect(() =>
        businessHoursSchema.parse({
          startHour: 17,
          startMinute: 0,
          endHour: 9,
          endMinute: 0,
        })
      ).toThrow(); // End before start
    });
  });
});

describe('Address & Location Validators', () => {
  describe('addressSchema', () => {
    it('should validate addresses', () => {
      const address = {
        street1: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94105',
      };
      const result = addressSchema.parse(address);
      expect(result.country).toBe('US'); // Default
    });

    it('should validate with optional fields', () => {
      const address = {
        street1: '123 Main St',
        street2: 'Apt 4B',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94105',
        country: 'US',
      };
      expect(addressSchema.parse(address)).toEqual(address);
    });
  });

  describe('coordinatesSchema', () => {
    it('should validate coordinates', () => {
      const coords = { latitude: 37.7749, longitude: -122.4194 };
      expect(coordinatesSchema.parse(coords)).toEqual(coords);
    });

    it('should reject invalid coordinates', () => {
      expect(() => coordinatesSchema.parse({ latitude: 100, longitude: 0 })).toThrow();
      expect(() => coordinatesSchema.parse({ latitude: 0, longitude: 200 })).toThrow();
    });
  });
});

describe('User Input Validators', () => {
  describe('nameSchema', () => {
    it('should validate names', () => {
      const name = { firstName: 'John', lastName: 'Doe' };
      expect(nameSchema.parse(name)).toEqual(name);
    });

    it('should validate with optional fields', () => {
      const name = {
        firstName: 'John',
        middleName: 'Q',
        lastName: 'Doe',
        prefix: 'Dr.',
        suffix: 'Jr.',
      };
      expect(nameSchema.parse(name)).toEqual(name);
    });
  });

  describe('usernameSchema', () => {
    it('should validate usernames', () => {
      expect(usernameSchema.parse('john_doe')).toBe('john_doe');
      expect(usernameSchema.parse('User123')).toBe('user123'); // Lowercase
    });

    it('should reject invalid usernames', () => {
      expect(() => usernameSchema.parse('ab')).toThrow(); // Too short
      expect(() => usernameSchema.parse('user@name')).toThrow(); // Invalid chars
    });
  });
});

describe('Pagination Validators', () => {
  describe('paginationSchema', () => {
    it('should validate with defaults', () => {
      const result = paginationSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should validate custom values', () => {
      const result = paginationSchema.parse({ page: 5, limit: 50 });
      expect(result).toEqual({ page: 5, limit: 50 });
    });

    it('should reject invalid values', () => {
      expect(() => paginationSchema.parse({ page: 0 })).toThrow();
      expect(() => paginationSchema.parse({ limit: 101 })).toThrow();
    });
  });

  describe('cursorPaginationSchema', () => {
    it('should validate cursor pagination', () => {
      const result = cursorPaginationSchema.parse({ cursor: 'abc123' });
      expect(result.cursor).toBe('abc123');
      expect(result.limit).toBe(20);
    });
  });
});

describe('Custom Validators', () => {
  describe('creditCardSchema', () => {
    it('should validate credit card numbers', () => {
      // Valid Luhn check
      expect(creditCardSchema.parse('4532015112830366')).toBe('4532015112830366');
    });

    it('should reject invalid credit cards', () => {
      expect(() => creditCardSchema.parse('1234567890123456')).toThrow(); // Invalid Luhn
      expect(() => creditCardSchema.parse('123')).toThrow(); // Too short
    });
  });

  describe('hexColorSchema', () => {
    it('should validate hex colors', () => {
      expect(hexColorSchema.parse('#FF0000')).toBe('#FF0000');
      expect(hexColorSchema.parse('#F00')).toBe('#F00');
    });

    it('should reject invalid hex colors', () => {
      expect(() => hexColorSchema.parse('FF0000')).toThrow(); // Missing #
      expect(() => hexColorSchema.parse('#GGGGGG')).toThrow(); // Invalid chars
    });
  });

  describe('slugSchema', () => {
    it('should validate slugs', () => {
      expect(slugSchema.parse('hello-world')).toBe('hello-world');
      expect(slugSchema.parse('test-123')).toBe('test-123');
    });

    it('should reject invalid slugs', () => {
      expect(() => slugSchema.parse('Hello World')).toThrow(); // Uppercase/spaces
      expect(() => slugSchema.parse('test_slug')).toThrow(); // Underscores
    });
  });

  describe('jsonStringSchema', () => {
    it('should validate JSON strings', () => {
      expect(jsonStringSchema.parse('{"key":"value"}')).toBe('{"key":"value"}');
      expect(jsonStringSchema.parse('[1,2,3]')).toBe('[1,2,3]');
    });

    it('should reject invalid JSON', () => {
      expect(() => jsonStringSchema.parse('{invalid}')).toThrow();
      expect(() => jsonStringSchema.parse('not json')).toThrow();
    });
  });
});

describe('Array Validators', () => {
  describe('nonEmptyArraySchema', () => {
    it('should validate non-empty arrays', () => {
      const schema = nonEmptyArraySchema(z.string());
      expect(schema.parse(['a', 'b'])).toEqual(['a', 'b']);
    });

    it('should reject empty arrays', () => {
      const schema = nonEmptyArraySchema(z.string());
      expect(() => schema.parse([])).toThrow();
    });
  });

  describe('uniqueArraySchema', () => {
    it('should validate unique arrays', () => {
      const schema = uniqueArraySchema(z.string());
      expect(schema.parse(['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
    });

    it('should reject arrays with duplicates', () => {
      const schema = uniqueArraySchema(z.string());
      expect(() => schema.parse(['a', 'b', 'a'])).toThrow();
    });
  });
});

describe('Helper Functions', () => {
  describe('validate', () => {
    it('should validate and return data', () => {
      const result = validate(emailSchema, 'test@example.com');
      expect(result).toBe('test@example.com');
    });

    it('should throw on invalid data', () => {
      expect(() => validate(emailSchema, 'invalid')).toThrow();
    });
  });

  describe('validateSafe', () => {
    it('should return success for valid data', () => {
      const result = validateSafe(emailSchema, 'test@example.com');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('test@example.com');
      }
    });

    it('should return error for invalid data', () => {
      const result = validateSafe(emailSchema, 'invalid');
      expect(result.success).toBe(false);
    });
  });
});
