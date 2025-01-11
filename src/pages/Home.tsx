import React from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { TokenStats } from "../components/Stats/TokenStats";
import { FeatureList } from "../components/Features/FeatureList";

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container>
      {/* Hero Section */}
      <Box
        sx={{
          pt: 8,
          pb: 6,
          textAlign: "center",
        }}
      >
        <Typography
          component="h1"
          variant="h2"
          color="primary"
          gutterBottom
          sx={{ fontWeight: "bold" }}
        >
          TokenForge
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Créez vos tokens ERC20 en quelques clics. Simple, rapide et sécurisé.
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/create")}
            sx={{ mr: 2 }}
          >
            Créer un Token
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate("/info")}
          >
            En savoir plus
          </Button>
        </Box>
      </Box>

      {/* Stats Section */}
      <Box sx={{ my: 6 }}>
        <TokenStats />
      </Box>

      {/* Features Section */}
      <Box sx={{ my: 6 }}>
        <Typography
          variant="h4"
          component="h2"
          align="center"
          gutterBottom
          sx={{ mb: 4 }}
        >
          Pourquoi choisir TokenForge ?
        </Typography>
        <FeatureList />
      </Box>
    </Container>
  );
};
