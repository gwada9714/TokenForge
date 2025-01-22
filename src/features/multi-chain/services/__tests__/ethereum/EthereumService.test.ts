import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EthereumService } from '../../ethereum/EthereumService';
import { BaseProviderService } from '../../BaseProviderService';
import { providers, utils, BigNumber } from 'ethers';

// Mock des dépendances
vi.mock('../../BaseProviderService');
vi.mock('ethers');

describe('EthereumService', () => {
  let service: EthereumService;
  let mockProvider: providers.JsonRpcProvider;

  beforeEach(() => {
    // Reset des mocks
    vi.clearAllMocks();

    // Configuration du mock provider
    mockProvider = {
      getBalance: vi.fn(),
      getSigner: vi.fn(),
      getGasPrice: vi.fn(),
      getNetwork: vi.fn(),
    } as unknown as providers.JsonRpcProvider;

    // Mock de BaseProviderService.getProvider
    vi.mocked(BaseProviderService.getProvider).mockResolvedValue(mockProvider);

    // Création d'une nouvelle instance du service
    service = new EthereumService();
  });

  describe('getNativeTokenPrice', () => {
    beforeEach(() => {
      global.fetch = vi.fn();
    });

    it('should return ETH price when API call is successful', async () => {
      const mockPrice = 2000;
      vi.mocked(global.fetch).mockResolvedValueOnce({
        json: () => Promise.resolve({ ethereum: { usd: mockPrice } }),
      } as Response);

      const price = await service.getNativeTokenPrice();
      expect(price).toBe(mockPrice);
    });

    it('should return 0 when API call fails', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('API Error'));

      const price = await service.getNativeTokenPrice();
      expect(price).toBe(0);
    });
  });

  describe('getBalance', () => {
    it('should return correct balance', async () => {
      const mockBalance = BigNumber.from('1000000000000000000'); // 1 ETH
      const address = '0x1234567890123456789012345678901234567890';

      vi.mocked(mockProvider.getBalance).mockResolvedValueOnce(mockBalance);

      const balance = await service.getBalance(address);
      expect(balance).toEqual(mockBalance);
      expect(mockProvider.getBalance).toHaveBeenCalledWith(address);
    });

    it('should throw error when provider fails', async () => {
      const address = '0x1234567890123456789012345678901234567890';
      vi.mocked(mockProvider.getBalance).mockRejectedValueOnce(new Error('Provider Error'));

      await expect(service.getBalance(address)).rejects.toThrow();
    });
  });

  describe('validateAddress', () => {
    it('should return true for valid ETH address', () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      expect(service.validateAddress(validAddress)).toBe(true);
    });

    it('should return false for invalid ETH address', () => {
      const invalidAddress = '0xinvalid';
      expect(service.validateAddress(invalidAddress)).toBe(false);
    });
  });

  describe('createToken', () => {
    const mockParams = {
      name: 'Test Token',
      symbol: 'TEST',
      decimals: 18,
      totalSupply: '1000000',
      owner: '0x1234567890123456789012345678901234567890',
    };

    it('should create ERC20 token successfully', async () => {
      const mockAddress = '0x9876543210987654321098765432109876543210';
      const mockContract = {
        address: mockAddress,
        deployed: vi.fn().mockResolvedValueOnce(undefined),
      };

      const mockContractFactory = {
        deploy: vi.fn().mockResolvedValueOnce(mockContract),
      };

      vi.mocked(utils.parseUnits).mockReturnValueOnce(
        BigNumber.from('1000000000000000000000000')
      );

      vi.mocked(mockProvider.getSigner).mockReturnValueOnce({
        getAddress: vi.fn().mockResolvedValueOnce(mockParams.owner),
        getContractFactory: vi.fn().mockResolvedValueOnce(mockContractFactory),
      } as any);

      const result = await service.createToken(mockParams);
      expect(result).toBe(mockAddress);
    });

    it('should throw error when token creation fails', async () => {
      const mockError = new Error('Contract creation failed');
      const mockContractFactory = {
        deploy: vi.fn().mockRejectedValueOnce(mockError),
      };

      vi.mocked(mockProvider.getSigner).mockReturnValueOnce({
        getAddress: vi.fn().mockRejectedValueOnce(mockError),
        getContractFactory: vi.fn().mockResolvedValueOnce(mockContractFactory),
      } as any);

      await expect(service.createToken(mockParams)).rejects.toThrow();
    });
  });

  describe('addLiquidity', () => {
    const mockParams = {
      tokenAddress: '0x1234567890123456789012345678901234567890',
      amount: '1.0',
      deadline: Math.floor(Date.now() / 1000) + 3600,
    };

    it('should add liquidity successfully', async () => {
      const mockTx = {
        wait: vi.fn().mockResolvedValueOnce(undefined),
      };

      const mockRouterContract = {
        addLiquidityETH: vi.fn().mockResolvedValueOnce(mockTx),
      };

      vi.mocked(mockProvider.getSigner).mockReturnValueOnce({
        getAddress: vi.fn().mockResolvedValueOnce(mockParams.tokenAddress),
        getContract: vi.fn().mockResolvedValueOnce(mockRouterContract),
      } as any);

      vi.mocked(utils.parseEther).mockReturnValueOnce(
        BigNumber.from('1000000000000000000')
      );

      const result = await service.addLiquidity(mockParams);
      expect(result).toBe(true);
    });

    it('should throw error when adding liquidity fails', async () => {
      vi.mocked(mockProvider.getSigner).mockReturnValueOnce({
        getAddress: vi.fn().mockRejectedValueOnce(new Error('Signer error')),
      } as any);

      await expect(service.addLiquidity(mockParams)).rejects.toThrow();
    });
  });

  describe('stake', () => {
    const mockParams = {
      tokenAddress: '0x1234567890123456789012345678901234567890',
      amount: '1.0',
      duration: 30,
    };

    it('should stake tokens successfully', async () => {
      const mockTx = {
        wait: vi.fn().mockResolvedValueOnce(undefined),
      };

      const mockStakingContract = {
        stake: vi.fn().mockResolvedValueOnce(mockTx),
      };

      vi.mocked(mockProvider.getSigner).mockReturnValueOnce({
        getAddress: vi.fn().mockResolvedValueOnce('0x1234...'),
        getContract: vi.fn().mockResolvedValueOnce(mockStakingContract),
      } as any);

      vi.mocked(utils.parseEther).mockReturnValueOnce(
        BigNumber.from('1000000000000000000')
      );

      const result = await service.stake(mockParams);
      expect(result).toBe(true);
    });

    it('should throw error when staking fails', async () => {
      vi.mocked(mockProvider.getSigner).mockReturnValueOnce({
        getAddress: vi.fn().mockRejectedValueOnce(new Error('Signer error')),
      } as any);

      await expect(service.stake(mockParams)).rejects.toThrow();
    });
  });

  describe('unstake', () => {
    const mockParams = {
      tokenAddress: '0x1234567890123456789012345678901234567890',
    };

    it('should unstake tokens successfully', async () => {
      const mockTx = {
        wait: vi.fn().mockResolvedValueOnce(undefined),
      };

      const mockStakingContract = {
        unstake: vi.fn().mockResolvedValueOnce(mockTx),
      };

      vi.mocked(mockProvider.getSigner).mockReturnValueOnce({
        getAddress: vi.fn().mockResolvedValueOnce('0x1234...'),
        getContract: vi.fn().mockResolvedValueOnce(mockStakingContract),
      } as any);

      const result = await service.unstake(mockParams);
      expect(result).toBe(true);
    });

    it('should throw error when unstaking fails', async () => {
      vi.mocked(mockProvider.getSigner).mockReturnValueOnce({
        getAddress: vi.fn().mockRejectedValueOnce(new Error('Signer error')),
      } as any);

      await expect(service.unstake(mockParams)).rejects.toThrow();
    });
  });
});
