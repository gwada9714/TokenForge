import { describe, it, expect, beforeEach, vi } from "vitest";
import { verifyMessage } from "viem";
import { type NextFunction, type Request, type Response } from "express";
import { authMiddleware, type AuthenticatedRequest } from "../middleware/auth";

vi.mock("viem", () => ({
  verifyMessage: vi.fn(),
}));

describe("Auth Middleware", () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();

    vi.mocked(verifyMessage).mockClear();
  });

  it("should return 401 if no authorization header", async () => {
    await authMiddleware(
      mockReq as AuthenticatedRequest,
      mockRes as Response,
      mockNext
    );

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: "No authorization header",
    });
  });

  it("should return 401 if invalid authorization format", async () => {
    mockReq.headers = {
      authorization: "InvalidFormat",
    };

    await authMiddleware(
      mockReq as AuthenticatedRequest,
      mockRes as Response,
      mockNext
    );

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: "Invalid authorization format",
    });
  });

  it("should return 401 if missing authentication parameters", async () => {
    mockReq.headers = {
      authorization: "Bearer invalid",
    };

    await authMiddleware(
      mockReq as AuthenticatedRequest,
      mockRes as Response,
      mockNext
    );

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: "Missing authentication parameters",
    });
  });

  it("should return 401 if signature is expired", async () => {
    const oldTimestamp = Date.now() - 6 * 60 * 1000; // 6 minutes ago
    mockReq.headers = {
      authorization: `Bearer address:signature:${oldTimestamp}`,
    };

    await authMiddleware(
      mockReq as AuthenticatedRequest,
      mockRes as Response,
      mockNext
    );

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: "Signature expired",
    });
  });

  it("should return 401 if signature is invalid", async () => {
    const timestamp = Date.now();
    const address = "0x1234567890123456789012345678901234567890";
    mockReq.headers = {
      authorization: `Bearer ${address}:invalid-signature:${timestamp}`,
    };

    vi.mocked(verifyMessage).mockResolvedValue(false);

    await authMiddleware(
      mockReq as AuthenticatedRequest,
      mockRes as Response,
      mockNext
    );

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: "Invalid signature",
    });
  });

  it("should call next() if signature is valid", async () => {
    const timestamp = Date.now();
    const address = "0x1234567890123456789012345678901234567890";
    mockReq.headers = {
      authorization: `Bearer ${address}:valid-signature:${timestamp}`,
    };

    vi.mocked(verifyMessage).mockResolvedValue(true);

    await authMiddleware(
      mockReq as AuthenticatedRequest,
      mockRes as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.user).toEqual({
      address: address.toLowerCase(),
      timestamp,
    });
  });
});
