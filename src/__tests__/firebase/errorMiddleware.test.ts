import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import { handleAuthError } from "../../features/auth/middleware/errorMiddleware";
import { AuthError, AuthErrorCode } from "../../features/auth/errors/AuthError";
import { logger } from "../../core/logger";
import type { Mock } from "vitest";

describe("Error Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
    locals: Record<string, unknown>;
    setHeader: ReturnType<typeof vi.fn>;
    getHeader: ReturnType<typeof vi.fn>;
    end: ReturnType<typeof vi.fn>;
  };
  let nextFunction: Mock;

  beforeEach(() => {
    vi.mock("../../core/logger", () => ({
      logger: {
        error: vi.fn(),
      },
    }));

    mockRequest = {
      path: "/test",
      method: "GET",
      headers: {
        "user-agent": "test-agent",
      },
      query: {},
      params: {},
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      locals: {},
      setHeader: vi.fn().mockReturnThis(),
      getHeader: vi.fn(),
      end: vi.fn(),
    };

    nextFunction = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should handle AuthError with correct status code", () => {
    const error = new AuthError(
      AuthErrorCode.INVALID_EMAIL,
      "Invalid email format"
    );

    handleAuthError(
      error,
      mockRequest as Request,
      mockResponse as unknown as Response,
      nextFunction as unknown as NextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: {
        code: AuthErrorCode.INVALID_EMAIL,
        message: expect.stringContaining("Invalid email format"),
      },
    });
  });

  it("should convert unknown errors to AuthError", () => {
    const error = new Error("Unknown error");

    handleAuthError(
      error,
      mockRequest as Request,
      mockResponse as unknown as Response,
      nextFunction as unknown as NextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: {
        code: AuthErrorCode.INTERNAL_ERROR,
        message: expect.stringContaining("INTERNAL_ERROR"),
      },
    });
  });

  it("should log errors with correct level and details", () => {
    const originalError = new Error("Original error");
    const error = new AuthError(
      AuthErrorCode.SIGN_IN_ERROR,
      "Sign in failed",
      originalError
    );

    handleAuthError(
      error,
      mockRequest as Request,
      mockResponse as unknown as Response,
      nextFunction as unknown as NextFunction
    );

    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("Erreur d'authentification"),
      expect.objectContaining({
        code: AuthErrorCode.SIGN_IN_ERROR,
        message: expect.any(String),
      })
    );
  });

  it("should handle rate limiting errors with 403", () => {
    const error = new AuthError(
      AuthErrorCode.TOO_MANY_REQUESTS,
      "Too many requests"
    );

    handleAuthError(
      error,
      mockRequest as Request,
      mockResponse as unknown as Response,
      nextFunction as unknown as NextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: {
        code: AuthErrorCode.TOO_MANY_REQUESTS,
        message: expect.stringContaining("Too many requests"),
      },
    });
  });

  it("should handle email conflict with 409", () => {
    const error = new AuthError(
      AuthErrorCode.EMAIL_ALREADY_IN_USE,
      "Email already exists"
    );

    handleAuthError(
      error,
      mockRequest as Request,
      mockResponse as unknown as Response,
      nextFunction as unknown as NextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: {
        code: AuthErrorCode.EMAIL_ALREADY_IN_USE,
        message: expect.stringContaining("Email already exists"),
      },
    });
  });

  it("should include request details in error log", () => {
    const error = new AuthError(
      AuthErrorCode.INTERNAL_ERROR,
      "Operation failed"
    );

    handleAuthError(
      error,
      mockRequest as Request,
      mockResponse as unknown as Response,
      nextFunction as unknown as NextFunction
    );

    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining(`[GET /test]`),
      expect.objectContaining({
        code: AuthErrorCode.INTERNAL_ERROR,
        message: expect.any(String),
      })
    );
  });
});
