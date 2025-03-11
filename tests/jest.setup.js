// Configuration de base pour les tests Jest/Vitest

// Mock des modules Firebase
jest.mock('@/lib/firebase/services', () => ({
  getFirebaseManager: jest.fn().mockResolvedValue({
    db: {},
    auth: {},
    functions: {},
  }),
}));

jest.mock('@/lib/firebase/firestore', () => ({
  getFirestore: jest.fn().mockResolvedValue({}),
  firestoreService: {
    createUserProfile: jest.fn(),
    updateUserProfile: jest.fn(),
    updateUserActivity: jest.fn(),
  },
}));

jest.mock('@/lib/firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

// Mock pour ethers
jest.mock('ethers', () => ({
  utils: {
    formatEther: jest.fn(val => `${val}`),
  },
}));

// Mock pour wagmi
jest.mock('wagmi', () => ({
  useAccount: jest.fn().mockReturnValue({ 
    address: '0x1234567890123456789012345678901234567890',
    isConnected: true
  }),
  useContractWrite: jest.fn().mockReturnValue({
    writeAsync: jest.fn().mockResolvedValue({}),
  }),
  useContractRead: jest.fn().mockReturnValue({
    data: [],
  }),
}));

// Mock pour react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
  loading: jest.fn(),
}));

// Configuration globale
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Cleanup des mocks après chaque test
afterEach(() => {
  jest.clearAllMocks();
});
