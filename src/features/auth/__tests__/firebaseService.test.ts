import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  AuthErrorCodes,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  UserCredential,
  Auth,
} from "firebase/auth";
import { firebaseService } from "../services/firebaseService";
import { AuthErrorCode } from "../errors/AuthError";

// Mock Firebase Auth
vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => ({
    currentUser: null,
  })),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  AuthErrorCodes: {
    INVALID_EMAIL: "auth/invalid-email",
    USER_DISABLED: "auth/user-disabled",
    USER_DELETED: "auth/user-not-found",
    INVALID_PASSWORD: "auth/wrong-password",
    EMAIL_EXISTS: "auth/email-already-in-use",
    OPERATION_NOT_ALLOWED: "auth/operation-not-allowed",
    WEAK_PASSWORD: "auth/weak-password",
    REQUIRES_RECENT_LOGIN: "auth/requires-recent-login",
    TOO_MANY_ATTEMPTS_TRY_LATER: "auth/too-many-requests",
  },
}));

describe("FirebaseService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("signIn", () => {
    it("should successfully sign in a user", async () => {
      const mockUserCredential: UserCredential = {
        user: {
          uid: "123",
          email: "test@example.com",
          emailVerified: true,
          metadata: {
            creationTime: "2023-01-01T00:00:00Z",
            lastSignInTime: "2023-01-01T00:00:00Z",
          },
          delete: vi.fn(),
          getIdToken: vi.fn(),
          getIdTokenResult: vi.fn(),
          reload: vi.fn(),
          toJSON: vi.fn(),
        },
        providerId: "password",
        operationType: "signIn",
      };

      (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce(
        mockUserCredential
      );

      const result = await firebaseService.signIn(
        "test@example.com",
        "password123"
      );

      expect(result).toEqual(
        expect.objectContaining({
          uid: "123",
          email: "test@example.com",
        })
      );
    });

    it("should handle invalid email error", async () => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({
        code: AuthErrorCodes.INVALID_EMAIL,
        message: "Invalid email",
      });

      await expect(
        firebaseService.signIn("invalid-email", "password123")
      ).rejects.toThrow(
        expect.objectContaining({
          code: AuthErrorCode.INVALID_EMAIL,
        })
      );
    });

    it("should handle disabled user error", async () => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({
        code: AuthErrorCodes.USER_DISABLED,
        message: "User disabled",
      });

      await expect(
        firebaseService.signIn("test@example.com", "password123")
      ).rejects.toThrow(
        expect.objectContaining({
          code: AuthErrorCode.USER_DISABLED,
        })
      );
    });
  });

  describe("signUp", () => {
    it("should successfully create a new user", async () => {
      const mockUserCredential: UserCredential = {
        user: {
          uid: "123",
          email: "test@example.com",
          emailVerified: false,
          metadata: {
            creationTime: "2023-01-01T00:00:00Z",
            lastSignInTime: "2023-01-01T00:00:00Z",
          },
          delete: vi.fn(),
          getIdToken: vi.fn(),
          getIdTokenResult: vi.fn(),
          reload: vi.fn(),
          toJSON: vi.fn(),
        },
        providerId: "password",
        operationType: "signUp",
      };

      (createUserWithEmailAndPassword as jest.Mock).mockResolvedValueOnce(
        mockUserCredential
      );

      const result = await firebaseService.signUp(
        "test@example.com",
        "password123"
      );

      expect(result).toEqual(
        expect.objectContaining({
          uid: "123",
          email: "test@example.com",
        })
      );
    });

    it("should handle email already in use error", async () => {
      (createUserWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({
        code: AuthErrorCodes.EMAIL_EXISTS,
        message: "Email already in use",
      });

      await expect(
        firebaseService.signUp("existing@example.com", "password123")
      ).rejects.toThrow(
        expect.objectContaining({
          code: AuthErrorCode.EMAIL_ALREADY_IN_USE,
        })
      );
    });
  });

  describe("signOut", () => {
    it("should successfully sign out", async () => {
      (signOut as jest.Mock).mockResolvedValueOnce(undefined);

      await expect(firebaseService.signOut()).resolves.not.toThrow();
    });

    it("should handle sign out error", async () => {
      (signOut as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

      await expect(firebaseService.signOut()).rejects.toThrow(
        expect.objectContaining({
          code: AuthErrorCode.SIGN_OUT_ERROR,
        })
      );
    });
  });

  describe("resetPassword", () => {
    it("should successfully send reset password email", async () => {
      (sendPasswordResetEmail as jest.Mock).mockResolvedValueOnce(undefined);

      await expect(
        firebaseService.resetPassword("test@example.com")
      ).resolves.not.toThrow();
    });

    it("should handle invalid email error", async () => {
      (sendPasswordResetEmail as jest.Mock).mockRejectedValueOnce({
        code: AuthErrorCodes.INVALID_EMAIL,
        message: "Invalid email",
      });

      await expect(
        firebaseService.resetPassword("invalid-email")
      ).rejects.toThrow(
        expect.objectContaining({
          code: AuthErrorCode.INVALID_EMAIL,
        })
      );
    });
  });
});
