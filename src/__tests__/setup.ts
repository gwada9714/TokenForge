import '@testing-library/jest-dom/vitest';
import { expect, vi, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import React from 'react';

// Polyfills pour Node.js
if (!global.crypto) {
  const nodeCrypto = require('crypto');
  Object.defineProperty(global, 'crypto', {
    value: {
      getRandomValues: (buffer: Uint8Array) => nodeCrypto.randomFillSync(buffer)
    },
    configurable: true,
    writable: true
  });
}

// Fix pour TextEncoder/TextDecoder
if (!global.TextEncoder) {
  const util = require('util');
  global.TextEncoder = util.TextEncoder;
  global.TextDecoder = util.TextDecoder;
}

// Autres polyfills nécessaires
global.ArrayBuffer = ArrayBuffer;
global.Uint8Array = Uint8Array;
global.fetch = vi.fn();
global.Request = vi.fn();
global.Response = vi.fn().mockImplementation((body, init) => {
  return {
    ...init,
    body,
    error: () => new Response(),
    json: () => Promise.resolve({}),
    redirect: (url: string, status?: number) => new Response(null, { status: status || 302, headers: { Location: url } }),
    ok: true,
    status: 200,
    headers: new Headers(),
    clone: () => new Response(body, init),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    formData: () => Promise.resolve(new FormData()),
    type: 'default',
    url: '',
    bodyUsed: false
  };
}) as unknown as typeof Response;
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

// Mock Firebase Config
vi.stubEnv('VITE_FIREBASE_API_KEY', 'test-api-key');
vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'test.firebaseapp.com');
vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'test-project');
vi.stubEnv('VITE_FIREBASE_STORAGE_BUCKET', 'test.appspot.com');
vi.stubEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', '123456789');
vi.stubEnv('VITE_FIREBASE_APP_ID', '1:123456789:web:abcdef');
vi.stubEnv('VITE_FIREBASE_MEASUREMENT_ID', 'G-TEST123456');

// Mock Firebase
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn().mockReturnValue({
    name: '[DEFAULT]',
    options: {
      apiKey: 'test-api-key',
      authDomain: 'test.firebaseapp.com',
      projectId: 'test-project',
      storageBucket: 'test.appspot.com',
      messagingSenderId: '123456789',
      appId: '1:123456789:web:abcdef',
      measurementId: 'G-TEST123456'
    },
    automaticDataCollectionEnabled: true
  }),
  getApp: vi.fn(),
  getApps: vi.fn().mockReturnValue([]),
  deleteApp: vi.fn(),
  onLog: vi.fn(),
  setLogLevel: vi.fn()
}));

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

const mockFirebaseUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  emailVerified: true,
  displayName: 'Test User',
  photoURL: null,
  phoneNumber: null,
  providerId: 'password',
  providerData: [],
  refreshToken: '',
  tenantId: null,
  delete: vi.fn(),
  getIdToken: vi.fn(),
  getIdTokenResult: vi.fn(),
  reload: vi.fn(),
  toJSON: vi.fn(),
  isAnonymous: false,
  metadata: {
    creationTime: new Date().toISOString(),
    lastSignInTime: new Date().toISOString()
  }
};

const mockAuth = {
  currentUser: mockFirebaseUser,
  onAuthStateChanged: vi.fn((callback) => {
    callback(mockFirebaseUser);
    return vi.fn(); // Unsubscribe function
  }),
  onIdTokenChanged: vi.fn((callback) => {
    callback(mockFirebaseUser);
    return vi.fn(); // Unsubscribe function
  }),
  setPersistence: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn()
};

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => mockAuth),
  onAuthStateChanged: vi.fn(),
  onIdTokenChanged: vi.fn(),
  getIdToken: vi.fn().mockResolvedValue('mock-token'),
  browserLocalPersistence: 'LOCAL',
  browserSessionPersistence: 'SESSION',
  inMemoryPersistence: 'NONE',
  setPersistence: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn()
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({
    collection: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(),
    setDoc: vi.fn()
  })),
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn()
}));

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({
    ref: vi.fn(),
    uploadBytes: vi.fn(),
    getDownloadURL: vi.fn()
  })),
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn()
}));

vi.mock('firebase/functions', () => ({
  getFunctions: vi.fn(() => ({
    httpsCallable: vi.fn()
  })),
  httpsCallable: vi.fn()
}));

// Mock des composants lazy
vi.mock('@/features/home/pages/HomePage', () => ({
  HomePage: () => React.createElement('div', null, 'Home Page')
}));

vi.mock('@/features/dashboard/pages/DashboardPage', () => ({
  DashboardPage: () => React.createElement('div', null, 'Dashboard Page')
}));

vi.mock('@/features/auth/pages/ProfilePage', () => ({
  ProfilePage: () => React.createElement('div', null, 'Profile Page')
}));

vi.mock('@/features/auth/pages/AuthPage', () => ({
  AuthPage: () => React.createElement('div', null, 'Auth Page')
}));

// Mock des dépendances Web3
vi.mock('@rainbow-me/rainbowkit', () => ({
  RainbowKitProvider: ({ children }: { children: React.ReactNode }) => children,
  ConnectButton: () => React.createElement('div', null, 'Connect Wallet'),
  darkTheme: () => ({}),
  connectorsForWallets: () => [],
  wallet: {
    metaMask: () => ({}),
    walletConnect: () => ({}),
    coinbase: () => ({}),
    trust: () => ({})
  }
}));

vi.mock('wagmi', () => ({
  WagmiConfig: ({ children }: { children: React.ReactNode }) => children,
  useAccount: () => ({ isConnected: true }),
  useConnect: () => ({ connect: vi.fn(), connectors: [] })
}));

vi.mock('viem', async () => {
  const actual = await vi.importActual('../../src/tests/mocks/viem');
  return {
    ...actual,
    mainnet: { id: 1 },
    polygon: { id: 137 },
    sepolia: { id: 11155111 },
    http: () => ({})
  };
});

// Mock de Material-UI
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material');
  return {
    ...actual,
    useMediaQuery: () => false
  };
});

// Nettoyage de la console
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
  cleanup();
});
