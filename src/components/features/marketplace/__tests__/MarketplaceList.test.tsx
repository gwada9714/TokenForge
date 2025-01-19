import { render, screen } from '@testing-library/react';
import { MarketplaceList } from '../components/MarketplaceList';
import { useMarketplace } from '../hooks/useMarketplace';

// Mock du hook useMarketplace
jest.mock('../hooks/useMarketplace');

const mockUseMarketplace = useMarketplace as jest.MockedFunction<typeof useMarketplace>;

describe('MarketplaceList', () => {
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

  const mockStats = {
    totalItems: 1,
    totalVolume: '100',
    activeItems: 1,
    soldItems: 0,
  };

  beforeEach(() => {
    mockUseMarketplace.mockReturnValue({
      items: [],
      stats: mockStats,
      isLoading: false,
      error: null,
      loadItems: jest.fn(),
      loadStats: jest.fn(),
      createItem: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    mockUseMarketplace.mockReturnValue({
      items: [],
      stats: mockStats,
      isLoading: true,
      error: null,
      loadItems: jest.fn(),
      loadStats: jest.fn(),
      createItem: jest.fn(),
    });

    render(<MarketplaceList />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders error state', () => {
    const errorMessage = 'Test error';
    mockUseMarketplace.mockReturnValue({
      items: [],
      stats: mockStats,
      isLoading: false,
      error: errorMessage,
      loadItems: jest.fn(),
      loadStats: jest.fn(),
      createItem: jest.fn(),
    });

    render(<MarketplaceList />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('renders empty state', () => {
    render(<MarketplaceList />);
    expect(screen.getByText(/Aucun item disponible/i)).toBeInTheDocument();
  });

  it('renders items list', () => {
    mockUseMarketplace.mockReturnValue({
      items: mockItems,
      stats: mockStats,
      isLoading: false,
      error: null,
      loadItems: jest.fn(),
      loadStats: jest.fn(),
      createItem: jest.fn(),
    });

    render(<MarketplaceList />);
    expect(screen.getByText(mockItems[0].name)).toBeInTheDocument();
  });

  it('calls loadItems and loadStats on mount', () => {
    const loadItems = jest.fn();
    const loadStats = jest.fn();

    mockUseMarketplace.mockReturnValue({
      items: [],
      stats: mockStats,
      isLoading: false,
      error: null,
      loadItems,
      loadStats,
      createItem: jest.fn(),
    });

    render(<MarketplaceList />);
    
    expect(loadItems).toHaveBeenCalledTimes(1);
    expect(loadStats).toHaveBeenCalledTimes(1);
  });
});
