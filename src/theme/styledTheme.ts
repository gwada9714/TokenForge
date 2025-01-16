export const theme = {
  colors: {
    primary: {
      main: "#182038",
      light: "#2a3654",
      dark: "#0c1019",
    },
    secondary: {
      main: "#D97706",
      light: "#f59e0b",
      dark: "#b45309",
    },
    background: {
      default: "#F5F5F5",
      paper: "#FFFFFF",
      dark: "#E5E5E5",
    },
    text: {
      primary: "#1F2937",
      secondary: "#6B7280",
      light: "#FFFFFF",
    },
    forge: {
      glow: "rgba(217, 119, 6, 0.4)",
      metallic: "linear-gradient(45deg, #182038 0%, #2a3654 50%, #182038 100%)",
    },
    gradient: {
      primary: "linear-gradient(135deg, #182038 0%, #2a3654 100%)",
      secondary: "linear-gradient(135deg, #D97706 0%, #f59e0b 100%)",
    },
    action: {
      active: "#182038",
      hover: "#2a3654",
      selected: "#0c1019",
    },
    error: {
      main: "#DC2626",
      light: "#EF4444",
      dark: "#B91C1C",
    },
    success: {
      main: "#22C55E",
      light: "#4ADE80",
      dark: "#16A34A",
    },
    warning: {
      main: "#F59E0B",
      light: "#FBBF24",
      dark: "#D97706",
    },
  },
  typography: {
    fontFamily: {
      heading: "Montserrat, system-ui, sans-serif",
      body: "Open Sans, system-ui, sans-serif",
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
      "5xl": "3rem",
    },
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem",
  },
  borderRadius: {
    sm: "0.25rem",
    md: "0.5rem",
    lg: "1rem",
    xl: "1.5rem",
    full: "9999px",
  },
  shadows: {
    sm: "0 1px 3px rgba(0,0,0,0.12)",
    md: "0 4px 6px rgba(0,0,0,0.1)",
    lg: "0 10px 15px rgba(0,0,0,0.1)",
  },
  transitions: {
    default: "all 0.2s ease-in-out",
    slow: "all 0.3s ease-in-out",
    fast: "all 0.1s ease-in-out",
  },
  zIndex: {
    navbar: 1000,
    modal: 1300,
    tooltip: 1500,
  },
} as const;
