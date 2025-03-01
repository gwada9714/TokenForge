import React from 'react';
import { Container, Typography, Box, Breadcrumbs, Link, Paper, Alert } from '@mui/material';
import { LaunchpadForm } from '../components/LaunchpadForm';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const LaunchpadPage: React.FC = () => {
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
        <Link color="inherit" href="/services">
          Services
        </Link>
        <Typography color="text.primary">Launchpad</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Launchpad TokenForge
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Lancez votre token avec succès grâce à notre plateforme de launchpad sécurisée et transparente.
        </Typography>
        
        <Paper sx={{ p: 3, mb: 4 }}>
          <Alert severity="info" sx={{ mb: 0 }}>
            <Typography variant="body1">
              <strong>Avantages du Launchpad TokenForge:</strong>
            </Typography>
            <ul>
              <li>Processus de lancement simplifié et guidé</li>
              <li>Options de vesting personnalisables pour rassurer les investisseurs</li>
              <li>Verrouillage automatique de la liquidité</li>
              <li>Visibilité auprès de notre communauté d'investisseurs</li>
              <li>Support technique et marketing pendant toute la durée de la presale</li>
            </ul>
          </Alert>
        </Paper>
      </Box>

      <LaunchpadForm />
    </Container>
  );
};

export default LaunchpadPage;
