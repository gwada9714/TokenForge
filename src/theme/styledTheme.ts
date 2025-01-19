import { DefaultTheme } from 'styled-components';

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
    background: {
      default: "#0c1019",
      paper: "#182038",
      dark: "#000000"
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#6B7280",
      disabled: "#9e9e9e",
      light: "#FFFFFF"
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
    gradient: {
      primary: "linear-gradient(135deg, #182038 0%, #2a3654 100%)",
      secondary: "linear-gradient(135deg, #D97706 0%, #f59e0b 100%)",
      forge: "linear-gradient(45deg, #182038 0%, #2a3654 50%, #182038 100%)",
    },
  },
  typography: {
    fontFamily: {
      heading: "'Poppins', sans-serif",
      body: "'Inter', sans-serif"
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    base: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem'
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
  breakpoints: {
    xs: '0px',
    sm: '600px',
    md: '960px',
    lg: '1280px',
    xl: '1920px',
    up: (key: string) => `@media (min-width: ${theme.breakpoints[key as keyof typeof theme.breakpoints]})`,
    down: (key: string) => `@media (max-width: ${theme.breakpoints[key as keyof typeof theme.breakpoints]})`,
    between: (start: string, end: string) => 
      `@media (min-width: ${theme.breakpoints[start as keyof typeof theme.breakpoints]}) and (max-width: ${theme.breakpoints[end as keyof typeof theme.breakpoints]})`
  },
  transitions: {
    default: "all 0.3s ease-in-out",
    fast: "all 0.15s ease-in-out",
    slow: "all 0.5s ease-in-out"
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
  },
};

export default theme;
