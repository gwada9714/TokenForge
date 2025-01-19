import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from '../LoginPage';
import { TokenForgeAuthProvider } from '../../../features/auth';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
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
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('has sign up link', () => {
    const signUpLink = screen.getByText(/don't have an account\?/i);
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink.closest('a')).toHaveAttribute('href', '/signup');
  });
});
