import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import type { UserCredential, User } from 'firebase/auth';
import { AuthError, AuthErrorCode } from '../../features/auth/errors/AuthError';
import { handleUnknownError } from '../../features/auth/errors/AuthError';

let mockApp: any;
let mockUser: User;

beforeAll(() => {
  mockApp = { 
    name: '[DEFAULT]',
    options: {},
    automaticDataCollectionEnabled: true
  };

  mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    emailVerified: true,
    displayName: 'Test User',
    providerData: [],
    isAnonymous: false,
    phoneNumber: null,
    photoURL: null,
    providerId: 'firebase',
    refreshToken: 'mock-refresh-token',
    tenantId: null,
    delete: vi.fn(),
    getIdToken: vi.fn(),
    getIdTokenResult: vi.fn(),
    reload: vi.fn(),
    toJSON: vi.fn(),
    metadata: {
      creationTime: '2025-02-12T00:00:00Z',
      lastSignInTime: '2025-02-12T00:00:00Z'
    }
  } as unknown as User;
});

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn().mockImplementation(() => mockApp),
  getApps: vi.fn().mockImplementation(() => [mockApp]),
  getApp: vi.fn()
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn().mockReturnValue({
    currentUser: null,
    signInWithEmailAndPassword: vi.fn(),
    signInWithPopup: vi.fn(),
    signOut: vi.fn()
  }),
  GoogleAuthProvider: class {
    constructor() {
      this.addScope = vi.fn();
      this.setCustomParameters = vi.fn();
    }
    addScope = vi.fn();
    setCustomParameters = vi.fn();
  },
  signInWithEmailAndPassword: vi.fn().mockImplementation(() => Promise.resolve({
    user: mockUser,
    providerId: 'password',
    operationType: 'signIn'
  })),
  signInWithPopup: vi.fn().mockImplementation(() => Promise.resolve({
    user: mockUser,
    providerId: 'google.com',
    operationType: 'signIn'
  }))
}));

describe('Firebase Configuration', () => {
  const mockConfig = {
    apiKey: 'test-api-key',
    authDomain: 'test.firebaseapp.com',
    projectId: 'test-project',
    storageBucket: 'test.appspot.com',
    messagingSenderId: '123456789',
    appId: '1:123456789:web:abcdef',
    measurementId: 'G-TEST123456'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize Firebase with correct config', () => {
    const app = initializeApp(mockConfig);
    expect(initializeApp).toHaveBeenCalledWith(mockConfig);
    expect(app).toBeDefined();
    expect(app.name).toBe('[DEFAULT]');
    expect(app.automaticDataCollectionEnabled).toBe(true);
  });

  it('should get auth instance successfully', () => {
    const app = initializeApp(mockConfig);
    const auth = getAuth(app);
    expect(getAuth).toHaveBeenCalledWith(app);
    expect(auth).toBeDefined();
    expect(auth.currentUser).toBeNull();
  });

  it('should prevent multiple initializations', () => {
    initializeApp(mockConfig);
    expect(getApps).toHaveBeenCalled();
    expect(initializeApp).toHaveBeenCalledTimes(1);
  });
});

describe('Authentication', () => {
  let auth: ReturnType<typeof getAuth>;

  beforeEach(() => {
    const app = initializeApp({
      apiKey: 'test-api-key',
      authDomain: 'test.firebaseapp.com'
    });
    auth = getAuth(app);
    vi.clearAllMocks();
  });

  it('should handle email/password sign in', async () => {
    const result = await signInWithEmailAndPassword(auth, 'test@test.com', 'password');
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@test.com', 'password');
    expect(result).toEqual({
      user: mockUser,
      providerId: 'password',
      operationType: 'signIn'
    });
  });

  it('should handle Google sign in', async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    
    const result = await signInWithPopup(auth, provider);
    
    expect(signInWithPopup).toHaveBeenCalledWith(auth, expect.objectContaining({
      addScope: expect.any(Function),
      setCustomParameters: expect.any(Function)
    }));
    expect(result).toEqual({
      user: mockUser,
      providerId: 'google.com',
      operationType: 'signIn'
    });
  });

  it('should handle sign in errors', async () => {
    const mockError = new Error('auth/invalid-email');
    vi.mocked(signInWithEmailAndPassword).mockRejectedValueOnce(mockError);

    await expect(
      signInWithEmailAndPassword(auth, 'invalid-email', 'password')
    ).rejects.toThrow();
  });
});

describe('Error Handling', () => {
  it('should handle AuthError correctly', () => {
    const originalError = new Error('Test error');
    const authError = new AuthError(AuthErrorCode.SIGN_IN_ERROR, originalError);
    
    expect(authError.code).toBe(AuthErrorCode.SIGN_IN_ERROR);
    expect(authError.originalError).toBe(originalError);
    expect(authError.message).toContain('SIGN_IN_ERROR');
  });

  it('should handle unknown errors', () => {
    const unknownError = new Error('Unknown error');
    const handledError = handleUnknownError(unknownError);
    
    expect(handledError).toBeInstanceOf(AuthError);
    expect(handledError.code).toBe(AuthErrorCode.INTERNAL_ERROR);
    expect(handledError.originalError).toBe(unknownError);
  });

  it('should pass through existing AuthErrors', () => {
    const originalError = new AuthError(AuthErrorCode.INVALID_EMAIL);
    const handledError = handleUnknownError(originalError);
    
    expect(handledError).toBe(originalError);
    expect(handledError.code).toBe(AuthErrorCode.INVALID_EMAIL);
  });

  it('should handle Firebase errors', () => {
    const firebaseError = {
      code: 'auth/invalid-email',
      message: 'The email address is badly formatted.'
    };
    const handledError = handleUnknownError(firebaseError);
    
    expect(handledError).toBeInstanceOf(AuthError);
    expect(handledError.code).toBe(AuthErrorCode.INTERNAL_ERROR);
    expect(handledError.originalError).toBe(firebaseError);
  });
});
