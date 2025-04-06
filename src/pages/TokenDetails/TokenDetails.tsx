import React from "react";
import { useParams } from "react-router-dom";
import { Typography } from "@mui/material";

export const TokenDetails: React.FC = () => {
  const { address } = useParams<{ address: string }>();

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Détails du Token
      </Typography>
      <Typography>Adresse: {address}</Typography>
    </div>
  );
};
