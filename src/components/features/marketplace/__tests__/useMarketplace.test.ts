import { renderHook, act } from '@testing-library/react';
import { useMarketplace } from '../hooks/useMarketplace';
import { useContract } from '../../../../hooks/useContract';
import { Contract } from 'ethers';

jest.mock('../../../../hooks/useContract');
jest.mock('ethers');

const mockUseContract = useContract as jest.MockedFunction<typeof useContract>;

describe('useMarketplace', () => {
  const mockContract = {
    getItems: jest.fn(),
    getStats: jest.fn(),
    createItem: jest.fn(),
    interface: {},
    provider: {},
    signer: {},
    callStatic: {},
    estimateGas: {},
    populateTransaction: {},
    filters: {},
    queryFilter: jest.fn(),
    listenerCount: jest.fn(),
    listeners: jest.fn(),
    removeAllListeners: jest.fn(),
    off: jest.fn(),
    on: jest.fn(),
    once: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    attach: jest.fn(),
    deployed: jest.fn(),
    _deployed: jest.fn(),
  } as unknown as Contract;

  beforeEach(() => {
    mockUseContract.mockReturnValue({
      contract: mockContract,
      error: null,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useMarketplace());

    expect(result.current.items).toEqual([]);
    expect(result.current.stats).toEqual({
      totalItems: 0,
      totalVolume: '0',
      activeItems: 0,
      soldItems: 0,
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('loads items successfully', async () => {
    const mockItems = [
      {
        id: '1',
        name: 'Test Token',
        description: 'Test Description',
        price: '100',
        seller: '0x123',
        tokenAddress: '0x456',
        tokenSymbol: 'TEST',
        tokenDecimals: 18,
        status: 'active' as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    mockContract.getItems.mockResolvedValue(mockItems);

    const { result } = renderHook(() => useMarketplace());

    await act(async () => {
      await result.current.loadItems();
    });

    expect(result.current.items).toEqual(mockItems);
    expect(result.current.error).toBe(null);
    expect(result.current.isLoading).toBe(false);
  });

  it('handles load items error', async () => {
    const errorMessage = 'Failed to load items';
    mockContract.getItems.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useMarketplace());

    await act(async () => {
      await result.current.loadItems();
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.isLoading).toBe(false);
  });

  it('loads stats successfully', async () => {
    const mockStats = {
      totalItems: 100,
      totalVolume: '1000',
      activeItems: 75,
      soldItems: 25,
    };

    mockContract.getStats.mockResolvedValue(mockStats);

    const { result } = renderHook(() => useMarketplace());

    await act(async () => {
      await result.current.loadStats();
    });

    expect(result.current.stats).toEqual(mockStats);
    expect(result.current.error).toBe(null);
  });

  it('creates item successfully', async () => {
    const newItem = {
      name: 'New Token',
      description: 'New Description',
      price: '100',
      seller: '0x123',
      tokenAddress: '0x456',
      tokenSymbol: 'NEW',
      tokenDecimals: 18,
    };

    mockContract.createItem.mockResolvedValue(true);

    const { result } = renderHook(() => useMarketplace());

    await act(async () => {
      await result.current.createItem(newItem);
    });

    expect(mockContract.createItem).toHaveBeenCalledWith(newItem);
    expect(mockContract.getItems).toHaveBeenCalled();
    expect(mockContract.getStats).toHaveBeenCalled();
  });
});
