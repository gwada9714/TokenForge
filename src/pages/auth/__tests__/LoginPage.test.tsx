import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';
import { TokenForgeAuthProvider } from '../../../features/auth';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: { from: { pathname: '/dashboard' } } }),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <TokenForgeAuthProvider>
          <LoginPage />
        </TokenForgeAuthProvider>
      </BrowserRouter>
    );
  });

  it('renders login form', () => {
    expect(screen.getByText('Sign In')).toBeTruthy();
    expect(screen.getByLabelText(/email/i)).toBeTruthy();
    expect(screen.getByLabelText(/password/i)).toBeTruthy();
  });

  it('has sign up link', () => {
    const signUpLink = screen.getByText(/don't have an account\?/i);
    expect(signUpLink).toBeTruthy();
    expect(signUpLink.closest('a')).toHaveAttribute('href', '/signup');
  });
});
