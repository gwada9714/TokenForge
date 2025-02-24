import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TokenForgeAuthProvider } from '../../../../features/auth';
import { LoginPage } from '../../LoginPage';
import { SignUpPage } from '../../SignUpPage';

vi.mock('../../../../features/auth/hooks/useTokenForgeAuth', () => ({
  useTokenForgeAuth: vi.fn()
}));

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows user to navigate between login and signup pages', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <TokenForgeAuthProvider>
          <LoginPage />
        </TokenForgeAuthProvider>
      </MemoryRouter>
    );

    // Check initial login page
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    
    // Navigate to signup
    const signupLink = screen.getByText(/don't have an account/i);
    fireEvent.click(signupLink);

    // Verify signup page content
    expect(screen.getByText(/create account/i)).toBeInTheDocument();
  });

  it('handles successful login flow', async () => {
    const mockLogin = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useTokenForgeAuth).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null
    });

    render(
      <MemoryRouter>
        <TokenForgeAuthProvider>
          <LoginPage />
        </TokenForgeAuthProvider>
      </MemoryRouter>
    );

    // Fill login form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('handles successful signup flow', async () => {
    const mockSignup = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useTokenForgeAuth).mockReturnValue({
      signup: mockSignup,
      isLoading: false,
      error: null
    });

    render(
      <MemoryRouter>
        <TokenForgeAuthProvider>
          <SignUpPage />
        </TokenForgeAuthProvider>
      </MemoryRouter>
    );

    // Fill signup form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'newuser@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'newpassword123' }
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'newpassword123' }
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith('newuser@example.com', 'newpassword123');
    });
  });

  it('displays error messages on failed authentication', async () => {
    const errorMessage = 'Invalid credentials';
    vi.mocked(useTokenForgeAuth).mockReturnValue({
      login: vi.fn().mockRejectedValue(new Error(errorMessage)),
      isLoading: false,
      error: new Error(errorMessage)
    });

    render(
      <MemoryRouter>
        <TokenForgeAuthProvider>
          <LoginPage />
        </TokenForgeAuthProvider>
      </MemoryRouter>
    );

    // Fill and submit form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' }
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
