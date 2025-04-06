import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { authService } from "../core/auth/services/AuthService";
import { AuthType } from "../core/auth/services/AuthServiceBase";

// Mocker les services Firebase
vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => ({
    currentUser: null,
    onAuthStateChanged: vi.fn((callback) => {
      callback(null);
      return vi.fn(); // Unsubscribe function
    }),
  })),
  signInWithEmailAndPassword: vi.fn(() =>
    Promise.resolve({
      user: {
        uid: "test-uid",
        email: "test@example.com",
        emailVerified: true,
        getIdToken: vi.fn(() => Promise.resolve("test-token")),
      },
    })
  ),
  createUserWithEmailAndPassword: vi.fn(() =>
    Promise.resolve({
      user: {
        uid: "test-uid",
        email: "test@example.com",
        emailVerified: false,
        getIdToken: vi.fn(() => Promise.resolve("test-token")),
      },
    })
  ),
  sendEmailVerification: vi.fn(() => Promise.resolve()),
  sendPasswordResetEmail: vi.fn(() => Promise.resolve()),
  updateProfile: vi.fn(() => Promise.resolve()),
  signOut: vi.fn(() => Promise.resolve()),
  AuthErrorCodes: {
    EMAIL_EXISTS: "auth/email-already-in-use",
    INVALID_EMAIL: "auth/invalid-email",
    WEAK_PASSWORD: "auth/weak-password",
    USER_DISABLED: "auth/user-disabled",
    USER_NOT_FOUND: "auth/user-not-found",
    WRONG_PASSWORD: "auth/wrong-password",
    TOO_MANY_ATTEMPTS_TRY_LATER: "auth/too-many-requests",
  },
}));

// Mocker ethers
vi.mock("ethers", () => ({
  ethers: {
    providers: {
      Web3Provider: vi.fn(() => ({
        getSigner: vi.fn(() => ({
          signMessage: vi.fn(() => Promise.resolve("test-signature")),
        })),
        send: vi.fn(() => Promise.resolve(["0x1234567890abcdef"])),
        getNetwork: vi.fn(() => Promise.resolve({ chainId: 1 })),
      })),
    },
    utils: {
      verifyMessage: vi.fn(() => "0x1234567890abcdef"),
    },
  },
}));

describe("Auth Service", () => {
  beforeEach(() => {
    // Simuler window.ethereum
    global.window = {
      ...global.window,
      ethereum: {
        request: vi.fn(() => Promise.resolve(["0x1234567890abcdef"])),
        on: vi.fn(),
        removeListener: vi.fn(),
      },
      setInterval: vi.fn(() => 123),
      clearInterval: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should be a singleton", () => {
    const instance2 = authService;
    expect(authService).toBe(instance2);
  });

  it("should login with email and password", async () => {
    const response = await authService.login(
      { email: "test@example.com", password: "password123" },
      AuthType.EMAIL_PASSWORD
    );

    expect(response.success).toBe(true);
    expect(response.user).toBeDefined();
    expect(response.user.uid).toBe("test-uid");
    expect(response.user.email).toBe("test@example.com");
  });

  it("should signup with email and password", async () => {
    const response = await authService.signup(
      {
        email: "test@example.com",
        password: "password123",
        displayName: "Test User",
      },
      AuthType.EMAIL_PASSWORD
    );

    expect(response.success).toBe(true);
    expect(response.user).toBeDefined();
    expect(response.user.uid).toBe("test-uid");
    expect(response.user.email).toBe("test@example.com");
  });

  it("should reset password", async () => {
    const result = await authService.resetPassword("test@example.com");

    expect(result).toBe(true);
  });

  it("should get current auth type", () => {
    const authType = authService.getCurrentAuthType();

    // Le type d'authentification est défini
    expect(authType).toBeDefined();
  });
});
