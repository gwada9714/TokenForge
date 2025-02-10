import { describe, it, expect, beforeEach, vi } from 'vitest';
import { secureStorageService } from '../secureStorageService';
import { AUTH_ERROR_CODES } from '../../errors/AuthError';

describe('SecureStorageService', () => {
  beforeEach(() => {
    // Clear storage before each test
    window.sessionStorage.clear();
    vi.clearAllMocks();
  });

  describe('setItem & getItem', () => {
    it('should store and retrieve data correctly', () => {
      const testData = { id: 1, name: 'test' };
      const key = 'test_key';

      secureStorageService.setItem(key, testData);
      const retrieved = secureStorageService.getItem(key);

      expect(retrieved).toEqual(testData);
    });

    it('should return null for non-existent key', () => {
      const result = secureStorageService.getItem('non_existent');
      expect(result).toBeNull();
    });

    it('should handle complex objects', () => {
      const complexData = {
        id: 1,
        nested: { key: 'value' },
        array: [1, 2, 3],
        date: new Date().toISOString()
      };

      secureStorageService.setItem('complex', complexData);
      const retrieved = secureStorageService.getItem('complex');

      expect(retrieved).toEqual(complexData);
    });

    it('should throw STORAGE_ERROR when storage is corrupted', () => {
      // Simulate corrupted data
      window.sessionStorage.setItem('tokenforge_corrupted', 'invalid-data');

      expect(() => {
        secureStorageService.getItem('corrupted');
      }).toThrow(expect.objectContaining({
        code: AUTH_ERROR_CODES.STORAGE_ERROR
      }));
    });
  });

  describe('Auth Token Management', () => {
    const testToken = 'test.jwt.token';

    it('should manage auth token correctly', () => {
      secureStorageService.setAuthToken(testToken);
      const retrieved = secureStorageService.getAuthToken();

      expect(retrieved).toBe(testToken);
    });

    it('should remove auth token', () => {
      secureStorageService.setAuthToken(testToken);
      secureStorageService.removeAuthToken();

      expect(secureStorageService.getAuthToken()).toBeNull();
    });
  });

  describe('Data Expiration', () => {
    it('should handle expired data', () => {
      const testData = { test: 'data' };
      
      // Mock Date.now to simulate future time
      const realDateNow = Date.now.bind(global.Date);
      const dateNowStub = vi.fn(() => realDateNow() + (25 * 60 * 60 * 1000)); // 25 hours later
      global.Date.now = dateNowStub;
      
      secureStorageService.setItem('expired', testData);
      
      // Reset Date.now to real implementation
      global.Date.now = realDateNow;
      
      const retrieved = secureStorageService.getItem('expired');
      expect(retrieved).toBeNull();
    });
  });

  describe('Clear Storage', () => {
    it('should clear only tokenforge prefixed items', () => {
      // Set some test data
      secureStorageService.setItem('test1', 'data1');
      secureStorageService.setItem('test2', 'data2');
      
      // Set non-tokenforge data
      window.sessionStorage.setItem('other_key', 'other_data');
      
      secureStorageService.clear();
      
      // TokenForge items should be cleared
      expect(secureStorageService.getItem('test1')).toBeNull();
      expect(secureStorageService.getItem('test2')).toBeNull();
      
      // Non-TokenForge items should remain
      expect(window.sessionStorage.getItem('other_key')).toBe('other_data');
    });
  });
});
