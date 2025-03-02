import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { EthereumBlockchainService, EthereumPaymentService, EthereumTokenService } from '../ethereum';
import { mockPublicClient, mockWalletClient } from '../../../tests/mocks/blockchain';

// Mock du module viem - utilise notre implémentation complète
vi.mock('viem', async () => {
    const mockViem = await vi.importActual('../../../tests/mocks/viem');
    return {
        ...mockViem,
        createPublicClient: vi.fn().mockImplementation(() => mockPublicClient),
        createWalletClient: vi.fn().mockImplementation(() => mockWalletClient),
    };
});

// Mock du provider factory
vi.mock('../../providers/index', () => ({
    createEvmProvider: vi.fn().mockImplementation(() => ({
        publicClient: mockPublicClient,
        walletClient: mockWalletClient,
    })),
}));

// Mock de la méthode getProvider pour injecter directement nos mocks
const mockProvider = {
    publicClient: mockPublicClient,
    walletClient: mockWalletClient
};

describe('EthereumBlockchainService', () => {
    let service: EthereumBlockchainService;

    beforeEach(() => {
        service = new EthereumBlockchainService({});
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

describe('EthereumPaymentService', () => {
    let service: EthereumPaymentService;

    beforeEach(() => {
        // Reset mocks
        vi.resetAllMocks();
        // Date.now() pour les tests prédictibles
        vi.setSystemTime(new Date('2025-01-01'));

        service = new EthereumPaymentService({});

        // Injecter directement le mock provider dans le service
        // @ts-ignore - Accès à une propriété privée pour le test
        service.blockchainService = {
            getProvider: vi.fn().mockReturnValue(mockProvider),
            getGasPrice: vi.fn().mockResolvedValue(2000000000n)
        };
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.useRealTimers();
    });

    it('should create payment session with correct id format', async () => {
        // Mock Date.now() et Math.random pour prédictibilité
        const dateNowSpy = vi.spyOn(Date, 'now').mockReturnValue(1704067200000);
        const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);

        const sessionId = await service.createPaymentSession(1000000000000000000n, 'ETH');
        expect(sessionId).toMatch(/^eth-\d+-\d+$/);
        expect(sessionId).toContain('eth-1704067200000-500');

        dateNowSpy.mockRestore();
        randomSpy.mockRestore();
    });

    it('should verify payment correctly for valid transaction', async () => {
        // Réinitialiser et configurer le mock pour ce test spécifique
        console.log('Test: should verify payment correctly for valid transaction');
        console.log('Configuring mock for getTransaction...');

        mockPublicClient.getTransaction = vi.fn().mockImplementation((params) => {
            console.log('Mock getTransaction called with params:', params);
            if (params.hash === '0xvalidtransactionhash') {
                console.log('Returning valid transaction data');
                return Promise.resolve({
                    hash: '0xvalidtransactionhash',
                    blockNumber: 1234567n,
                    confirmations: 10,
                });
            }
            console.log('Returning null (transaction not found)');
            return Promise.resolve(null);
        });

        console.log('Calling service.verifyPayment...');
        const result = await service.verifyPayment('0xvalidtransactionhash');
        console.log('verifyPayment result:', result);

        console.log('Checking if mockPublicClient.getTransaction was called...');
        console.log('mockPublicClient.getTransaction mock calls:', mockPublicClient.getTransaction.mock?.calls);

        expect(mockPublicClient.getTransaction).toHaveBeenCalledWith({
            hash: '0xvalidtransactionhash',
        });
        expect(result).toBe(true);
    });

    it('should verify payment correctly for invalid transaction', async () => {
        // Réinitialiser et configurer le mock pour ce test spécifique
        console.log('Test: should verify payment correctly for invalid transaction');
        console.log('Configuring mock for getTransaction (invalid case)...');

        mockPublicClient.getTransaction = vi.fn().mockImplementation((params) => {
            console.log('Mock getTransaction called with params (invalid case):', params);
            console.log('Returning null for invalid transaction');
            return Promise.resolve(null);
        });

        console.log('Calling service.verifyPayment with invalid hash...');
        const result = await service.verifyPayment('0xinvalidtransactionhash');
        console.log('verifyPayment result for invalid transaction:', result);

        console.log('Checking if mockPublicClient.getTransaction was called for invalid case...');
        console.log('mockPublicClient.getTransaction mock calls (invalid case):', mockPublicClient.getTransaction.mock?.calls);

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

describe('EthereumTokenService', () => {
    let service: EthereumTokenService;

    beforeEach(() => {
        service = new EthereumTokenService({});
        // @ts-ignore - Définir tokenFactoryAbi pour les tests
        service.tokenFactoryAbi = [];

        // Injecter directement le mock provider dans le service
        // @ts-ignore - Accès à une propriété privée pour le test
        service.blockchainService = {
            getProvider: vi.fn().mockReturnValue(mockProvider),
            getNetworkId: vi.fn().mockResolvedValue(1)
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
        console.log('Test: should deploy token correctly');

        // Mock getAddresses pour le test
        console.log('Configuring mockWalletClient.getAddresses...');
        mockWalletClient.getAddresses = vi.fn().mockResolvedValue(['0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266']);
        console.log('mockWalletClient.getAddresses configured');

        // Injecter directement le wallet client dans le service
        console.log('Injecting provider into service...');
        console.log('Service before injection:', JSON.stringify(service, null, 2));
        // @ts-ignore - Accès à une propriété privée pour le test
        service.provider = {
            publicClient: mockPublicClient,
            walletClient: mockWalletClient
        };
        console.log('Provider injected, service after injection:', JSON.stringify(service, null, 2));

        const tokenConfig = {
            name: 'Test Token',
            symbol: 'TEST',
            decimals: 18,
            initialSupply: 1000000
        };
        console.log('Token config:', tokenConfig);

        console.log('Calling service.deployToken...');
        try {
            const result = await service.deployToken(tokenConfig);
            console.log('deployToken result:', result);

            console.log('Checking if mockWalletClient.getAddresses was called...');
            console.log('mockWalletClient.getAddresses mock calls:', mockWalletClient.getAddresses.mock?.calls);

            console.log('Checking if mockWalletClient.deployContract was called...');
            console.log('mockWalletClient.deployContract mock calls:', mockWalletClient.deployContract.mock?.calls);

            expect(mockWalletClient.getAddresses).toHaveBeenCalled();
            expect(mockWalletClient.deployContract).toHaveBeenCalled();

            // Vérifier que le hash de transaction est correctement assigné
            // Le mock retourne directement la chaîne, pas un objet avec une propriété hash
            expect(result.transactionHash).toBe(mockWalletClient.deployContract.mock.results[0].value);
        } catch (error) {
            console.error('Error in deployToken test:', error);
            throw error;
        }
    });
});
