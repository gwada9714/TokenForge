import { describe, it, expect } from "vitest";
import {
  AuthError,
  AuthErrorCode,
  createAuthError,
  AuthComponentNotRegisteredError,
  AuthIntegrityError,
} from "../../../../features/auth/errors/AuthError";

describe("Auth Errors", () => {
  describe("AuthError", () => {
    it("devrait créer AuthError avec code et message", () => {
      const error = new AuthError(
        AuthErrorCode.INVALID_CREDENTIALS,
        "Erreur d'authentification"
      );
      expect(error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
      expect(error.message).toBe("Erreur d'authentification");
      expect(error.name).toBe("AuthError");
    });

    it("devrait stocker l'erreur originale", () => {
      const originalError = new Error("Erreur originale");
      const error = new AuthError(
        AuthErrorCode.INTERNAL_ERROR,
        "Erreur interne",
        originalError
      );
      expect(error.originalError).toBe(originalError);
    });
  });

  describe("createAuthError", () => {
    it("devrait créer une instance de AuthError", () => {
      const error = createAuthError(
        AuthErrorCode.INVALID_EMAIL,
        "Email invalide"
      );
      expect(error).toBeInstanceOf(AuthError);
      expect(error.code).toBe(AuthErrorCode.INVALID_EMAIL);
    });

    it("devrait inclure l'erreur originale si fournie", () => {
      const originalError = new Error("Erreur originale");
      const error = createAuthError(
        AuthErrorCode.NETWORK_ERROR,
        "Erreur réseau",
        originalError
      );
      expect(error.originalError).toBe(originalError);
    });
  });

  describe("AuthComponentNotRegisteredError", () => {
    it("devrait créer une erreur avec un message personnalisé", () => {
      const message = "Composant non enregistré";
      const error = new AuthComponentNotRegisteredError(message);
      expect(error.message).toBe(message);
      expect(error.name).toBe("AuthComponentNotRegisteredError");
    });
  });

  describe("AuthIntegrityError", () => {
    it("devrait créer une erreur avec un message personnalisé", () => {
      const message = "Vérification d'intégrité échouée";
      const error = new AuthIntegrityError(message);
      expect(error.message).toBe(message);
      expect(error.name).toBe("AuthIntegrityError");
    });
  });

  describe("AuthErrorCode", () => {
    it("devrait contenir tous les codes d'erreur requis", () => {
      expect(AuthErrorCode).toHaveProperty("INVALID_CREDENTIALS");
      expect(AuthErrorCode).toHaveProperty("USER_NOT_FOUND");
      expect(AuthErrorCode).toHaveProperty("WRONG_PASSWORD");
      expect(AuthErrorCode).toHaveProperty("EMAIL_ALREADY_IN_USE");
      expect(AuthErrorCode).toHaveProperty("WEAK_PASSWORD");
      expect(AuthErrorCode).toHaveProperty("INVALID_EMAIL");
      expect(AuthErrorCode).toHaveProperty("INTERNAL_ERROR");
      expect(AuthErrorCode).toHaveProperty("NETWORK_ERROR");
      expect(AuthErrorCode).toHaveProperty("WALLET_NOT_FOUND");
      expect(AuthErrorCode).toHaveProperty("SESSION_EXPIRED");
    });
  });
});
