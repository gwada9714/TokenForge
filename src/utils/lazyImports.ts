import { lazy } from "react";

// Utilisation de la syntaxe d'import dynamique avec le mot-clé "default"
export const LazyTokenChart = lazy(() =>
  import("../components/common/TokenChart").then((module) => ({
    default: module.default,
  }))
);
export const LazyForgeBackground = lazy(() =>
  import("../components/common/ForgeBackground").then((module) => ({
    default: module.default,
  }))
);
export const LazySecurityFeature = lazy(() =>
  import("../components/common/SecurityFeature").then((module) => ({
    default: module.default,
  }))
);
export const LazyFeatureCard = lazy(() =>
  import("../components/common/FeatureCard").then((module) => ({
    default: module.default,
  }))
);
export const LazyLaunchpad = lazy(() =>
  import("../components/Launchpad/Launchpad").then((module) => ({
    default: module.default,
  }))
);
