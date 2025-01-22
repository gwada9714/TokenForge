import { describe, expect, it, vi } from 'vitest';
import { EthereumService } from '../../ethereum/EthereumService';
import { type Address, type PublicClient } from 'viem';
import { mainnet } from 'viem/chains';

describe('EthereumService', () => {
  const service = new EthereumService();

  it('should initialize with correct chain ID', () => {
    expect(service['chainId']).toBe(1);
  });

  it('should fetch ETH price', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({ ethereum: { usd: 2000 } })
    });

    const price = await service.getNativeTokenPrice();
    expect(price).toBe(2000);
  });

  it('should handle ETH price fetch error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('API Error'));

    const price = await service.getNativeTokenPrice();
    expect(price).toBe(0);
  });

  it('should create token', async () => {
    const mockWalletClient = {
      deployContract: vi.fn().mockResolvedValue('0xhash'),
      getAddresses: vi.fn().mockResolvedValue(['0xaccount'])
    };

    const mockPublicClient = {
      request: vi.fn(),
      call: vi.fn(),
      createBlockFilter: vi.fn(),
      createContractEventFilter: vi.fn(),
      createEventFilter: vi.fn(),
      createPendingTransactionFilter: vi.fn(),
      estimateContractGas: vi.fn(),
      estimateGas: vi.fn(),
      getBalance: vi.fn(),
      getBlock: vi.fn(),
      getBlockNumber: vi.fn(),
      getBlockTransactionCount: vi.fn(),
      getBytecode: vi.fn(),
      getChainId: vi.fn(),
      getContractEvents: vi.fn(),
      getEnsAddress: vi.fn(),
      getEnsAvatar: vi.fn(),
      getEnsName: vi.fn(),
      getEnsResolver: vi.fn(),
      getEnsText: vi.fn(),
      getFeeHistory: vi.fn(),
      getFilterChanges: vi.fn(),
      getFilterLogs: vi.fn(),
      getGasPrice: vi.fn(),
      getLogs: vi.fn(),
      getStorageAt: vi.fn(),
      getTransaction: vi.fn(),
      getTransactionConfirmations: vi.fn(),
      getTransactionCount: vi.fn(),
      getTransactionReceipt: vi.fn(),
      multicall: vi.fn(),
      readContract: vi.fn(),
      simulateContract: vi.fn(),
      verifyMessage: vi.fn(),
      verifyTypedData: vi.fn(),
      uninstallFilter: vi.fn(),
      watchBlockNumber: vi.fn(),
      watchBlocks: vi.fn(),
      watchContractEvent: vi.fn(),
      watchEvent: vi.fn(),
      watchPendingTransactions: vi.fn(),
      waitForTransactionReceipt: vi.fn().mockResolvedValue({
        contractAddress: '0xcontract' as Address
      }),
      account: undefined,
      batch: undefined,
      cacheTime: 4_000,
      chain: mainnet,
      key: 'public',
      name: 'Public Client',
      pollingInterval: 4_000,
      type: 'publicClient',
      uid: 'public-0',
      transport: { type: 'http' }
    } as unknown as PublicClient;

    vi.spyOn(service as any, 'getWalletClient').mockResolvedValue(mockWalletClient);
    vi.spyOn(service as any, 'initProvider').mockResolvedValue(mockPublicClient);
    service['client'] = mockPublicClient;

    const result = await service.createToken({
      name: 'Test Token',
      symbol: 'TEST',
      decimals: 18,
      totalSupply: '1000',
      owner: '0xowner' as Address
    });

    expect(result).toBe('0xcontract');
  });

  it('should add liquidity', async () => {
    const mockWalletClient = {
      writeContract: vi.fn().mockResolvedValue('0xhash'),
      getAddresses: vi.fn().mockResolvedValue(['0xaccount'])
    };

    const mockPublicClient = {
      request: vi.fn(),
      call: vi.fn(),
      createBlockFilter: vi.fn(),
      createContractEventFilter: vi.fn(),
      createEventFilter: vi.fn(),
      createPendingTransactionFilter: vi.fn(),
      estimateContractGas: vi.fn(),
      estimateGas: vi.fn(),
      getBalance: vi.fn(),
      getBlock: vi.fn(),
      getBlockNumber: vi.fn(),
      getBlockTransactionCount: vi.fn(),
      getBytecode: vi.fn(),
      getChainId: vi.fn(),
      getContractEvents: vi.fn(),
      getEnsAddress: vi.fn(),
      getEnsAvatar: vi.fn(),
      getEnsName: vi.fn(),
      getEnsResolver: vi.fn(),
      getEnsText: vi.fn(),
      getFeeHistory: vi.fn(),
      getFilterChanges: vi.fn(),
      getFilterLogs: vi.fn(),
      getGasPrice: vi.fn(),
      getLogs: vi.fn(),
      getStorageAt: vi.fn(),
      getTransaction: vi.fn(),
      getTransactionConfirmations: vi.fn(),
      getTransactionCount: vi.fn(),
      getTransactionReceipt: vi.fn(),
      multicall: vi.fn(),
      readContract: vi.fn(),
      simulateContract: vi.fn(),
      verifyMessage: vi.fn(),
      verifyTypedData: vi.fn(),
      uninstallFilter: vi.fn(),
      watchBlockNumber: vi.fn(),
      watchBlocks: vi.fn(),
      watchContractEvent: vi.fn(),
      watchEvent: vi.fn(),
      watchPendingTransactions: vi.fn(),
      waitForTransactionReceipt: vi.fn().mockResolvedValue({}),
      account: undefined,
      batch: undefined,
      cacheTime: 4_000,
      chain: mainnet,
      key: 'public',
      name: 'Public Client',
      pollingInterval: 4_000,
      type: 'publicClient',
      uid: 'public-1',
      transport: { type: 'http' }
    } as unknown as PublicClient;

    vi.spyOn(service as any, 'getWalletClient').mockResolvedValue(mockWalletClient);
    vi.spyOn(service as any, 'initProvider').mockResolvedValue(mockPublicClient);
    service['client'] = mockPublicClient;

    const result = await service.addLiquidity({
      tokenAddress: '0xtoken' as Address,
      amount: BigInt('1000000000000000000'),
      deadline: Math.floor(Date.now() / 1000) + 60 * 20
    });

    expect(result).toBe(true);
  });

  it('should remove liquidity', async () => {
    const mockWalletClient = {
      writeContract: vi.fn().mockResolvedValue('0xhash'),
      getAddresses: vi.fn().mockResolvedValue(['0xaccount'])
    };

    const mockPublicClient = {
      request: vi.fn(),
      call: vi.fn(),
      createBlockFilter: vi.fn(),
      createContractEventFilter: vi.fn(),
      createEventFilter: vi.fn(),
      createPendingTransactionFilter: vi.fn(),
      estimateContractGas: vi.fn(),
      estimateGas: vi.fn(),
      getBalance: vi.fn(),
      getBlock: vi.fn(),
      getBlockNumber: vi.fn(),
      getBlockTransactionCount: vi.fn(),
      getBytecode: vi.fn(),
      getChainId: vi.fn(),
      getContractEvents: vi.fn(),
      getEnsAddress: vi.fn(),
      getEnsAvatar: vi.fn(),
      getEnsName: vi.fn(),
      getEnsResolver: vi.fn(),
      getEnsText: vi.fn(),
      getFeeHistory: vi.fn(),
      getFilterChanges: vi.fn(),
      getFilterLogs: vi.fn(),
      getGasPrice: vi.fn(),
      getLogs: vi.fn(),
      getStorageAt: vi.fn(),
      getTransaction: vi.fn(),
      getTransactionConfirmations: vi.fn(),
      getTransactionCount: vi.fn(),
      getTransactionReceipt: vi.fn(),
      multicall: vi.fn(),
      readContract: vi.fn(),
      simulateContract: vi.fn(),
      verifyMessage: vi.fn(),
      verifyTypedData: vi.fn(),
      uninstallFilter: vi.fn(),
      watchBlockNumber: vi.fn(),
      watchBlocks: vi.fn(),
      watchContractEvent: vi.fn(),
      watchEvent: vi.fn(),
      watchPendingTransactions: vi.fn(),
      waitForTransactionReceipt: vi.fn().mockResolvedValue({}),
      account: undefined,
      batch: undefined,
      cacheTime: 4_000,
      chain: mainnet,
      key: 'public',
      name: 'Public Client',
      pollingInterval: 4_000,
      type: 'publicClient',
      uid: 'public-2',
      transport: { type: 'http' }
    } as unknown as PublicClient;

    vi.spyOn(service as any, 'getWalletClient').mockResolvedValue(mockWalletClient);
    vi.spyOn(service as any, 'initProvider').mockResolvedValue(mockPublicClient);
    service['client'] = mockPublicClient;

    const result = await service.removeLiquidity({
      tokenAddress: '0xtoken' as Address,
      amount: BigInt('1000000000000000000'),
      deadline: Math.floor(Date.now() / 1000) + 60 * 20
    });

    expect(result).toBe(true);
  });

  it('should throw error for unimplemented stake', async () => {
    await expect(service.stake({
      tokenAddress: '0xtoken' as Address,
      amount: BigInt('1000000000000000000')
    })).rejects.toThrow('Staking not implemented for Ethereum yet');
  });

  it('should throw error for unimplemented unstake', async () => {
    await expect(service.unstake({
      tokenAddress: '0xtoken' as Address,
      amount: BigInt('1000000000000000000')
    })).rejects.toThrow('Unstaking not implemented for Ethereum yet');
  });
});
