import React from "react";
import { Alert, Box, Paper, Typography } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

interface NetworkNotSupportedProps {
  message?: string;
}

export const NetworkNotSupported: React.FC<NetworkNotSupportedProps> = ({
  message = "This network is not supported. Please switch to a supported network.",
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        textAlign: "center",
        backgroundColor: "background.default",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box sx={{ mb: 2 }}>
        <ErrorOutlineIcon sx={{ fontSize: 48, color: "warning.main" }} />
      </Box>
      <Typography variant="h6" gutterBottom>
        Network Not Supported
      </Typography>
      <Alert severity="warning" sx={{ mt: 2 }}>
        {message}
      </Alert>
    </Paper>
  );
};
