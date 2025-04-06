import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import { useTokenDeployment } from '../hooks/useTokenDeployment';
import { TokenDeploymentService } from '../services/tokenDeploymentService';

// Mock des dépendances
vi.mock('@/hooks/useAuth', () => ({
  useTokenForgeAuth: () => ({
    isAuthenticated: true
  })
}));

vi.mock('@/features/auth/hooks/useWalletState', () => ({
  useWalletState: () => ({
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
  })
}));

vi.mock('../services/tokenDeploymentService', () => ({
  TokenDeploymentService: vi.fn().mockImplementation(() => ({
    deployToken: vi.fn().mockResolvedValue({
      success: true,
      tokenAddress: '0x1234567890123456789012345678901234567890',
      transactionHash: '0xabcdef1234567890'
    })
  }))
}));

describe('useTokenDeployment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockConfig = {
    name: 'Test Token',
    symbol: 'TEST',
    decimals: 18,
    initialSupply: '1000000000000000000000',
    mintable: true,
    burnable: true,
    blacklist: false,
    customTaxPercentage: 1.5
  };

  it('should deploy token successfully', async () => {
    const { result } = renderHook(() => useTokenDeployment());

    await act(async () => {
      const success = await result.current.deployToken('bsc', mockConfig);
      expect(success).toBe(true);
    });

    expect(result.current.isDeploying).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.tokenAddress).toBe('0x1234567890123456789012345678901234567890');
    expect(result.current.transactionHash).toBe('0xabcdef1234567890');
  });

  it('should handle deployment failure', async () => {
    // Mock service to simulate failure
    (TokenDeploymentService as jest.Mock).mockImplementation(() => ({
      deployToken: vi.fn().mockResolvedValue({
        success: false,
        error: 'Deployment failed'
      })
    }));

    const { result } = renderHook(() => useTokenDeployment());

    await act(async () => {
      const success = await result.current.deployToken('bsc', mockConfig);
      expect(success).toBe(false);
    });

    expect(result.current.isDeploying).toBe(false);
    expect(result.current.error).toBe('Deployment failed');
    expect(result.current.tokenAddress).toBeNull();
    expect(result.current.transactionHash).toBeNull();
  });

  it('should reset state correctly', () => {
    const { result } = renderHook(() => useTokenDeployment());

    act(() => {
      result.current.resetState();
    });

    expect(result.current.isDeploying).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.tokenAddress).toBeNull();
    expect(result.current.transactionHash).toBeNull();
  });
});
