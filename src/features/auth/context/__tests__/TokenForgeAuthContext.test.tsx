import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TokenForgeAuthProvider, useTokenForgeAuth } from '../TokenForgeAuthContext';
import { firebaseService } from '../../services/firebaseService';
import { errorService } from '../../services/errorService';
import { walletReconnectionService } from '../../services/walletReconnectionService';
import { authSyncService } from '../../services/authSyncService';
import { createAuthError } from '../../errors/AuthError';

// Mock des services
jest.mock('../../services/firebaseService');
jest.mock('../../services/errorService');
jest.mock('../../services/walletReconnectionService');
jest.mock('../../services/authSyncService');

// Mock Wagmi
jest.mock('wagmi', () => ({
  useAccount: jest.fn(() => ({ address: null, isConnected: false })),
  useConnect: jest.fn(() => ({ connect: jest.fn() })),
  useDisconnect: jest.fn(() => ({ disconnect: jest.fn() })),
}));

// Mock @wagmi/core
jest.mock('@wagmi/core', () => ({
  getWalletClient: jest.fn(),
}));

// Composant de test
const TestComponent = () => {
  const auth = useTokenForgeAuth();
  return (
    <div>
      <div data-testid="status">{auth.status}</div>
      <div data-testid="is-authenticated">{auth.isAuthenticated.toString()}</div>
      <div data-testid="wallet-connected">{auth.walletState.isConnected.toString()}</div>
      <button onClick={() => auth.signIn('test@example.com', 'password')}>Sign In</button>
      <button onClick={() => auth.signUp('test@example.com', 'password')}>Sign Up</button>
      <button onClick={() => auth.signOut()}>Sign Out</button>
      <button onClick={() => auth.connectWallet()}>Connect Wallet</button>
      <button onClick={() => auth.disconnectWallet()}>Disconnect Wallet</button>
      <button onClick={() => auth.clearError()}>Clear Error</button>
    </div>
  );
};

