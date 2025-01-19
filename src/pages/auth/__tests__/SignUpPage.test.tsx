import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SignUpPage } from '../SignUpPage';
import { TokenForgeAuthProvider } from '../../../features/auth';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: { from: { pathname: '/dashboard' } } }),
}));

describe('SignUpPage', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <TokenForgeAuthProvider>
          <SignUpPage />
        </TokenForgeAuthProvider>
      </BrowserRouter>
    );
  });

  it('renders signup form', () => {
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('has sign in link', () => {
    const signInLink = screen.getByText(/already have an account\?/i);
    expect(signInLink).toBeInTheDocument();
    expect(signInLink.closest('a')).toHaveAttribute('href', '/login');
  });
});
