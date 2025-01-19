import { Request, Response } from 'express';
import { MarketplaceController } from '../controllers/marketplace';
import { mockMarketplaceContract, mockTokenContract } from '../__mocks__/contracts';
import { Contract } from 'ethers';
import { AuthenticatedRequest } from '../middleware/auth';
import { ParsedQs } from 'qs';

interface MarketplaceRequest extends Request {
  query: ParsedQs & {
    page?: string;
    limit?: string;
    sortBy?: string;
    sortDirection?: string;
    seller?: string;
    status?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

interface CreateItemRequest extends AuthenticatedRequest {
  body: {
    tokenAddress: string;
    amount: string;
    price: string;
  };
}

jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  Contract: jest.fn().mockImplementation(() => mockTokenContract),
}));

describe('MarketplaceController', () => {
  let controller: MarketplaceController;
  let mockReq: Partial<MarketplaceRequest | CreateItemRequest>;
  let mockRes: Partial<Response>;
  const mockJson = jest.fn();
  const mockStatus = jest.fn().mockReturnValue({ json: mockJson });

  beforeEach(() => {
    controller = new MarketplaceController(mockMarketplaceContract as Contract);
    mockRes = {
      json: mockJson,
      status: mockStatus,
    };
    mockJson.mockClear();
    mockStatus.mockClear();
  });

  describe('getItems', () => {
    beforeEach(() => {
      mockReq = {
        query: {
          page: '1',
          limit: '10',
          sortBy: 'price',
          sortDirection: 'asc',
        },
      };
    });

    it('should return marketplace items', async () => {
      await controller.getItems(mockReq as MarketplaceRequest, mockRes as Response);

      expect(mockMarketplaceContract.getItemCount).toHaveBeenCalled();
      expect(mockMarketplaceContract.getItem).toHaveBeenCalledTimes(2);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            price: '100',
            status: 'active',
          }),
        ]),
      });
    });

    it('should filter by seller', async () => {
      (mockReq as MarketplaceRequest).query.seller = '0x1234567890123456789012345678901234567890';

      await controller.getItems(mockReq as MarketplaceRequest, mockRes as Response);

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            seller: '0x1234567890123456789012345678901234567890',
          }),
        ]),
      });
    });

    it('should filter by status', async () => {
      (mockReq as MarketplaceRequest).query.status = 'active';

      await controller.getItems(mockReq as MarketplaceRequest, mockRes as Response);

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            status: 'active',
          }),
        ]),
      });
    });

    it('should filter by price range', async () => {
      (mockReq as MarketplaceRequest).query.minPrice = '50';
      (mockReq as MarketplaceRequest).query.maxPrice = '150';

      await controller.getItems(mockReq as MarketplaceRequest, mockRes as Response);

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            price: '100',
          }),
        ]),
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
      await controller.createItem(mockReq as CreateItemRequest, mockRes as Response);

      expect(mockTokenContract.allowance).toHaveBeenCalled();
      expect(mockMarketplaceContract.listItem).toHaveBeenCalledWith(
        mockReq.body.tokenAddress,
        mockReq.body.amount,
        mockReq.body.price
      );
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: '1',
          status: 'active',
        }),
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      delete (mockReq as CreateItemRequest).user;

      await controller.createItem(mockReq as CreateItemRequest, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required',
      });
    });

    it('should return 400 when allowance is insufficient', async () => {
      jest.spyOn(mockTokenContract, 'allowance').mockResolvedValueOnce(0);

      await controller.createItem(mockReq as CreateItemRequest, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Insufficient allowance',
      });
    });
  });
});
