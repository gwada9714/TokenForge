import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SecureStorageService } from '../secureStorageService';

describe('SecureStorageService', () => {
  let secureStorageService: SecureStorageService;
  let mockLocalStorage: Storage;

  beforeEach(() => {
    mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };
    
    global.localStorage = mockLocalStorage;
    secureStorageService = new SecureStorageService();
  });

  describe('setItem', () => {
    it('encrypts and stores data', async () => {
      const key = 'testKey';
      const value = 'testValue';
      
      await secureStorageService.setItem(key, value);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        key,
        expect.any(String)
      );
      
      const storedValue = vi.mocked(mockLocalStorage.setItem).mock.calls[0][1];
      expect(storedValue).not.toBe(value); // Should be encrypted
    });

    it('handles objects', async () => {
      const key = 'testKey';
      const value = { test: 'value' };
      
      await secureStorageService.setItem(key, value);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        key,
        expect.any(String)
      );
    });
  });

  describe('getItem', () => {
    it('retrieves and decrypts data', async () => {
      const key = 'testKey';
      const encryptedValue = 'encryptedValue';
      vi.mocked(mockLocalStorage.getItem).mockReturnValue(encryptedValue);
      
      const result = await secureStorageService.getItem(key);
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(key);
      expect(result).toBeDefined();
    });

    it('returns null for non-existent key', async () => {
      const key = 'nonExistentKey';
      vi.mocked(mockLocalStorage.getItem).mockReturnValue(null);
      
      const result = await secureStorageService.getItem(key);
      
      expect(result).toBeNull();
    });

    it('handles corrupted data', async () => {
      const key = 'corruptedKey';
      vi.mocked(mockLocalStorage.getItem).mockReturnValue('corrupted-data');
      
      const result = await secureStorageService.getItem(key);
      
      expect(result).toBeNull();
    });
  });

  describe('removeItem', () => {
    it('removes item from storage', async () => {
      const key = 'testKey';
      
      await secureStorageService.removeItem(key);
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(key);
    });
  });

  describe('clear', () => {
    it('clears all items from storage', async () => {
      await secureStorageService.clear();
      
      expect(mockLocalStorage.clear).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('handles storage quota exceeded error', async () => {
      const key = 'testKey';
      const value = 'testValue';
      vi.mocked(mockLocalStorage.setItem).mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      
      await expect(secureStorageService.setItem(key, value)).rejects.toThrow();
    });

    it('handles storage not available error', async () => {
      const key = 'testKey';
      vi.mocked(mockLocalStorage.getItem).mockImplementation(() => {
        throw new Error('Storage not available');
      });
      
      await expect(secureStorageService.getItem(key)).rejects.toThrow();
    });
  });
});
