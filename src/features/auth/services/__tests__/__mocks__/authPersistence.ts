import { vi } from 'vitest';
import type { User as FirebaseUser, IdTokenResult } from 'firebase/auth';

// Mock console.error
export const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

// Mock services
export const mockNotificationService = {
  success: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
  error: vi.fn()
};

export const mockTabSyncService = {
  subscribe: vi.fn(),
  broadcast: vi.fn()
};

export const mockAuth = {
  currentUser: null,
  signOut: vi.fn().mockResolvedValue(undefined)
};

// Mock AuthPersistence
export const { mockAuthPersistence } = vi.hoisted(() => {
  return {
    mockAuthPersistence: {
      load: vi.fn(),
      save: vi.fn(),
      remove: vi.fn()
    }
  };
});

export const AuthPersistence = {
  getInstance: () => mockAuthPersistence
};

// Mock modules
export const mockModules = {
  '../notificationService': () => ({
    notificationService: mockNotificationService
  }),
  '../tabSyncService': () => ({
    tabSyncService: mockTabSyncService
  }),
  '../../../../config/firebase': () => ({
    auth: mockAuth
  }),
  '../../store/authPersistence': () => ({
    AuthPersistence: {
      getInstance: () => mockAuthPersistence
    }
  })
};

// Mock user
export const createMockUser = (): Partial<FirebaseUser> => ({
  uid: 'test-uid',
  email: 'test@example.com',
  emailVerified: true,
  getIdToken: vi.fn().mockResolvedValue('mock-token'),
  getIdTokenResult: vi.fn().mockResolvedValue({
    token: 'mock-token',
    claims: {
      admin: true,
      canCreateToken: true
    },
    authTime: new Date().toISOString(),
    issuedAtTime: new Date().toISOString(),
    expirationTime: new Date(Date.now() + 3600000).toISOString(),
    signInProvider: 'password',
    signInSecondFactor: null
  } as IdTokenResult)
});
