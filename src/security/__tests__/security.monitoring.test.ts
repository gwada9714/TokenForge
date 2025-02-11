import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createTestClient, http, publicActions, walletActions, parseEther, type Hash } from 'viem';
import { hardhat } from 'viem/chains';
import { securityMonitoring } from '../security.monitoring';
import { chainPolicies } from '../security.policies';

describe('Security Monitoring Tests', () => {
  const testClient = createTestClient({
    chain: hardhat,
    mode: 'anvil',
    transport: http(),
  })
    .extend(publicActions)
    .extend(walletActions);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Transaction Monitoring', () => {
    it('should detect high gas usage transactions', async () => {
      const [sender, recipient] = await testClient.getAddresses();
      
      // Create a transaction that will use a lot of gas
      const tx = {
        to: recipient,
        value: parseEther('1'),
        from: sender,
        gas: chainPolicies.transactionPolicies.maxGasLimit + 1000n
      };

      const hash = await testClient.sendTransaction(tx);
      
      // Monitor the transaction
      const receipt = await securityMonitoring.monitorTransaction(hash as Hash);
      
      // Get recent alerts
      const alerts = securityMonitoring.getRecentAlerts();
      
      // Verify that a high gas alert was created
      expect(alerts.some(alert => 
        alert.type === 'transaction' && 
        alert.severity === 'high' &&
        alert.message.includes('High gas usage detected')
      )).toBe(true);
    });
  });

  describe('Chain Validation', () => {
    it('should detect unsupported chains', async () => {
      const unsupportedChainId = 12345;
      
      const isValid = await securityMonitoring.validateChainId(unsupportedChainId);
      
      expect(isValid).toBe(false);
      
      const alerts = securityMonitoring.getRecentAlerts();
      expect(alerts.some(alert => 
        alert.type === 'error' && 
        alert.severity === 'critical' &&
        alert.message.includes('Unsupported chain ID detected')
      )).toBe(true);
    });

    it('should validate supported chains', async () => {
      const supportedChainId = chainPolicies.defaultChain.id;
      
      const isValid = await securityMonitoring.validateChainId(supportedChainId);
      
      expect(isValid).toBe(true);
    });
  });

  describe('Alert Management', () => {
    it('should maintain alert history within limits', async () => {
      const [address] = await testClient.getAddresses();
      
      // Generate multiple transactions to create alerts
      for (let i = 0; i < 1100; i++) {
        await securityMonitoring.watchPendingTransactions(address);
      }
      
      const alerts = securityMonitoring.getRecentAlerts(1100);
      expect(alerts.length).toBeLessThanOrEqual(1000);
    });
  });
});
