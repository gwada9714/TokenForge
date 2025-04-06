import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { AuthStatus } from "../../types";
import { messages } from "../../constants/messages";

interface AuthProgressProps {
  status: AuthStatus;
  showText?: boolean;
}

export const AuthProgress: React.FC<AuthProgressProps> = ({
  status,
  showText = true,
}) => {
  const isLoading = status === "loading" || status === "verifying";
  const statusMessage = messages.fr.status[status];

  if (!isLoading) return null;

  return (
    <Box display="flex" alignItems="center" gap={2} py={1}>
      <CircularProgress size={24} color="primary" />
      {showText && (
        <Typography variant="body2" color="text.secondary">
          {statusMessage}
        </Typography>
      )}
    </Box>
  );
};
