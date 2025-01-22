import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockProvider, mockChainConfig } from './__mocks__/providers';
import { ChainId } from '../../../types/Chain';

// Mock modules before imports
vi.mock('ethers', () => ({
  providers: {
    JsonRpcProvider: vi.fn().mockImplementation(() => mockProvider),
    Web3Provider: vi.fn().mockImplementation(() => mockProvider),
  },
  utils: {
    isAddress: (address: string) => /^0x[0-9a-fA-F]{40}$/.test(address),
    parseEther: (value: string) => ({
      _hex: '0x00',
      _isBigNumber: true,
      toString: () => value,
      mul: vi.fn().mockReturnThis(),
      div: vi.fn().mockReturnThis(),
    }),
  },
  Contract: vi.fn(),
  ContractFactory: vi.fn(),
}));

// Mock dependencies
vi.mock('../../../../config/dependencies', () => ({
  PROVIDERS: {
    ALCHEMY_KEY: 'test-key',
    INFURA_KEY: 'test-key',
    BSC_NODE_KEY: 'test-key',
    POLYGON_NODE_KEY: 'test-key',
  }
}));

// Mock chain config
vi.mock('../../../../config/chains', () => {
  return {
    getChainConfig: vi.fn().mockReturnValue(mockChainConfig),
    polygonConfig: mockChainConfig,
    ChainId,
    supportedChains: {
      [ChainId.POLYGON]: mockChainConfig
    }
  };
});

// Mock BaseProviderService
vi.mock('../../BaseProviderService', () => ({
  BaseProviderService: {
    getProvider: vi.fn().mockImplementation(async () => mockProvider),
    clearProviders: vi.fn()
  }
}));

// Import service after mocks
import { PolygonService } from '../../polygon/PolygonService';

describe('PolygonService', () => {
  let service: PolygonService;

  beforeEach(() => {
    service = new PolygonService();
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  describe('getBalance', () => {
    it('should return correct balance', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      const balance = await service.getBalance(address);
      expect(balance.toString()).toBe('1000000000000000000');
    });
  });

  describe('validateAddress', () => {
    it('should return true for valid Polygon address', () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      expect(service.validateAddress(address)).toBe(true);
    });

    it('should return false for invalid Polygon address', () => {
      const address = 'invalid-address';
      expect(service.validateAddress(address)).toBe(false);
    });
  });

  describe('createToken', () => {
    it('should create token successfully', async () => {
      const params = {
        name: 'Test Token',
        symbol: 'TEST',
        decimals: 18,
        totalSupply: '1000000000000000000000',
        owner: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      };

      const tokenAddress = await service.createToken(params);
      expect(tokenAddress).toBe('0x123');
    });
  });

  describe('addLiquidity', () => {
    it('should add liquidity successfully', async () => {
      const params = {
        tokenAddress: '0x123',
        amount: '1000000000000000000',
        deadline: Math.floor(Date.now() / 1000) + 3600,
      };

      const success = await service.addLiquidity(params);
      expect(success).toBe(true);
    });
  });

  describe('estimateFees', () => {
    it('should estimate transaction fees correctly', async () => {
      const params = {
        to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        value: '1000000000000000000',
      };

      const fees = await service.estimateFees(params);
      expect(fees.toString()).toBe('21000');
    });
  });
});
