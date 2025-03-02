import { vi } from 'vitest';
import { PublicKey, Keypair } from '@solana/web3.js';

/**
 * Mock pour la connexion Solana
 * Simule les méthodes de la classe Connection de @solana/web3.js
 */
export const mockSolanaConnection = {
    getBalance: vi.fn().mockResolvedValue(10000000000), // 10 SOL en lamports
    getVersion: vi.fn().mockResolvedValue({ 'solana-core': '1.14.0' }),
    getLatestBlockhash: vi.fn().mockResolvedValue({
        blockhash: '5n7pbXHbJaGkh3hJLKXCS4ht3JqJnWoSJfS7cXW3KJeJ',
        lastValidBlockHeight: 150000000
    }),
    getSlot: vi.fn().mockResolvedValue(123456789),
    getMinimumBalanceForRentExemption: vi.fn().mockResolvedValue(2039280),
    getSignatureStatus: vi.fn().mockImplementation((signature) => {
        if (signature === 'validSignature') {
            return Promise.resolve({
                value: {
                    slot: 123456789,
                    confirmations: 10,
                    confirmationStatus: 'confirmed',
                }
            });
        }
        return Promise.resolve({ value: null });
    }),
    getSignaturesForAddress: vi.fn().mockResolvedValue([
        { signature: 'validSignature', slot: 123456789 }
    ]),
    simulateTransaction: vi.fn().mockResolvedValue({
        value: { unitsConsumed: 200000 }
    }),
};

/**
 * Mock pour le wallet Solana
 * Simule un wallet Solana avec une paire de clés
 */
export const mockSolanaWallet = {
    payer: Keypair.generate(),
    publicKey: new PublicKey('5n7pbXHbJaGkh3hJLKXCS4ht3JqJnWoSJfS7cXW3KJeJ'),
};

/**
 * Mock pour les fonctions SPL Token
 */
// Générer des clés publiques valides pour les tests
const tokenKeyPair = Keypair.generate();
const accountKeyPair = Keypair.generate();
const ownerKeyPair = Keypair.generate();

const TOKEN_ADDRESS = tokenKeyPair.publicKey.toString();
const TOKEN_ACCOUNT = accountKeyPair.publicKey.toString();
const OWNER_ADDRESS = ownerKeyPair.publicKey.toString();

export const mockSplToken = {
    createMint: vi.fn().mockResolvedValue(new PublicKey(TOKEN_ADDRESS)),
    getOrCreateAssociatedTokenAccount: vi.fn().mockResolvedValue({
        address: new PublicKey(TOKEN_ACCOUNT),
        mint: new PublicKey(TOKEN_ADDRESS),
        owner: new PublicKey(OWNER_ADDRESS),
    }),
    mintTo: vi.fn().mockResolvedValue('mintToSignature'),
    getMint: vi.fn().mockResolvedValue({
        address: new PublicKey(TOKEN_ADDRESS),
        mintAuthority: new PublicKey(OWNER_ADDRESS),
        freezeAuthority: new PublicKey(OWNER_ADDRESS),
        decimals: 9,
        isInitialized: true,
        supply: 1000000000000, // 1000 tokens avec 9 décimales
    }),
};

/**
 * Configuration d'ensemble pour les tests unitaires Solana
 * Retourne les mocks pour la connexion et le wallet
 */
export const setupSolanaMocks = () => {
    return {
        connection: mockSolanaConnection,
        wallet: mockSolanaWallet,
    };
};
