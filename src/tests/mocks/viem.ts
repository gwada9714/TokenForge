import { vi } from 'vitest';

// Mock des fonctions de viem
export const mockPublicClient = {
    getBalance: vi.fn().mockResolvedValue(10n * 10n ** 18n),
    getChainId: vi.fn().mockResolvedValue(1),
    estimateGas: vi.fn().mockResolvedValue(21000n),
    getGasPrice: vi.fn().mockResolvedValue(2000000000n),
    getTransaction: vi.fn().mockImplementation((params) => {
        if (params.hash === '0xvalidtransactionhash') {
            return Promise.resolve({
                hash: '0xvalidtransactionhash',
                to: '0x1234567890123456789012345678901234567890',
                from: '0x0987654321098765432109876543210987654321',
                value: 1000000000000000000n,
                status: 'success'
            });
        }
        return Promise.resolve(null);
    }),
    getBlock: vi.fn().mockResolvedValue({
        hash: '0xblock',
        number: 1000n,
        timestamp: 1625097600n,
        transactions: []
    }),
    waitForTransactionReceipt: vi.fn().mockResolvedValue({
        status: 'success',
        blockNumber: 1000n
    }),
    readContract: vi.fn().mockResolvedValue(true),
    getBytecode: vi.fn().mockResolvedValue('0x1234')
};

export const mockWalletClient = {
    getAddresses: vi.fn().mockResolvedValue(['0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266']),
    deployContract: vi.fn().mockResolvedValue({
        hash: '0xcontractdeploymenthash'
    }),
    writeContract: vi.fn().mockResolvedValue('0xtransactionhash'),
    sendTransaction: vi.fn().mockResolvedValue('0xtransactionhash')
};

// Mock des fonctions de hachage et de conversion
export const keccak256 = vi.fn().mockReturnValue('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
export const toBytes = vi.fn().mockReturnValue(new Uint8Array([1, 2, 3, 4]));
export const parseEther = vi.fn().mockImplementation((amount) => BigInt(amount) * 10n ** 18n);
export const formatEther = vi.fn().mockImplementation((amount) => amount.toString());
export const encodeAbiParameters = vi.fn().mockReturnValue('0x1234');
export const decodeAbiParameters = vi.fn().mockReturnValue(['0x1234']);
export const encodeFunctionData = vi.fn().mockReturnValue('0x1234');
export const decodeFunctionData = vi.fn().mockReturnValue({ args: ['0x1234'] });

// Mock des fonctions de création de client
export const createPublicClient = vi.fn().mockReturnValue(mockPublicClient);
export const createWalletClient = vi.fn().mockReturnValue(mockWalletClient);
