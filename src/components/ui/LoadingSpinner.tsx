import React from "react";
import { Box, CircularProgress } from "@mui/material";

interface LoadingSpinnerProps {
  size?: number;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  fullScreen = true,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: fullScreen ? "100vh" : "auto",
        background: fullScreen
          ? "linear-gradient(to right, rgba(24, 32, 56, 0.95), rgba(30, 41, 67, 0.95))"
          : "transparent",
      }}
    >
      <CircularProgress
        size={size}
        sx={{
          color: "#D97706",
          "& .MuiCircularProgress-circle": {
            strokeLinecap: "round",
          },
        }}
      />
    </Box>
  );
};
