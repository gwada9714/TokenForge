import React from "react";
import { Box, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

export const TokenPreviewPage: React.FC = () => {
  const { tokenId } = useParams();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Aperçu du Token
      </Typography>
      <Typography>Token ID: {tokenId}</Typography>
      {/* Add token preview content here */}
    </Box>
  );
};
