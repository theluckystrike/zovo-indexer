import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sleep, formatDate, truncateUrl } from '../src/utils.js';

describe('utils', () => {
  describe('sleep', () => {
    it('should resolve after specified milliseconds', async () => {
      const start = Date.now();
      await sleep(50);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(45); // Allow small variance
      expect(elapsed).toBeLessThan(100);
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15T12:30:00.000Z');
      const formatted = formatDate(date);
      expect(formatted).toBe('2024-01-15 12:30:00');
    });

    it('should handle different dates', () => {
      const date = new Date('2023-06-01T00:00:00.000Z');
      const formatted = formatDate(date);
      expect(formatted).toBe('2023-06-01 00:00:00');
    });
  });

  describe('truncateUrl', () => {
    it('should not truncate short URLs', () => {
      const url = 'https://example.com';
      expect(truncateUrl(url, 60)).toBe('https://example.com');
    });

    it('should truncate long URLs with ellipsis', () => {
      const url = 'https://example.com/very/long/path/that/needs/truncation';
      const truncated = truncateUrl(url, 30);
      expect(truncated).toBe('https://example.com/very/lo...');
      expect(truncated.length).toBe(30);
    });

    it('should use default maxLength of 60', () => {
      const longUrl = 'https://' + 'a'.repeat(100) + '.com';
      const truncated = truncateUrl(longUrl);
      expect(truncated.length).toBe(60);
      expect(truncated.endsWith('...')).toBe(true);
    });

    it('should handle exact boundary', () => {
      const url = 'https://example.com/12345678901234567890123456789012345678901234567890'; // 70 chars
      const truncated = truncateUrl(url, 60);
      expect(truncated.length).toBe(60);
    });
  });
});
