import { vi } from 'vitest';
import type { User as FirebaseUser, IdTokenResult } from 'firebase/auth';

// Mock services
export const { mockNotificationService, mockTabSyncService, mockAuth } = vi.hoisted(() => {
  return {
    mockNotificationService: {
      success: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
      error: vi.fn()
    },
    mockTabSyncService: {
      subscribe: vi.fn(),
      broadcast: vi.fn()
    },
    mockAuth: {
      currentUser: null,
      signOut: vi.fn().mockResolvedValue(undefined)
    }
  };
});

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
