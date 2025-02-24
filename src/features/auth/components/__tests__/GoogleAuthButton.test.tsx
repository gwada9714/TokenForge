import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GoogleAuthButton } from '../GoogleAuthButton';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';
import type { AuthSession } from '../../services/firebaseAuth';

// Mock du hook useFirebaseAuth
vi.mock('../../hooks/useFirebaseAuth');
const mockUseFirebaseAuth = useFirebaseAuth as vi.MockedFunction<typeof useFirebaseAuth>;

// Mock des valeurs par défaut pour useFirebaseAuth
const defaultMockValues = {
  signInWithWallet: vi.fn(),
  signOut: vi.fn(),
  sendVerificationEmail: vi.fn(),
  refreshSession: vi.fn(),
  error: null,
};

describe('GoogleAuthButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche le bouton quand non connecté', () => {
    mockUseFirebaseAuth.mockReturnValue({
      ...defaultMockValues,
      session: null,
      isLoading: false,
      signInWithGoogle: vi.fn(),
    });

    render(<GoogleAuthButton />);
    
    const button = screen.getByTestId('mui-button');
    expect(button).toBeTruthy();
    expect(button.textContent).toBe('Continue with Google');
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
      signInWithGoogle: vi.fn(),
    });

    const { container } = render(<GoogleAuthButton />);
    expect(container).toBeEmptyDOMElement();
  });

  it('désactive le bouton pendant le chargement', () => {
    mockUseFirebaseAuth.mockReturnValue({
      ...defaultMockValues,
      session: null,
      isLoading: true,
      signInWithGoogle: vi.fn(),
    });

    render(<GoogleAuthButton />);
    
    const button = screen.getByTestId('mui-button');
    const progress = screen.getByTestId('mui-progress');

    expect(button).toBeDisabled();
    expect(progress).toBeTruthy();
    expect(progress.className).toContain('MuiCircularProgress-root');
  });

  it('appelle signInWithGoogle au clic', async () => {
    const mockSignIn = vi.fn().mockResolvedValue({
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
      signInWithGoogle: vi.fn(),
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
    const mockSignIn = vi.fn().mockRejectedValue(new Error('Test error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation();

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
