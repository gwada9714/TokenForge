import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TokenForgeAuthProvider, useTokenForgeAuth } from '../TokenForgeAuthContext';

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn((_, callback) => {
    callback(null);
    return jest.fn();
  }),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  updateProfile: jest.fn(),
}));

// Mock Wagmi
jest.mock('wagmi', () => ({
  useAccount: jest.fn(() => ({ address: null, isConnected: false })),
  useConnect: jest.fn(() => ({ connectAsync: jest.fn() })),
  useDisconnect: jest.fn(() => ({ disconnectAsync: jest.fn() })),
}));

// Test Component
const TestComponent = () => {
  const auth = useTokenForgeAuth();
  return (
    <div>
      <div data-testid="status">{auth.status}</div>
      <div data-testid="is-authenticated">{auth.isAuthenticated.toString()}</div>
      <button onClick={() => auth.signIn('test@example.com', 'password')}>
        Sign In
      </button>
      <button onClick={() => auth.connectWallet()}>
        Connect Wallet
      </button>
    </div>
  );
};

describe('TokenForgeAuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides initial auth state', () => {
    render(
      <TokenForgeAuthProvider>
        <TestComponent />
      </TokenForgeAuthProvider>
    );

    expect(screen.getByTestId('status')).toHaveTextContent('idle');
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
  });

  it('handles sign in', async () => {
    const { signInWithEmailAndPassword } = require('firebase/auth');
    
    render(
      <TokenForgeAuthProvider>
        <TestComponent />
      </TokenForgeAuthProvider>
    );

    fireEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password'
      );
    });
  });

  it('handles wallet connection', async () => {
    const { useConnect } = require('wagmi');
    const mockConnectAsync = jest.fn();
    useConnect.mockImplementation(() => ({ connectAsync: mockConnectAsync }));

    render(
      <TokenForgeAuthProvider>
        <TestComponent />
      </TokenForgeAuthProvider>
    );

    fireEvent.click(screen.getByText('Connect Wallet'));

    await waitFor(() => {
      expect(mockConnectAsync).toHaveBeenCalled();
    });
  });

  it('updates auth state on user change', async () => {
    const { onAuthStateChanged } = require('firebase/auth');
    
    onAuthStateChanged.mockImplementation((_, callback) => {
      callback({
        uid: '123',
        email: 'test@tokenforge.com',
        displayName: 'Test User',
        photoURL: null,
        metadata: {
          creationTime: '2023-01-01',
          lastSignInTime: '2023-01-02',
        },
      });
      return jest.fn();
    });

    render(
      <TokenForgeAuthProvider>
        <TestComponent />
      </TokenForgeAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
    });
  });

  it('handles errors gracefully', async () => {
    const { signInWithEmailAndPassword } = require('firebase/auth');
    signInWithEmailAndPassword.mockRejectedValue({
      code: 'auth/wrong-password',
      message: 'Invalid password',
    });

    render(
      <TokenForgeAuthProvider>
        <TestComponent />
      </TokenForgeAuthProvider>
    );

    fireEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated');
    });
  });
});
