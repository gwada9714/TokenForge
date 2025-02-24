import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SolanaService } from '../../solana/SolanaService';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { getMint, createMint, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import { Address } from 'viem';

// Mock des dépendances
vi.mock('@solana/web3.js', () => ({
  Connection: vi.fn(),
  PublicKey: vi.fn((address) => ({
    toString: () => address,
    toBase58: () => address,
  })),
  Keypair: {
    generate: vi.fn()
  },
  SystemProgram: {
    createAccount: vi.fn()
  }
}));

vi.mock('@solana/spl-token', () => ({
  getMint: vi.fn(),
  createMint: vi.fn(),
  getOrCreateAssociatedTokenAccount: vi.fn(),
  mintTo: vi.fn(),
  TOKEN_PROGRAM_ID: 'token-program',
  MINT_SIZE: 82
}));

describe('SolanaService', () => {
  let service: SolanaService;
  let mockConnection: Connection;
  const testAddress = '0xGsbwXfJraMomNxBcpR5WTNdtx1BgwYhQdThwcWvJuf8p' as Address;
  const testPublicKey = { toBase58: () => testAddress.slice(2) } as PublicKey;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock de Keypair
    vi.mocked(Keypair.generate).mockReturnValue({
      publicKey: testPublicKey
    } as any);

    // Configuration du mock connection
    mockConnection = {
      getBalance: vi.fn(),
      getMinimumBalanceForRentExemption: vi.fn().mockResolvedValue(1000000),
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
      vi.mocked(mockConnection.getBalance).mockResolvedValueOnce(mockBalance);

      const balance = await service.getBalance(testAddress);
      expect(balance).toBe(BigInt(mockBalance));
      expect(mockConnection.getBalance).toHaveBeenCalledWith(expect.any(PublicKey));
    });

    it('should throw error when connection fails', async () => {
      vi.mocked(mockConnection.getBalance).mockRejectedValueOnce(new Error('Connection Error'));

      await expect(service.getBalance(testAddress)).rejects.toThrow('Failed to get balance');
    });
  });

  describe('validateAddress', () => {
    it('should return true for valid Solana address', () => {
      expect(service.validateAddress(testAddress)).toBe(true);
    });

    it('should return false for invalid Solana address', () => {
      vi.mocked(PublicKey).mockImplementationOnce(() => {
        throw new Error('Invalid address');
      });
      expect(service.validateAddress('invalid-address')).toBe(false);
    });
  });

  describe('createToken', () => {
    const mockParams = {
      name: 'Test Token',
      symbol: 'TEST',
      decimals: 9,
      totalSupply: '1000000',
      owner: testAddress,
    };

    it('should create SPL token successfully', async () => {
      // Mock des fonctions SPL Token
      vi.mocked(createMint).mockResolvedValueOnce(testPublicKey);
      vi.mocked(getOrCreateAssociatedTokenAccount).mockResolvedValueOnce({
        address: testPublicKey,
      } as any);
      vi.mocked(mintTo).mockResolvedValueOnce('tx-signature');

      const result = await service.createToken(mockParams);
      expect(result).toBe(testAddress);
      expect(createMint).toHaveBeenCalled();
      expect(getOrCreateAssociatedTokenAccount).toHaveBeenCalled();
      expect(mintTo).toHaveBeenCalled();
    });

    it('should throw error when token creation fails', async () => {
      vi.mocked(createMint).mockRejectedValueOnce(new Error('Token creation failed'));

      await expect(service.createToken(mockParams)).rejects.toThrow('Failed to create token on Solana');
    });
  });

  describe('getTokenInfo', () => {
    it('should return token info', async () => {
      const mockMintInfo = {
        decimals: 9,
        supply: BigInt('1000000000'),
      };

      vi.mocked(getMint).mockResolvedValueOnce(mockMintInfo as any);

      const tokenInfo = await service.getTokenInfo(testAddress);
      expect(tokenInfo).toEqual({
        address: testAddress,
        name: '',
        symbol: '',
        decimals: mockMintInfo.decimals,
        totalSupply: mockMintInfo.supply,
      });
    });

    it('should throw error when getting token info fails', async () => {
      vi.mocked(getMint).mockRejectedValueOnce(new Error('Failed to get mint info'));

      await expect(service.getTokenInfo(testAddress)).rejects.toThrow('Failed to get token info');
    });
  });

  describe('addLiquidity', () => {
    it('should throw not implemented error', async () => {
      await expect(service.addLiquidity({
        tokenAddress: testAddress,
        amount: BigInt('1000000000'),
        deadline: Math.floor(Date.now() / 1000) + 3600,
      })).rejects.toThrow('Liquidity provision not implemented for Solana yet');
    });
  });

  describe('removeLiquidity', () => {
    it('should throw not implemented error', async () => {
      await expect(service.removeLiquidity({
        tokenAddress: testAddress,
        amount: BigInt('1000000000'),
        deadline: Math.floor(Date.now() / 1000) + 3600,
      })).rejects.toThrow('Liquidity removal not implemented for Solana yet');
    });
  });

  describe('stake', () => {
    it('should throw not implemented error', async () => {
      await expect(service.stake({
        tokenAddress: testAddress,
        amount: BigInt('1000000000'),
        duration: 30,
      })).rejects.toThrow('Staking not implemented for Solana yet');
    });
  });

  describe('unstake', () => {
    it('should throw not implemented error', async () => {
      await expect(service.unstake({
        tokenAddress: testAddress,
        amount: BigInt('1000000000'),
      })).rejects.toThrow('Unstaking not implemented for Solana yet');
    });
  });

  describe('estimateFees', () => {
    it('should return base fee estimation', async () => {
      const fees = await service.estimateFees({
        to: testAddress,
        value: BigInt('1000000000'),
      });
      expect(fees).toBe(BigInt(5000));
    });
  });
});
