import React, { useState } from "react";
import { useTokenForgeAuth } from "../hooks/useTokenForgeAuth";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  Card,
  Stack,
} from "@mui/material";
import { AuthTest } from "@/lib/firebase/test/auth-test";

/**
 * Composant de test pour vérifier le fonctionnement de l'authentification
 * Ce composant affiche l'état d'authentification actuel et permet de tester les fonctionnalités d'authentification
 */
export const AuthTestComponent: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [testResults, setTestResults] = useState<
    Array<{ label: string; success: boolean; message: string }>
  >([]);
  const [firebaseTestResults, setFirebaseTestResults] = useState<
    Record<string, any>
  >({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Utiliser notre hook d'authentification
  const {
    isAuthenticated,
    user,
    wallet,
    signIn,
    signUp,
    signOut,
    connectWallet,
    disconnectWallet,
    status,
    isInitialized,
  } = useTokenForgeAuth();

  // Fonction pour ajouter un résultat de test
  const addTestResult = (label: string, success: boolean, message: string) => {
    setTestResults((prev) => [...prev, { label, success, message }]);
  };

  // Fonctions pour tester les services d'authentification
  const handleTestSignIn = async () => {
    try {
      await signIn(email, password);
      addTestResult("Connexion", true, `Connexion réussie avec ${email}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      addTestResult("Connexion", false, `Erreur: ${errorMessage}`);
    }
  };

  const handleTestSignUp = async () => {
    if (!email || !password) {
      addTestResult("Inscription", false, "Email et mot de passe requis");
      return;
    }

    try {
      await signUp(email, password);
      addTestResult("Inscription", true, `Compte créé avec ${email}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      addTestResult("Inscription", false, `Erreur: ${errorMessage}`);
    }
  };

  const handleTestSignOut = async () => {
    try {
      await signOut();
      addTestResult("Déconnexion", true, "Déconnexion réussie");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      addTestResult("Déconnexion", false, `Erreur: ${errorMessage}`);
    }
  };

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      addTestResult("Connexion Wallet", true, "Wallet connecté avec succès");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      addTestResult("Connexion Wallet", false, `Erreur: ${errorMessage}`);
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      await disconnectWallet();
      addTestResult(
        "Déconnexion Wallet",
        true,
        "Wallet déconnecté avec succès"
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      addTestResult("Déconnexion Wallet", false, `Erreur: ${errorMessage}`);
    }
  };

  // Fonction pour exécuter un test Firebase Auth
  const runFirebaseTest = async (
    testName: string,
    testFunction: () => Promise<any>
  ) => {
    setIsLoading(true);

    try {
      const result = await testFunction();
      setFirebaseTestResults((prev) => ({
        ...prev,
        [testName]: result,
      }));
    } catch (err) {
      setFirebaseTestResults((prev) => ({
        ...prev,
        [testName]: {
          success: false,
          error: err instanceof Error ? err.message : String(err),
        },
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Tests d'authentification
      </Typography>

      {/* Affichage de l'état actuel */}
      <Card variant="outlined" sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          État actuel
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1">
            <strong>Status d'initialisation:</strong>{" "}
            {isInitialized ? "✅ Initialisé" : "⏳ En cours d'initialisation"}
          </Typography>
          <Typography variant="body1">
            <strong>Status d'authentification:</strong>{" "}
            {isAuthenticated ? "✅ Connecté" : "❌ Déconnecté"}
          </Typography>
          <Typography variant="body1">
            <strong>Status de connexion:</strong> {status}
          </Typography>
          {user && (
            <>
              <Typography variant="body1">
                <strong>User ID:</strong> {user.uid}
              </Typography>
              <Typography variant="body1">
                <strong>Email:</strong> {user.email}
              </Typography>
            </>
          )}
          {wallet && (
            <>
              <Typography variant="body1">
                <strong>Wallet:</strong>{" "}
                {wallet.isConnected ? "✅ Connecté" : "❌ Déconnecté"}
              </Typography>
              <Typography variant="body1">
                <strong>Adresse:</strong> {wallet.address || "Non disponible"}
              </Typography>
              <Typography variant="body1">
                <strong>Chain ID:</strong> {wallet.chainId || "Non disponible"}
              </Typography>
            </>
          )}
        </Box>
      </Card>

      <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {/* Tests d'authentification par email */}
        <Card variant="outlined" sx={{ p: 3, mb: 4, flex: "1 1 400px" }}>
          <Typography variant="h6" gutterBottom>
            Tests par email
          </Typography>

          <Box component="form" sx={{ mb: 3 }}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              margin="normal"
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <Button variant="contained" onClick={handleTestSignIn}>
              Connexion
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleTestSignUp}
            >
              Inscription
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleTestSignOut}
            >
              Déconnexion
            </Button>
          </Box>
        </Card>

        {/* Tests de connexion wallet */}
        <Card variant="outlined" sx={{ p: 3, mb: 4, flex: "1 1 400px" }}>
          <Typography variant="h6" gutterBottom>
            Tests de wallet
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <Button variant="contained" onClick={handleConnectWallet}>
              Connecter Wallet
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleDisconnectWallet}
            >
              Déconnecter Wallet
            </Button>
          </Box>
        </Card>
      </Box>

      {/* Tests des services Firebase Auth */}
      <Card variant="outlined" sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Tests des services Firebase Auth
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Ces tests vérifient directement les services Firebase Auth
          sous-jacents.
        </Typography>

        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            disabled={isLoading}
            onClick={() =>
              runFirebaseTest(
                "initialization",
                AuthTest.testFirebaseInitialization
              )
            }
          >
            Tester l'initialisation
          </Button>
          <Button
            variant="contained"
            color="secondary"
            disabled={isLoading}
            onClick={() =>
              runFirebaseTest("anonymousSignIn", AuthTest.testAnonymousSignIn)
            }
          >
            Connexion anonyme
          </Button>
          <Button
            variant="outlined"
            color="error"
            disabled={isLoading}
            onClick={() => runFirebaseTest("signOut", AuthTest.testSignOut)}
          >
            Déconnexion Firebase
          </Button>
        </Stack>

        {isLoading && (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress />
          </Box>
        )}

        {Object.entries(firebaseTestResults).map(([testName, result]) => (
          <Box
            key={testName}
            sx={{ mb: 2, p: 2, bgcolor: "background.paper", borderRadius: 1 }}
          >
            <Typography variant="subtitle1" gutterBottom>
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

            <Typography
              variant="body2"
              component="pre"
              sx={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                bgcolor: "grey.100",
                p: 2,
                borderRadius: 1,
                fontSize: "0.8rem",
              }}
            >
              {JSON.stringify(result, null, 2)}
            </Typography>
          </Box>
        ))}
      </Card>

      {/* Résultats des tests */}
      {testResults.length > 0 && (
        <Card variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Résultats des tests
          </Typography>
          {testResults.map((result, index) => (
            <Alert
              key={index}
              severity={result.success ? "success" : "error"}
              sx={{ mb: 1 }}
            >
              <strong>{result.label}:</strong> {result.message}
            </Alert>
          ))}
        </Card>
      )}
    </Box>
  );
};

export default AuthTestComponent;
