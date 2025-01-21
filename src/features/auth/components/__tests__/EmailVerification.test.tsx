import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmailVerification } from '../EmailVerification';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';

// Mock des dépendances
vi.mock('../../hooks/useFirebaseAuth');

describe('EmailVerification', () => {
  const mockSession = {
    uid: '0x123',
    emailVerified: false,
    email: 'test@tokenforge.eth',
  };

  const mockSendVerificationEmail = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useFirebaseAuth as vi.Mock).mockReturnValue({
      session: mockSession,
      sendVerificationEmail: mockSendVerificationEmail,
    });
  });

  it('should render nothing when no session exists', () => {
    (useFirebaseAuth as vi.Mock).mockReturnValue({
      session: null,
    });

    const { container } = render(
      <EmailVerification open={true} onClose={mockOnClose} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render nothing when email is verified', () => {
    (useFirebaseAuth as vi.Mock).mockReturnValue({
      session: { ...mockSession, emailVerified: true },
    });

    const { container } = render(
      <EmailVerification open={true} onClose={mockOnClose} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render verification dialog when email is not verified', () => {
    render(<EmailVerification open={true} onClose={mockOnClose} />);

    expect(screen.getByText('Email Verification Required')).toBeTruthy();
    expect(screen.getByText(mockSession.email!)).toBeTruthy();
  });

  it('should handle send verification email click', async () => {
    mockSendVerificationEmail.mockResolvedValue(undefined);

    render(<EmailVerification open={true} onClose={mockOnClose} />);

    const sendButton = screen.getByText('Send Verification Email');
    fireEvent.click(sendButton);

    expect(mockSendVerificationEmail).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByText('Verification email sent successfully')).toBeTruthy();
    });
  });

  it('should handle send verification email error', async () => {
    const mockError = new Error('Failed to send email');
    mockSendVerificationEmail.mockRejectedValue(mockError);

    render(<EmailVerification open={true} onClose={mockOnClose} />);

    const sendButton = screen.getByText('Send Verification Email');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to send verification email')).toBeTruthy();
    });
  });

  it('should handle close button click', () => {
    render(<EmailVerification open={true} onClose={mockOnClose} />);

    const laterButton = screen.getByText('Later');
    fireEvent.click(laterButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should show loading state while sending email', async () => {
    mockSendVerificationEmail.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<EmailVerification open={true} onClose={mockOnClose} />);

    const sendButton = screen.getByText('Send Verification Email');
    fireEvent.click(sendButton);

    expect(screen.getByText('Sending...')).toBeTruthy();
    expect(sendButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText('Resend Email')).toBeTruthy();
      expect(sendButton).not.toBeDisabled();
    });
  });

  it('should allow resending email after success', async () => {
    mockSendVerificationEmail.mockResolvedValue(undefined);

    render(<EmailVerification open={true} onClose={mockOnClose} />);

    const sendButton = screen.getByText('Send Verification Email');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Resend Email')).toBeTruthy();
    });

    // Tenter de renvoyer l'email
    fireEvent.click(screen.getByText('Resend Email'));
    expect(mockSendVerificationEmail).toHaveBeenCalledTimes(2);
  });
});
