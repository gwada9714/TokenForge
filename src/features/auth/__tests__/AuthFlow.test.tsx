import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TokenForgeAuthProvider } from '../context';
import { LoginPage } from '../../../pages/auth/LoginPage';
import { SignUpPage } from '../../../pages/auth/SignUpPage';
import { ConnectWalletPage } from '../../../pages/auth/ConnectWalletPage';
import { WrongNetworkPage } from '../../../pages/auth/WrongNetworkPage';

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

// Mock Wagmi
jest.mock('wagmi', () => ({
  useAccount: jest.fn(),
  useConnect: jest.fn(),
  useNetwork: jest.fn(),
  useSwitchNetwork: jest.fn(),
}));

describe('Authentication Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithProvider = (Component: React.ComponentType) => {
    return render(
      <MemoryRouter>
        <TokenForgeAuthProvider>
          <Component />
        </TokenForgeAuthProvider>
      </MemoryRouter>
    );
  };

  describe('Email/Password Authentication', () => {
    it('allows user to sign in with valid credentials', async () => {
      const mockSignIn = jest.fn().mockResolvedValue({
        user: { email: 'user@example.com' },
      });
      (require('firebase/auth') as any).signInWithEmailAndPassword.mockImplementation(mockSignIn);

      renderWithProvider(LoginPage);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'user@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/mot de passe/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByText(/se connecter/i));

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith(
          expect.anything(),
          'user@example.com',
          'password123'
        );
      });
    });

    it('shows error message with invalid credentials', async () => {
      const mockSignIn = jest.fn().mockRejectedValue(new Error('Invalid credentials'));
      (require('firebase/auth') as any).signInWithEmailAndPassword.mockImplementation(mockSignIn);

      renderWithProvider(LoginPage);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'invalid@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/mot de passe/i), {
        target: { value: 'wrongpass' },
      });
      fireEvent.click(screen.getByText(/se connecter/i));

      await waitFor(() => {
        expect(screen.getByText(/identifiants invalides/i)).toBeInTheDocument();
      });
    });
  });

  describe('Wallet Connection Flow', () => {
    it('allows connecting wallet when MetaMask is available', async () => {
      const mockConnect = jest.fn().mockResolvedValue({});
      (require('wagmi') as any).useConnect.mockReturnValue({
        connect: mockConnect,
        connectors: [{ name: 'MetaMask', ready: true }],
      });

      renderWithProvider(ConnectWalletPage);

      fireEvent.click(screen.getByText(/connecter avec metamask/i));

      await waitFor(() => {
        expect(mockConnect).toHaveBeenCalled();
      });
    });

    it('shows network switch prompt when on wrong network', async () => {
      const mockSwitchNetwork = jest.fn();
      (require('wagmi') as any).useNetwork.mockReturnValue({
        chain: { id: 97 }, // Wrong network
      });
      (require('wagmi') as any).useSwitchNetwork.mockReturnValue({
        switchNetwork: mockSwitchNetwork,
      });

      renderWithProvider(WrongNetworkPage);

      fireEvent.click(screen.getByText(/changer de réseau/i));

      expect(mockSwitchNetwork).toHaveBeenCalledWith(56); // BSC Mainnet
    });
  });

  describe('Registration Flow', () => {
    it('allows user to create account with valid information', async () => {
      const mockSignUp = jest.fn().mockResolvedValue({
        user: { email: 'newuser@example.com' },
      });
      (require('firebase/auth') as any).createUserWithEmailAndPassword.mockImplementation(mockSignUp);

      renderWithProvider(SignUpPage);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'newuser@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/mot de passe/i), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText(/confirmer le mot de passe/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByText(/créer un compte/i));

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith(
          expect.anything(),
          'newuser@example.com',
          'password123'
        );
      });
    });

    it('shows error for password mismatch', async () => {
      renderWithProvider(SignUpPage);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'newuser@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/mot de passe/i), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText(/confirmer le mot de passe/i), {
        target: { value: 'differentpass' },
      });
      fireEvent.click(screen.getByText(/créer un compte/i));

      expect(screen.getByText(/les mots de passe ne correspondent pas/i)).toBeInTheDocument();
    });
  });
});
