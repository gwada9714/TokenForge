import React, { useState } from "react";
import {
  Button,
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Divider,
  Alert,
  Chip,
  Stack,
} from "@mui/material";
import { FirestoreTest } from "../../lib/firebase/test/firestore-test";

// Type pour les résultats de test
interface TestResult {
  name: string;
  result: any;
  success: boolean;
  timestamp: number;
}

/**
 * Composant de test pour les fonctionnalités Firestore
 * Permet d'exécuter différents tests CRUD sur Firestore et d'afficher les résultats
 */
const FirestoreTestComponent: React.FC = () => {
  // État pour stocker les résultats des tests
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  // État pour suivre si un test est en cours d'exécution
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // État pour stocker les messages d'erreur
  const [error, setError] = useState<string | null>(null);

  // Fonction générique pour exécuter un test et gérer son résultat
  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await testFn();

      // Ajoute le résultat au début de la liste (pour afficher les plus récents en premier)
      setTestResults((prev) => [
        {
          name: testName,
          result: result,
          success: result.success,
          timestamp: Date.now(),
        },
        ...prev,
      ]);
    } catch (err) {
      setError(
        `Erreur lors de l'exécution du test ${testName}: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
      console.error("Erreur de test:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Exécute tous les tests Firestore en séquence
  const runAllTests = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Liste des tests à exécuter
      const tests = [
        {
          name: "Initialisation Firestore",
          fn: FirestoreTest.testFirestoreInitialization,
        },
        { name: "Création de document", fn: FirestoreTest.testCreateDocument },
        { name: "Lecture de document", fn: FirestoreTest.testReadDocument },
        {
          name: "Mise à jour de document",
          fn: FirestoreTest.testUpdateDocument,
        },
        {
          name: "Suppression de document",
          fn: FirestoreTest.testDeleteDocument,
        },
        { name: "Requête avec filtres", fn: FirestoreTest.testQueryCollection },
      ];

      // Exécution séquentielle des tests
      const results: TestResult[] = [];

      for (const test of tests) {
        try {
          const result = await test.fn();
          results.push({
            name: test.name,
            result: result,
            success: result.success,
            timestamp: Date.now(),
          });
        } catch (err) {
          results.push({
            name: test.name,
            result: {
              success: false,
              message: err instanceof Error ? err.message : String(err),
              error: err,
            },
            success: false,
            timestamp: Date.now(),
          });
        }
      }

      // Met à jour la liste des résultats
      setTestResults((prev) => [...results.reverse(), ...prev]);
    } catch (err) {
      setError(
        `Erreur lors de l'exécution des tests: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
      console.error("Erreur de test:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Formatte les données du résultat pour l'affichage
  const formatResultData = (data: any): string => {
    if (data === null || data === undefined) return "Aucune donnée";
    return JSON.stringify(data, null, 2);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Tests des Services Firestore
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" paragraph>
          Cette page permet de tester les différentes fonctionnalités des
          services Firestore de l'application. Les tests vérifient
          l'initialisation, la création, la lecture, la mise à jour, la
          suppression et les requêtes sur des collections.
        </Typography>
      </Box>

      {/* Affichage des erreurs */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Boutons de test */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          onClick={() =>
            runTest(
              "Initialisation Firestore",
              FirestoreTest.testFirestoreInitialization
            )
          }
          disabled={isLoading}
        >
          Tester l'initialisation
        </Button>

        <Button
          variant="contained"
          onClick={() =>
            runTest("Création de document", FirestoreTest.testCreateDocument)
          }
          disabled={isLoading}
        >
          Tester la création
        </Button>

        <Button
          variant="contained"
          onClick={() =>
            runTest("Lecture de document", FirestoreTest.testReadDocument)
          }
          disabled={isLoading}
        >
          Tester la lecture
        </Button>

        <Button
          variant="contained"
          onClick={() =>
            runTest("Mise à jour de document", FirestoreTest.testUpdateDocument)
          }
          disabled={isLoading}
        >
          Tester la mise à jour
        </Button>

        <Button
          variant="contained"
          onClick={() =>
            runTest("Suppression de document", FirestoreTest.testDeleteDocument)
          }
          disabled={isLoading}
        >
          Tester la suppression
        </Button>

        <Button
          variant="contained"
          onClick={() =>
            runTest("Requête avec filtres", FirestoreTest.testQueryCollection)
          }
          disabled={isLoading}
        >
          Tester les requêtes
        </Button>

        <Button
          variant="contained"
          color="secondary"
          onClick={runAllTests}
          disabled={isLoading}
        >
          Exécuter tous les tests
        </Button>
      </Box>

      {/* Indicateur de chargement */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Liste des résultats de test */}
      <Typography variant="h6" component="h2" gutterBottom>
        Résultats des tests
      </Typography>

      {testResults.length === 0 ? (
        <Alert severity="info">Aucun test n'a encore été exécuté</Alert>
      ) : (
        <List sx={{ width: "100%", bgcolor: "background.paper" }}>
          {testResults.map((result, index) => (
            <React.Fragment key={index}>
              <Paper sx={{ p: 2, mb: 1 }} elevation={1}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle1">
                          {result.name}
                        </Typography>
                        <Chip
                          label={result.success ? "Succès" : "Échec"}
                          color={result.success ? "success" : "error"}
                          size="small"
                        />
                      </Stack>
                    }
                    secondary={
                      <>
                        <Typography
                          variant="body2"
                          component="span"
                          color="text.primary"
                        >
                          Message: {result.result.message}
                        </Typography>

                        <Box sx={{ mt: 1 }}>
                          <Typography
                            variant="body2"
                            component="div"
                            color="text.secondary"
                          >
                            Données:
                          </Typography>
                          <Box
                            component="pre"
                            sx={{
                              p: 1,
                              bgcolor: "grey.100",
                              borderRadius: 1,
                              fontSize: "0.75rem",
                              maxHeight: "200px",
                              overflow: "auto",
                            }}
                          >
                            {formatResultData(result.result.data)}
                          </Box>
                        </Box>

                        {result.result.error && (
                          <Box sx={{ mt: 1 }}>
                            <Typography
                              variant="body2"
                              component="div"
                              color="error"
                            >
                              Erreur:
                            </Typography>
                            <Box
                              component="pre"
                              sx={{
                                p: 1,
                                bgcolor: "grey.100",
                                borderRadius: 1,
                                fontSize: "0.75rem",
                                color: "error.main",
                                maxHeight: "150px",
                                overflow: "auto",
                              }}
                            >
                              {formatResultData(result.result.error)}
                            </Box>
                          </Box>
                        )}

                        <Typography
                          variant="caption"
                          display="block"
                          sx={{ mt: 1 }}
                        >
                          Exécuté le{" "}
                          {new Date(result.timestamp).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              </Paper>
              {index < testResults.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Container>
  );
};

export default FirestoreTestComponent;
