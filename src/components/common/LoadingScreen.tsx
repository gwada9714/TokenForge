import { Box, CircularProgress, Typography } from "@mui/material";

const LoadingScreen = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <CircularProgress size={60} thickness={4} />
      <Typography
        variant="h6"
        sx={{
          mt: 2,
          fontWeight: "medium",
          color: "text.secondary",
          textAlign: "center",
        }}
      >
        Chargement...
      </Typography>
    </Box>
  );
};

export default LoadingScreen;
