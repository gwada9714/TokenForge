import { DefaultTheme } from "styled-components";
import {
  COLORS,
  FORGE_COLORS,
  BLOCKCHAIN_COLORS,
  SPACING,
  THEME_CONFIG,
} from "@/config/constants/theme";

type BreakpointKey = "xs" | "sm" | "md" | "lg" | "xl";

// Define breakpoint values
const breakpointValues: Record<BreakpointKey, number> = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
};

// Function to create spacing utility
const createSpacing = () => {
  const spacing = (value: number): string => `${value * 0.25}rem`;
  spacing.xs = SPACING.xs + "px";
  spacing.sm = SPACING.sm + "px";
  spacing.md = SPACING.md + "px";
  spacing.lg = SPACING.lg + "px";
  spacing.xl = SPACING.xl + "px";
  spacing.xxl = SPACING.xxl + "px";
  spacing.base = SPACING.md + "px";
  return spacing;
};

// Create headings configuration
const headings = {
  h1: {
    fontSize: THEME_CONFIG.typography.h1.fontSize,
    lineHeight: THEME_CONFIG.typography.h1.lineHeight,
    fontWeight: THEME_CONFIG.typography.h1.fontWeight,
    letterSpacing: THEME_CONFIG.typography.h1.letterSpacing,
    fontFamily: THEME_CONFIG.typography.h1.fontFamily,
  },
  h2: {
    fontSize: THEME_CONFIG.typography.h2.fontSize,
    lineHeight: THEME_CONFIG.typography.h2.lineHeight,
    fontWeight: THEME_CONFIG.typography.h2.fontWeight,
    fontFamily: THEME_CONFIG.typography.h2.fontFamily,
  },
  h3: {
    fontSize: THEME_CONFIG.typography.h3.fontSize,
    lineHeight: THEME_CONFIG.typography.h3.lineHeight,
    fontWeight: THEME_CONFIG.typography.h3.fontWeight,
    fontFamily: THEME_CONFIG.typography.h3.fontFamily,
  },
  h4: {
    fontSize: THEME_CONFIG.typography.h4.fontSize,
    lineHeight: THEME_CONFIG.typography.h4.lineHeight,
    fontWeight: THEME_CONFIG.typography.h4.fontWeight,
    fontFamily: THEME_CONFIG.typography.h4.fontFamily,
  },
  h5: {
    fontSize: THEME_CONFIG.typography.h5.fontSize,
    lineHeight: THEME_CONFIG.typography.h5.lineHeight,
    fontWeight: THEME_CONFIG.typography.h5.fontWeight,
    fontFamily: THEME_CONFIG.typography.h5.fontFamily,
    textTransform: THEME_CONFIG.typography.h5.textTransform,
  },
};

// Create effects configuration
const effects = {
  forgeGlow: `0 0 10px ${COLORS.secondary}`,
  metalShine: `linear-gradient(45deg, ${FORGE_COLORS.steel}22 0%, ${FORGE_COLORS.steel}88 50%, ${FORGE_COLORS.steel}22 100%)`,
  heatEffect: `linear-gradient(45deg, ${COLORS.secondary} 0%, ${COLORS.secondaryLight} 50%, ${COLORS.secondary} 100%)`,
  circuitPattern: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10h80v80h-80z' fill='none' stroke='%23475569' stroke-width='0.5' stroke-opacity='0.1'/%3E%3C/svg%3E")`,
  metalTexture: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.05' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.1'/%3E%3C/svg%3E")`,
};

