// vitest setup
import "@testing-library/jest-dom/vitest";
import { vi } from 'vitest';
import { TextEncoder, TextDecoder } from "util";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
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

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
    status: 200,
  })
) as unknown as typeof fetch;

// Mock Firebase
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => []),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    currentUser: null,
    signInWithPopup: vi.fn(),
    signOut: vi.fn(),
  })),
  GoogleAuthProvider: vi.fn(() => ({})),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
}));

// Mock Web3Modal
vi.mock("@web3modal/wagmi", () => ({
  useWeb3Modal: () => ({
    open: vi.fn(),
    close: vi.fn(),
    isOpen: false,
  }),
  createWeb3Modal: vi.fn(),
}));

// Mock Wagmi
vi.mock("wagmi", async () => {
  const actual = await vi.importActual("wagmi");
  return {
    ...actual,
    WagmiProvider: ({ children }: { children: React.ReactNode }) => children,
    useAccount: () => ({
      address: "0x1234567890123456789012345678901234567890",
      isConnecting: false,
      isDisconnected: false,
    }),
    useContractRead: vi.fn(),
    useWriteContract: vi.fn(),
    createConfig: vi.fn(),
    http: vi.fn(),
  };
});

// Mock Ethers
vi.mock("ethers", async () => {
  const actual = await vi.importActual("ethers");
  return {
    ...actual,
    JsonRpcProvider: vi.fn(),
  };
});

// Mock React Query
vi.mock("@tanstack/react-query", () => ({
  QueryClient: vi.fn(() => ({
    setDefaultOptions: vi.fn(),
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));
