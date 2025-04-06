import React from "react";
import { Box, Typography } from "@mui/material";

export const TokenCreationPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Créer un Token
      </Typography>
      {/* Add token creation form here */}
    </Box>
  );
};
