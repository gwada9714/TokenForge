import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../components/LoginForm';
import { AUTH_ERROR_CODES, createAuthError } from '../errors/AuthError';

describe('LoginForm Unit Tests', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all form elements', () => {
      render(<LoginForm onSubmit={mockOnSubmit} />);
      
      expect(screen.getByLabelText(/email/i)).toBeDefined();
      expect(screen.getByLabelText(/password/i)).toBeDefined();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeDefined();
    });

    it('should show loading state when isLoading is true', () => {
      render(<LoginForm onSubmit={mockOnSubmit} isLoading={true} />);
      
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
      expect(screen.getByLabelText(/email/i)).toBeDisabled();
      expect(screen.getByLabelText(/password/i)).toBeDisabled();
    });

    it('should display error message when error prop is provided', () => {
      const error = createAuthError(
        AUTH_ERROR_CODES.FIREBASE_ERROR,
        'Invalid credentials'
      );
      
      render(<LoginForm onSubmit={mockOnSubmit} error={error} />);
      
      expect(screen.getByText(error.message)).toBeDefined();
    });
  });

  describe('Form Validation', () => {
    it('should show email validation error for invalid email', async () => {
      const user = userEvent.setup({ delay: null });
      render(<LoginForm onSubmit={mockOnSubmit} />);
      
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid-email');
      fireEvent.blur(emailInput);

      expect(screen.getByText(/invalid email address/i)).toBeDefined();
    });

    it('should show password validation error for short password', async () => {
      const user = userEvent.setup({ delay: null });
      render(<LoginForm onSubmit={mockOnSubmit} />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(passwordInput, '12345');
      fireEvent.blur(passwordInput);

      expect(screen.getByText(/password must be at least 6 characters/i)).toBeDefined();
    });

    it('should not call onSubmit if form is invalid', async () => {
      const user = userEvent.setup({ delay: null });
      render(<LoginForm onSubmit={mockOnSubmit} />);
      
      await user.type(screen.getByLabelText(/email/i), 'invalid-email');
      await user.type(screen.getByLabelText(/password/i), '12345');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with email and password when form is valid', async () => {
      const user = userEvent.setup({ delay: null });
      render(<LoginForm onSubmit={mockOnSubmit} />);
      
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(mockOnSubmit).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('should toggle password visibility', async () => {
      const user = userEvent.setup({ delay: null });
      render(<LoginForm onSubmit={mockOnSubmit} />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      const toggleButton = screen.getByRole('button', { name: /show password/i });

      expect(passwordInput).toHaveAttribute('type', 'password');
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });
});
