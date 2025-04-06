import React from "react";
import { Box, Typography, Container } from "@mui/material";

/**
 * Composant de test ultra-simple pour vérifier le rendu sans dépendances
 */
const TestPage: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box
        sx={{
          p: 4,
          border: "1px solid #ccc",
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Page de Test TokenForge
        </Typography>
        <Typography variant="body1" paragraph>
          Cette page confirme que le rendu de base fonctionne correctement.
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Si vous voyez ce contenu, le problème n'est pas lié au rendu de base
          de React.
        </Typography>
      </Box>
    </Container>
  );
};

export default TestPage;
