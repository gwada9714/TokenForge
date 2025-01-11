import React, { Suspense } from "react";
import { Box, Button, Container, Typography, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";

// Lazy loading des composants lourds
const TokenStats = React.lazy(() => import("../components/Stats/TokenStats"));
const FeatureList = React.lazy(() => import("../components/Features/FeatureList"));

export const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    try {
      navigate(path);
    } catch (error) {
      console.error("Navigation error:", error);
      // Vous pouvez ajouter ici une notification pour l'utilisateur
    }
  };

  return (
    <Container maxWidth="lg">
      <Grid container spacing={4}>
        {/* Hero Section */}
        <Grid item xs={12}>
          <Box
            sx={{
              pt: { xs: 4, sm: 6, md: 8 },
              pb: { xs: 3, sm: 4, md: 6 },
              textAlign: "center",
            }}
          >
            <Typography
              component="h1"
              variant="h2"
              color="primary"
              gutterBottom
              sx={{ fontWeight: "bold", fontSize: { xs: "2.5rem", sm: "3rem", md: "3.75rem" } }}
            >
              TokenForge
            </Typography>
            <Typography variant="h5" color="text.secondary" paragraph sx={{ mb: 4 }}>
              Créez vos tokens ERC20 en quelques clics. Simple, rapide et sécurisé.
            </Typography>
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => handleNavigation("/create")}
                sx={{ mr: 2, mb: { xs: 2, sm: 0 } }}
                aria-label="Créer un nouveau token"
              >
                Créer un Token
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => handleNavigation("/info")}
                aria-label="En savoir plus sur TokenForge"
              >
                En savoir plus
              </Button>
            </Box>
          </Box>
        </Grid>

        {/* Stats Section */}
        <Grid item xs={12}>
          <Box sx={{ my: { xs: 3, sm: 4, md: 6 } }}>
            <Suspense fallback={<Typography align="center">Chargement des statistiques...</Typography>}>
              <TokenStats />
            </Suspense>
          </Box>
        </Grid>

        {/* Features Section */}
        <Grid item xs={12}>
          <Box sx={{ my: { xs: 3, sm: 4, md: 6 } }}>
            <Typography
              variant="h4"
              component="h2"
              align="center"
              gutterBottom
              sx={{ mb: 4, fontSize: { xs: "1.75rem", sm: "2rem", md: "2.25rem" } }}
            >
              Pourquoi choisir TokenForge ?
            </Typography>
            <Suspense fallback={<Typography align="center">Chargement des fonctionnalités...</Typography>}>
              <FeatureList />
            </Suspense>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;