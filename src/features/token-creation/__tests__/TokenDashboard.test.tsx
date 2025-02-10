import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TokenDashboard } from '../components/TokenDashboard';
import { useTokenEvents } from '../hooks/useTokenEvents';
import { NotificationService } from '../services/notificationService';

// Mock des hooks et services
vi.mock('../hooks/useTokenEvents', () => ({
  useTokenEvents: vi.fn()
}));

vi.mock('../services/notificationService', () => ({
  NotificationService: vi.fn().mockImplementation(() => ({
    notify: vi.fn()
  }))
}));

describe('TokenDashboard', () => {
  const mockEvents = [
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
      to: '0x9abc...',
      amount: BigInt(5000000000),
      timestamp: Date.now()
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Configuration par défaut du mock useTokenEvents
    vi.mocked(useTokenEvents).mockReturnValue({
      events: mockEvents,
      taxEvents: mockEvents.filter(e => e.type === 'TaxCollected'),
      isLoading: false,
      error: null,
      fetchEvents: vi.fn()
    });
  });

  it('should render statistics correctly', () => {
    render(
      <TokenDashboard
        network="bsc"
        tokenAddress="0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
      />
    );

    // Vérifier les statistiques
    expect(screen.getByText('Total des Taxes')).toBeInTheDocument();
    expect(screen.getByText('Taxes (24h)')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Adresses Uniques')).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    vi.mocked(useTokenEvents).mockReturnValue({
      events: [],
      taxEvents: [],
      isLoading: true,
      error: null,
      fetchEvents: vi.fn()
    });

    render(
      <TokenDashboard
        network="bsc"
        tokenAddress="0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
      />
    );

    // Vérifier les skeletons de chargement
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should handle error state', () => {
    const errorMessage = 'Erreur de chargement';
    vi.mocked(useTokenEvents).mockReturnValue({
      events: [],
      taxEvents: [],
      isLoading: false,
      error: errorMessage,
      fetchEvents: vi.fn()
    });

    render(
      <TokenDashboard
        network="bsc"
        tokenAddress="0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should notify on new events', async () => {
    const notifySpy = vi.spyOn(NotificationService.prototype, 'notify');
    
    render(
      <TokenDashboard
        network="bsc"
        tokenAddress="0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
      />
    );

    // Simuler un nouvel événement
    vi.mocked(useTokenEvents).mockReturnValue({
      events: [...mockEvents, {
        type: 'TaxCollected',
        from: '0xabcd...',
        to: '0xefgh...',
        amount: BigInt(2000000000),
        timestamp: Date.now()
      }],
      taxEvents: mockEvents.filter(e => e.type === 'TaxCollected'),
      isLoading: false,
      error: null,
      fetchEvents: vi.fn()
    });

    await waitFor(() => {
      expect(notifySpy).toHaveBeenCalled();
    });
  });

  it('should switch between trends and events tabs', () => {
    render(
      <TokenDashboard
        network="bsc"
        tokenAddress="0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
      />
    );

    // Cliquer sur l'onglet Événements
    fireEvent.click(screen.getByText('Événements'));
    expect(screen.getByTestId('events-tab')).toHaveAttribute('aria-selected', 'true');

    // Cliquer sur l'onglet Tendances
    fireEvent.click(screen.getByText('Tendances'));
    expect(screen.getByTestId('trends-tab')).toHaveAttribute('aria-selected', 'true');
  });
});
