import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, CircularProgress } from "@mui/material";
import { Router } from "./router";
import { logger } from "./core/logger";
import TokenForgeAuthProvider from "./features/auth/providers/TokenForgeAuthProvider";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "./theme/theme";
// Import des éléments nécessaires pour Wagmi
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
// Import nécessaire pour React Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// Utiliser notre configuration de Wagmi unifiée
import { getWagmiConfig } from "./hooks/useWagmiConfig";

// Déclaration pour TypeScript
declare global {
  interface Window {
    appInitialized?: boolean;
  }
}

// Créer une instance de QueryClient pour React Query
const queryClient = new QueryClient();

// Récupérer la configuration Wagmi
const wagmiConfig = getWagmiConfig();

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Marquer l'application comme initialisée dès que possible
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Définir appInitialized à true pour éviter le timeout
      (window as any).appInitialized = true;

      if (typeof (window as any).markAppAsInitialized === "function") {
        (window as any).markAppAsInitialized();
      }

      console.log("App.tsx: Application marquée comme initialisée");
    }
  }, []);

  useEffect(() => {
    // Initialisation normale
    const initTimer = setTimeout(() => {
      try {
        logger.info({
          category: "Application",
          message: "Application initialisée avec succès",
        });
        setIsInitialized(true);

        // Marquer l'application comme initialisée pour le mécanisme de détection
        if (
          typeof window !== "undefined" &&
          typeof (window as any).markAppAsInitialized === "function"
        ) {
          (window as any).markAppAsInitialized();
        } else if (typeof window !== "undefined") {
          (window as any).appInitialized = true;
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error({
          category: "Application",
          message: `Erreur d'initialisation: ${error.message}`,
          error,
        });
        setError(error);
      } finally {
        setIsLoading(false);
      }
    }, 1000);

    // Timeout de sécurité pour éviter le chargement infini
    const safetyTimer = setTimeout(() => {
      if (isLoading) {
        logger.warn({
          category: "Application",
          message: "Timeout d'initialisation déclenché après 15 secondes",
        });
        setIsLoading(false);
        setError(
          new Error(
            "L'initialisation de l'application a pris trop de temps. Veuillez rafraîchir la page."
          )
        );
      }
    }, 15000); // 15 secondes de timeout

    return () => {
      clearTimeout(initTimer);
      clearTimeout(safetyTimer);
    };
  }, [isLoading]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress color="primary" />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Chargement de TokenForge...
        </Typography>
      </Box>
    );
  }

  if (error || !isInitialized) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          p: 3,
          bgcolor: "background.default",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            maxWidth: 600,
            width: "100%",
            borderRadius: 2,
          }}
        >
          <Typography variant="h5" color="error" gutterBottom>
            Erreur d'initialisation de l'application
          </Typography>
          <Typography variant="body1" paragraph>
            {error
              ? error.message
              : "TokenForge n'a pas pu initialiser correctement."}
          </Typography>
          <Box display="flex" justifyContent="space-between" mt={3}>
            <Box
              component="button"
              onClick={() => window.location.reload()}
              sx={{
                py: 1,
                px: 3,
                bgcolor: "primary.main",
                color: "white",
                border: "none",
                borderRadius: 1,
                cursor: "pointer",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
              }}
            >
              Rafraîchir la page
            </Box>
            <Box
              component="button"
              onClick={() => {
                // Essayer de nettoyer le cache et les données locales
                try {
                  localStorage.clear();
                  sessionStorage.clear();
                  console.log("Cache local nettoyé");
                } catch (e) {
                  console.error("Erreur lors du nettoyage du cache:", e);
                }
                window.location.href = "/";
              }}
              sx={{
                py: 1,
                px: 3,
                bgcolor: "grey.300",
                color: "text.primary",
                border: "none",
                borderRadius: 1,
                cursor: "pointer",
                "&:hover": {
                  bgcolor: "grey.400",
                },
              }}
            >
              Réinitialiser et retourner à l'accueil
            </Box>
          </Box>
        </Paper>
      </Box>
    );
  }

  // Si tout est prêt, afficher l'application avec les providers nécessaires
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <RainbowKitProvider>
            <TokenForgeAuthProvider>
              <Router />
            </TokenForgeAuthProvider>
          </RainbowKitProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
