import React, { Suspense } from "react";
import { Container, Box, Typography, Paper, Button, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  LockOpen as LockOpenIcon,
  Token as TokenIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import { ContentSkeleton } from "../components/common/loading/ContentSkeleton";
import { RealTimeMetrics } from "../components/features/analytics/RealTimeMetrics";
import { SecuritySection } from "../components/features/security/SecuritySection";

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/create");
  };

  return (
    <Box>
      {/* Hero Section avec Skeleton */}
      <Suspense fallback={<ContentSkeleton rows={3} height={100} />}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              py: 8,
            }}
          >
            <Typography variant="h3" component="h1" gutterBottom align="center">
              Bienvenue sur TokenForge
            </Typography>

            <Typography
              variant="h5"
              gutterBottom
              align="center"
              color="text.secondary"
            >
              Créez et déployez vos tokens en quelques clics
            </Typography>

            {/* Métriques en temps réel */}
            <Box sx={{ width: "100%", mt: 4 }}>
              <RealTimeMetrics />
            </Box>

            <Grid container spacing={4} sx={{ mt: 4 }}>
              <Grid item xs={12} md={4}>
                <Paper
                  elevation={3}
                  sx={{ p: 3, height: "100%", textAlign: "center" }}
                >
                  <TokenIcon
                    sx={{ fontSize: 40, mb: 2, color: "primary.main" }}
                  />
                  <Typography variant="h6" gutterBottom>
                    Création Simple
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Interface intuitive pour créer vos tokens sans code
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper
                  elevation={3}
                  sx={{ p: 3, height: "100%", textAlign: "center" }}
                >
                  <SecurityIcon
                    sx={{ fontSize: 40, mb: 2, color: "primary.main" }}
                  />
                  <Typography variant="h6" gutterBottom>
                    Sécurisé
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Contrats intelligents audités et sécurisés
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper
                  elevation={3}
                  sx={{ p: 3, height: "100%", textAlign: "center" }}
                >
                  <LockOpenIcon
                    sx={{ fontSize: 40, mb: 2, color: "primary.main" }}
                  />
                  <Typography variant="h6" gutterBottom>
                    Transparent
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Code source vérifié et accessible
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleGetStarted}
              sx={{ mt: 4 }}
            >
              Commencer
            </Button>
          </Box>
        </Container>
      </Suspense>

      {/* Section Sécurité */}
      <SecuritySection />
    </Box>
  );
};

export default Home;
