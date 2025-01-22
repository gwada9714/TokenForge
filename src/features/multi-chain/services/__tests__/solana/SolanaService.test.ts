import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SolanaService } from '../../solana/SolanaService';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Token } from '@solana/spl-token';

// Mock des dépendances
vi.mock('@solana/web3.js');
vi.mock('@solana/spl-token');

describe('SolanaService', () => {
  let service: SolanaService;
  let mockConnection: Connection;

  beforeEach(() => {
    // Reset des mocks
    vi.clearAllMocks();

    // Configuration du mock connection
    mockConnection = {
      getBalance: vi.fn(),
      getLatestBlockhash: vi.fn(),
      sendTransaction: vi.fn(),
    } as unknown as Connection;

    // Création d'une nouvelle instance du service
    service = new SolanaService();
    // @ts-ignore accès à la propriété privée pour les tests
    service.connection = mockConnection;
  });

  describe('getNativeTokenPrice', () => {
    beforeEach(() => {
      global.fetch = vi.fn();
    });

    it('should return SOL price when API call is successful', async () => {
      const mockPrice = 100;
      vi.mocked(global.fetch).mockResolvedValueOnce({
        json: () => Promise.resolve({ solana: { usd: mockPrice } }),
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
      const mockBalance = 1000000000; // 1 SOL
      const address = 'GsbwXfJraMomNxBcpR5WTNdtx1BgwYhQdThwcWvJuf8p';

      vi.mocked(mockConnection.getBalance).mockResolvedValueOnce(mockBalance);

      const balance = await service.getBalance(address);
      expect(balance.toNumber()).toBe(mockBalance);
      expect(mockConnection.getBalance).toHaveBeenCalledWith(new PublicKey(address));
    });

    it('should throw error when connection fails', async () => {
      const address = 'GsbwXfJraMomNxBcpR5WTNdtx1BgwYhQdThwcWvJuf8p';
      vi.mocked(mockConnection.getBalance).mockRejectedValueOnce(new Error('Connection Error'));

      await expect(service.getBalance(address)).rejects.toThrow();
    });
  });

  describe('validateAddress', () => {
    it('should return true for valid Solana address', () => {
      const validAddress = 'GsbwXfJraMomNxBcpR5WTNdtx1BgwYhQdThwcWvJuf8p';
      expect(service.validateAddress(validAddress)).toBe(true);
    });

    it('should return false for invalid Solana address', () => {
      const invalidAddress = 'invalid-address';
      expect(service.validateAddress(invalidAddress)).toBe(false);
    });
  });

  describe('createToken', () => {
    const mockParams = {
      name: 'Test Token',
      symbol: 'TEST',
      decimals: 9,
      totalSupply: '1000000',
      owner: 'GsbwXfJraMomNxBcpR5WTNdtx1BgwYhQdThwcWvJuf8p',
    };

    it('should create SPL token successfully', async () => {
      const mockMint = new PublicKey('mint-address');
      const mockToken = {
        createMint: vi.fn().mockResolvedValueOnce(mockMint),
        getMint: vi.fn().mockResolvedValueOnce({ address: mockMint }),
      };

      vi.mocked(Token).mockImplementationOnce(() => mockToken as any);

      vi.mocked(mockConnection.getLatestBlockhash).mockResolvedValueOnce({
        blockhash: 'mock-blockhash',
        lastValidBlockHeight: 1000,
      });

      const result = await service.createToken(mockParams);
      expect(result).toBe(mockMint.toString());
    });

    it('should throw error when token creation fails', async () => {
      const mockError = new Error('Token creation failed');
      vi.mocked(Token.createMint).mockRejectedValueOnce(mockError);

      await expect(service.createToken(mockParams)).rejects.toThrow();
    });
  });

  describe('addLiquidity', () => {
    const mockParams = {
      tokenAddress: 'GsbwXfJraMomNxBcpR5WTNdtx1BgwYhQdThwcWvJuf8p',
      amount: '1.0',
      deadline: Math.floor(Date.now() / 1000) + 3600,
    };

    it('should add liquidity successfully', async () => {
      vi.mocked(mockConnection.getLatestBlockhash).mockResolvedValueOnce({
        blockhash: 'mock-blockhash',
        lastValidBlockHeight: 1000,
      });

      vi.mocked(mockConnection.sendTransaction).mockResolvedValueOnce('tx-signature');

      const result = await service.addLiquidity(mockParams);
      expect(result).toBe(true);
    });

    it('should throw error when adding liquidity fails', async () => {
      vi.mocked(mockConnection.sendTransaction).mockRejectedValueOnce(
        new Error('Transaction failed')
      );

      await expect(service.addLiquidity(mockParams)).rejects.toThrow();
    });
  });

  describe('stake', () => {
    const mockParams = {
      tokenAddress: 'GsbwXfJraMomNxBcpR5WTNdtx1BgwYhQdThwcWvJuf8p',
      amount: '1.0',
      duration: 30,
    };

    it('should stake tokens successfully', async () => {
      vi.mocked(mockConnection.getLatestBlockhash).mockResolvedValueOnce({
        blockhash: 'mock-blockhash',
        lastValidBlockHeight: 1000,
      });

      vi.mocked(mockConnection.sendTransaction).mockResolvedValueOnce('tx-signature');

      const result = await service.stake(mockParams);
      expect(result).toBe(true);
    });

    it('should throw error when staking fails', async () => {
      vi.mocked(mockConnection.sendTransaction).mockRejectedValueOnce(
        new Error('Transaction failed')
      );

      await expect(service.stake(mockParams)).rejects.toThrow();
    });
  });

  describe('unstake', () => {
    const mockParams = {
      tokenAddress: 'GsbwXfJraMomNxBcpR5WTNdtx1BgwYhQdThwcWvJuf8p',
      amount: '1.0', // Ajout du paramètre amount requis
    };

    it('should unstake tokens successfully', async () => {
      vi.mocked(mockConnection.getLatestBlockhash).mockResolvedValueOnce({
        blockhash: 'mock-blockhash',
        lastValidBlockHeight: 1000,
      });

      vi.mocked(mockConnection.sendTransaction).mockResolvedValueOnce('tx-signature');

      const result = await service.unstake(mockParams);
      expect(result).toBe(true);
    });

    it('should throw error when unstaking fails', async () => {
      vi.mocked(mockConnection.sendTransaction).mockRejectedValueOnce(
        new Error('Transaction failed')
      );

      await expect(service.unstake(mockParams)).rejects.toThrow();
    });
  });
});
