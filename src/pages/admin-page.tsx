import React from 'react';
import { Helmet } from 'react-helmet-async';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import { useNavigate } from 'react-router-dom';
import AuthGuard from '../components/AuthGuard';
import { useAuthContext } from '../contexts/AuthContext';

const AdminPage = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuthContext();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth-demo');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <AuthGuard requireAuth={true} requireAdmin={true} fallbackUrl="/auth-demo">
      <Helmet>
        <title>Administration | TokenForge</title>
        <meta name="description" content="Page d'administration nécessitant des privilèges d'administrateur" />
      </Helmet>
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Page d'Administration
          </Typography>
          
          <Paper sx={{ p: 4, mb: 4, bgcolor: 'warning.light' }}>
            <Typography variant="h6" gutterBottom>
              Accès Administrateur
            </Typography>
            <Typography paragraph>
              Cette page est hautement protégée et n&apos;est accessible qu&apos;aux utilisateurs avec des privilèges d&apos;administrateur.
              Si vous voyez ce contenu, cela signifie que vous êtes un administrateur.
            </Typography>
            <Typography paragraph fontWeight="bold">
              Attention: Les actions effectuées ici peuvent avoir des conséquences importantes sur l'application.
            </Typography>
          </Paper>
          
          <Paper sx={{ p: 4, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Informations Administrateur
            </Typography>
            <Typography paragraph>
              Administrateur: {user?.displayName || user?.email || 'Admin Anonyme'}
            </Typography>
            <Box sx={{ backgroundColor: 'rgba(0, 0, 0, 0.05)', p: 2, borderRadius: 1, mb: 3 }}>
              <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
                {JSON.stringify(user, null, 2)}
              </Typography>
            </Box>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Fonctions d'Administration
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button variant="contained" color="error" disabled>
                Réinitialiser la base de données
              </Button>
              <Button variant="contained" color="warning" disabled>
                Gérer les utilisateurs
              </Button>
              <Button variant="contained" color="info" disabled>
                Configurer l&apos;application
              </Button>
            </Box>
          </Paper>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/auth-demo')}
            >
              Retour à la démo
            </Button>
            <Button 
              variant="outlined" 
              color="secondary"
              onClick={handleSignOut}
            >
              Se déconnecter
            </Button>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
            Pour en savoir plus sur la protection des routes et les privilèges administrateur, consultez la{' '}
            <Link href="/docs/auth-hook" color="primary">
              documentation du hook d&apos;authentification
            </Link>.
          </Typography>
        </Box>
      </Container>
    </AuthGuard>
  );
};

export default AdminPage;
