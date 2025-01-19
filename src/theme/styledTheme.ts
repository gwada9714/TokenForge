import { DefaultTheme } from 'styled-components';

type BreakpointKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type SpacingKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'base';

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
      default: "#0c1019",
      paper: "#182038",
      dark: "#000000"
    },
    gradient: {
      primary: "linear-gradient(135deg, #182038 0%, #2a3654 100%)",
      secondary: "linear-gradient(135deg, #D97706 0%, #f59e0b 100%)",
      forge: "linear-gradient(45deg, #182038 0%, #2a3654 50%, #182038 100%)"
    },
    forge: {
      main: "#182038",
      dark: "#0c1019",
      light: "#2a3654",
      border: "#2a3654",
      hover: "#2a3654",
      metallic: "linear-gradient(45deg, #182038 0%, #2a3654 50%, #182038 100%)",
      glow: "rgba(217, 119, 6, 0.4)"
    }
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
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    base: '1rem'
  },
  borderRadius: {
    sm: "0.25rem",
    md: "0.5rem",
    lg: "1rem"
  },
  transitions: {
    default: "all 0.3s ease-in-out",
    fast: "all 0.15s ease-in-out",
    slow: "all 0.5s ease-in-out"
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
