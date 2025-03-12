import React, { useState } from 'react';
import { Button, Card, Typography, Box, Alert, CircularProgress, Divider, Grid, Paper } from '@mui/material';
import { FirestoreSecurityTest } from '@/lib/firebase/test/security-rules-test';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';

/**
 * Composant de test pour vérifier les règles de sécurité Firestore
 */
const FirestoreSecurityTestComponent: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Vérifier l'état d'authentification au chargement du composant
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setUserId(user ? user.uid : null);
    });

    return () => unsubscribe();
  }, []);

  const runTest = async (testName: string, testFunction: () => Promise<any>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await testFunction();
      setResults(prev => ({
        ...prev,
        [testName]: result
      }));
    } catch (err) {
      setError(`Erreur lors de l'exécution du test "${testName}": ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Card sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Tests des règles de sécurité Firestore
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Ce composant permet de tester les règles de sécurité Firestore pour différents types d'utilisateurs et d'opérations.
        </Typography>

        <Paper sx={{ p: 2, mb: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
          <Typography variant="body1">
            État d'authentification actuel: {isAuthenticated ? 'Authentifié' : 'Non authentifié'}
            {userId && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                ID utilisateur: {userId}
              </Typography>
            )}
          </Typography>
        </Paper>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>Tests pour utilisateurs anonymes:</Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Button 
              variant="contained" 
              color="primary"
              fullWidth
              disabled={isLoading}
              onClick={() => runTest('anonymousRead', FirestoreSecurityTest.testAnonymousRead)}
            >
              Tester lecture anonyme
            </Button>
          </Grid>
          <Grid item xs={12} md={6}>
            <Button 
              variant="contained" 
              color="secondary"
              fullWidth
              disabled={isLoading}
              onClick={() => runTest('anonymousCspViolation', FirestoreSecurityTest.testAnonymousCspViolation)}
            >
              Tester création rapports CSP
            </Button>
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom>Tests pour utilisateurs authentifiés:</Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Button 
              variant="contained" 
              color="success"
              fullWidth
              disabled={isLoading || !isAuthenticated}
              onClick={() => runTest('userProfile', FirestoreSecurityTest.testAuthenticatedUserProfile)}
            >
              Tester accès profil
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button 
              variant="contained" 
              color="info"
              fullWidth
              disabled={isLoading || !isAuthenticated}
              onClick={() => runTest('walletAccess', FirestoreSecurityTest.testWalletAccess)}
            >
              Tester accès wallets
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button 
              variant="contained" 
              color="warning"
              fullWidth
              disabled={isLoading || !isAuthenticated}
              onClick={() => runTest('otherUserAccess', FirestoreSecurityTest.testOtherUserAccess)}
            >
              Tester isolation entre utilisateurs
            </Button>
          </Grid>
        </Grid>

        {!isAuthenticated && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Vous devez être authentifié pour exécuter les tests d'utilisateurs authentifiés.
          </Alert>
        )}

        {isLoading && (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        )}

        {Object.entries(results).map(([testName, result]) => (
          <Card key={testName} variant="outlined" sx={{ mb: 2, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Résultat: {testName}
            </Typography>
            
            {result.success ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                Test réussi! {result.message}
              </Alert>
            ) : (
              <Alert severity="error" sx={{ mb: 2 }}>
                Échec du test: {result.message}
              </Alert>
            )}
            
            <Typography variant="body2" component="pre" sx={{ 
              whiteSpace: 'pre-wrap', 
              wordBreak: 'break-word',
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              fontSize: '0.8rem',
              maxHeight: '300px',
              overflow: 'auto'
            }}>
              {JSON.stringify(result.data, null, 2)}
            </Typography>
          </Card>
        ))}
      </Card>
    </Box>
  );
};

export default FirestoreSecurityTestComponent;