describe('TokenForgeAuthContext', () => {
  const mockUser = {
    uid: '123',
    email: 'test@tokenforge.com',
    displayName: 'Test User',
    photoURL: null,
    metadata: {
      creationTime: '2023-01-01',
      lastSignInTime: '2023-01-02',
    },
    isAdmin: false,
    canCreateToken: true,
    canUseServices: true,
  };

  const mockWalletClient = {
    transport: {},
    chain: {
      id: 1,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Configuration des mocks par défaut
    (firebaseService.onAuthStateChanged as jest.Mock).mockImplementation((callback) => {
      callback(null);
      return jest.fn();
    });
    (firebaseService.getUserData as jest.Mock).mockResolvedValue(mockUser);
    (walletReconnectionService.isCorrectNetwork as jest.Mock).mockReturnValue(true);
    (walletReconnectionService.validateNetworkBeforeConnect as jest.Mock).mockResolvedValue(true);
  });

  it('provides initial auth state', () => {
    render(
      <TokenForgeAuthProvider>
        <TestComponent />
      </TokenForgeAuthProvider>
    );

    expect(screen.getByTestId('status')).toHaveTextContent('idle');
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('wallet-connected')).toHaveTextContent('false');
  });

  it('handles sign in successfully', async () => {
    (firebaseService.signIn as jest.Mock).mockResolvedValue(mockUser);

    render(
      <TokenForgeAuthProvider>
        <TestComponent />
      </TokenForgeAuthProvider>
    );

    fireEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(firebaseService.signIn).toHaveBeenCalledWith('test@example.com', 'password');
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated');
      expect(authSyncService.startTokenRefresh).toHaveBeenCalled();
    });
  });

  it('handles sign in error', async () => {
    const mockError = new Error('Invalid credentials');
    (firebaseService.signIn as jest.Mock).mockRejectedValue(mockError);
    (errorService.handleAuthError as jest.Mock).mockReturnValue(
      createAuthError('AUTH_016', 'Invalid credentials')
    );

    render(
      <TokenForgeAuthProvider>
        <TestComponent />
      </TokenForgeAuthProvider>
    );

    fireEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('error');
      expect(errorService.handleAuthError).toHaveBeenCalledWith(mockError);
    });
  });

  it('handles wallet connection with network validation', async () => {
    const { useAccount } = require('wagmi');
    useAccount.mockImplementation(() => ({ 
      address: '0x123', 
      isConnected: true 
    }));

    const { getWalletClient } = require('@wagmi/core');
    getWalletClient.mockResolvedValue(mockWalletClient);

    render(
      <TokenForgeAuthProvider>
        <TestComponent />
      </TokenForgeAuthProvider>
    );

    fireEvent.click(screen.getByText('Connect Wallet'));

    await waitFor(() => {
      expect(walletReconnectionService.validateNetworkBeforeConnect).toHaveBeenCalled();
      expect(screen.getByTestId('wallet-connected')).toHaveTextContent('true');
      expect(authSyncService.synchronizeWalletAndAuth).toHaveBeenCalled();
    });
  });

  it('handles wallet connection with wrong network', async () => {
    const { useAccount } = require('wagmi');
    useAccount.mockImplementation(() => ({ 
      address: '0x123', 
      isConnected: true 
    }));

    const { getWalletClient } = require('@wagmi/core');
    getWalletClient.mockResolvedValue(mockWalletClient);

    (walletReconnectionService.validateNetworkBeforeConnect as jest.Mock).mockRejectedValue(
      createAuthError('AUTH_002', 'Wrong network')
    );

    render(
      <TokenForgeAuthProvider>
        <TestComponent />
      </TokenForgeAuthProvider>
    );

    fireEvent.click(screen.getByText('Connect Wallet'));

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('error');
    });
  });

  it('handles auth state changes and token refresh', async () => {
    (firebaseService.onAuthStateChanged as jest.Mock).mockImplementation((callback) => {
      callback(mockUser);
      return jest.fn();
    });

    render(
      <TokenForgeAuthProvider>
        <TestComponent />
      </TokenForgeAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated');
      expect(authSyncService.startTokenRefresh).toHaveBeenCalled();
    });
  });

  it('cleans up resources on unmount', () => {
    const unsubscribe = jest.fn();
    (firebaseService.onAuthStateChanged as jest.Mock).mockReturnValue(unsubscribe);

    const { unmount } = render(
      <TokenForgeAuthProvider>
        <TestComponent />
      </TokenForgeAuthProvider>
    );

    unmount();
    expect(unsubscribe).toHaveBeenCalled();
    expect(authSyncService.stopTokenRefresh).toHaveBeenCalled();
  });

  it('handles sign out with connected wallet', async () => {
    const { useAccount, useDisconnect } = require('wagmi');
    const mockDisconnect = jest.fn();
    useAccount.mockImplementation(() => ({ 
      address: '0x123', 
      isConnected: true 
    }));
    useDisconnect.mockImplementation(() => ({ 
      disconnect: mockDisconnect 
    }));

    render(
      <TokenForgeAuthProvider>
        <TestComponent />
      </TokenForgeAuthProvider>
    );

    fireEvent.click(screen.getByText('Sign Out'));

    await waitFor(() => {
      expect(mockDisconnect).toHaveBeenCalled();
      expect(authSyncService.stopTokenRefresh).toHaveBeenCalled();
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('wallet-connected')).toHaveTextContent('false');
    });
  });

  it('handles wallet disconnection sync', async () => {
    const { useAccount, useDisconnect } = require('wagmi');
    const mockDisconnect = jest.fn();
    useAccount.mockImplementation(() => ({ 
      address: '0x123', 
      isConnected: true 
    }));
    useDisconnect.mockImplementation(() => ({ 
      disconnect: mockDisconnect 
    }));

    render(
      <TokenForgeAuthProvider>
        <TestComponent />
      </TokenForgeAuthProvider>
    );

    fireEvent.click(screen.getByText('Disconnect Wallet'));

    await waitFor(() => {
      expect(mockDisconnect).toHaveBeenCalled();
      expect(authSyncService.synchronizeWalletAndAuth).toHaveBeenCalled();
      expect(screen.getByTestId('wallet-connected')).toHaveTextContent('false');
    });
  });
});
