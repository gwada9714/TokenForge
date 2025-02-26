import { describe, it, expect, beforeEach } from 'vitest';
import { TokenDeploymentService } from '../../features/token-creation/services/tokenDeploymentService';
import { setupTestEnvironment } from '../utils/testSetup';
import { parseEther } from 'viem';

describe('Token Creation Performance Tests', () => {
  let deploymentService: TokenDeploymentService;

  beforeEach(async () => {
    const env = await setupTestEnvironment();
    deploymentService = env.deploymentService;
  });

  it('should handle concurrent token deployments efficiently', async () => {
    const metrics = {
      totalDeployments: 5,
      successfulDeployments: 0,
      failedDeployments: 0,
      totalTime: 0,
      averageTime: 0,
      minTime: Infinity,
      maxTime: 0,
      deploymentTimes: [] as number[],
    };

    const deployToken = async (index: number) => {
      const startTime = Date.now();
      try {
        const tokenConfig = {
          name: `Performance Token ${index}`,
          symbol: `PERF${index}`,
          decimals: 18,
          initialSupply: parseEther('1000000'),
          mintable: true,
          burnable: true,
          pausable: false,
          taxConfig: {
            enabled: false,
            buyTax: 0,
            sellTax: 0,
            transferTax: 0
          }
        };

        const result = await deploymentService.deployToken(tokenConfig);
        const endTime = Date.now();
        const deploymentTime = endTime - startTime;

        if (result.success) {
          metrics.successfulDeployments++;
          metrics.deploymentTimes.push(deploymentTime);
          metrics.minTime = Math.min(metrics.minTime, deploymentTime);
          metrics.maxTime = Math.max(metrics.maxTime, deploymentTime);
        } else {
          metrics.failedDeployments++;
        }

        return result;
      } catch (error) {
        metrics.failedDeployments++;
        throw error;
      }
    };

    const startTime = Date.now();
    const deploymentPromises = Array.from(
      { length: metrics.totalDeployments },
      (_, i) => deployToken(i)
    );

    const results = await Promise.allSettled(deploymentPromises);
    const endTime = Date.now();
    metrics.totalTime = endTime - startTime;
    metrics.averageTime =
      metrics.deploymentTimes.reduce((a, b) => a + b, 0) /
      metrics.successfulDeployments;

    // Analyse des résultats
    console.log(`
Performance Test Results:
------------------------
Total Deployments: ${metrics.totalDeployments}
Successful: ${metrics.successfulDeployments}
Failed: ${metrics.failedDeployments}
Total Time: ${metrics.totalTime}ms
Average Time per Deployment: ${metrics.averageTime.toFixed(2)}ms
Minimum Deployment Time: ${metrics.minTime}ms
Maximum Deployment Time: ${metrics.maxTime}ms
Throughput: ${(metrics.successfulDeployments / (metrics.totalTime / 1000)).toFixed(2)} tokens/second
    `);

    // Assertions
    expect(metrics.successfulDeployments).toBeGreaterThan(0);
    expect(metrics.failedDeployments).toBe(0);
    expect(metrics.averageTime).toBeLessThan(30000); // Moins de 30 secondes en moyenne
    expect(metrics.maxTime).toBeLessThan(45000); // Pas plus de 45 secondes pour un déploiement
  });

  it('should maintain performance under load', async () => {
    const batchSizes = [1, 3, 5];
    const results = [];

    for (const batchSize of batchSizes) {
      const startTime = Date.now();
      const deployments = Array.from({ length: batchSize }, (_, i) => 
        deploymentService.deployToken({
          name: `Load Test Token ${i}`,
          symbol: `LOAD${i}`,
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
        })
      );

      await Promise.all(deployments);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / batchSize;

      results.push({
        batchSize,
        totalTime,
        averageTime
      });
    }

    console.log('\nLoad Test Results:');
    results.forEach(({ batchSize, totalTime, averageTime }) => {
      console.log(`
Batch Size: ${batchSize}
Total Time: ${totalTime}ms
Average Time per Token: ${averageTime.toFixed(2)}ms
      `);
    });

    // Vérification de la dégradation des performances
    const baselineTime = results[0].averageTime;
    const maxDegradation = 2; // Facteur de dégradation maximum acceptable

    results.slice(1).forEach(({ batchSize, averageTime }) => {
      const degradation = averageTime / baselineTime;
      expect(degradation).toBeLessThan(maxDegradation);
      console.log(`Performance degradation for batch size ${batchSize}: ${degradation.toFixed(2)}x`);
    });
  });
}); 