import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response } from "express";
import { TokensController } from "../controllers/tokens";
import {
  mockTokenForgeFactory,
  mockTokenContract,
} from "../__mocks__/contracts";
import { Contract } from "ethers";
import { AuthenticatedRequest } from "../middleware/auth";
import { ParsedQs } from "qs";

interface TokenRequest extends Request {
  params: {
    address?: string;
  };
}

interface TokenSearchRequest extends Request {
  query: ParsedQs & {
    owner?: string;
    symbol?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
    sortDirection?: string;
  };
}

interface TokenAuthRequest extends AuthenticatedRequest {
  params: {
    address?: string;
  };
}

vi.mock("ethers", () => ({
  ...vi.importActual("ethers"),
  Contract: vi.fn().mockImplementation(() => mockTokenContract),
}));

describe("TokensController", () => {
  let controller: TokensController;
  let mockReq: Partial<TokenRequest | TokenSearchRequest | TokenAuthRequest>;
  let mockRes: Partial<Response>;
  const mockJson = vi.fn();
  const mockStatus = vi.fn().mockReturnValue({ json: mockJson });

  beforeEach(() => {
    controller = new TokensController(mockTokenForgeFactory as Contract);
    mockRes = {
      json: mockJson,
      status: mockStatus,
    };
    mockJson.mockClear();
    mockStatus.mockClear();
  });

  describe("getUserTokens", () => {
    beforeEach(() => {
      mockReq = {
        params: { address: "0x1234567890123456789012345678901234567890" },
        user: {
          address: "0x1234567890123456789012345678901234567890",
          timestamp: Date.now(),
        },
      } as TokenAuthRequest;
    });

    it("should return user tokens when authorized", async () => {
      await controller.getUserTokens(
        mockReq as TokenAuthRequest,
        mockRes as Response
      );

      expect(mockTokenForgeFactory.getUserTokens).toHaveBeenCalledWith(
        mockReq.params.address
      );
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            name: "Test Token",
            symbol: "TEST",
            decimals: 18,
          }),
        ]),
      });
    });

    it("should return 403 when unauthorized", async () => {
      (mockReq as TokenAuthRequest).user = {
        address: "0x9999999999999999999999999999999999999999",
        timestamp: Date.now(),
      };

      await controller.getUserTokens(
        mockReq as TokenAuthRequest,
        mockRes as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: "Unauthorized access",
      });
    });

    it("should return 400 when address is missing", async () => {
      delete (mockReq as TokenAuthRequest).params.address;

      await controller.getUserTokens(
        mockReq as TokenAuthRequest,
        mockRes as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: "Address parameter is required",
      });
    });
  });

  describe("getTokenDetails", () => {
    beforeEach(() => {
      mockReq = {
        params: { address: "0x1234567890123456789012345678901234567890" },
      } as TokenRequest;
    });

    it("should return token details", async () => {
      await controller.getTokenDetails(
        mockReq as TokenRequest,
        mockRes as Response
      );

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          name: "Test Token",
          symbol: "TEST",
          decimals: 18,
        }),
      });
    });
  });

  describe("searchTokens", () => {
    beforeEach(() => {
      mockReq = {
        query: {
          owner: "0x1234567890123456789012345678901234567890",
          page: "1",
          limit: "10",
        },
      } as TokenSearchRequest;
    });

    it("should return filtered tokens", async () => {
      await controller.searchTokens(
        mockReq as TokenSearchRequest,
        mockRes as Response
      );

      expect(mockTokenForgeFactory.getUserTokens).toHaveBeenCalledWith(
        (mockReq as TokenSearchRequest).query.owner
      );
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            name: "Test Token",
            symbol: "TEST",
            decimals: 18,
          }),
        ]),
      });
    });

    it("should return empty array when no owner specified", async () => {
      mockReq = { query: {} } as TokenSearchRequest;

      await controller.searchTokens(
        mockReq as TokenSearchRequest,
        mockRes as Response
      );

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: [],
      });
    });

    it("should filter by symbol when specified", async () => {
      (mockReq as TokenSearchRequest).query.symbol = "TEST";

      await controller.searchTokens(
        mockReq as TokenSearchRequest,
        mockRes as Response
      );

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            symbol: "TEST",
          }),
        ]),
      });
    });
  });
});
