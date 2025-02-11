import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SecureStorageService } from '@/services/secureStorageService';
import { TokenForgeError } from '@/utils/errors';
import { webcrypto } from 'node:crypto';

// Mock crypto API
const mockCrypto = {
  subtle: {
    generateKey: vi.fn(),
    encrypt: vi.fn(),
    decrypt: vi.fn(),
    exportKey: vi.fn(),
    importKey: vi.fn(),
    deriveKey: vi.fn()
  },
  getRandomValues: vi.fn()
};

vi.stubGlobal('crypto', mockCrypto);

describe('Secure Storage Service', () => {
  let storage: SecureStorageService;
  const testNamespace = 'test-namespace';

  beforeEach(() => {
    vi.clearAllMocks();
    storage = new SecureStorageService(testNamespace);

    // Mock localStorage
    const mockStorage: { [key: string]: string } = {};
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(
      (key) => mockStorage[key] || null
    );
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(
      (key, value) => { mockStorage[key] = value; }
    );
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(
      (key) => { delete mockStorage[key]; }
    );
    vi.spyOn(Storage.prototype, 'clear').mockImplementation(
      () => { Object.keys(mockStorage).forEach(key => delete mockStorage[key]); }
    );
  });

  describe('initialization', () => {
    it('initializes with namespace', () => {
      expect(storage['namespace']).toBe(testNamespace);
    });

    it('generates encryption key on first use', async () => {
      const mockKey = { type: 'secret', extractable: false };
      vi.mocked(mockCrypto.subtle.generateKey).mockResolvedValueOnce(mockKey);

      await storage.init();

      expect(mockCrypto.subtle.generateKey).toHaveBeenCalledWith(
        {
          name: 'AES-GCM',
          length: 256
        },
        true,
        ['encrypt', 'decrypt']
      );
    });

    it('reuses existing encryption key', async () => {
      const mockKey = { type: 'secret', extractable: false };
      vi.mocked(mockCrypto.subtle.importKey).mockResolvedValueOnce(mockKey);

      // Simulate existing key in storage
      localStorage.setItem(
        `${testNamespace}_key`,
        JSON.stringify({ key: 'encrypted-key' })
      );

      await storage.init();

      expect(mockCrypto.subtle.generateKey).not.toHaveBeenCalled();
      expect(mockCrypto.subtle.importKey).toHaveBeenCalled();
    });
  });

  describe('setItem', () => {
    it('encrypts and stores data', async () => {
      const key = 'test-key';
      const value = { foo: 'bar' };
      const mockEncrypted = new Uint8Array([1, 2, 3]);
      const mockIv = new Uint8Array([4, 5, 6]);

      vi.mocked(mockCrypto.getRandomValues).mockReturnValueOnce(mockIv);
      vi.mocked(mockCrypto.subtle.encrypt).mockResolvedValueOnce(mockEncrypted);

      await storage.setItem(key, value);

      expect(mockCrypto.subtle.encrypt).toHaveBeenCalledWith(
        {
          name: 'AES-GCM',
          iv: mockIv
        },
        expect.any(Object),
        expect.any(Uint8Array)
      );

      expect(localStorage.setItem).toHaveBeenCalledWith(
        `${testNamespace}_${key}`,
        expect.any(String)
      );
    });

    it('handles encryption errors', async () => {
      vi.mocked(mockCrypto.subtle.encrypt).mockRejectedValueOnce(
        new Error('Encryption failed')
      );

      await expect(storage.setItem('test-key', { foo: 'bar' }))
        .rejects.toThrow(TokenForgeError);
    });

    it('validates input data', async () => {
      await expect(storage.setItem('', { foo: 'bar' }))
        .rejects.toThrow(TokenForgeError);

      await expect(storage.setItem('test-key', undefined as any))
        .rejects.toThrow(TokenForgeError);
    });
  });

  describe('getItem', () => {
    it('retrieves and decrypts data', async () => {
      const key = 'test-key';
      const value = { foo: 'bar' };
      const mockEncrypted = new Uint8Array([1, 2, 3]);
      const mockIv = new Uint8Array([4, 5, 6]);

      // Setup mock encrypted data
      vi.mocked(mockCrypto.subtle.encrypt).mockResolvedValueOnce(mockEncrypted);
      vi.mocked(mockCrypto.getRandomValues).mockReturnValueOnce(mockIv);
      await storage.setItem(key, value);

      // Setup mock decryption
      vi.mocked(mockCrypto.subtle.decrypt).mockResolvedValueOnce(
        new TextEncoder().encode(JSON.stringify(value))
      );

      const retrieved = await storage.getItem(key);
      expect(retrieved).toEqual(value);
    });

    it('returns null for non-existent key', async () => {
      const retrieved = await storage.getItem('non-existent');
      expect(retrieved).toBeNull();
    });

    it('handles decryption errors', async () => {
      const key = 'test-key';
      localStorage.setItem(
        `${testNamespace}_${key}`,
        JSON.stringify({ data: 'invalid-data', iv: [] })
      );

      vi.mocked(mockCrypto.subtle.decrypt).mockRejectedValueOnce(
        new Error('Decryption failed')
      );

      await expect(storage.getItem(key)).rejects.toThrow(TokenForgeError);
    });
  });

  describe('removeItem', () => {
    it('removes stored item', async () => {
      const key = 'test-key';
      await storage.setItem(key, { foo: 'bar' });
      await storage.removeItem(key);

      expect(localStorage.removeItem).toHaveBeenCalledWith(
        `${testNamespace}_${key}`
      );

      const retrieved = await storage.getItem(key);
      expect(retrieved).toBeNull();
    });

    it('handles non-existent key', async () => {
      await expect(storage.removeItem('non-existent'))
        .resolves.not.toThrow();
    });
  });

  describe('clear', () => {
    it('clears all items in namespace', async () => {
      // Setup multiple items
      await storage.setItem('key1', { foo: 'bar' });
      await storage.setItem('key2', { baz: 'qux' });

      await storage.clear();

      const item1 = await storage.getItem('key1');
      const item2 = await storage.getItem('key2');

      expect(item1).toBeNull();
      expect(item2).toBeNull();
    });

    it('only clears items in current namespace', async () => {
      const otherStorage = new SecureStorageService('other-namespace');

      // Setup items in both namespaces
      await storage.setItem('key1', { foo: 'bar' });
      await otherStorage.setItem('key2', { baz: 'qux' });

      await storage.clear();

      const item1 = await storage.getItem('key1');
      const item2 = await otherStorage.getItem('key2');

      expect(item1).toBeNull();
      expect(item2).not.toBeNull();
    });
  });

  describe('key rotation', () => {
    it('rotates encryption key', async () => {
      const mockOldKey = { type: 'secret', extractable: true };
      const mockNewKey = { type: 'secret', extractable: true };

      vi.mocked(mockCrypto.subtle.generateKey).mockResolvedValueOnce(mockNewKey);
      vi.mocked(mockCrypto.subtle.exportKey).mockResolvedValue(new Uint8Array([1, 2, 3]));

      // Setup existing data
      await storage.setItem('test-key', { foo: 'bar' });

      await storage.rotateKey();

      expect(mockCrypto.subtle.generateKey).toHaveBeenCalled();
      expect(mockCrypto.subtle.encrypt).toHaveBeenCalled();
    });

    it('preserves data during key rotation', async () => {
      const testData = { foo: 'bar' };
      await storage.setItem('test-key', testData);

      const mockNewKey = { type: 'secret', extractable: true };
      vi.mocked(mockCrypto.subtle.generateKey).mockResolvedValueOnce(mockNewKey);
      vi.mocked(mockCrypto.subtle.decrypt).mockResolvedValue(
        new TextEncoder().encode(JSON.stringify(testData))
      );

      await storage.rotateKey();

      const retrieved = await storage.getItem('test-key');
      expect(retrieved).toEqual(testData);
    });
  });

  describe('namespace isolation', () => {
    it('maintains separate encryption keys per namespace', async () => {
      const storage1 = new SecureStorageService('namespace1');
      const storage2 = new SecureStorageService('namespace2');

      const mockKey1 = { type: 'secret', extractable: false };
      const mockKey2 = { type: 'secret', extractable: false };

      vi.mocked(mockCrypto.subtle.generateKey)
        .mockResolvedValueOnce(mockKey1)
        .mockResolvedValueOnce(mockKey2);

      await storage1.init();
      await storage2.init();

      expect(mockCrypto.subtle.generateKey).toHaveBeenCalledTimes(2);
    });

    it('prevents cross-namespace access', async () => {
      const storage1 = new SecureStorageService('namespace1');
      const storage2 = new SecureStorageService('namespace2');

      await storage1.setItem('shared-key', { foo: 'bar' });
      const retrieved = await storage2.getItem('shared-key');

      expect(retrieved).toBeNull();
    });
  });
});
