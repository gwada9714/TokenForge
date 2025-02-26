export const THEME = {
  PRIMARY: '#6366f1',
  PRIMARY_LIGHT: '#818cf8',
  PRIMARY_DARK: '#4f46e5',
  SECONDARY: '#4f46e5',
  SECONDARY_LIGHT: '#6366f1',
  SECONDARY_DARK: '#4338ca',
  SUCCESS: '#22c55e',
  WARNING: '#eab308',
  ERROR: '#ef4444',
  INFO: '#3b82f6',
};

export const BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};

export const COLORS = {
  primary: THEME.PRIMARY,
  primaryLight: THEME.PRIMARY_LIGHT,
  primaryDark: THEME.PRIMARY_DARK,
  secondary: THEME.SECONDARY,
  secondaryLight: THEME.SECONDARY_LIGHT,
  secondaryDark: THEME.SECONDARY_DARK,
  success: THEME.SUCCESS,
  warning: THEME.WARNING,
  error: THEME.ERROR,
  info: THEME.INFO,
  text: '#111827',
  textSecondary: '#4b5563',
  background: '#ffffff',
  surface: '#f9fafb',
};

export const SPACING = {
  unit: 8, // 8px base unit
};

export const THEME_CONFIG = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 16,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
  },
  shape: {
    borderRadius: 8,
  },
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
}; 