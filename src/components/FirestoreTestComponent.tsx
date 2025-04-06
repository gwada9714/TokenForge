import React, { useState } from "react";
import {
  Button,
  Typography,
  Paper,
  Box,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  testFirestoreTransaction,
  testFirestoreBatch,
  runAllFirestoreTests,
} from "@/lib/firebase/firestore-test";
import { logger } from "@/core/logger";

interface TestResult {
  name: string;
  success: boolean;
  timestamp: Date;
  details?: any;
}

const FirestoreTestComponent: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = async (
    testName: string,
    testFunction: () => Promise<any>
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      logger.info({
        category: "FirestoreTestComponent",
        message: `Démarrage du test: ${testName}`,
      });

      const result = await testFunction();

      const testResult: TestResult = {
        name: testName,
        success: typeof result === "boolean" ? result : result !== null,
        timestamp: new Date(),
        details: result,
      };

      setResults((prev) => [testResult, ...prev]);

      logger.info({
        category: "FirestoreTestComponent",
        message: `Test terminé: ${testName}`,
        data: { success: testResult.success },
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Erreur lors du test ${testName}: ${errorMessage}`);

      logger.error({
        category: "FirestoreTestComponent",
        message: `Erreur lors du test: ${testName}`,
        error: err instanceof Error ? err : new Error(String(err)),
      });

      setResults((prev) => [
        {
          name: testName,
          success: false,
          timestamp: new Date(),
          details: { error: errorMessage },
        },
        ...prev,
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransactionTest = () => {
    runTest("Test Transaction", testFirestoreTransaction);
  };

  const handleBatchTest = () => {
    runTest("Test Batch", testFirestoreBatch);
  };

  const handleRunAllTests = () => {
    runTest("Tous les tests", runAllFirestoreTests);
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Tests Firestore
      </Typography>

      <Typography variant="body2" color="text.secondary" paragraph>
        Ce composant permet de tester les fonctionnalités avancées de Firestore
        comme les transactions et les batches.
      </Typography>

      <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleTransactionTest}
          disabled={isLoading}
        >
          Tester Transaction
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={handleBatchTest}
          disabled={isLoading}
        >
          Tester Batch
        </Button>

        <Button
          variant="contained"
          color="secondary"
          onClick={handleRunAllTests}
          disabled={isLoading}
        >
          Exécuter tous les tests
        </Button>

        <Button
          variant="outlined"
          color="error"
          onClick={clearResults}
          disabled={isLoading || results.length === 0}
        >
          Effacer les résultats
        </Button>
      </Box>

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {results.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Résultats des tests
          </Typography>

          {results.map((result, index) => (
            <Paper
              key={index}
              elevation={1}
              sx={{
                p: 2,
                mb: 2,
                bgcolor: result.success ? "success.light" : "error.light",
                color: result.success
                  ? "success.contrastText"
                  : "error.contrastText",
              }}
            >
              <Typography variant="subtitle1">
                {result.name} - {result.success ? "Succès" : "Échec"}
              </Typography>

              <Typography variant="body2">
                Exécuté le {result.timestamp.toLocaleString()}
              </Typography>

              {result.details && (
                <Box
                  sx={{
                    mt: 1,
                    p: 1,
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{ whiteSpace: "pre-wrap" }}
                  >
                    {JSON.stringify(result.details, null, 2)}
                  </Typography>
                </Box>
              )}
            </Paper>
          ))}
        </>
      )}
    </Paper>
  );
};

export default FirestoreTestComponent;
