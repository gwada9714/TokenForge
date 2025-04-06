import React, { useState } from "react";
import {
  Alert,
  AlertTitle,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
} from "@mui/material";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";

interface EmailVerificationProps {
  open: boolean;
  onClose: () => void;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({
  open,
  onClose,
}) => {
  const { session, sendVerificationEmail } = useFirebaseAuth();
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleSendVerification = async () => {
    if (!session?.email) return;

    setIsSending(true);
    setError(null);
    setEmailSent(false);

    try {
      await sendVerificationEmail();
      setEmailSent(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to send verification email")
      );
    } finally {
      setIsSending(false);
    }
  };

  if (!session || !session.email || session.emailVerified) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Email Verification Required</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            Please verify your email address to access all features:
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {session.email}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            <AlertTitle>Error</AlertTitle>
            {error.message}
          </Alert>
        )}

        {emailSent && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            onClose={() => setEmailSent(false)}
          >
            <AlertTitle>Success</AlertTitle>
            Verification email sent successfully. Please check your inbox.
          </Alert>
        )}

        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          If you don't receive the email within a few minutes, check your spam
          folder or request a new verification email.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Later
        </Button>
        <Button
          onClick={handleSendVerification}
          variant="contained"
          color="primary"
          disabled={isSending}
        >
          {isSending
            ? "Sending..."
            : emailSent
            ? "Resend Email"
            : "Send Verification Email"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
