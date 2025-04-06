import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Switch,
  FormControlLabel,
  CircularProgress,
  Tabs,
  Tab,
  Tooltip,
  IconButton,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import BarChartIcon from "@mui/icons-material/BarChart";
import { firestorePerformance } from "@/lib/firebase/utils/firestore-performance";
import { firestoreService } from "@/lib/firebase/firestore";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`performance-tabpanel-${index}`}
      aria-labelledby={`performance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

/**
 * Composant pour visualiser et analyser les performances des requêtes Firestore
 */
export const FirestorePerformanceComponent: React.FC = () => {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);
  const [isEnabled, setIsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Récupérer les métriques actuelles
  const fetchMetrics = () => {
    const currentMetrics = firestorePerformance.getMetrics();
    setMetrics(currentMetrics);

    const performanceReport = firestorePerformance.generatePerformanceReport();
    setReport(performanceReport);
  };

  // Activer/désactiver le monitoring
  const toggleMonitoring = (enabled: boolean) => {
    firestorePerformance.setEnabled(enabled);
    setIsEnabled(enabled);
  };

  // Réinitialiser les métriques
  const resetMetrics = () => {
    firestorePerformance.resetMetrics();
    fetchMetrics();
  };

  // Effectuer quelques requêtes de test pour générer des métriques
  const runTestQueries = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      // Tester différentes opérations Firestore
      const userId = "test_user_" + Date.now();
      const testDocId = "test_" + Date.now();

      // Test 1: Écriture simple
      await firestorePerformance.measureAsync("set", `test/${testDocId}`, () =>
        firestoreService.setDocument("test", testDocId, {
          name: "Test Document",
          timestamp: new Date(),
          userId,
        })
      );

      // Test 2: Lecture
      await firestorePerformance.measureAsync("get", `test/${testDocId}`, () =>
        firestoreService.getDocument("test", testDocId)
      );

      // Test 3: Requête avec filtre
      await firestorePerformance.measureAsync("query", "test", () =>
        firestoreService.queryDocuments("test", "userId", "==", userId)
      );

      // Test 4: Mise à jour
      await firestorePerformance.measureAsync(
        "update",
        `test/${testDocId}`,
        () =>
          firestoreService.updateDocument("test", testDocId, {
            updated: true,
            counter: Math.floor(Math.random() * 100),
          })
      );

      // Test 5: Batch
      const batch = await firestoreService.createBatch();
      await firestorePerformance.measureAsync("batch", "test", async () => {
        for (let i = 0; i < 5; i++) {
          batch.set("test", `batch_${Date.now()}_${i}`, {
            index: i,
            batch: true,
            userId,
          });
        }
        await batch.commit();
      });

      // Test 6: Suppression du document de test
      await firestorePerformance.measureAsync(
        "delete",
        `test/${testDocId}`,
        () => firestoreService.deleteDocument("test", testDocId)
      );

      // Mettre à jour les métriques après les tests
      fetchMetrics();
      setTestResult("Tests de performance complétés avec succès!");
    } catch (error) {
      console.error("Erreur lors des tests:", error);
      setTestResult(
        `Erreur: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les métriques au chargement du composant
  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <Card elevation={3} sx={{ p: 2, mx: 2, my: 3 }}>
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" color="primary">
          Monitoring des Performances Firestore
        </Typography>

        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={isEnabled}
                onChange={(e) => toggleMonitoring(e.target.checked)}
                color="primary"
              />
            }
            label="Activer le monitoring"
          />
          <Tooltip title="Rafraîchir les métriques">
            <IconButton onClick={fetchMetrics} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Réinitialiser les métriques">
            <IconButton onClick={resetMetrics} color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(_, val) => setTabValue(val)}
          aria-label="performances tabs"
        >
          <Tab label="Résumé" id="performance-tab-0" />
          <Tab label="Requêtes les plus lentes" id="performance-tab-1" />
          <Tab label="Toutes les métriques" id="performance-tab-2" />
          <Tab label="Tests" id="performance-tab-3" />
        </Tabs>
      </Box>

      {/* Onglet Résumé */}
      <TabPanel value={tabValue} index={0}>
        {report ? (
          <Box>
            <Typography variant="h6" gutterBottom>
              Statistiques générales
            </Typography>

            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="body2">
                Nombre total de requêtes: <strong>{report.totalQueries}</strong>
              </Typography>

              {report.timeRange.from && (
                <Typography variant="body2">
                  Période:{" "}
                  <strong>
                    {new Date(report.timeRange.from).toLocaleString()}
                  </strong>{" "}
                  à{" "}
                  <strong>
                    {new Date(report.timeRange.to).toLocaleString()}
                  </strong>
                </Typography>
              )}
            </Paper>

            <Typography variant="h6" gutterBottom>
              Statistiques par opération
            </Typography>

            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Opération</TableCell>
                    <TableCell align="right">Nombre</TableCell>
                    <TableCell align="right">Durée moyenne (ms)</TableCell>
                    <TableCell align="right">Durée min (ms)</TableCell>
                    <TableCell align="right">Durée max (ms)</TableCell>
                    <TableCell align="right">Taux de succès</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(report.operationStats).map(
                    ([operation, stats]: [string, any]) => (
                      <TableRow key={operation}>
                        <TableCell component="th" scope="row">
                          {operation}
                        </TableCell>
                        <TableCell align="right">{stats.count}</TableCell>
                        <TableCell align="right">
                          {stats.avgDurationMs}
                        </TableCell>
                        <TableCell align="right">
                          {stats.minDurationMs}
                        </TableCell>
                        <TableCell align="right">
                          {stats.maxDurationMs}
                        </TableCell>
                        <TableCell align="right">{stats.successRate}</TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ) : (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <Typography variant="body1" color="text.secondary">
              Aucune métrique disponible. Exécutez des requêtes Firestore pour
              collecter des données.
            </Typography>
          </Box>
        )}
      </TabPanel>

      {/* Onglet Requêtes les plus lentes */}
      <TabPanel value={tabValue} index={1}>
        {report && report.slowestQueries.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Opération</TableCell>
                  <TableCell>Chemin</TableCell>
                  <TableCell align="right">Durée (ms)</TableCell>
                  <TableCell>Horodatage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {report.slowestQueries.map((query: any, index: number) => (
                  <TableRow
                    key={index}
                    sx={{
                      backgroundColor:
                        query.durationMs > 500
                          ? "rgba(255, 0, 0, 0.05)"
                          : undefined,
                    }}
                  >
                    <TableCell>{query.operation}</TableCell>
                    <TableCell>{query.path}</TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: "bold",
                        color:
                          query.durationMs > 500 ? "error.main" : undefined,
                      }}
                    >
                      {query.durationMs}
                    </TableCell>
                    <TableCell>
                      {new Date(query.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <Typography variant="body1" color="text.secondary">
              Aucune requête lente détectée.
            </Typography>
          </Box>
        )}
      </TabPanel>

      {/* Onglet Toutes les métriques */}
      <TabPanel value={tabValue} index={2}>
        {metrics.length > 0 ? (
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Opération</TableCell>
                  <TableCell>Chemin</TableCell>
                  <TableCell align="right">Durée (ms)</TableCell>
                  <TableCell>Horodatage</TableCell>
                  <TableCell align="center">Statut</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {metrics.map((metric, index) => (
                  <TableRow key={index}>
                    <TableCell>{metric.operation}</TableCell>
                    <TableCell>{metric.path}</TableCell>
                    <TableCell align="right">
                      {Math.round(metric.duration)}
                    </TableCell>
                    <TableCell>
                      {new Date(metric.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell align="center">
                      {metric.success ? (
                        <Typography color="success.main">Succès</Typography>
                      ) : (
                        <Tooltip title={metric.error || "Erreur inconnue"}>
                          <Typography color="error.main">Échec</Typography>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <Typography variant="body1" color="text.secondary">
              Aucune métrique disponible. Exécutez des requêtes Firestore pour
              collecter des données.
            </Typography>
          </Box>
        )}
      </TabPanel>

      {/* Onglet Tests */}
      <TabPanel value={tabValue} index={3}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Exécuter des requêtes de test
          </Typography>
          <Typography variant="body2" paragraph>
            Cette fonction exécute une série de requêtes Firestore (création,
            lecture, mise à jour, requête, batch, suppression) pour générer des
            métriques de performance à des fins de test.
          </Typography>

          <Button
            variant="contained"
            color="primary"
            startIcon={
              isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <BarChartIcon />
              )
            }
            onClick={runTestQueries}
            disabled={isLoading || !isEnabled}
            sx={{ mb: 2 }}
          >
            {isLoading
              ? "Exécution en cours..."
              : "Exécuter des requêtes de test"}
          </Button>

          {testResult && (
            <Alert
              severity={testResult.startsWith("Erreur") ? "error" : "success"}
              sx={{ mt: 2 }}
            >
              {testResult}
            </Alert>
          )}

          {!isEnabled && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Le monitoring des performances est désactivé. Activez-le pour
              exécuter des tests.
            </Alert>
          )}
        </Box>
      </TabPanel>
    </Card>
  );
};

export default FirestorePerformanceComponent;
