import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { logger } from '../core/logger';

// Style pour le contenu principal
const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginTop: 64,
  minHeight: 'calc(100vh - 64px)',
  backgroundColor: theme.palette.background.default
}));

/**
 * Layout diagnostic simplifié pour le débogage
 * Ne dépend pas des services d'authentification ni de Firebase
 */
export const DiagnosticLayout: React.FC = () => {
  logger.info({
    category: 'DiagnosticLayout',
    message: 'Affichage du layout diagnostique simplifié'
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* En-tête simplifié */}
      <AppBar position="fixed" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            TokenForge - Mode Diagnostic
          </Typography>
          <Button color="inherit">Accueil</Button>
          <Button color="inherit">Templates</Button>
          <Button color="inherit">À propos</Button>
        </Toolbar>
      </AppBar>

      {/* Contenu principal */}
      <MainContent>
        <Container maxWidth="lg">
          <Suspense fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Typography>Chargement...</Typography>
            </Box>
          }>
            <Outlet />
          </Suspense>
        </Container>
      </MainContent>

      {/* Pied de page simplifié */}
      <Box component="footer" sx={{ py: 3, bgcolor: 'background.paper', mt: 'auto' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            TokenForge © {new Date().getFullYear()} - Mode Diagnostic
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

// Exposer le Layout de diagnostic comme Layout par défaut pour les tests
export { DiagnosticLayout as Layout };