// Thème "La Forge Numérique"
export const styledTheme: DefaultTheme = {
  colors: {
    primary: {
      main: COLORS.primary,
      light: COLORS.primaryLight,
      dark: COLORS.primaryDark,
      border: FORGE_COLORS.steel,
      hover: COLORS.primaryLight,
    },
    secondary: {
      main: COLORS.secondary,
      light: COLORS.secondaryLight,
      dark: COLORS.secondaryDark,
      border: COLORS.secondaryLight,
      hover: COLORS.secondaryDark,
    },
    success: {
      main: COLORS.success,
      light: "#86efac", // Version plus claire du vert émeraude
      dark: "#059669", // Version plus foncée du vert émeraude
    },
    warning: {
      main: COLORS.warning,
      light: COLORS.secondaryLight, // Même que l'orange clair
      dark: COLORS.secondaryDark, // Même que l'orange foncé
    },
    error: {
      main: COLORS.error,
      light: "#fca5a5", // Version plus claire du rouge rubis
      dark: "#b91c1c", // Version plus foncée du rouge rubis
    },
    info: {
      main: COLORS.info,
      light: "#93c5fd", // Version plus claire du bleu électrique
      dark: "#1d4ed8", // Version plus foncée du bleu électrique
    },
    grey: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: FORGE_COLORS.steel, // Gris acier
      700: "#374151",
      800: FORGE_COLORS.charcoal, // Noir charbon
      900: COLORS.primary, // Bleu nuit profond
    },
    text: {
      primary: COLORS.text, // Blanc ivoire
      secondary: COLORS.textSecondary, // Gris acier
      disabled: "#9ca3af",
    },
    background: {
      default: COLORS.background, // Bleu nuit profond
      paper: COLORS.surface, // Version plus claire du bleu nuit
    },
    // Couleurs spécifiques au thème "La Forge Numérique"
    ember: {
      main: COLORS.secondary, // Orange incandescent
      light: COLORS.secondaryLight,
      dark: COLORS.secondaryDark,
      border: COLORS.secondaryLight,
      hover: COLORS.secondaryDark,
      metallic: "#B87333", // Cuivre métallique
      glow: "#FFA500", // Lueur orange
    },
    forge: {
      main: COLORS.primary, // Bleu nuit profond
      light: COLORS.primaryLight,
      dark: COLORS.primaryDark,
      border: FORGE_COLORS.steel, // Gris acier
      hover: COLORS.primaryLight,
      metallic: FORGE_COLORS.steel, // Gris acier
      glow: COLORS.info, // Lueur bleu électrique
    },
    gold: {
      main: COLORS.gold, // Doré métallique
      light: "#F5D76E", // Version plus claire du doré
      dark: "#B7950B", // Version plus foncée du doré
      border: "#F5D76E",
      hover: "#B7950B",
      metallic: COLORS.gold, // Doré métallique
      glow: "#FFD700", // Lueur dorée
    },
    gradient: COLORS.gradient,
    // Couleurs blockchain-spécifiques
    blockchain: BLOCKCHAIN_COLORS,
  },
  typography: {
    fontFamily: {
      heading: THEME_CONFIG.typography.fontFamily.heading,
      body: THEME_CONFIG.typography.fontFamily.body,
      code:
        THEME_CONFIG.typography.fontFamily.code ||
        '"JetBrains Mono", monospace',
    },
    fontWeight: {
      light: THEME_CONFIG.typography.fontWeightLight,
      regular: THEME_CONFIG.typography.fontWeightRegular,
      medium: THEME_CONFIG.typography.fontWeightMedium,
      semibold: THEME_CONFIG.typography.fontWeightSemiBold,
      bold: THEME_CONFIG.typography.fontWeightBold,
      extraBold: THEME_CONFIG.typography.fontWeightExtraBold || 800,
    },
    fontSizes: {
      xs: "0.75rem", // 12px
      sm: "0.875rem", // 14px
      md: "1rem", // 16px
      lg: "1.125rem", // 18px
      xl: "1.25rem", // 20px
      "2xl": "1.5rem", // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem", // 36px
      "5xl": "3rem", // 48px
    },
    headings,
  },
  borderRadius: {
    none: "0",
    small: THEME_CONFIG.shape.borderRadius.small + "px",
    medium: THEME_CONFIG.shape.borderRadius.medium + "px",
    large: THEME_CONFIG.shape.borderRadius.large + "px",
    xl: "0.75rem",
    "2xl": "1rem",
    full: "9999px",
  },
  transitions: {
    default: `all ${THEME_CONFIG.transitions.normal}`,
    fast: `all ${THEME_CONFIG.transitions.fast}`,
    slow: `all ${THEME_CONFIG.transitions.slow}`,
  },
  spacing: createSpacing(),
  shadows: {
    small: THEME_CONFIG.shadows.small,
    medium: THEME_CONFIG.shadows.medium,
    large: THEME_CONFIG.shadows.large,
  },
  effects,
  zIndex: {
    modal: 1300,
    popup: 1400,
    header: 1100,
    dropdown: 1200,
  },
  breakpoints: {
    values: breakpointValues,
    up: (key: string): string => {
      const breakpointKey = key as BreakpointKey;
      return `@media (min-width: ${breakpointValues[breakpointKey]}px)`;
    },
    down: (key: string): string => {
      const breakpointKey = key as BreakpointKey;
      return `@media (max-width: ${breakpointValues[breakpointKey] - 0.05}px)`;
    },
    between: (start: string, end: string): string => {
      const startKey = start as BreakpointKey;
      const endKey = end as BreakpointKey;
      return `@media (min-width: ${
        breakpointValues[startKey]
      }px) and (max-width: ${breakpointValues[endKey] - 0.05}px)`;
    },
  },
};
