import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import authReducer from '../../store/authSlice';
import { TokenForgeAuthProvider } from '../../providers/TokenForgeAuthProvider';
import { LoginPage } from '../../pages/LoginPage';
import { ConnectWalletPage } from '../../pages/ConnectWalletPage';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { createPublicClient, createWalletClient } from 'viem';

// Mock Firebase
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  onAuthStateChanged: vi.fn()
}));

// Mock Viem
vi.mock('viem', () => ({
  createPublicClient: vi.fn(),
  createWalletClient: vi.fn(),
  http: vi.fn()
}));

describe('Authentication Flow Integration', () => {
  let mockStore: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockStore = configureStore({
      reducer: {
        auth: authReducer
      }
    });

    // Setup Firebase mocks
    vi.mocked(getAuth).mockReturnValue({
      currentUser: null,
      onAuthStateChanged: vi.fn()
    } as any);

    vi.mocked(signInWithEmailAndPassword).mockResolvedValue({
      user: {
        uid: 'test-uid',
        email: 'test@example.com',
        emailVerified: true
      }
    } as any);

    // Setup Viem mocks
    vi.mocked(createPublicClient).mockReturnValue({
      chain: { id: 1, name: 'Ethereum' },
      request: vi.fn()
    } as any);

    vi.mocked(createWalletClient).mockReturnValue({
      account: {
        address: '0x1234...',
        type: 'json-rpc'
      },
      chain: { id: 1, name: 'Ethereum' },
      request: vi.fn()
    } as any);
  });

  const renderWithProviders = (component: React.ReactNode) => {
    return render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <TokenForgeAuthProvider>
            {component}
          </TokenForgeAuthProvider>
        </BrowserRouter>
      </Provider>
    );
  };

  describe('Email Authentication Flow', () => {
    it('completes the email login flow successfully', async () => {
      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
          expect.any(Object),
          'test@example.com',
          'password123'
        );
      });

      // Verify redirect or success state
      await waitFor(() => {
        expect(screen.getByText(/welcome/i)).toBeInTheDocument();
      });
    });

    it('displays error messages for invalid credentials', async () => {
      const mockError = new Error('Invalid credentials');
      vi.mocked(signInWithEmailAndPassword).mockRejectedValueOnce(mockError);

      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });

      await userEvent.type(emailInput, 'wrong@example.com');
      await userEvent.type(passwordInput, 'wrongpass');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });
  });

  describe('Wallet Connection Flow', () => {
    it('connects wallet successfully', async () => {
      renderWithProviders(<ConnectWalletPage />);

      const connectButton = screen.getByRole('button', { name: /connect wallet/i });
      fireEvent.click(connectButton);

      await waitFor(() => {
        expect(createWalletClient).toHaveBeenCalled();
      });

      // Verify wallet connected state
      await waitFor(() => {
        expect(screen.getByText(/0x1234.../i)).toBeInTheDocument();
      });
    });

    it('handles wallet connection errors', async () => {
      const mockError = new Error('Wallet connection failed');
      vi.mocked(createWalletClient).mockRejectedValueOnce(mockError);

      renderWithProviders(<ConnectWalletPage />);

      const connectButton = screen.getByRole('button', { name: /connect wallet/i });
      fireEvent.click(connectButton);

      await waitFor(() => {
        expect(screen.getByText(/wallet connection failed/i)).toBeInTheDocument();
      });
    });

    it('detects network changes', async () => {
      renderWithProviders(<ConnectWalletPage />);

      const connectButton = screen.getByRole('button', { name: /connect wallet/i });
      fireEvent.click(connectButton);

      await waitFor(() => {
        expect(createWalletClient).toHaveBeenCalled();
      });

      // Simulate network change
      window.dispatchEvent(new Event('chainChanged'));

      await waitFor(() => {
        expect(screen.getByText(/network changed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Combined Authentication Flow', () => {
    it('maintains authentication state between email and wallet connection', async () => {
      renderWithProviders(
        <>
          <LoginPage />
          <ConnectWalletPage />
        </>
      );

      // First login with email
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(signInWithEmailAndPassword).toHaveBeenCalled();
      });

      // Then connect wallet
      const connectButton = screen.getByRole('button', { name: /connect wallet/i });
      fireEvent.click(connectButton);

      await waitFor(() => {
        expect(createWalletClient).toHaveBeenCalled();
      });

      // Verify both states are maintained
      expect(screen.getByText(/welcome/i)).toBeInTheDocument();
      expect(screen.getByText(/0x1234.../i)).toBeInTheDocument();
    });

    it('handles session persistence', async () => {
      // First render and login
      const { unmount } = renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(signInWithEmailAndPassword).toHaveBeenCalled();
      });

      // Unmount and remount to simulate page refresh
      unmount();

      renderWithProviders(<LoginPage />);

      // Verify authentication state is preserved
      await waitFor(() => {
        expect(screen.getByText(/welcome/i)).toBeInTheDocument();
      });
    });
  });
});
