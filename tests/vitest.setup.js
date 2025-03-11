// Configuration de base pour les tests Vitest

import { vi } from 'vitest';

// Mock des modules Firebase
vi.mock('@/lib/firebase/services', () => ({
  getFirebaseManager: vi.fn().mockResolvedValue({
    db: {},
    auth: {},
    functions: {},
  }),
}));

vi.mock('@/lib/firebase/firestore', () => ({
  getFirestore: vi.fn().mockResolvedValue({}),
  firestoreService: {
    createUserProfile: vi.fn(),
    updateUserProfile: vi.fn(),
    updateUserActivity: vi.fn(),
  },
}));

vi.mock('@/lib/firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

// Mock pour viem au lieu d'ethers
vi.mock('viem', () => ({
  formatEther: vi.fn(val => `${val}`),
  parseEther: vi.fn(val => BigInt(val)),
  createPublicClient: vi.fn(),
  createWalletClient: vi.fn(),
  http: vi.fn(),
}));

// Mock pour wagmi
vi.mock('wagmi', () => ({
  useAccount: vi.fn().mockReturnValue({ 
    address: '0x1234567890123456789012345678901234567890',
    isConnected: true
  }),
  useContractWrite: vi.fn().mockReturnValue({
    writeAsync: vi.fn().mockResolvedValue({}),
  }),
  useContractRead: vi.fn().mockReturnValue({
    data: [],
  }),
}));

// Mock pour react-hot-toast
vi.mock('react-hot-toast', () => ({
  success: vi.fn(),
  error: vi.fn(),
  loading: vi.fn(),
}));

// Configuration globale
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Nettoyage des mocks après chaque test
afterEach(() => {
  vi.clearAllMocks();
});
