import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import { useTokenEvents } from '../hooks/useTokenEvents';
import { EventMonitorService } from '../services/eventMonitorService';

// Mock des dépendances
vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    showToast: vi.fn()
  })
}));

vi.mock('@/features/auth/hooks/useTokenForgeAuth', () => ({
  useTokenForgeAuth: () => ({
    isAuthenticated: true
  })
}));

// Mock de EventMonitorService
vi.mock('../services/eventMonitorService', () => ({
  EventMonitorService: vi.fn().mockImplementation(() => ({
    getLatestBlockNumber: vi.fn().mockResolvedValue(BigInt(1000000)),
    monitorTokenEvents: vi.fn().mockResolvedValue([
      {
        type: 'TaxCollected',
        from: '0x1234...',
        to: '0x5678...',
        amount: BigInt(1000000000),
        timestamp: Date.now()
      },
      {
        type: 'Transfer',
        from: '0x1234...',
        to: '0x5678...',
        amount: BigInt(5000000000),
        timestamp: Date.now()
      }
    ])
  }))
}));

describe('useTokenEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockTokenAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' as `0x${string}`;

  it('should fetch and filter events correctly', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useTokenEvents('bsc', mockTokenAddress)
    );

    expect(result.current.isLoading).toBe(true);
    await waitForNextUpdate();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.events).toHaveLength(2);
    expect(result.current.taxEvents).toHaveLength(1);
    expect(result.current.transferEvents).toHaveLength(1);
  });

  it('should handle errors gracefully', async () => {
    // Mock d'erreur
    vi.mocked(EventMonitorService).mockImplementationOnce(() => ({
      getLatestBlockNumber: vi.fn().mockRejectedValue(new Error('RPC Error')),
      monitorTokenEvents: vi.fn()
    }));

    const { result, waitForNextUpdate } = renderHook(() =>
      useTokenEvents('bsc', mockTokenAddress)
    );

    await waitForNextUpdate();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('RPC Error');
    expect(result.current.events).toHaveLength(0);
  });

  it('should not fetch events without token address', () => {
    const { result } = renderHook(() => useTokenEvents('bsc', undefined));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.events).toHaveLength(0);
  });

  it('should refresh events on interval', async () => {
    vi.useFakeTimers();
    const { result, waitForNextUpdate } = renderHook(() =>
      useTokenEvents('bsc', mockTokenAddress, 5000)
    );

    await waitForNextUpdate();
    expect(result.current.events).toHaveLength(2);

    // Avancer le temps de 5 secondes
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(EventMonitorService).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
