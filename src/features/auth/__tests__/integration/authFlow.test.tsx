import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, waitFor, screen, fireEvent } from '@testing-library/react';
import { TokenForgeAuthProvider } from '../../providers/TokenForgeAuthProvider';
import { useTokenForgeAuth } from '../../providers/TokenForgeAuthProvider';
import { firebaseAuth } from '../../services/firebaseAuth';
import { sessionService } from '../../services/sessionService';
import { secureStorageService } from '../../services/secureStorageService';
import { useAccount, useDisconnect } from 'wagmi';

// Mocks
vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
  useDisconnect: vi.fn()
}));

vi.mock('../../services/firebaseAuth');
vi.mock('../../services/sessionService');
vi.mock('../../services/secureStorageService');

// Composant de test pour simuler l'interface utilisateur
const AuthTestComponent = () => {
  const { isAuthenticated, user, wallet } = useTokenForgeAuth();
  
  return (
    <div>
      <div data-testid="auth-status">
        Status: {isAuthenticated ? 'authenticated' : 'idle'}
      </div>
      <div data-testid="wallet-status">
        Wallet: {wallet.isConnected ? 'Connected' : 'Disconnected'}
      </div>
      <div data-testid="user-status">
        User: {user ? user.email : 'Not logged in'}
      </div>
      <button
        data-testid="login-button"
        onClick={() => {
          firebaseAuth.signInWithEmailAndPassword('test@example.com', 'password');
        }}
      >
        Login
      </button>
      <button
        data-testid="connect-wallet-button"
        onClick={() => {
          (useAccount as any).mockReturnValue({
            address: '0x123' as `0x${string}`,
            isConnected: true
          });
        }}
      >
        Connect Wallet
      </button>
    </div>
  );
};

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAccount as any).mockReturnValue({ address: null, isConnected: false });
    (useDisconnect as any).mockReturnValue({ disconnect: vi.fn() });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete Authentication Flow', () => {
    it('should handle the complete authentication flow with wallet connection', async () => {
      // Configuration des mocks
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        getIdToken: vi.fn().mockResolvedValue('mock-token')
      };

      const mockSessionData = {
        isAdmin: true,
        canCreateToken: true,
        canUseServices: true
      };

      // Setup des services mockés
      (firebaseAuth.signInWithEmailAndPassword as any).mockResolvedValue({ user: mockUser });
      (sessionService.getUserSession as any).mockResolvedValue(mockSessionData);
      (secureStorageService.setAuthToken as any).mockResolvedValue(undefined);

      // Rendu du composant
      render(
        <TokenForgeAuthProvider>
          <AuthTestComponent />
        </TokenForgeAuthProvider>
      );

      // Vérification de l'état initial
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Status: idle');
      expect(screen.getByTestId('wallet-status')).toHaveTextContent('Wallet: Disconnected');
      expect(screen.getByTestId('user-status')).toHaveTextContent('User: Not logged in');

      // Test de la connexion utilisateur
      await act(async () => {
        fireEvent.click(screen.getByTestId('login-button'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Status: authenticated');
        expect(screen.getByTestId('user-status')).toHaveTextContent('test@example.com');
      });

      // Test de la connexion wallet
      await act(async () => {
        fireEvent.click(screen.getByTestId('connect-wallet-button'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('wallet-status')).toHaveTextContent('Wallet: Connected');
      });

      // Vérification des appels de service
      expect(secureStorageService.setAuthToken).toHaveBeenCalledWith('mock-token');
      expect(sessionService.getUserSession).toHaveBeenCalledWith('test-uid');
    });

    it('should handle authentication errors gracefully', async () => {
      // Setup des erreurs
      (firebaseAuth.signInWithEmailAndPassword as any).mockRejectedValue(
        new Error('Invalid credentials')
      );

      render(
        <TokenForgeAuthProvider>
          <AuthTestComponent />
        </TokenForgeAuthProvider>
      );

      // Test de la tentative de connexion
      await act(async () => {
        fireEvent.click(screen.getByTestId('login-button'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Status: idle');
      });
    });
  });

  describe('Wallet-Auth Integration', () => {
    it('should synchronize wallet state with authentication', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        getIdToken: vi.fn().mockResolvedValue('mock-token')
      };

      // Setup initial avec utilisateur connecté
      (firebaseAuth.signInWithEmailAndPassword as any).mockResolvedValue({ user: mockUser });
      
      render(
        <TokenForgeAuthProvider>
          <AuthTestComponent />
        </TokenForgeAuthProvider>
      );

      // Connexion utilisateur
      await act(async () => {
        fireEvent.click(screen.getByTestId('login-button'));
      });

      // Simulation de la connexion wallet
      await act(async () => {
        (useAccount as any).mockReturnValue({
          address: '0x123' as `0x${string}`,
          isConnected: true
        });
      });

      await waitFor(() => {
        expect(screen.getByTestId('wallet-status')).toHaveTextContent('Wallet: Connected');
      });

      // Simulation de la déconnexion wallet
      await act(async () => {
        (useAccount as any).mockReturnValue({
          address: null,
          isConnected: false
        });
      });

      await waitFor(() => {
        expect(screen.getByTestId('wallet-status')).toHaveTextContent('Wallet: Disconnected');
      });
    });
  });
});
