import React from "react";
import { CircularProgress, Box } from "@mui/material";
import { Toaster } from "react-hot-toast";

interface GlobalFeedbackProps {
  loading?: boolean;
  loadingMessage?: string;
}

export const GlobalFeedback: React.FC<GlobalFeedbackProps> = ({
  loading = false,
  loadingMessage = "Chargement en cours...",
}) => {
  return (
    <>
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#333",
            color: "#fff",
          },
          success: {
            iconTheme: {
              primary: "#4caf50",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#f44336",
              secondary: "#fff",
            },
          },
        }}
      />

      {/* Loading overlay */}
      {loading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9999,
          }}
        >
          <CircularProgress size={60} sx={{ color: "white" }} />
          {loadingMessage && (
            <Box
              sx={{
                color: "white",
                mt: 2,
                textAlign: "center",
                maxWidth: "80%",
                typography: "body1",
              }}
            >
              {loadingMessage}
            </Box>
          )}
        </Box>
      )}
    </>
  );
};

export default GlobalFeedback;
