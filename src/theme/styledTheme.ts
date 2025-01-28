import { DefaultTheme } from 'styled-components';

type BreakpointKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ColorSet {
  main: string;
  light: string;
  dark: string;
  border?: string;
  hover?: string;
}

interface ExtendedColorSet extends ColorSet {
  metallic?: string;
  glow?: string;
}

const breakpointValues: Record<BreakpointKey, number> = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920
};

const createSpacing = () => {
  const spacing = (value: number): string => `${value * 0.25}rem`;
  spacing.xs = '0.25rem';
  spacing.sm = '0.5rem';
  spacing.md = '1rem';
  spacing.lg = '1.5rem';
  spacing.xl = '2rem';
  spacing.base = '1rem';
  return spacing;
};

export const theme: DefaultTheme = {
  colors: {
    primary: {
      main: "#f97316",
      light: "#fdba74",
      dark: "#c2410c",
      border: "#fdba74",
      hover: "#c2410c"
    } as ColorSet,
    secondary: {
      main: "#3b82f6",
      light: "#93c5fd",
      dark: "#1d4ed8",
      border: "#93c5fd",
      hover: "#1d4ed8"
    } as ColorSet,
    success: {
      main: "#22c55e",
      light: "#86efac",
      dark: "#15803d"
    } as ColorSet,
    warning: {
      main: "#f59e0b",
      light: "#fcd34d",
      dark: "#b45309"
    } as ColorSet,
    error: {
      main: "#ef4444",
      light: "#fca5a5",
      dark: "#b91c1c"
    } as ColorSet,
    info: {
      main: "#3b82f6",
      light: "#93c5fd",
      dark: "#1d4ed8"
    } as ColorSet,
    grey: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827"
    },
    text: {
      primary: "#111827",
      secondary: "#4b5563",
      disabled: "#9ca3af"
    },
    background: {
      default: "#ffffff",
      paper: "#f9fafb"
    },
    ember: {
      main: "#f97316",
      light: "#fdba74",
      dark: "#c2410c",
      border: "#fdba74",
      hover: "#c2410c",
      metallic: "#B87333",
      glow: "#FFA500"
    } as ExtendedColorSet,
    forge: {
      main: "#f97316",
      light: "#fdba74",
      dark: "#c2410c",
      border: "#fdba74",
      hover: "#c2410c",
      metallic: "#B87333",
      glow: "#FFA500"
    } as ExtendedColorSet,
    gradient: {
      primary: "linear-gradient(45deg, #f97316 30%, #fdba74 90%)",
      secondary: "linear-gradient(45deg, #3b82f6 30%, #93c5fd 90%)",
      forge: "linear-gradient(45deg, #f97316 30%, #c2410c 90%)"
    }
  },
  typography: {
    fontFamily: {
      heading: "'Inter', sans-serif",
      body: "'Inter', sans-serif"
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    fontSizes: {
      xs: "0.75rem",
      small: "0.875rem",
      medium: "1rem",
      large: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem"
    }
  },
  borderRadius: {
    none: "0",
    small: "0.25rem",
    medium: "0.375rem",
    large: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    full: "9999px"
  },
  transitions: {
    default: "all 0.2s ease-in-out",
    fast: "all 0.1s ease-in-out",
    slow: "all 0.3s ease-in-out"
  },
  spacing: createSpacing(),
  breakpoints: {
    values: breakpointValues,
    up: (key: BreakpointKey): string => `@media (min-width: ${breakpointValues[key]}px)`,
    down: (key: BreakpointKey): string => `@media (max-width: ${breakpointValues[key] - 0.05}px)`,
    between: (start: BreakpointKey, end: BreakpointKey): string =>
      `@media (min-width: ${breakpointValues[start]}px) and (max-width: ${breakpointValues[end] - 0.05}px)`
  }
};

export default theme;
