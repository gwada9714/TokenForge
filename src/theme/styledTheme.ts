import { DefaultTheme } from 'styled-components';

type BreakpointKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const breakpointValues: Record<BreakpointKey, number> = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920
};

export const theme: DefaultTheme = {
  colors: {
    primary: {
      main: "#f97316",
      light: "#fdba74",
      dark: "#c2410c",
      border: "#fdba74",
      hover: "#c2410c"
    },
    secondary: {
      main: "#3b82f6",
      light: "#93c5fd",
      dark: "#1d4ed8",
      border: "#93c5fd",
      hover: "#1d4ed8"
    },
    success: {
      main: "#22c55e",
      light: "#86efac",
      dark: "#15803d"
    },
    warning: {
      main: "#f59e0b",
      light: "#fcd34d",
      dark: "#b45309"
    },
    ember: {
      main: "#f97316",
      light: "#fdba74",
      dark: "#c2410c",
      border: "#fdba74",
      hover: "#c2410c"
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#6B7280",
      light: "#FFFFFF"
    },
    background: {
      default: "#0F172A",
      paper: "#1E293B",
      dark: "#020617"
    },
    gradient: {
      primary: "linear-gradient(45deg, #f97316 30%, #fdba74 90%)",
      secondary: "linear-gradient(45deg, #3b82f6 30%, #93c5fd 90%)",
      forge: "linear-gradient(45deg, #f97316 30%, #c2410c 90%)"
    },
    forge: {
      main: "#f97316",
      light: "#fdba74",
      dark: "#c2410c",
      border: "#fdba74",
      hover: "#c2410c",
      metallic: "#B87333",
      glow: "#FFA500"
    }
  },
  typography: {
    fontFamily: {
      heading: "'Montserrat', sans-serif",
      body: "'Roboto', sans-serif"
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    fontSizes: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      md: "1.125rem",
      lg: "1.25rem",
      xl: "1.5rem",
      '2xl': "1.875rem",
      '3xl': "2.25rem",
      '4xl': "3rem",
      '5xl': "3.75rem"
    }
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    base: "1rem",
    md: "1.5rem",
    lg: "2rem",
    xl: "3rem"
  },
  breakpoints: {
    values: breakpointValues,
    up: (key: BreakpointKey) => `@media (min-width: ${breakpointValues[key]}px)`,
    down: (key: BreakpointKey) => `@media (max-width: ${breakpointValues[key] - 0.05}px)`,
    between: (start: BreakpointKey, end: BreakpointKey) => 
      `@media (min-width: ${breakpointValues[start]}px) and (max-width: ${breakpointValues[end] - 0.05}px)`
  }
};

export default theme;
