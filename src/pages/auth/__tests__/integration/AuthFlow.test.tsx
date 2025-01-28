import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TokenForgeAuthProvider } from '../../../../features/auth';
import LoginPage from '../../LoginPage';
import { SignUpPage } from '../../SignUpPage';
import { ConnectWalletPage } from '../../ConnectWalletPage';
import { WrongNetworkPage } from '../../WrongNetworkPage';
import { UnauthorizedPage } from '../../UnauthorizedPage';

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
}));

// Mock RainbowKit
vi.mock('@rainbow-me/rainbowkit', () => ({
  ConnectButton: () => <button>Connect Wallet</button>,
}));

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Authentication Flow', () => {
  const renderAuthFlow = () => {
    render(
      <BrowserRouter>
        <TokenForgeAuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/connect-wallet" element={<ConnectWalletPage />} />
            <Route path="/wrong-network" element={<WrongNetworkPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
          </Routes>
        </TokenForgeAuthProvider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows navigation between login and signup pages', () => {
    renderAuthFlow();
    
    // Start at login page
    expect(screen.getByText('Sign In')).toBeTruthy();
    
    // Navigate to signup
    const signUpLink = screen.getByText(/don't have an account\?/i);
    fireEvent.click(signUpLink);
    
    // Should navigate to signup page
    expect(mockNavigate).toHaveBeenCalledWith('/signup');
  });

  it('shows wallet connection flow after login', async () => {
    const mockSignIn = vi.fn().mockResolvedValue({});
    (require('firebase/auth') as any).signInWithEmailAndPassword.mockImplementation(mockSignIn);
    
    renderAuthFlow();
    
    // Fill and submit login form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.submit(screen.getByRole('form'));
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      );
    });
  });

  it('shows error message on login failure', async () => {
    const mockError = { code: 'auth/wrong-password', message: 'Invalid password' };
    (require('firebase/auth') as any).signInWithEmailAndPassword.mockRejectedValue(mockError);
    
    renderAuthFlow();
    
    // Fill and submit login form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.submit(screen.getByRole('form'));
    
    await waitFor(() => {
      expect(screen.getByText('Invalid password')).toBeTruthy();
    });
  });
});
