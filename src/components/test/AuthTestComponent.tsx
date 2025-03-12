import React, { useState } from 'react';
import { Button, Card, Typography, Box, Alert, CircularProgress, Stack, Divider } from '@mui/material';
import { AuthTest } from '@/lib/firebase/test/auth-test';

/**
 * Composant de test pour vérifier les fonctionnalités d'authentification Firebase
 */
const AuthTestComponent: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);

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
    <Card sx={{ maxWidth: 800, mx: 'auto', my: 4, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tests d'authentification Firebase
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Ce composant permet de tester manuellement les fonctionnalités d'authentification Firebase.
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Stack spacing={2} direction="row" sx={{ mb: 3 }}>
        <Button 
          variant="contained" 
          color="primary"
          disabled={isLoading}
          onClick={() => runTest('initialization', AuthTest.testFirebaseInitialization)}
        >
          Tester l'initialisation
        </Button>
        <Button 
          variant="contained" 
          color="secondary"
          disabled={isLoading}
          onClick={() => runTest('anonymousSignIn', AuthTest.testAnonymousSignIn)}
        >
          Tester la connexion anonyme
        </Button>
        <Button 
          variant="outlined" 
          color="error"
          disabled={isLoading}
          onClick={() => runTest('signOut', AuthTest.testSignOut)}
        >
          Tester la déconnexion
        </Button>
      </Stack>

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
              Test réussi!
            </Alert>
          ) : (
            <Alert severity="error" sx={{ mb: 2 }}>
              Échec du test
            </Alert>
          )}
          
          <Typography variant="body2" component="pre" sx={{ 
            whiteSpace: 'pre-wrap', 
            wordBreak: 'break-word',
            bgcolor: 'grey.100',
            p: 2,
            borderRadius: 1,
            fontSize: '0.8rem'
          }}>
            {JSON.stringify(result, null, 2)}
          </Typography>
        </Card>
      ))}
    </Card>
  );
};

export default AuthTestComponent;
