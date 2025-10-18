import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatRelativeDate,
  formatDuration,
  parseDate,
  toTimeZone,
  calculateDuration,
  addBusinessDays,
  addMinutesToDate,
  addDaysToDate,
  isWithinBusinessHours,
  getNextBusinessDay,
  isPast,
  isFuture,
  isSameDay,
  isWeekendDay,
  getStartOfDay,
  getEndOfDay,
  DateFormat,
  TimeZone,
  type BusinessHours,
} from '../src/date';

describe('Date Formatting', () => {
  describe('formatDate', () => {
    it('should format dates in different formats', () => {
      const date = new Date('2024-10-17T14:30:00Z');

      const isoResult = formatDate(date, DateFormat.ISO, TimeZone.UTC);
      expect(isoResult).toContain('2024-10-17');

      const usResult = formatDate(date, DateFormat.US, TimeZone.UTC);
      expect(usResult).toContain('10/17/2024');
    });

    it('should handle timezone conversions', () => {
      const date = new Date('2024-10-17T14:30:00Z');
      const pacificResult = formatDate(date, DateFormat.TIME_24, TimeZone.PACIFIC);
      // Should be 7 hours behind UTC (during PDT)
      expect(pacificResult).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should format string dates', () => {
      const result = formatDate('2024-10-17T14:30:00Z', DateFormat.ISO_DATE, TimeZone.UTC);
      expect(result).toBe('2024-10-17');
    });
  });

  describe('formatRelativeDate', () => {
    const now = new Date('2024-10-17T12:00:00Z');

    it('should format "just now"', () => {
      const date = new Date('2024-10-17T12:00:00Z');
      expect(formatRelativeDate(date, now)).toBe('just now');
    });

    it('should format minutes ago', () => {
      const date = new Date('2024-10-17T11:30:00Z');
      expect(formatRelativeDate(date, now)).toBe('30 minutes ago');
    });

    it('should format hours ago', () => {
      const date = new Date('2024-10-17T10:00:00Z');
      expect(formatRelativeDate(date, now)).toBe('2 hours ago');
    });

    it('should format days ago', () => {
      const date = new Date('2024-10-15T12:00:00Z');
      expect(formatRelativeDate(date, now)).toBe('2 days ago');
    });

    it('should format future dates', () => {
      const date = new Date('2024-10-17T14:00:00Z');
      expect(formatRelativeDate(date, now)).toBe('2 hours from now');
    });
  });

  describe('formatDuration', () => {
    it('should format minutes only', () => {
      expect(formatDuration(30)).toBe('30m');
      expect(formatDuration(45)).toBe('45m');
    });

    it('should format hours only', () => {
      expect(formatDuration(60)).toBe('1h');
      expect(formatDuration(120)).toBe('2h');
    });

    it('should format hours and minutes', () => {
      expect(formatDuration(90)).toBe('1h 30m');
      expect(formatDuration(150)).toBe('2h 30m');
    });

    it('should throw on negative duration', () => {
      expect(() => formatDuration(-10)).toThrow();
    });
  });
});

