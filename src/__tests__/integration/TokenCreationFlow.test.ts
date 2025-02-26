import { describe, it, expect, beforeEach } from 'vitest';
import { TokenDeploymentService } from '../../features/token-creation/services/tokenDeploymentService';
import { TokenForgeFactory, TokenForgeToken } from '../../contracts/typechain-types';
import { parseEther, getContract } from 'viem';
import { mockPublicClient, mockWalletClient } from '../mocks/clients';
import { setupTestEnvironment } from '../utils/testSetup';
import { TokenConfig, DeploymentResult } from '../../types/deployment';
import { TokenForgeABI } from '../../contracts/abis/TokenForgeABI';

describe('Token Creation Flow Integration', () => {
  let deploymentService: TokenDeploymentService;
  let tokenFactory: TokenForgeFactory;

  beforeEach(async () => {
    const env = await setupTestEnvironment();
    deploymentService = env.deploymentService;
    tokenFactory = env.tokenFactory;
  });

  it('should complete full token creation process', async () => {
    const tokenConfig: TokenConfig = {
      name: 'Integration Test Token',
      symbol: 'ITT',
      decimals: 18,
      initialSupply: parseEther('1000000'),
      mintable: true,
      burnable: true,
      pausable: true,
      taxConfig: {
        enabled: true,
        buyTax: 2,
        sellTax: 2,
        transferTax: 1
      }
    };

    // Étape 1: Validation de la configuration
    const validationResult = await deploymentService.validateTokenConfig(tokenConfig);
    expect(validationResult.isValid).toBe(true);

    // Étape 2: Estimation des coûts
    const costEstimation = await deploymentService.estimateDeploymentCost(tokenConfig);
    expect(costEstimation.gasCost).toBeGreaterThan(0n);

    // Étape 3: Déploiement du token
    const deploymentResult = await deploymentService.deployToken(tokenConfig, {
      chain: 'bsc',
      verifyContract: true
    });
    expect(deploymentResult.success).toBe(true);
    expect(deploymentResult.tokenAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);

    // Étape 4: Vérification post-déploiement
    if (!deploymentResult.tokenAddress) {
      throw new Error('Token address not found');
    }

    const tokenContract = getContract({
      address: deploymentResult.tokenAddress,
      abi: TokenForgeABI,
      publicClient: mockPublicClient,
      walletClient: mockWalletClient,
    });

    const [name, symbol, decimals, totalSupply] = await Promise.all([
      tokenContract.read.name(),
      tokenContract.read.symbol(),
      tokenContract.read.decimals(),
      tokenContract.read.totalSupply()
    ]);

    expect(name).to.equal(tokenConfig.name);
    expect(symbol).to.equal(tokenConfig.symbol);
    expect(decimals).to.equal(tokenConfig.decimals);
    expect(totalSupply).to.equal(tokenConfig.initialSupply);

    // Étape 5: Vérification des fonctionnalités
    if (tokenConfig.mintable) {
      const canMint = await tokenContract.read.mintable();
      expect(canMint).to.be.true;
    }

    if (tokenConfig.burnable) {
      const canBurn = await tokenContract.read.burnable();
      expect(canBurn).to.be.true;
    }

    if (tokenConfig.pausable) {
      const canPause = await tokenContract.read.pausable();
      expect(canPause).to.be.true;
    }

    // Étape 6: Vérification de la configuration des taxes
    if (tokenConfig.taxConfig.enabled) {
      const taxConfig = await tokenContract.read.getTaxConfig();
      expect(taxConfig.buyTax).to.equal(tokenConfig.taxConfig.buyTax);
      expect(taxConfig.sellTax).to.equal(tokenConfig.taxConfig.sellTax);
      expect(taxConfig.transferTax).to.equal(tokenConfig.taxConfig.transferTax);
    }
  });

  it('should handle multiple token creations efficiently', async () => {
    const startTime = Date.now();
    const numberOfTokens = 3;
    const deploymentPromises: Promise<DeploymentResult>[] = [];

    for (let i = 0; i < numberOfTokens; i++) {
      const tokenConfig: TokenConfig = {
        name: `Performance Test Token ${i}`,
        symbol: `PTT${i}`,
        decimals: 18,
        initialSupply: parseEther('1000000'),
        mintable: true,
        burnable: false,
        pausable: false,
        taxConfig: {
          enabled: false,
          buyTax: 0,
          sellTax: 0,
          transferTax: 0
        }
      };

      deploymentPromises.push(
        deploymentService.deployToken(tokenConfig, { chain: 'bsc' })
      );
    }

    const results = await Promise.all(deploymentPromises);
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // Vérification des résultats
    results.forEach((result) => {
      expect(result.success).to.be.true;
      expect(result.tokenAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    // Vérification de la performance
    const averageDeployTime = totalTime / numberOfTokens;
    expect(averageDeployTime).toBeLessThan(30000); // Moins de 30 secondes par token
    
    console.log(`Performance metrics:
      - Total time: ${totalTime}ms
      - Average deployment time: ${averageDeployTime}ms
      - Number of tokens: ${numberOfTokens}
    `);
  });
}); 