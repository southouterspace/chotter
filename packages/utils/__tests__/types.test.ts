import { describe, it, expect } from 'vitest';
import {
  isUUID,
  isEmail,
  isPhoneNumber,
  isPositiveInt,
  isNonEmptyString,
  isNonEmptyArray,
  isDefined,
  isPlainObject,
  isURL,
  isValidDate,
  assertType,
  assertNever,
  brand,
  unbrand,
} from '../src/types';

describe('Type Guards', () => {
  describe('isUUID', () => {
    it('should validate valid UUIDs', () => {
      expect(isUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(isUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      expect(isUUID('not-a-uuid')).toBe(false);
      expect(isUUID('550e8400-e29b-41d4-a716')).toBe(false);
      expect(isUUID(123)).toBe(false);
      expect(isUUID(null)).toBe(false);
    });
  });

  describe('isEmail', () => {
    it('should validate valid emails', () => {
      expect(isEmail('test@example.com')).toBe(true);
      expect(isEmail('user+tag@example.co.uk')).toBe(true);
      expect(isEmail('valid.email@sub.domain.com')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isEmail('not-an-email')).toBe(false);
      expect(isEmail('@example.com')).toBe(false);
      expect(isEmail('user@')).toBe(false);
      expect(isEmail(123)).toBe(false);
      expect(isEmail('a'.repeat(255) + '@example.com')).toBe(false); // Too long
    });
  });

  describe('isPhoneNumber', () => {
    it('should validate E.164 phone numbers', () => {
      expect(isPhoneNumber('+11234567890')).toBe(true);
      expect(isPhoneNumber('+442071234567')).toBe(true);
      expect(isPhoneNumber('+86123456789')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isPhoneNumber('1234567890')).toBe(false); // Missing +
      expect(isPhoneNumber('+0123456789')).toBe(false); // Starts with 0
      expect(isPhoneNumber('+1')).toBe(false); // Too short
      expect(isPhoneNumber(123)).toBe(false);
    });
  });

  describe('isPositiveInt', () => {
    it('should validate positive integers', () => {
      expect(isPositiveInt(1)).toBe(true);
      expect(isPositiveInt(100)).toBe(true);
      expect(isPositiveInt(999999)).toBe(true);
    });

    it('should reject non-positive integers', () => {
      expect(isPositiveInt(0)).toBe(false);
      expect(isPositiveInt(-1)).toBe(false);
      expect(isPositiveInt(1.5)).toBe(false);
      expect(isPositiveInt('1')).toBe(false);
      expect(isPositiveInt(NaN)).toBe(false);
    });
  });

  describe('isNonEmptyString', () => {
    it('should validate non-empty strings', () => {
      expect(isNonEmptyString('hello')).toBe(true);
      expect(isNonEmptyString('a')).toBe(true);
      expect(isNonEmptyString('  test  ')).toBe(true); // Has content after trim
    });

    it('should reject empty strings', () => {
      expect(isNonEmptyString('')).toBe(false);
      expect(isNonEmptyString('   ')).toBe(false); // Only whitespace
      expect(isNonEmptyString(123)).toBe(false);
      expect(isNonEmptyString(null)).toBe(false);
    });
  });

  describe('isNonEmptyArray', () => {
    it('should validate non-empty arrays', () => {
      expect(isNonEmptyArray([1])).toBe(true);
      expect(isNonEmptyArray([1, 2, 3])).toBe(true);
      expect(isNonEmptyArray(['a', 'b'])).toBe(true);
    });

    it('should reject empty arrays', () => {
      expect(isNonEmptyArray([])).toBe(false);
      expect(isNonEmptyArray('not an array')).toBe(false);
      expect(isNonEmptyArray(null)).toBe(false);
    });
  });

  describe('isDefined', () => {
    it('should validate defined values', () => {
      expect(isDefined(0)).toBe(true);
      expect(isDefined('')).toBe(true);
      expect(isDefined(false)).toBe(true);
      expect(isDefined([])).toBe(true);
    });

    it('should reject null and undefined', () => {
      expect(isDefined(null)).toBe(false);
      expect(isDefined(undefined)).toBe(false);
    });
  });

  describe('isPlainObject', () => {
    it('should validate plain objects', () => {
      expect(isPlainObject({})).toBe(true);
      expect(isPlainObject({ a: 1, b: 2 })).toBe(true);
    });

    it('should reject non-plain objects', () => {
      expect(isPlainObject([])).toBe(false);
      expect(isPlainObject(null)).toBe(false);
      expect(isPlainObject(new Date())).toBe(false);
      expect(isPlainObject('string')).toBe(false);
    });
  });

  describe('isURL', () => {
    it('should validate valid URLs', () => {
      expect(isURL('https://example.com')).toBe(true);
      expect(isURL('http://sub.domain.com/path?query=value')).toBe(true);
      expect(isURL('ftp://files.example.com')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isURL('not-a-url')).toBe(false);
      expect(isURL('example.com')).toBe(false); // Missing protocol
      expect(isURL(123)).toBe(false);
    });
  });

  describe('isValidDate', () => {
    it('should validate valid dates', () => {
      expect(isValidDate(new Date())).toBe(true);
      expect(isValidDate(new Date('2024-01-01'))).toBe(true);
    });

    it('should reject invalid dates', () => {
      expect(isValidDate(new Date('invalid'))).toBe(false);
      expect(isValidDate('2024-01-01')).toBe(false);
      expect(isValidDate(123)).toBe(false);
    });
  });
});

describe('Utility Functions', () => {
  describe('assertType', () => {
    it('should assert valid type', () => {
      const result = assertType('test@example.com', isEmail);
      expect(result).toBe('test@example.com');
    });

    it('should throw on invalid type', () => {
      expect(() => assertType('invalid', isEmail)).toThrow();
      expect(() => assertType('invalid', isEmail, 'Custom error')).toThrow('Custom error');
    });
  });

  describe('assertNever', () => {
    it('should throw with value', () => {
      expect(() => assertNever('unexpected' as never)).toThrow('Unexpected value: "unexpected"');
    });
  });

  describe('brand and unbrand', () => {
    it('should brand and unbrand values', () => {
      const branded = brand('test');
      expect(branded).toBe('test');

      const unbranded = unbrand(branded);
      expect(unbranded).toBe('test');
    });
  });
});
