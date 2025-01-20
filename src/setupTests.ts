// jest-dom adds custom jest matchers for asserting on DOM nodes.
import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
    status: 200,
  })
) as jest.Mock;

// Mock Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: null,
    signInWithPopup: jest.fn(),
    signOut: jest.fn(),
  })),
  GoogleAuthProvider: jest.fn(() => ({})),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
}));

// Mock modules
jest.mock("@web3modal/wagmi", () => ({
  useWeb3Modal: () => ({
    open: jest.fn(),
    close: jest.fn(),
    isOpen: false,
  }),
  createWeb3Modal: jest.fn(),
}));

// Mock wagmi
jest.mock("wagmi", () => {
  const originalModule = jest.requireActual("wagmi");
  return {
    ...originalModule,
    WagmiProvider: ({ children }: { children: React.ReactNode }) => children,
    useAccount: () => ({
      address: "0x1234567890123456789012345678901234567890",
      isConnecting: false,
      isDisconnected: false,
    }),
    useContractRead: jest.fn(),
    useWriteContract: jest.fn(),
    createConfig: jest.fn(),
    http: jest.fn(),
  };
});

// Mock ethers
jest.mock("ethers", () => ({
  ...jest.requireActual("ethers"),
  JsonRpcProvider: jest.fn(),
}));

// Mock react-query
jest.mock("@tanstack/react-query", () => ({
  QueryClient: jest.fn(() => ({
    setDefaultOptions: jest.fn(),
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));
