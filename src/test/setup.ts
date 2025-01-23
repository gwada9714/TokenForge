import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Polyfills nécessaires pour les tests
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
  global.Uint8Array = Uint8Array;
}

// Mock de fetch pour les tests
global.fetch = vi.fn();

// Mock de console.error pour éviter le bruit dans les tests
console.error = vi.fn();

// Mock des APIs Web3
vi.mock('@solana/web3.js', async () => {
  const actual = await vi.importActual<typeof import('@solana/web3.js')>('@solana/web3.js');
  return {
    ...actual,
    Connection: vi.fn().mockImplementation(() => ({
      getBalance: vi.fn().mockResolvedValue(1000000000),
      getAccountInfo: vi.fn().mockResolvedValue(null),
      sendTransaction: vi.fn().mockResolvedValue('mock-signature'),
    })),
    PublicKey: vi.fn().mockImplementation((key) => ({
      toString: () => key,
      toBase58: () => key,
    })),
  };
});

vi.mock('ethers', async () => {
  const actual = await vi.importActual('ethers');
  return {
    ...(actual as any),
    providers: {
      JsonRpcProvider: vi.fn(),
      Web3Provider: vi.fn(),
    },
    Contract: vi.fn(),
    utils: {
      formatUnits: vi.fn(),
      parseUnits: vi.fn(),
      formatEther: vi.fn(),
      parseEther: vi.fn(),
    },
    BigNumber: {
      from: vi.fn(),
    },
  };
});

// Mock de firebase/app
vi.mock('firebase/app', () => {
  return {
    initializeApp: vi.fn(),
    getApps: vi.fn(() => []),
  };
});

// Mock de firebase/auth
vi.mock('firebase/auth', () => {
  return {
    getAuth: vi.fn(() => ({
      currentUser: null,
      onAuthStateChanged: vi.fn(),
      signInWithEmailAndPassword: vi.fn(),
      signOut: vi.fn(),
    })),
    signInWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn(),
  };
});

// Mock de firebase/firestore
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({
    collection: vi.fn(),
    doc: vi.fn(),
    on: vi.fn()
  }))
}));

// Mock de firebase/functions
vi.mock('firebase/functions', () => ({
  getFunctions: vi.fn(() => ({
    app: {
      name: '[DEFAULT]',
      options: {},
      on: vi.fn(),
      automaticDataCollectionEnabled: false
    }
  }))
}));

// Mock de react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
  };
});

// Configuration globale de Vitest
beforeAll(() => {
  vi.useFakeTimers();
});

afterAll(() => {
  vi.useRealTimers();
});

// Nettoyage après chaque test
afterEach(() => {
  vi.clearAllMocks();
});
