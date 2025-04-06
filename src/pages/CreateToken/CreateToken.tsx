import React from "react";
import { Typography, Container } from "@mui/material";
import { CreateTokenForm } from "./CreateTokenForm";

export const CreateToken: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
        Créer un Token
      </Typography>
      <CreateTokenForm />
    </Container>
  );
};
