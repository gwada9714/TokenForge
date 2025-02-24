import '@testing-library/jest-dom/vitest';
import { expect, vi, beforeAll, afterAll, beforeEach, afterEach, describe, it } from 'vitest';
import type { WalletClient } from 'viem';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Polyfills pour Node.js
const nodeCrypto = require('crypto');
global.crypto = {
  getRandomValues: function(buffer) {
    return nodeCrypto.randomFillSync(buffer);
  }
};

// Fix pour TextEncoder/TextDecoder
const util = require('util');
global.TextEncoder = util.TextEncoder;
global.TextDecoder = util.TextDecoder;

// Autres polyfills nécessaires
global.ArrayBuffer = ArrayBuffer;
global.Uint8Array = Uint8Array;
global.fetch = vi.fn();
global.Request = vi.fn();
global.Response = vi.fn();
global.Headers = vi.fn();

// Étend les matchers de test
expect.extend(matchers);

// Mock de matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock environment variables
vi.stubEnv('VITE_FIREBASE_API_KEY', 'test-api-key');
vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'test.firebaseapp.com');
vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'test-project');
vi.stubEnv('VITE_FIREBASE_STORAGE_BUCKET', 'test.appspot.com');
vi.stubEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', '123456789');
vi.stubEnv('VITE_FIREBASE_APP_ID', '1:123456789:web:abcdef');
vi.stubEnv('VITE_FIREBASE_MEASUREMENT_ID', 'G-TEST123456');

// Mock window.ethereum
const mockEthereum = {
  request: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn(),
  isMetaMask: true,
  selectedAddress: '0x1234567890123456789012345678901234567890',
  networkVersion: '1',
  isConnected: vi.fn().mockReturnValue(true),
  enable: vi.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890'])
};

vi.stubGlobal('ethereum', mockEthereum);

// Mock viem
vi.mock('viem', () => {
  const mockWalletClient: Partial<WalletClient> = {
    request: vi.fn(),
    getAddresses: vi.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']),
    getChainId: vi.fn().mockResolvedValue(1),
    sendTransaction: vi.fn(),
    signMessage: vi.fn(),
    watchAsset: vi.fn()
  };

  return {
    createWalletClient: vi.fn().mockReturnValue(mockWalletClient),
    custom: vi.fn().mockReturnValue({}),
    mainnet: { 
      id: 1, 
      name: 'Mainnet', 
      network: 'homestead',
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
      }
    },
    WalletClient: vi.fn(),
    parseEther: vi.fn((value: string) => BigInt(value) * BigInt(10 ** 18)),
    formatEther: vi.fn((value: bigint) => (Number(value) / 10 ** 18).toString())
  };
});

// Mock Firebase avec plus de fonctionnalités
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn().mockReturnValue({
    name: '[DEFAULT]',
    options: {},
    automaticDataCollectionEnabled: true
  }),
  getApp: vi.fn(),
  getApps: vi.fn().mockReturnValue([]),
  deleteApp: vi.fn(),
  onLog: vi.fn(),
  setLogLevel: vi.fn()
}));

vi.mock('firebase/auth', () => {
  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    emailVerified: true,
    displayName: 'Test User',
    photoURL: null,
    phoneNumber: null,
    isAnonymous: false,
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString()
    }
  };

  return {
    getAuth: vi.fn().mockReturnValue({
      currentUser: mockUser,
      signInWithEmailAndPassword: vi.fn().mockResolvedValue({ user: mockUser }),
      signInWithPopup: vi.fn().mockResolvedValue({ user: mockUser }),
      createUserWithEmailAndPassword: vi.fn().mockResolvedValue({ user: mockUser }),
      signOut: vi.fn().mockResolvedValue(undefined),
      onAuthStateChanged: vi.fn(),
      sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
      updateProfile: vi.fn().mockResolvedValue(undefined),
      verifyBeforeUpdateEmail: vi.fn().mockResolvedValue(undefined),
      sendEmailVerification: vi.fn().mockResolvedValue(undefined)
    }),
    signInWithEmailAndPassword: vi.fn().mockResolvedValue({ user: mockUser }),
    signInWithPopup: vi.fn().mockResolvedValue({ user: mockUser }),
    createUserWithEmailAndPassword: vi.fn().mockResolvedValue({ user: mockUser }),
    signOut: vi.fn().mockResolvedValue(undefined),
    onAuthStateChanged: vi.fn(),
    GoogleAuthProvider: vi.fn().mockImplementation(() => ({
      addScope: vi.fn(),
      setCustomParameters: vi.fn()
    }))
  };
});

// Mock console methods
const originalConsole = { ...console };
beforeAll(() => {
  console.log = vi.fn();
  console.error = vi.fn();
  console.warn = vi.fn();
  console.debug = vi.fn();
});

afterAll(() => {
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
  console.debug = originalConsole.debug;
});

// Nettoyage après chaque test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});
