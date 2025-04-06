import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EmailVerification } from "../EmailVerification";
import { useTokenForgeAuth } from "../../hooks/useTokenForgeAuth";

vi.mock("../../hooks/useTokenForgeAuth", () => ({
  useTokenForgeAuth: vi.fn(),
}));

describe("EmailVerification", () => {
  const mockSendVerificationEmail = vi.fn();
  const mockVerifyEmail = vi.fn();

  beforeEach(() => {
    vi.mocked(useTokenForgeAuth).mockReturnValue({
      sendVerificationEmail: mockSendVerificationEmail,
      verifyEmail: mockVerifyEmail,
      isLoading: false,
      error: null,
    });
  });

  it("renders verification form", () => {
    render(<EmailVerification />);

    expect(screen.getByText(/verify your email/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send verification email/i })
    ).toBeInTheDocument();
  });

  it("sends verification email when button is clicked", async () => {
    render(<EmailVerification />);

    const sendButton = screen.getByRole("button", {
      name: /send verification email/i,
    });
    fireEvent.click(sendButton);

    expect(mockSendVerificationEmail).toHaveBeenCalled();
  });

  it("shows loading state while sending email", () => {
    vi.mocked(useTokenForgeAuth).mockReturnValue({
      sendVerificationEmail: mockSendVerificationEmail,
      verifyEmail: mockVerifyEmail,
      isLoading: true,
      error: null,
    });

    render(<EmailVerification />);

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send verification email/i })
    ).toBeDisabled();
  });

  it("displays error message when sending fails", () => {
    const errorMessage = "Failed to send verification email";
    vi.mocked(useTokenForgeAuth).mockReturnValue({
      sendVerificationEmail: mockSendVerificationEmail,
      verifyEmail: mockVerifyEmail,
      isLoading: false,
      error: new Error(errorMessage),
    });

    render(<EmailVerification />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("shows success message after sending email", async () => {
    mockSendVerificationEmail.mockResolvedValue(undefined);

    render(<EmailVerification />);

    const sendButton = screen.getByRole("button", {
      name: /send verification email/i,
    });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/verification email sent/i)).toBeInTheDocument();
    });
  });

  it("verifies email with code", async () => {
    render(<EmailVerification />);

    const codeInput = screen.getByLabelText(/verification code/i);
    const verifyButton = screen.getByRole("button", { name: /verify/i });

    fireEvent.change(codeInput, { target: { value: "123456" } });
    fireEvent.click(verifyButton);

    expect(mockVerifyEmail).toHaveBeenCalledWith("123456");
  });

  it("shows success message after verification", async () => {
    mockVerifyEmail.mockResolvedValue(undefined);

    render(<EmailVerification />);

    const codeInput = screen.getByLabelText(/verification code/i);
    const verifyButton = screen.getByRole("button", { name: /verify/i });

    fireEvent.change(codeInput, { target: { value: "123456" } });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(
        screen.getByText(/email verified successfully/i)
      ).toBeInTheDocument();
    });
  });

  it("handles verification errors", async () => {
    const errorMessage = "Invalid verification code";
    mockVerifyEmail.mockRejectedValue(new Error(errorMessage));

    render(<EmailVerification />);

    const codeInput = screen.getByLabelText(/verification code/i);
    const verifyButton = screen.getByRole("button", { name: /verify/i });

    fireEvent.change(codeInput, { target: { value: "123456" } });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
