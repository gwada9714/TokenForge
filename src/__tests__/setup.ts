import { vi, beforeAll, afterAll } from 'vitest';
import type { WalletClient } from 'viem';

// Mock environment variables
vi.stubEnv('VITE_FIREBASE_API_KEY', 'test-api-key');
vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'test.firebaseapp.com');
vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'test-project');
vi.stubEnv('VITE_FIREBASE_STORAGE_BUCKET', 'test.appspot.com');
vi.stubEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', '123456789');
vi.stubEnv('VITE_FIREBASE_APP_ID', '1:123456789:web:abcdef');
vi.stubEnv('VITE_FIREBASE_MEASUREMENT_ID', 'G-TEST123456');

// Mock window.ethereum
vi.stubGlobal('ethereum', {
  request: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn(),
  isMetaMask: true,
  selectedAddress: '0x1234567890123456789012345678901234567890',
  networkVersion: '1',
  isConnected: vi.fn().mockReturnValue(true),
  enable: vi.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890'])
});

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

// Mock Firebase
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn().mockReturnValue({
    name: '[DEFAULT]',
    options: {},
    automaticDataCollectionEnabled: true
  }),
  getApp: vi.fn(),
  getApps: vi.fn().mockReturnValue([])
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn().mockReturnValue({
    currentUser: null,
    signInWithEmailAndPassword: vi.fn(),
    signInWithPopup: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
    updateProfile: vi.fn(),
    GoogleAuthProvider: vi.fn().mockImplementation(() => ({
      addScope: vi.fn()
    }))
  }),
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  GoogleAuthProvider: vi.fn().mockImplementation(() => ({
    addScope: vi.fn()
  }))
}));

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
