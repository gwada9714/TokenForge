import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { CacheProvider } from "@emotion/react";
import createEmotionCache from "../utils/createEmotionCache";
import { theme } from "../styles/theme";
import { registerServiceWorker } from "../utils/serviceWorker";
import { AuthProvider } from "../contexts/AuthContext";
import { logger } from "../core/logger";
import { AuthUser } from "../hooks/useAuth";

// Import des pages
import AdminPage from "./admin-page";
import ProtectedPage from "./protected-page";
import AuthDemo from "./auth-demo";
// Importez d'autres pages selon les besoins

// Client-side cache, shared for the whole session of the user in the browser
const clientSideEmotionCache = createEmotionCache();

export default function App() {
  useEffect(() => {
    // Register service worker
    registerServiceWorker();
  }, []);

  // Callbacks pour le contexte d'authentification
  const handleAuthStateChanged = (user: AuthUser | null) => {
    logger.info({
      category: "Auth",
      message: `État d'authentification changé: ${
        user ? "Connecté" : "Déconnecté"
      }`,
      data: user ? { uid: user.uid, isAnonymous: user.isAnonymous } : undefined,
    });
  };

  const handleAuthError = (error: Error) => {
    logger.error({
      category: "Auth",
      message: "Erreur d'authentification globale",
      error,
    });
  };

  return (
    <CacheProvider value={clientSideEmotionCache}>
      <HelmetProvider>
        <Helmet>
          <meta name="viewport" content="initial-scale=1, width=device-width" />
          <link
            rel="preload"
            href="/fonts/your-main-font.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
        </Helmet>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider
            onAuthStateChanged={handleAuthStateChanged}
            onError={handleAuthError}
          >
            <Router>
              <Routes>
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/protected" element={<ProtectedPage />} />
                <Route path="/auth-demo" element={<AuthDemo />} />
                {/* Ajoutez d'autres routes selon les besoins */}
                <Route path="/" element={<AuthDemo />} />{" "}
                {/* Page par défaut */}
              </Routes>
            </Router>
          </AuthProvider>
        </ThemeProvider>
      </HelmetProvider>
    </CacheProvider>
  );
}
