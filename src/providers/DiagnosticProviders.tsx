import React from "react";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "../store/store";
import { DiagnosticWagmiProvider } from "./DiagnosticWagmiProvider";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../theme/theme";
import CssBaseline from "@mui/material/CssBaseline";
import { logger } from "../core/logger";
import FirebaseIntegration from "./FirebaseIntegration";

interface DiagnosticProvidersProps {
  children: React.ReactNode;
}

/**
 * Version diagnostique des Providers qui n'inclut que les providers essentiels
 * sans dépendances aux services externes (Firebase, Wagmi, etc.)
 */
const DiagnosticProviders: React.FC<DiagnosticProvidersProps> = ({
  children,
}) => {
  logger.info({
    category: "DiagnosticProviders",
    message: "Initialisation des providers en mode diagnostic",
  });

  return (
    <ReduxProvider store={store}>
      <DiagnosticWagmiProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <FirebaseIntegration>{children}</FirebaseIntegration>
        </ThemeProvider>
      </DiagnosticWagmiProvider>
    </ReduxProvider>
  );
};

export default DiagnosticProviders;
