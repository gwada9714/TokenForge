import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from '../LoginPage';
import { useTokenForgeAuth } from '../../../features/auth/hooks/useTokenForgeAuth';
import { useNavigate } from 'react-router-dom';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}));

vi.mock('../../../features/auth/hooks/useTokenForgeAuth', () => ({
  useTokenForgeAuth: vi.fn()
}));

describe('LoginPage', () => {
  const mockNavigate = vi.fn();
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useTokenForgeAuth).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null
    });
  });

  it('renders login form correctly', () => {
    render(<LoginPage />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('handles form submission correctly', async () => {
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('shows loading state when isLoading is true', () => {
    vi.mocked(useTokenForgeAuth).mockReturnValue({
      login: mockLogin,
      isLoading: true,
      error: null
    });

    render(<LoginPage />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeDisabled();
  });

  it('displays error message when login fails', () => {
    const errorMessage = 'Invalid credentials';
    vi.mocked(useTokenForgeAuth).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: new Error(errorMessage)
    });

    render(<LoginPage />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('navigates to dashboard after successful login', async () => {
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});
