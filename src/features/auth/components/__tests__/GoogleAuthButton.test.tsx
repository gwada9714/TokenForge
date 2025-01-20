import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GoogleAuthButton } from '../GoogleAuthButton';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';
import type { AuthSession } from '../../services/firebaseAuth';

// Mock du hook useFirebaseAuth
jest.mock('../../hooks/useFirebaseAuth');
const mockUseFirebaseAuth = useFirebaseAuth as jest.MockedFunction<typeof useFirebaseAuth>;

// Mock des valeurs par défaut pour useFirebaseAuth
const defaultMockValues = {
  signInWithWallet: jest.fn(),
  signOut: jest.fn(),
  sendVerificationEmail: jest.fn(),
  refreshSession: jest.fn(),
  error: null,
};

describe('GoogleAuthButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche le bouton quand non connecté', () => {
    mockUseFirebaseAuth.mockReturnValue({
      ...defaultMockValues,
      session: null,
      isLoading: false,
      signInWithGoogle: jest.fn(),
    });

    render(<GoogleAuthButton />);
    
    const button = screen.getByTestId('mui-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Continue with Google');
    expect(button.className).toContain('styled-component');
  });

  it('masque le bouton quand connecté', () => {
    const mockSession: AuthSession = {
      uid: '123',
      emailVerified: true,
      email: 'test@example.com',
      provider: 'google',
    };

    mockUseFirebaseAuth.mockReturnValue({
      ...defaultMockValues,
      session: mockSession,
      isLoading: false,
      signInWithGoogle: jest.fn(),
    });

    const { container } = render(<GoogleAuthButton />);
    expect(container).toBeEmptyDOMElement();
  });

  it('désactive le bouton pendant le chargement', () => {
    mockUseFirebaseAuth.mockReturnValue({
      ...defaultMockValues,
      session: null,
      isLoading: true,
      signInWithGoogle: jest.fn(),
    });

    render(<GoogleAuthButton />);
    
    const button = screen.getByTestId('mui-button');
    const progress = screen.getByTestId('mui-progress');

    expect(button).toBeDisabled();
    expect(progress).toBeInTheDocument();
    expect(progress.className).toContain('MuiCircularProgress-root');
  });

  it('appelle signInWithGoogle au clic', async () => {
    const mockSignIn = jest.fn().mockResolvedValue({
      uid: '123',
      emailVerified: true,
      email: 'test@example.com',
      provider: 'google',
    });

    mockUseFirebaseAuth.mockReturnValue({
      ...defaultMockValues,
      session: null,
      isLoading: false,
      signInWithGoogle: mockSignIn,
    });

    render(<GoogleAuthButton />);
    
    const button = screen.getByTestId('mui-button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
  });

  it('applique les props de style correctement', () => {
    mockUseFirebaseAuth.mockReturnValue({
      ...defaultMockValues,
      session: null,
      isLoading: false,
      signInWithGoogle: jest.fn(),
    });

    render(
      <GoogleAuthButton 
        variant="contained"
        size="small"
        fullWidth
      />
    );
    
    const button = screen.getByTestId('mui-button');
    const className = button.className;

    // Vérifie que toutes les classes sont présentes
    expect(className).toContain('MuiButton-root');
    expect(className).toContain('MuiButton-contained');
    expect(className).toContain('MuiButton-sizeSmall');
    expect(className).toContain('MuiButton-fullWidth');
    expect(className).toContain('styled-component');
  });

  it('gère les erreurs de connexion silencieusement', async () => {
    const mockSignIn = jest.fn().mockRejectedValue(new Error('Test error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    mockUseFirebaseAuth.mockReturnValue({
      ...defaultMockValues,
      session: null,
      isLoading: false,
      signInWithGoogle: mockSignIn,
    });

    render(<GoogleAuthButton />);
    
    const button = screen.getByTestId('mui-button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to sign in with Google:',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });
});
