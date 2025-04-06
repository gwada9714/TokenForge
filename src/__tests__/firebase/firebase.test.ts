import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import type { UserCredential, User } from "firebase/auth";
import { AuthError, AuthErrorCode } from "../../features/auth/errors/AuthError";
import { handleUnknownError } from "../../features/auth/errors/AuthError";

let mockApp: any;
let mockUser: User;

beforeAll(() => {
  mockApp = {
    name: "[DEFAULT]",
    options: {},
    automaticDataCollectionEnabled: true,
  };

  mockUser = {
    uid: "test-uid",
    email: "test@example.com",
    emailVerified: true,
    displayName: "Test User",
    providerData: [],
    isAnonymous: false,
    phoneNumber: null,
    photoURL: null,
    providerId: "firebase",
    refreshToken: "mock-refresh-token",
    tenantId: null,
    delete: vi.fn(),
    getIdToken: vi.fn(),
    getIdTokenResult: vi.fn(),
    reload: vi.fn(),
    toJSON: vi.fn(),
    metadata: {
      creationTime: "2025-02-12T00:00:00Z",
      lastSignInTime: "2025-02-12T00:00:00Z",
    },
  } as unknown as User;
});

vi.mock("firebase/app", () => {
  let existingApp: any = null;
  const getAppsSpy = vi
    .fn()
    .mockImplementation(() => (existingApp ? [existingApp] : []));
  const initializeAppSpy = vi.fn().mockImplementation((config) => {
    if (getAppsSpy().length === 0) {
      existingApp = {
        name: "[DEFAULT]",
        options: config,
        automaticDataCollectionEnabled: true,
      };
    }
    return existingApp;
  });

  return {
    initializeApp: initializeAppSpy,
    getApps: getAppsSpy,
    getApp: vi.fn(),
  };
});

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn().mockReturnValue({
    currentUser: null,
    signInWithEmailAndPassword: vi.fn(),
    signInWithPopup: vi.fn(),
    signOut: vi.fn(),
  }),
  GoogleAuthProvider: class {
    constructor() {
      this.addScope = vi.fn();
      this.setCustomParameters = vi.fn();
    }
    addScope = vi.fn();
    setCustomParameters = vi.fn();
  },
  signInWithEmailAndPassword: vi.fn().mockImplementation(() =>
    Promise.resolve({
      user: mockUser,
      providerId: "password",
      operationType: "signIn",
    })
  ),
  signInWithPopup: vi.fn().mockImplementation(() =>
    Promise.resolve({
      user: mockUser,
      providerId: "google.com",
      operationType: "signIn",
    })
  ),
}));

describe("Configuration Firebase", () => {
  const mockConfig = {
    apiKey: "test-api-key",
    authDomain: "test.firebaseapp.com",
    projectId: "test-project",
    storageBucket: "test.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef",
    measurementId: "G-TEST123456",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devrait initialiser Firebase avec la bonne configuration", () => {
    const app = initializeApp(mockConfig);
    expect(initializeApp).toHaveBeenCalledWith(mockConfig);
    expect(app).toBeDefined();
    expect(app.name).toBe("[DEFAULT]");
    expect(app.automaticDataCollectionEnabled).toBe(true);
  });

  it("devrait obtenir l'instance d'authentification avec succès", () => {
    const app = initializeApp(mockConfig);
    const auth = getAuth(app);
    expect(getAuth).toHaveBeenCalledWith(app);
    expect(auth).toBeDefined();
    expect(auth.currentUser).toBeNull();
  });

  it("devrait empêcher les initialisations multiples", () => {
    const app1 = initializeApp(mockConfig);
    const app2 = initializeApp(mockConfig);

    expect(getApps).toHaveBeenCalled();
    expect(app1).toBe(app2);
    expect(initializeApp).toHaveBeenCalledTimes(2);
  });
});

describe("Authentification", () => {
  let auth: ReturnType<typeof getAuth>;

  beforeEach(() => {
    const app = initializeApp({
      apiKey: "test-api-key",
      authDomain: "test.firebaseapp.com",
    });
    auth = getAuth(app);
    vi.clearAllMocks();
  });

  it("devrait gérer la connexion par email/mot de passe", async () => {
    const result = await signInWithEmailAndPassword(
      auth,
      "test@test.com",
      "password"
    );
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      auth,
      "test@test.com",
      "password"
    );
    expect(result).toEqual({
      user: mockUser,
      providerId: "password",
      operationType: "signIn",
    });
  });

  it("devrait gérer la connexion Google", async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope("email");

    const result = await signInWithPopup(auth, provider);

    expect(signInWithPopup).toHaveBeenCalledWith(
      auth,
      expect.objectContaining({
        addScope: expect.any(Function),
        setCustomParameters: expect.any(Function),
      })
    );
    expect(result).toEqual({
      user: mockUser,
      providerId: "google.com",
      operationType: "signIn",
    });
  });

  it("devrait gérer les erreurs de connexion", async () => {
    const mockError = new Error("auth/invalid-email");
    vi.mocked(signInWithEmailAndPassword).mockRejectedValueOnce(mockError);

    await expect(
      signInWithEmailAndPassword(auth, "invalid-email", "password")
    ).rejects.toThrow();
  });
});

describe("Gestion des Erreurs", () => {
  it("devrait gérer correctement AuthError", () => {
    const originalError = new Error("Erreur de test");
    const authError = new AuthError(
      AuthErrorCode.INVALID_CREDENTIALS,
      "Erreur d'authentification",
      originalError
    );

    expect(authError.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
    expect(authError.originalError).toBe(originalError);
    expect(authError.message).toBe("Erreur d'authentification");
  });

  it("devrait gérer les erreurs inconnues", () => {
    const unknownError = new Error("Erreur inconnue");
    const handledError = handleUnknownError(unknownError);

    expect(handledError).toBeInstanceOf(AuthError);
    expect(handledError.code).toBe(AuthErrorCode.INTERNAL_ERROR);
    expect(handledError.originalError).toBe(unknownError);
  });

  it("devrait transmettre les AuthErrors existantes", () => {
    const originalError = new AuthError(
      AuthErrorCode.INVALID_EMAIL,
      "Email invalide"
    );
    const handledError = handleUnknownError(originalError);

    expect(handledError).toBe(originalError);
    expect(handledError.code).toBe(AuthErrorCode.INVALID_EMAIL);
  });

  it("devrait gérer les erreurs Firebase", () => {
    const firebaseError = {
      code: "auth/invalid-email",
      message: "L'adresse email est mal formatée.",
    };
    const handledError = handleUnknownError(firebaseError);

    expect(handledError).toBeInstanceOf(AuthError);
    expect(handledError.code).toBe(AuthErrorCode.INTERNAL_ERROR);
    expect(handledError.originalError).toBe(firebaseError);
  });
});
