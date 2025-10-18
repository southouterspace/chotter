import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatCurrencyWhole,
  parseCurrency,
  formatPhoneNumber,
  formatPhoneE164,
  parsePhoneNumber,
  formatAddress,
  formatAddressMultiline,
  formatName,
  formatNameLastFirst,
  getInitials,
  formatNumber,
  formatPercent,
  formatCompactNumber,
  formatBytes,
  capitalize,
  titleCase,
  truncate,
  slugify,
  formatList,
  formatListIntl,
  type Address,
  type Name,
} from '../src/format';

describe('Currency Formatting', () => {
  describe('formatCurrency', () => {
    it('should format cents to USD', () => {
      expect(formatCurrency(1599)).toBe('$15.99');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(10000)).toBe('$100.00');
    });

    it('should format with different currencies', () => {
      expect(formatCurrency(1599, 'EUR', 'de-DE')).toContain('15,99');
    });

    it('should throw on invalid input', () => {
      expect(() => formatCurrency(NaN)).toThrow();
      expect(() => formatCurrency(Infinity)).toThrow();
    });
  });

  describe('formatCurrencyWhole', () => {
    it('should format without cents', () => {
      expect(formatCurrencyWhole(1599)).toBe('$16');
      expect(formatCurrencyWhole(10000)).toBe('$100');
    });
  });

  describe('parseCurrency', () => {
    it('should parse currency strings to cents', () => {
      expect(parseCurrency('$15.99')).toBe(1599);
      expect(parseCurrency('15.99')).toBe(1599);
      expect(parseCurrency('$1,234.56')).toBe(123456);
    });

    it('should throw on invalid input', () => {
      expect(() => parseCurrency('invalid')).toThrow();
      expect(() => parseCurrency('abc')).toThrow();
    });
  });
});

describe('Phone Number Formatting', () => {
  describe('formatPhoneNumber', () => {
    it('should format E.164 to US format', () => {
      expect(formatPhoneNumber('+11234567890')).toBe('(123) 456-7890');
      expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
      expect(formatPhoneNumber('11234567890')).toBe('(123) 456-7890');
    });

    it('should return original for invalid format', () => {
      expect(formatPhoneNumber('invalid')).toBe('invalid');
      expect(formatPhoneNumber('123')).toBe('123');
    });
  });

  describe('formatPhoneE164', () => {
    it('should format to E.164', () => {
      expect(formatPhoneE164('(123) 456-7890')).toBe('+11234567890');
      expect(formatPhoneE164('123-456-7890')).toBe('+11234567890');
      expect(formatPhoneE164('1234567890')).toBe('+11234567890');
    });
  });

  describe('parsePhoneNumber', () => {
    it('should extract digits only', () => {
      expect(parsePhoneNumber('(123) 456-7890')).toBe('1234567890');
      expect(parsePhoneNumber('+1-123-456-7890')).toBe('11234567890');
    });
  });
});

describe('Address Formatting', () => {
  const address: Address = {
    street1: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94105',
  };

  describe('formatAddress', () => {
    it('should format address on single line', () => {
      expect(formatAddress(address)).toBe('123 Main St, San Francisco, CA 94105');
    });

    it('should include street2 if present', () => {
      const addr = { ...address, street2: 'Apt 4B' };
      expect(formatAddress(addr)).toBe('123 Main St, Apt 4B, San Francisco, CA 94105');
    });

    it('should include country if not US', () => {
      const addr = { ...address, country: 'CA' };
      expect(formatAddress(addr)).toContain('CA');
    });
  });

  describe('formatAddressMultiline', () => {
    it('should format address on multiple lines', () => {
      const result = formatAddressMultiline(address);
      expect(result).toBe('123 Main St\nSan Francisco, CA 94105');
    });
  });
});

