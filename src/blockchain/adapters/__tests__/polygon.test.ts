import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PolygonBlockchainService, PolygonPaymentService, PolygonTokenService } from '../polygon';
import { mockPublicClient, mockWalletClient, setupViemMocks } from '../../../tests/mocks/blockchain';

// Mock du module viem
vi.mock('viem', async () => {
  const actual = await vi.importActual('viem');
  return {
    ...actual,
    createPublicClient: vi.fn().mockImplementation(() => mockPublicClient),
    createWalletClient: vi.fn().mockImplementation(() => mockWalletClient),
    parseEther: vi.fn().mockImplementation((amount) => BigInt(amount) * 10n ** 18n),
  };
});

// Mock du provider factory
vi.mock('../../providers/index', () => ({
  createEvmProvider: vi.fn().mockImplementation(() => ({
    publicClient: mockPublicClient,
    walletClient: mockWalletClient,
  })),
}));

describe('PolygonBlockchainService', () => {
  let service: PolygonBlockchainService;

  beforeEach(() => {
    service = new PolygonBlockchainService({});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should get balance correctly', async () => {
    const balance = await service.getBalance('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
    expect(mockPublicClient.getBalance).toHaveBeenCalledWith({
      address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    });
    expect(balance).toBe(10n * 10n ** 18n);
  });

  it('should get network id correctly', async () => {
    const networkId = await service.getNetworkId();
    expect(mockPublicClient.getChainId).toHaveBeenCalled();
    expect(networkId).toBe(1);
  });

  it('should check connection correctly', async () => {
    const connected = await service.isConnected();
    expect(mockPublicClient.getChainId).toHaveBeenCalled();
    expect(connected).toBe(true);
  });

  it('should estimate gas correctly', async () => {
    const transaction = { to: '0x123', value: 1000n };
    const gas = await service.estimateGas(transaction);
    expect(mockPublicClient.estimateGas).toHaveBeenCalledWith(transaction);
    expect(gas).toBe(21000n);
  });

  it('should get gas price correctly', async () => {
    const gasPrice = await service.getGasPrice();
    expect(mockPublicClient.getGasPrice).toHaveBeenCalled();
    expect(gasPrice).toBe(2000000000n);
  });

  it('should get gas price estimates correctly', async () => {
    // Mock getGasPrice pour ce test spécifique
    vi.spyOn(service, 'getGasPrice').mockResolvedValue(2000000000n);
    
    const estimates = await service.getGasPriceEstimate();
    expect(service.getGasPrice).toHaveBeenCalled();
    expect(estimates).toEqual({
      safeLow: 1600000000n,
      standard: 2000000000n,
      fast: 2400000000n,
      fastest: 3000000000n
    });
  });
});

describe('PolygonPaymentService', () => {
  let service: PolygonPaymentService;

  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    // Date.now() pour les tests prédictibles
    vi.setSystemTime(new Date('2025-01-01'));
    
    service = new PolygonPaymentService({});
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('should create payment session with correct id format', async () => {
    // Mock Math.random pour prédictibilité
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
    
    const sessionId = await service.createPaymentSession(1000000000000000000n, 'MATIC');
    expect(sessionId).toMatch(/^matic-\d+-\d+$/);
    expect(sessionId).toContain('matic-1704067200000-500');
    
    randomSpy.mockRestore();
  });

  it('should verify payment correctly for valid transaction', async () => {
    const result = await service.verifyPayment('0xvalidtransactionhash');
    expect(mockPublicClient.getTransaction).toHaveBeenCalledWith({
      hash: '0xvalidtransactionhash',
    });
    expect(result).toBe(true);
  });

  it('should verify payment correctly for invalid transaction', async () => {
    const result = await service.verifyPayment('0xinvalidtransactionhash');
    expect(mockPublicClient.getTransaction).toHaveBeenCalledWith({
      hash: '0xinvalidtransactionhash',
    });
    expect(result).toBe(false);
  });

  it('should calculate fees based on gas price', async () => {
    // Mock pour getGasPriceEstimate
    const mockBlockchainService = {
      getGasPriceEstimate: vi.fn().mockResolvedValue({
        safeLow: 1600000000n,
        standard: 2000000000n,
        fast: 2400000000n,
        fastest: 3000000000n
      })
    };
    
    // @ts-ignore - Remplacer le service blockchain par notre mock
    service.blockchainService = mockBlockchainService;
    
    const fees = await service.calculateFees(1000000000000000000n);
    expect(mockBlockchainService.getGasPriceEstimate).toHaveBeenCalled();
    // 21000 (gasLimit) * 2000000000 (gasPrice) = 42000000000000
    expect(fees).toBe(42000000000000n);
  });
});

describe('PolygonTokenService', () => {
  let service: PolygonTokenService;

  beforeEach(() => {
    service = new PolygonTokenService({});
    // @ts-ignore - Définir tokenFactoryAbi pour les tests
    service.tokenFactoryAbi = [];
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should validate token config correctly', () => {
    const validConfig = {
      name: 'Test Token',
      symbol: 'TEST',
      decimals: 18,
      initialSupply: 1000000
    };
    
    const result = service.validateTokenConfig(validConfig);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should invalidate token config with empty name', () => {
    const invalidConfig = {
      name: '',
      symbol: 'TEST',
      decimals: 18,
      initialSupply: 1000000
    };
    
    const result = service.validateTokenConfig(invalidConfig);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Token name must be between 1 and 50 characters');
  });

  it('should invalidate token config with empty symbol', () => {
    const invalidConfig = {
      name: 'Test Token',
      symbol: '',
      decimals: 18,
      initialSupply: 1000000
    };
    
    const result = service.validateTokenConfig(invalidConfig);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Token symbol must be between 1 and 10 characters');
  });

  it('should deploy token correctly', async () => {
    // Mock getAddresses pour le test
    mockWalletClient.getAddresses = vi.fn().mockResolvedValue(['0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266']);
    
    const tokenConfig = {
      name: 'Test Token',
      symbol: 'TEST',
      decimals: 18,
      initialSupply: 1000000
    };
    
    const result = await service.deployToken(tokenConfig);
    expect(mockWalletClient.getAddresses).toHaveBeenCalled();
    expect(mockWalletClient.deployContract).toHaveBeenCalled();
    expect(result.transactionHash).toBe('0xcontractdeploymenthash');
  });
});
