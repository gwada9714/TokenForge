import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { MarketplaceController } from '../controllers/marketplace';
import { createPublicClient, createWalletClient, type PublicClient, type WalletClient } from 'viem';

vi.mock('viem', () => ({
  createPublicClient: vi.fn(),
  createWalletClient: vi.fn(),
}));

describe('MarketplaceController', () => {
  let marketplaceController: MarketplaceController;
  let mockPublicClient: PublicClient;
  let mockWalletClient: WalletClient;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockPublicClient = {
      readContract: vi.fn(),
    } as any;

    mockWalletClient = {
      writeContract: vi.fn(),
    } as any;

    vi.mocked(createPublicClient).mockReturnValue(mockPublicClient);
    vi.mocked(createWalletClient).mockReturnValue(mockWalletClient);

    marketplaceController = new MarketplaceController();

    mockReq = {
      body: {},
      params: {},
      query: {},
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });

  describe('getItems', () => {
    beforeEach(() => {
      mockReq.query = {
        page: '1',
        limit: '10',
        sortBy: 'price',
        sortDirection: 'asc',
      };
    });

    it('should return marketplace items', async () => {
      const mockListings = [
        {
          id: '1',
          tokenAddress: '0x123...',
          tokenId: '1',
          price: BigInt('1000000000000000000'),
          seller: '0x456...',
        },
      ];

      vi.mocked(mockPublicClient.readContract).mockResolvedValue(mockListings);

      await marketplaceController.getItems(mockReq as Request, mockRes as Response);

      expect(mockPublicClient.readContract).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockListings,
      });
    });

    it('should filter by seller', async () => {
      (mockReq as Request).query.seller = '0x1234567890123456789012345678901234567890';

      const mockListings = [
        {
          id: '1',
          tokenAddress: '0x123...',
          tokenId: '1',
          price: BigInt('1000000000000000000'),
          seller: '0x1234567890123456789012345678901234567890',
        },
      ];

      vi.mocked(mockPublicClient.readContract).mockResolvedValue(mockListings);

      await marketplaceController.getItems(mockReq as Request, mockRes as Response);

      expect(mockPublicClient.readContract).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockListings,
      });
    });

    it('should filter by status', async () => {
      (mockReq as Request).query.status = 'active';

      const mockListings = [
        {
          id: '1',
          tokenAddress: '0x123...',
          tokenId: '1',
          price: BigInt('1000000000000000000'),
          seller: '0x456...',
          status: 'active',
        },
      ];

      vi.mocked(mockPublicClient.readContract).mockResolvedValue(mockListings);

      await marketplaceController.getItems(mockReq as Request, mockRes as Response);

      expect(mockPublicClient.readContract).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockListings,
      });
    });

    it('should filter by price range', async () => {
      (mockReq as Request).query.minPrice = '50';
      (mockReq as Request).query.maxPrice = '150';

      const mockListings = [
        {
          id: '1',
          tokenAddress: '0x123...',
          tokenId: '1',
          price: BigInt('1000000000000000000'),
          seller: '0x456...',
        },
      ];

      vi.mocked(mockPublicClient.readContract).mockResolvedValue(mockListings);

      await marketplaceController.getItems(mockReq as Request, mockRes as Response);

      expect(mockPublicClient.readContract).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockListings,
      });
    });
  });

  describe('createItem', () => {
    beforeEach(() => {
      mockReq = {
        user: {
          address: '0x1234567890123456789012345678901234567890',
          timestamp: Date.now(),
        },
        body: {
          tokenAddress: '0x1111111111111111111111111111111111111111',
          amount: '100',
          price: '1000',
        },
      };
    });

    it('should create marketplace item', async () => {
      vi.mocked(mockWalletClient.writeContract).mockResolvedValue('0x789...');

      await marketplaceController.createItem(mockReq as Request, mockRes as Response);

      expect(mockWalletClient.writeContract).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          id: '1',
          status: 'active',
        },
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      delete (mockReq as Request).user;

      await marketplaceController.createItem(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required',
      });
    });

    it('should return 400 when allowance is insufficient', async () => {
      vi.mocked(mockWalletClient.writeContract).mockRejectedValue(new Error('Insufficient allowance'));

      await marketplaceController.createItem(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Insufficient allowance',
      });
    });
  });
});
