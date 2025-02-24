import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import { FirebaseError } from 'firebase/app';
import authReducer from '../../store/authSlice';
import { TokenForgeAuthProvider } from '../../providers/TokenForgeAuthProvider';
import { LoginPage } from '../../pages/LoginPage';
import { RegisterPage } from '../../pages/RegisterPage';
import { ProfilePage } from '../../pages/ProfilePage';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { ErrorService } from '../../services/errorService';
import { AuthErrorCode } from '../../errors/AuthError';

// Mock Firebase
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  sendEmailVerification: vi.fn(),
  onAuthStateChanged: vi.fn()
}));

// Mock Sentry
vi.mock('@sentry/react', () => ({
  captureException: vi.fn(),
  setUser: vi.fn()
}));

describe('Authentication Flow Integration', () => {
  let mockStore: any;
  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    emailVerified: true
  };

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

    vi.mocked(signInWithEmailAndPassword).mockResolvedValue({ user: mockUser } as any);
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({ user: mockUser } as any);
    vi.mocked(sendEmailVerification).mockResolvedValue();
  });

  afterEach(() => {
    vi.clearAllMocks();
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
      const passwordInput = screen.getByLabelText(/mot de passe/i);
      const submitButton = screen.getByRole('button', { name: /connexion/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          'test@example.com',
          'password123'
        );
      });
    });

    it('handles unverified email error correctly', async () => {
      const unverifiedUser = { ...mockUser, emailVerified: false };
      vi.mocked(signInWithEmailAndPassword).mockResolvedValueOnce({ user: unverifiedUser } as any);

      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/mot de passe/i);
      const submitButton = screen.getByRole('button', { name: /connexion/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(sendEmailVerification).toHaveBeenCalled();
        expect(screen.getByText(/veuillez vérifier votre email/i)).toBeInTheDocument();
      });
    });

    it('handles network errors with retry mechanism', async () => {
      const networkError = new FirebaseError('auth/network-request-failed', 'Network error');
      vi.mocked(signInWithEmailAndPassword)
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce({ user: mockUser } as any);

      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/mot de passe/i);
      const submitButton = screen.getByRole('button', { name: /connexion/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(signInWithEmailAndPassword).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('Registration Flow', () => {
    it('completes the registration flow successfully', async () => {
      renderWithProviders(<RegisterPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/mot de passe/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmer le mot de passe/i);
      const submitButton = screen.getByRole('button', { name: /créer un compte/i });

      await userEvent.type(emailInput, 'new@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(confirmPasswordInput, 'password123');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          'new@example.com',
          'password123'
        );
        expect(sendEmailVerification).toHaveBeenCalled();
      });
    });

    it('validates password strength requirements', async () => {
      renderWithProviders(<RegisterPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/mot de passe/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmer le mot de passe/i);
      const submitButton = screen.getByRole('button', { name: /créer un compte/i });

      await userEvent.type(emailInput, 'new@example.com');
      await userEvent.type(passwordInput, 'weak');
      await userEvent.type(confirmPasswordInput, 'weak');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/mot de passe doit contenir au moins 6 caractères/i)).toBeInTheDocument();
      });
    });
  });

  describe('Protected Routes', () => {
    it('redirects to login when accessing protected route without authentication', async () => {
      renderWithProviders(<ProfilePage />);

      await waitFor(() => {
        expect(window.location.pathname).toBe('/login');
      });
    });

    it('allows access to protected route when authenticated', async () => {
      vi.mocked(getAuth).mockReturnValue({
        currentUser: mockUser,
        onAuthStateChanged: vi.fn()
      } as any);

      renderWithProviders(<ProfilePage />);

      await waitFor(() => {
        expect(window.location.pathname).not.toBe('/login');
      });
    });
  });
});
