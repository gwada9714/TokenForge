// Polyfills
import "./polyfills";

// Styles
import "./index.css";

// React imports
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

// Firebase imports
import "firebase/auth";
import { firebaseAuth } from "./lib/firebase/auth";
import { getFirebaseManager } from "./lib/firebase/services";

// App imports
import App from "./App";
import { store } from "./store";
import { logger } from "./utils/firebase-logger";
import { ErrorMonitoring } from "./utils/error-monitoring";
import { SessionService } from "./services/session/sessionService";
import { serviceManager } from "@/core/services/ServiceManager";
import { firebaseInitializer } from "@/lib/firebase/initialization";

const LOG_CATEGORY = "Application";

async function initializeServices() {
  try {
    // 1. Initialiser Firebase Manager
    const firebaseManager = await getFirebaseManager();
    logger.info({
      category: "Firebase",
      message: "Firebase core services initialized",
    });

    // 2. Initialiser Auth explicitement en utilisant la méthode directe
    // Cette approche évite les dépendances circulaires
    await firebaseManager.initAuth();
    logger.info({
      category: "Firebase",
      message: "Firebase Auth est complètement initialisé",
    });

    // 3. Initialiser le service d'authentification qui utilise Firebase Auth
    await firebaseAuth.getAuth();
    logger.info({
      category: "Firebase",
      message: "FirebaseAuth service est prêt à être utilisé",
    });

    // 4. Initialiser les autres services qui peuvent dépendre de Auth
    serviceManager.registerService(firebaseInitializer);
    await serviceManager.initialize();

    // 5. Initialiser le monitoring d'erreur
    ErrorMonitoring.getInstance().initialize();

    // 6. Initialiser la session en dernier
    const sessionService = SessionService.getInstance();
    await sessionService.startSession();

    logger.info({
      category: LOG_CATEGORY,
      message: "Services initialized successfully",
    });
  } catch (error) {
    logger.error({
      category: LOG_CATEGORY,
      message: "❌ Services initialization failed",
      error: error as Error,
    });
    throw error;
  }
}

async function startApp() {
  try {
    // Vérifier si process.stdout.isTTY est défini
    if (
      typeof process !== "undefined" &&
      process.stdout &&
      typeof process.stdout.isTTY === "undefined"
    ) {
      console.warn(
        "process.stdout.isTTY n'est pas défini dans main.tsx, vérification des polyfills"
      );

      // Vérifier si le polyfill global a été appliqué
      if (
        typeof window !== "undefined" &&
        window.process &&
        window.process.stdout &&
        typeof window.process.stdout.isTTY !== "undefined"
      ) {
        // Utiliser la valeur du polyfill global
        console.log(
          "Utilisation de la valeur du polyfill global pour process.stdout.isTTY"
        );
        process.stdout.isTTY = window.process.stdout.isTTY;
      } else {
        // Appliquer le polyfill localement
        try {
          Object.defineProperty(process.stdout, "isTTY", {
            value: false,
            writable: false,
            configurable: false,
            enumerable: true,
          });
          console.log("process.stdout.isTTY défini avec succès dans main.tsx");
        } catch (e) {
          console.warn(
            "Impossible de définir process.stdout.isTTY dans main.tsx:",
            e
          );
          // Fallback: essayer d'assigner directement
          try {
            process.stdout.isTTY = false;
          } catch (e2) {
            console.error(
              "Impossible d'assigner process.stdout.isTTY dans main.tsx:",
              e2
            );
          }
        }
      }
    }

    logger.info({
      category: LOG_CATEGORY,
      message: "🚀 Starting TokenForge application",
    });

    // Validate environment variables
    const requiredEnvVars = [
      "VITE_FIREBASE_API_KEY",
      "VITE_FIREBASE_AUTH_DOMAIN",
      "VITE_FIREBASE_PROJECT_ID",
    ];

    requiredEnvVars.forEach((varName) => {
      if (!import.meta.env[varName]) {
        throw new Error(`Missing environment variable: ${varName}`);
      }
    });

    // Vérifier si un gestionnaire d'erreurs pour isTTY a déjà été ajouté
    if (
      typeof window !== "undefined" &&
      !(window as any).__isTTYErrorHandlerAdded
    ) {
      // Marquer que le gestionnaire a été ajouté
      (window as any).__isTTYErrorHandlerAdded = true;

      // Intercepter les erreurs liées à isTTY
      window.addEventListener(
        "error",
        function (event) {
          if (event.message && event.message.includes("isTTY")) {
            console.warn(
              "Erreur isTTY interceptée dans main.tsx:",
              event.message
            );
            event.preventDefault();
            return true;
          }
        },
        true
      );

      console.log("Gestionnaire d'erreurs pour isTTY ajouté dans main.tsx");
    } else {
      console.log("Gestionnaire d'erreurs pour isTTY déjà ajouté");
    }

    // Initialize all services
    try {
      await initializeServices();
    } catch (error) {
      console.error("Erreur lors de l'initialisation des services:", error);
      // Continuer malgré l'erreur pour permettre le rendu de l'application
    }

    // Render the application
    const container = document.getElementById("root");
    if (!container) {
      throw new Error("Container #root not found in DOM");
    }

    // Importer dynamiquement les composants pour éviter les problèmes de dépendances circulaires
    const ErrorBoundary = (await import("./components/ErrorBoundary")).default;
    const LoadingTimeout = (await import("./components/LoadingTimeout"))
      .default;

    const root = createRoot(container);
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <LoadingTimeout timeout={30000}>
            <Provider store={store}>
              <App />
            </Provider>
          </LoadingTimeout>
        </ErrorBoundary>
      </StrictMode>
    );

    logger.info({
      category: LOG_CATEGORY,
      message: "🎉 Application started successfully",
    });
  } catch (error) {
    logger.error({
      category: LOG_CATEGORY,
      message: "❌ Application initialization failed",
      error: error as Error,
    });

    // Display user-friendly error
    const errorContainer = document.getElementById("root");
    if (errorContainer) {
      errorContainer.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          text-align: center;
          font-family: system-ui, -apple-system, sans-serif;
          color: #ff4444;
          padding: 20px;
        ">
          <h1>Oops! Une erreur est survenue</h1>
          <p>Nous rencontrons un problème au démarrage de l'application. Veuillez réessayer plus tard.</p>
          <p style="font-size: 0.8em; margin-top: 20px;">Détails techniques: ${
            (error as Error).message
          }</p>
        </div>
      `;
    }
  }
}

// Start the application
startApp();
