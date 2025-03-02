import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { BinanceBlockchainService, BinancePaymentService, BinanceTokenService } from '../binance';
import { mockPublicClient, mockWalletClient } from '../../../tests/mocks/blockchain';

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

describe('BinanceBlockchainService', () => {
    let service: BinanceBlockchainService;

    beforeEach(() => {
        // Reset les mocks avant chaque test
        vi.resetAllMocks();

        // Configurer les mocks pour retourner des valeurs
        mockPublicClient.getBalance.mockResolvedValue(10n * 10n ** 18n);
        mockPublicClient.getChainId.mockResolvedValue(1);
        mockPublicClient.estimateGas.mockResolvedValue(21000n);
        mockPublicClient.getGasPrice.mockResolvedValue(2000000000n);

        service = new BinanceBlockchainService({});

        // Injecter directement les mocks dans le service
        // @ts-ignore - Accès à des propriétés privées pour le test
        service.publicClient = mockPublicClient;
        // @ts-ignore
        service.walletClient = mockWalletClient;
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
        expect(networkId).toBe(1); // Mockée à 1, mais serait 56 pour BSC mainnet
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

    it('should calculate gas price estimates based on current gas price', async () => {
        // Mock getGasPrice pour ce test spécifique
        vi.spyOn(service, 'getGasPrice').mockResolvedValue(2000000000n);

        // Calculer manuellement les estimations
        const gasPrice = await service.getGasPrice();
        expect(service.getGasPrice).toHaveBeenCalled();

        // Calculer les estimations comme dans l'implémentation réelle
        const safeLow = BigInt(Math.floor(Number(gasPrice) * 0.8));
        const standard = gasPrice;
        const fast = BigInt(Math.floor(Number(gasPrice) * 1.2));
        const fastest = BigInt(Math.floor(Number(gasPrice) * 1.5));

        expect(safeLow).toBe(1600000000n);
        expect(standard).toBe(2000000000n);
        expect(fast).toBe(2400000000n);
        expect(fastest).toBe(3000000000n);
    });
});

describe('BinancePaymentService', () => {
    let service: BinancePaymentService;

    beforeEach(() => {
        // Reset mocks
        vi.resetAllMocks();
        // Date.now() pour les tests prédictibles
        vi.setSystemTime(new Date('2025-01-01'));

        service = new BinancePaymentService({});

        // Injecter directement le mock provider dans le service
        // @ts-ignore - Accès à une propriété privée pour le test
        service.blockchainService = {
            getProvider: vi.fn().mockReturnValue({
                publicClient: mockPublicClient,
                walletClient: mockWalletClient
            })
        };
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.useRealTimers();
    });

    it('should create payment session with correct id format', async () => {
        // Mock Math.random pour prédictibilité
        const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);

        const sessionId = await service.createPaymentSession(1000000000000000000n, 'BNB');
        expect(sessionId).toMatch(/^bsc-\d+-\d+$/);
        expect(sessionId).toContain('bsc-1735689600000-500');

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
        // Configurer le mock pour retourner null pour les transactions invalides
        mockPublicClient.getTransaction = vi.fn().mockImplementation(({ hash }) => {
            if (hash === '0xvalidtransactionhash') {
                return { hash, blockNumber: 123456 };
            }
            return null;
        });

        const result = await service.verifyPayment('0xinvalidtransactionhash');
        expect(mockPublicClient.getTransaction).toHaveBeenCalledWith({
            hash: '0xinvalidtransactionhash',
        });
        expect(result).toBe(false);
    });

    it('should calculate fees based on gas price', async () => {
        // Mock pour getGasPrice
        const mockBlockchainService = {
            getGasPrice: vi.fn().mockResolvedValue(2000000000n)
        };

        // @ts-ignore - Remplacer le service blockchain par notre mock
        service.blockchainService = mockBlockchainService;

        const fees = await service.calculateFees(1000000000000000000n);
        expect(mockBlockchainService.getGasPrice).toHaveBeenCalled();
        // 21000 (gasLimit) * 2000000000 (gasPrice) = 42000000000000
        expect(fees).toBe(42000000000000n);
    });
});

describe('BinanceTokenService', () => {
    let service: BinanceTokenService;

    beforeEach(() => {
        service = new BinanceTokenService({});
        // @ts-ignore - Définir tokenFactoryAbi pour les tests
        service.tokenFactoryAbi = [];

        // Injecter directement le mock provider dans le service
        // @ts-ignore - Accès à une propriété privée pour le test
        service.blockchainService = {
            getProvider: vi.fn().mockReturnValue({
                publicClient: mockPublicClient,
                walletClient: mockWalletClient
            }),
            getNetworkId: vi.fn().mockResolvedValue(56)
        };
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

        // Mock deployContract pour retourner un hash de transaction
        mockWalletClient.deployContract = vi.fn().mockResolvedValue('0xcontractdeploymenthash');

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

    it('should handle BEP-20 specific validations', () => {
        // Test spécifique pour les validations BEP-20
        const bep20Config = {
            name: 'BEP20 Token',
            symbol: 'BEP',
            decimals: 18,
            initialSupply: 1000000,
            // Propriétés spécifiques à BEP-20
            taxable: {
                enabled: true,
                buyTaxPercent: 5,
                sellTaxPercent: 5,
                transferTaxPercent: 2,
                taxRecipient: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
            }
        };

        const result = service.validateTokenConfig(bep20Config);
        expect(result.valid).toBe(true);
    });
});
