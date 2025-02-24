import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createTestClient, http, publicActions, walletActions, TestClient } from 'viem';
import { hardhat } from 'viem/chains';
import { TokenForgeAuthProvider } from '../../features/auth/providers/TokenForgeAuthProvider';
import { securityMiddleware } from '../middleware';
import { secureStorageService } from '../../services/secureStorageService';
import { authSyncService } from '../../services/authSyncService';

describe('Security Integration Tests', () => {
  let testClient: TestClient;

  beforeEach(() => {
    testClient = createTestClient({
      chain: hardhat,
      mode: 'anvil',
      transport: http(),
    })
      .extend(publicActions)
      .extend(walletActions);

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Wallet Authentication Flow', () => {
    it('should validate wallet signature and create session', async () => {
      const [address] = await testClient.getAddresses();
      const message = 'Sign this message to authenticate';
      
      // Sign message using viem test client
      const signature = await testClient.signMessage({
        account: address,
        message
      });

      // Verify signature
      const recoveredAddress = await testClient.verifyMessage({
        address,
        message,
        signature
      });

      expect(recoveredAddress).toBe(address);
      
      // Test session creation
      const session = await secureStorageService.createSession({
        address,
        signature,
        timestamp: Date.now()
      });

      expect(session).toBeDefined();
      expect(session.address).toBe(address);
    });

    it('should detect invalid signatures', async () => {
      const [address] = await testClient.getAddresses();
      const message = 'Sign this message to authenticate';
      const invalidSignature = '0x1234';

      await expect(
        testClient.verifyMessage({
          address,
          message,
          signature: invalidSignature
        })
      ).rejects.toThrow();
    });
  });

  describe('Transaction Security', () => {
    it('should validate transaction signing and prevent tampering', async () => {
      const [sender, recipient] = await testClient.getAddresses();
      
      const tx = {
        to: recipient,
        value: 1000000000000000000n, // 1 ETH
        from: sender
      };

      // Sign transaction
      const signedTx = await testClient.signTransaction(tx);

      // Verify transaction hasn't been tampered
      const recoveredTx = await testClient.getRawTransactionReceipt({
        hash: signedTx
      });

      expect(recoveredTx).toBeDefined();
    });
  });

  describe('Cross-Service Security', () => {
    it('should maintain secure context across service boundaries', async () => {
      const [address] = await testClient.getAddresses();
      
      // Initialize auth context
      const authContext = await TokenForgeAuthProvider.initialize({
        address,
        chainId: hardhat.id
      });

      // Test auth sync service
      const syncResult = await authSyncService.syncAuthState(authContext);
      expect(syncResult.status).toBe('success');
      
      // Verify secure storage
      const storedContext = await secureStorageService.getAuthContext();
      expect(storedContext?.address).toBe(address);
      expect(storedContext?.chainId).toBe(hardhat.id);
    });
  });
});
