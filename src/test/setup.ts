import { vi, beforeAll, afterAll } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Mock de firebase/app
vi.mock('firebase/app', () => {
  const app = {
    name: '[DEFAULT]',
    options: {},
    on: vi.fn(),
    automaticDataCollectionEnabled: false
  };
  return {
    initializeApp: vi.fn(() => app),
    getApps: vi.fn(() => [app]),
    getApp: vi.fn(() => app)
  };
});

// Mock de firebase/auth
vi.mock('firebase/auth', () => {
  const auth = {
    currentUser: null,
    onAuthStateChanged: vi.fn(),
    app: {
      name: '[DEFAULT]',
      options: {},
      on: vi.fn(),
      automaticDataCollectionEnabled: false
    }
  };
  return {
    getAuth: vi.fn(() => auth),
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn()
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

// Polyfills pour TextEncoder/TextDecoder
class MockTextEncoder {
  encode(input: string): Uint8Array {
    return new Uint8Array(Buffer.from(input));
  }
}

class MockTextDecoder {
  decode(input?: BufferSource): string {
    if (!input) return '';
    return Buffer.from(input as ArrayBuffer).toString();
  }
}

global.TextEncoder = MockTextEncoder as any;
global.TextDecoder = MockTextDecoder as any;

// Configuration globale de Vitest
beforeAll(() => {
  vi.useFakeTimers();
});

afterAll(() => {
  vi.useRealTimers();
});
