import React from "react";
import { createRoot } from "react-dom/client";
import { logger } from "./core/logger";
import DiagnosticProviders from "./providers/DiagnosticProviders";
import App from "./App";

// Configuration du point d'entrée ultra-minimal
console.log("===== DÉMARRAGE DE L'APPLICATION EN MODE DIAGNOSTIC =====");

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

const root = createRoot(rootElement);

try {
  logger.info({
    category: "AppDiagnostic",
    message: "Tentative de rendu avec DiagnosticProviders",
  });

  // Rendu avec nos providers de diagnostic qui incluent WagmiProvider simulé
  root.render(
    <React.StrictMode>
      <DiagnosticProviders>
        <App />
      </DiagnosticProviders>
    </React.StrictMode>
  );

  logger.info({
    category: "AppDiagnostic",
    message: "Rendu avec DiagnosticProviders effectué avec succès",
  });
} catch (err) {
  logger.error({
    category: "AppDiagnostic",
    message: `Erreur pendant le rendu en mode diagnostic: ${
      err instanceof Error ? err.message : String(err)
    }`,
    error: err instanceof Error ? err : new Error(String(err)),
  });
  console.error("===== ERREUR PENDANT LE RENDU DIAGNOSTIC =====", err);
}
