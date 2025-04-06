import React from "react";
import { Container, Typography, Paper, Box } from "@mui/material";

export const DocumentationPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Documentation
      </Typography>
      <Paper elevation={1}>
        <Box p={3}>
          <Typography variant="h5" gutterBottom>
            Guide d'utilisation
          </Typography>
          <Typography paragraph>
            Bienvenue dans la documentation de TokenForge. Ici, vous trouverez
            toutes les informations nécessaires pour utiliser notre plateforme.
          </Typography>
          {/* Contenu de la documentation à implémenter */}
        </Box>
      </Paper>
    </Container>
  );
};