describe('Date Parsing', () => {
  describe('parseDate', () => {
    it('should parse date strings with timezone', () => {
      const result = parseDate('2024-10-17T10:00:00', TimeZone.UTC);
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe('toTimeZone', () => {
    it('should convert dates to timezone', () => {
      const date = new Date('2024-10-17T12:00:00Z');
      const result = toTimeZone(date, TimeZone.UTC);
      expect(result).toBeInstanceOf(Date);
    });
  });
});

describe('Date Calculations', () => {
  describe('calculateDuration', () => {
    it('should calculate duration in minutes', () => {
      const start = new Date('2024-10-17T10:00:00Z');
      const end = new Date('2024-10-17T12:30:00Z');
      expect(calculateDuration(start, end)).toBe(150);
    });

    it('should handle string dates', () => {
      const result = calculateDuration(
        '2024-10-17T10:00:00Z',
        '2024-10-17T11:00:00Z'
      );
      expect(result).toBe(60);
    });

    it('should handle negative durations', () => {
      const start = new Date('2024-10-17T12:00:00Z');
      const end = new Date('2024-10-17T10:00:00Z');
      expect(calculateDuration(start, end)).toBe(-120);
    });
  });

  describe('addBusinessDays', () => {
    it('should add business days', () => {
      const friday = new Date('2024-10-18T12:00:00Z'); // Friday
      const result = addBusinessDays(friday, 1);
      const day = result.getDay();
      expect(day).toBe(1); // Monday
    });

    it('should subtract business days', () => {
      const monday = new Date('2024-10-21T12:00:00Z');
      const result = addBusinessDays(monday, -1);
      const day = result.getDay();
      expect(day).toBe(5); // Friday
    });
  });

  describe('addMinutesToDate', () => {
    it('should add minutes', () => {
      const date = new Date('2024-10-17T10:00:00Z');
      const result = addMinutesToDate(date, 30);
      expect(result.getMinutes()).toBe(30);
    });
  });

  describe('addDaysToDate', () => {
    it('should add days', () => {
      const date = new Date('2024-10-17T12:00:00Z');
      const result = addDaysToDate(date, 5);
      expect(result.getDate()).toBe(22);
    });
  });
});

describe('Business Hours', () => {
  const businessHours: BusinessHours = {
    startHour: 9,
    startMinute: 0,
    endHour: 17,
    endMinute: 0,
  };

  describe('isWithinBusinessHours', () => {
    it('should return true for time within business hours', () => {
      const date = new Date('2024-10-17T10:00:00-07:00'); // Thursday 10 AM Pacific
      const result = isWithinBusinessHours(date, businessHours, TimeZone.PACIFIC);
      expect(result).toBe(true);
    });

    it('should return false for weekends', () => {
      const saturday = new Date('2024-10-19T10:00:00-07:00'); // Saturday
      const result = isWithinBusinessHours(saturday, businessHours, TimeZone.PACIFIC);
      expect(result).toBe(false);
    });

    it('should return false for time outside business hours', () => {
      const date = new Date('2024-10-17T20:00:00-07:00'); // Thursday 8 PM Pacific
      const result = isWithinBusinessHours(date, businessHours, TimeZone.PACIFIC);
      expect(result).toBe(false);
    });
  });

  describe('getNextBusinessDay', () => {
    it('should get next business day from weekday', () => {
      const thursday = new Date('2024-10-17T12:00:00Z');
      const result = getNextBusinessDay(thursday);
      expect(result.getDay()).toBe(5); // Friday
    });

    it('should skip weekend', () => {
      const friday = new Date('2024-10-18T12:00:00Z');
      const result = getNextBusinessDay(friday);
      expect(result.getDay()).toBe(1); // Monday
    });
  });
});

describe('Date Validation & Comparison', () => {
  describe('isPast', () => {
    it('should identify past dates', () => {
      const yesterday = new Date(Date.now() - 86400000);
      expect(isPast(yesterday)).toBe(true);
    });

    it('should identify non-past dates', () => {
      const tomorrow = new Date(Date.now() + 86400000);
      expect(isPast(tomorrow)).toBe(false);
    });
  });

  describe('isFuture', () => {
    it('should identify future dates', () => {
      const tomorrow = new Date(Date.now() + 86400000);
      expect(isFuture(tomorrow)).toBe(true);
    });

    it('should identify non-future dates', () => {
      const yesterday = new Date(Date.now() - 86400000);
      expect(isFuture(yesterday)).toBe(false);
    });
  });

  describe('isSameDay', () => {
    it('should identify same day', () => {
      const date1 = new Date('2024-10-17T10:00:00Z');
      const date2 = new Date('2024-10-17T14:00:00Z');
      expect(isSameDay(date1, date2, TimeZone.UTC)).toBe(true);
    });

    it('should identify different days', () => {
      const date1 = new Date('2024-10-17T10:00:00Z');
      const date2 = new Date('2024-10-18T10:00:00Z');
      expect(isSameDay(date1, date2, TimeZone.UTC)).toBe(false);
    });
  });

  describe('isWeekendDay', () => {
    it('should identify weekends', () => {
      const saturday = new Date('2024-10-19T12:00:00Z');
      const sunday = new Date('2024-10-20T12:00:00Z');
      expect(isWeekendDay(saturday)).toBe(true);
      expect(isWeekendDay(sunday)).toBe(true);
    });

    it('should identify weekdays', () => {
      const monday = new Date('2024-10-21T12:00:00Z');
      expect(isWeekendDay(monday)).toBe(false);
    });
  });

  describe('getStartOfDay', () => {
    it('should get start of day', () => {
      const date = new Date('2024-10-17T14:30:45Z');
      const result = getStartOfDay(date, TimeZone.UTC);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
    });
  });

  describe('getEndOfDay', () => {
    it('should get end of day', () => {
      const date = new Date('2024-10-17T10:00:00Z');
      const result = getEndOfDay(date, TimeZone.UTC);
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
    });
  });
});
