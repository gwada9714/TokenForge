import { DefaultTheme } from 'styled-components';
import { breakpoints } from './breakpoints';

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
      dark: "#15803d",
    },
    forge: {
      main: "#182038",
      dark: "#0c1019",
      light: "#2a3654",
      metallic: "linear-gradient(45deg, #182038 0%, #2a3654 50%, #182038 100%)",
      glow: "rgba(217, 119, 6, 0.4)",
      border: "#2a3654",
      hover: "#2a3654",
    },
    warning: {
      main: "#f59e0b",
      light: "#fcd34d",
      dark: "#b45309",
    },
    ember: {
      main: "#f97316",
      light: "#fdba74",
      dark: "#c2410c",
    },
    background: {
      default: "#0c1019",
      paper: "#182038",
      dark: "#000000",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#6B7280",
      light: "#FFFFFF",
    },
    gradient: {
      primary: "linear-gradient(135deg, #182038 0%, #2a3654 100%)",
      secondary: "linear-gradient(135deg, #D97706 0%, #f59e0b 100%)",
      forge: "linear-gradient(45deg, #182038 0%, #2a3654 50%, #182038 100%)",
    },
  },
  typography: {
    fontFamily: {
      heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800
    },
    fontSizes: {
      xs: "0.75rem",
      sm: "0.875rem",
      md: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
      "5xl": "3rem",
      "6xl": "4rem"
    },
  },
  spacing: {
    xs: "0.5rem",
    sm: "1rem",
    md: "1.5rem",
    lg: "2rem",
    xl: "2.5rem"
  },
  borderRadius: {
    sm: "0.25rem",
    md: "0.5rem",
    lg: "1rem",
  },
  zIndex: {
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
  },
  breakpoints,
};

export default theme;
