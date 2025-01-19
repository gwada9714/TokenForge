import { renderHook, act } from '@testing-library/react';
import { useTokenOperations } from '../useTokenOperations';

// Mock wagmi's useAccount hook
jest.mock('wagmi', () => ({
  useAccount: () => ({
    address: '0x1234567890123456789012345678901234567890',
  }),
}));

describe('useTokenOperations', () => {
  const mockTokenAddress = '0x0987654321098765432109876543210987654321';

  it('should initialize with empty operations array', () => {
    const { result } = renderHook(() => useTokenOperations(mockTokenAddress));
    expect(result.current.operations).toEqual([]);
  });

  it('should handle mint operation', async () => {
    const { result } = renderHook(() => useTokenOperations(mockTokenAddress));

    await act(async () => {
      await result.current.mint('0x1234...', '1000');
    });

    const lastOperation = result.current.operations[result.current.operations.length - 1];
    expect(lastOperation).toEqual(
      expect.objectContaining({
        type: 'mint',
        status: 'success',
        txHash: expect.any(String),
      })
    );
  });

  it('should handle burn operation', async () => {
    const { result } = renderHook(() => useTokenOperations(mockTokenAddress));

    await act(async () => {
      await result.current.burn('500');
    });

    const lastOperation = result.current.operations[result.current.operations.length - 1];
    expect(lastOperation).toEqual(
      expect.objectContaining({
        type: 'burn',
        status: 'success',
        txHash: expect.any(String),
      })
    );
  });

  it('should handle pause operation', async () => {
    const { result } = renderHook(() => useTokenOperations(mockTokenAddress));

    await act(async () => {
      await result.current.pause();
    });

    const lastOperation = result.current.operations[result.current.operations.length - 1];
    expect(lastOperation).toEqual(
      expect.objectContaining({
        type: 'pause',
        status: 'success',
        txHash: expect.any(String),
      })
    );
  });

  it('should handle transfer operation', async () => {
    const { result } = renderHook(() => useTokenOperations(mockTokenAddress));

    await act(async () => {
      await result.current.transfer('0x5678...', '750');
    });

    const lastOperation = result.current.operations[result.current.operations.length - 1];
    expect(lastOperation).toEqual(
      expect.objectContaining({
        type: 'transfer',
        status: 'success',
        txHash: expect.any(String),
      })
    );
  });

  it('should handle operation failure when wallet is not connected', async () => {
    // Mock useAccount to return no address
    jest.spyOn(require('wagmi'), 'useAccount').mockImplementation(() => ({
      address: null,
    }));

    const { result } = renderHook(() => useTokenOperations(mockTokenAddress));

    await expect(
      act(async () => {
        await result.current.mint('0x1234...', '1000');
      })
    ).rejects.toThrow('Wallet not connected');

    const lastOperation = result.current.operations[result.current.operations.length - 1];
    expect(lastOperation?.status).toBe('error');
  });
});
