import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateConfig, generateKey, submitIndexNow, submitSingleUrl } from '../src/indexnow.js';

describe('indexnow', () => {
  describe('validateConfig', () => {
    it('should throw error if host is missing', () => {
      expect(() => validateConfig({ host: '', key: 'test-key' })).toThrow('INDEXNOW_HOST not set');
    });

    it('should throw error if key is missing', () => {
      expect(() => validateConfig({ host: 'example.com', key: '' })).toThrow('INDEXNOW_KEY not set');
    });

    it('should not throw if config is valid', () => {
      expect(() => validateConfig({ host: 'example.com', key: 'test-key' })).not.toThrow();
    });

    it('should accept optional keyLocation', () => {
      expect(() => validateConfig({ 
        host: 'example.com', 
        key: 'test-key',
        keyLocation: 'https://example.com/key.txt'
      })).not.toThrow();
    });
  });

  describe('generateKey', () => {
    it('should generate a 32-character hex string', () => {
      const key = generateKey();
      expect(key.length).toBe(32);
      expect(/^[a-f0-9]+$/.test(key)).toBe(true);
    });

    it('should generate unique keys', () => {
      const keys = new Set(Array.from({ length: 100 }, () => generateKey()));
      expect(keys.size).toBe(100); // All should be unique
    });
  });

  describe('submitIndexNow', () => {
    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('should throw if config is invalid', async () => {
      await expect(submitIndexNow([], { host: '', key: '' })).rejects.toThrow();
    });

    it('should return empty array if no URLs provided', async () => {
      const results = await submitIndexNow([], { host: 'example.com', key: 'test-key' });
      expect(results).toHaveLength(0);
    });
  });

  describe('submitSingleUrl', () => {
    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('should throw if config is invalid', async () => {
      await expect(submitSingleUrl('https://example.com', { host: '', key: '' })).rejects.toThrow();
    });
  });
});
