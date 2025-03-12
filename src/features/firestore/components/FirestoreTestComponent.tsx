import React, { useState } from 'react';
import { Button, Card, Typography, Box, Alert, CircularProgress, Stack, Divider, Grid } from '@mui/material';
import { FirestoreTest } from '@/lib/firebase/test/firestore-test';

/**
 * Composant de test pour vérifier les fonctionnalités Firestore
 */
const FirestoreTestComponent: React.FC = () => {
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
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Card sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Tests des services Firestore
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Ce composant permet de tester les opérations CRUD de Firestore et les requêtes de base.
          Attention : ces tests créent des données temporaires dans votre base Firestore.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Button 
              variant="contained" 
              color="primary"
              fullWidth
              disabled={isLoading}
              onClick={() => runTest('initialization', FirestoreTest.testFirestoreInitialization)}
            >
              Tester l'initialisation
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button 
              variant="contained" 
              color="secondary"
              fullWidth
              disabled={isLoading}
              onClick={() => runTest('createDocument', FirestoreTest.testCreateDocument)}
            >
              Tester création de document
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button 
              variant="contained" 
              color="info"
              fullWidth
              disabled={isLoading}
              onClick={() => runTest('readDocument', FirestoreTest.testReadDocument)}
            >
              Tester lecture de document
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button 
              variant="contained" 
              color="success"
              fullWidth
              disabled={isLoading}
              onClick={() => runTest('updateDocument', FirestoreTest.testUpdateDocument)}
            >
              Tester mise à jour de document
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button 
              variant="contained" 
              color="error"
              fullWidth
              disabled={isLoading}
              onClick={() => runTest('deleteDocument', FirestoreTest.testDeleteDocument)}
            >
              Tester suppression de document
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button 
              variant="contained" 
              color="warning"
              fullWidth
              disabled={isLoading}
              onClick={() => runTest('queryCollection', FirestoreTest.testQueryCollection)}
            >
              Tester requête sur collection
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button 
              variant="contained" 
              color="secondary"
              fullWidth
              disabled={isLoading}
              onClick={() => runTest('firestoreBatch', FirestoreTest.testFirestoreBatch)}
            >
              Tester les batches
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button 
              variant="contained" 
              color="primary"
              fullWidth
              disabled={isLoading}
              onClick={() => runTest('firestoreTransaction', FirestoreTest.testFirestoreTransaction)}
            >
              Tester les transactions
            </Button>
          </Grid>
        </Grid>

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

export default FirestoreTestComponent;
