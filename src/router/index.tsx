import React, { Suspense } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { routes } from "./routes.tsx";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { logger } from "../core/logger";
import { routerConfig } from "./router.config";

// Configuration du router avec les options adaptées pour réduire les avertissements
const router = createBrowserRouter(routes, {
  basename: "/", // Définit explicitement le basename pour éviter les problèmes de chemins relatifs
  future: routerConfig.future, // Utilisation de la configuration centralisée
});

logger.info({
  category: "Router",
  message: "Configuration du router initialisée",
  data: {
    routesCount: routes.length,
    futureConfig: routerConfig.future,
  },
});

export const Router: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen={true} />}>
      <RouterProvider
        router={router}
        fallbackElement={<LoadingSpinner fullScreen={false} />}
      />
    </Suspense>
  );
};
