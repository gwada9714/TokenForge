import { renderHook, act } from '@testing-library/react';
import { useTokenDeployment } from '../useTokenDeployment';
import { TokenConfig } from '../../types';

// Mock wagmi's useAccount hook
jest.mock('wagmi', () => ({
  useAccount: () => ({
    address: '0x1234567890123456789012345678901234567890',
  }),
}));

describe('useTokenDeployment', () => {
  const mockTokenConfig: TokenConfig = {
    name: 'Test Token',
    symbol: 'TEST',
    decimals: 18,
    totalSupply: '1000000',
    features: {
      mintable: true,
      burnable: true,
      pausable: true,
    },
  };

  it('should initialize with pending status', () => {
    const { result } = renderHook(() => useTokenDeployment());
    expect(result.current.deploymentStatus.status).toBe('pending');
  });

  it('should deploy token successfully', async () => {
    const { result } = renderHook(() => useTokenDeployment());

    await act(async () => {
      const tokenAddress = await result.current.deployToken(mockTokenConfig, 'premium');
      expect(tokenAddress).toMatch(/^0x[a-f0-9]{40}$/i);
    });

    expect(result.current.deploymentStatus.status).toBe('success');
    expect(result.current.deploymentStatus.txHash).toBeDefined();
  });

  it('should handle basic plan feature restrictions', async () => {
    const { result } = renderHook(() => useTokenDeployment());
    const consoleLogSpy = jest.spyOn(console, 'log');

    await act(async () => {
      await result.current.deployToken(mockTokenConfig, 'basic');
    });

    // Verify that premium features are disabled in basic plan
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        features: expect.objectContaining({
          mintable: false,
          pausable: false,
        }),
      })
    );

    consoleLogSpy.mockRestore();
  });

  it('should handle deployment failure', async () => {
    // Mock useAccount to return no address to simulate error
    jest.spyOn(require('wagmi'), 'useAccount').mockImplementation(() => ({
      address: null,
    }));

    const { result } = renderHook(() => useTokenDeployment());

    await expect(
      act(async () => {
        await result.current.deployToken(mockTokenConfig, 'premium');
      })
    ).rejects.toThrow('Wallet not connected');

    expect(result.current.deploymentStatus.status).toBe('error');
    expect(result.current.deploymentStatus.error).toBeDefined();
  });
});
