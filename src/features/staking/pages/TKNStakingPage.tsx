import React from 'react';
import { Container, Typography, Box, Breadcrumbs, Link, Paper, Alert } from '@mui/material';
import { TKNStakingPanel } from '../components/TKNStakingPanel';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const TKNStakingPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link color="inherit" href="/">
          Accueil
        </Link>
        <Link color="inherit" href="/staking">
          Staking
        </Link>
        <Typography color="text.primary">$TKN Staking</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Staking de $TKN
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Stakez vos tokens $TKN pour obtenir des réductions sur les frais de la plateforme et gagner des récompenses.
        </Typography>
        
        <Paper sx={{ p: 3, mb: 4 }}>
          <Alert severity="info" sx={{ mb: 0 }}>
            <Typography variant="body1">
              <strong>Avantages du staking $TKN:</strong>
            </Typography>
            <ul>
              <li>Réductions sur les frais de déploiement et de service</li>
              <li>Récompenses en $TKN proportionnelles à votre mise et à la durée</li>
              <li>Accès prioritaire aux nouvelles fonctionnalités</li>
              <li>Participation à la gouvernance de la plateforme (à venir)</li>
            </ul>
          </Alert>
        </Paper>
      </Box>

      <TKNStakingPanel />
    </Container>
  );
};

export default TKNStakingPage;