describe('Name Formatting', () => {
  const name: Name = {
    firstName: 'John',
    lastName: 'Doe',
  };

  describe('formatName', () => {
    it('should format basic name', () => {
      expect(formatName(name)).toBe('John Doe');
    });

    it('should include all name parts', () => {
      const fullName: Name = {
        prefix: 'Dr.',
        firstName: 'John',
        middleName: 'Q',
        lastName: 'Doe',
        suffix: 'Jr.',
      };
      expect(formatName(fullName)).toBe('Dr. John Q Doe Jr.');
    });
  });

  describe('formatNameLastFirst', () => {
    it('should format as last, first', () => {
      expect(formatNameLastFirst(name)).toBe('Doe, John');
    });
  });

  describe('getInitials', () => {
    it('should get initials', () => {
      expect(getInitials(name)).toBe('JD');
      expect(getInitials({ firstName: 'alice', lastName: 'bob' })).toBe('AB');
    });
  });
});

describe('Number Formatting', () => {
  describe('formatNumber', () => {
    it('should format with thousands separators', () => {
      expect(formatNumber(1234567)).toBe('1,234,567');
      expect(formatNumber(1000)).toBe('1,000');
    });
  });

  describe('formatPercent', () => {
    it('should format percentages', () => {
      expect(formatPercent(0.15)).toBe('15%');
      expect(formatPercent(0.1234, 2)).toBe('12.34%');
      expect(formatPercent(1)).toBe('100%');
    });
  });

  describe('formatCompactNumber', () => {
    it('should format in compact notation', () => {
      const result1 = formatCompactNumber(1234);
      expect(result1).toMatch(/1\.2K/i);

      const result2 = formatCompactNumber(1234567);
      expect(result2).toMatch(/1\.2M/i);
    });
  });

  describe('formatBytes', () => {
    it('should format byte sizes', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
      expect(formatBytes(1024)).toBe('1.00 KB');
      expect(formatBytes(1048576)).toBe('1.00 MB');
      expect(formatBytes(1234567)).toContain('MB');
    });
  });
});

describe('String Formatting', () => {
  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('WORLD')).toBe('World');
    });

    it('should handle empty strings', () => {
      expect(capitalize('')).toBe('');
    });
  });

  describe('titleCase', () => {
    it('should convert to title case', () => {
      expect(titleCase('hello world')).toBe('Hello World');
      expect(titleCase('THE QUICK BROWN FOX')).toBe('The Quick Brown Fox');
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      expect(truncate('Hello world', 8)).toBe('Hello...');
      expect(truncate('Short', 10)).toBe('Short');
    });

    it('should use custom ellipsis', () => {
      expect(truncate('Hello world', 8, '…')).toBe('Hello w…');
    });
  });

  describe('slugify', () => {
    it('should create URL-friendly slugs', () => {
      expect(slugify('Hello World!')).toBe('hello-world');
      expect(slugify('  Multiple   Spaces  ')).toBe('multiple-spaces');
      expect(slugify('Special@#$Characters')).toBe('specialcharacters');
    });
  });
});

describe('List Formatting', () => {
  describe('formatList', () => {
    it('should format empty array', () => {
      expect(formatList([])).toBe('');
    });

    it('should format single item', () => {
      expect(formatList(['apple'])).toBe('apple');
    });

    it('should format two items', () => {
      expect(formatList(['apple', 'orange'])).toBe('apple and orange');
    });

    it('should format multiple items', () => {
      expect(formatList(['apple', 'orange', 'banana'])).toBe('apple, orange, and banana');
    });

    it('should use custom conjunction', () => {
      expect(formatList(['apple', 'orange'], 'or')).toBe('apple or orange');
    });
  });

  describe('formatListIntl', () => {
    it('should format lists using Intl.ListFormat', () => {
      const result = formatListIntl(['apple', 'orange', 'banana']);
      expect(result).toContain('apple');
      expect(result).toContain('orange');
      expect(result).toContain('banana');
    });
  });
});
