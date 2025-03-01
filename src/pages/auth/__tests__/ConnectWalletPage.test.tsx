import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConnectWalletPage from '../ConnectWalletPage';
import { useTokenForgeAuth } from '../../../features/auth/hooks/useTokenForgeAuth';
import { useNavigate } from 'react-router-dom';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}));

vi.mock('../../../features/auth/hooks/useTokenForgeAuth', () => ({
  useTokenForgeAuth: vi.fn()
}));

describe('ConnectWalletPage', () => {
  const mockNavigate = vi.fn();
  const mockConnectWallet = vi.fn();

  beforeEach(() => {
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useTokenForgeAuth).mockReturnValue({
      connectWallet: mockConnectWallet,
      isLoading: false,
      error: null,
      isWalletConnected: false
    });
  });

  it('renders connect wallet button correctly', () => {
    render(<ConnectWalletPage />);
    
    expect(screen.getByRole('button', { name: /connect wallet/i })).toBeInTheDocument();
  });

  it('shows loading state when connecting', () => {
    vi.mocked(useTokenForgeAuth).mockReturnValue({
      connectWallet: mockConnectWallet,
      isLoading: true,
      error: null,
      isWalletConnected: false
    });

    render(<ConnectWalletPage />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /connect wallet/i })).toBeDisabled();
  });

  it('displays error message when connection fails', () => {
    const errorMessage = 'Failed to connect wallet';
    vi.mocked(useTokenForgeAuth).mockReturnValue({
      connectWallet: mockConnectWallet,
      isLoading: false,
      error: new Error(errorMessage),
      isWalletConnected: false
    });

    render(<ConnectWalletPage />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('navigates to dashboard when wallet is connected', () => {
    vi.mocked(useTokenForgeAuth).mockReturnValue({
      connectWallet: mockConnectWallet,
      isLoading: false,
      error: null,
      isWalletConnected: true
    });

    render(<ConnectWalletPage />);
    
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('calls connectWallet when button is clicked', () => {
    render(<ConnectWalletPage />);
    
    const connectButton = screen.getByRole('button', { name: /connect wallet/i });
    fireEvent.click(connectButton);

    expect(mockConnectWallet).toHaveBeenCalled();
  });
});
