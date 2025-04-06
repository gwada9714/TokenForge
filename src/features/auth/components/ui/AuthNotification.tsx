import React, { useEffect } from "react";
import { Alert, Snackbar, AlertColor } from "@mui/material";
import { AuthStatus } from "../../types";
import { authMessages } from "../../locales/fr";

interface AuthNotificationProps {
  status: AuthStatus;
  message?: string;
  severity?: AlertColor;
  isOpen: boolean;
  onClose: () => void;
  autoHideDuration?: number;
}

export const AuthNotification: React.FC<AuthNotificationProps> = ({
  status,
  message,
  severity = "info",
  isOpen,
  onClose,
  autoHideDuration = 6000,
}) => {
  // Effet pour gérer les changements de statut automatiquement
  useEffect(() => {
    if (status === "authenticated") {
      severity = "success";
      message = message || authMessages.status.authenticated;
    } else if (status === "error") {
      severity = "error";
      message = message || authMessages.status.error;
    }
  }, [status, message]);

  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};
