// Définition des types pour le thème
export interface Tokens {
  colors: {
    primary: {
      main: string;
      light: string;
      dark: string;
      border?: string;
      hover?: string;
    };
    secondary: {
      main: string;
      light: string;
      dark: string;
      border?: string;
      hover?: string;
    };
    background: {
      default: string;
      paper: string;
      dark: string;
    };
    text: {
      primary: string;
      secondary: string;
      light: string;
    };
    gradient: {
      primary: string;
      secondary: string;
    };
    action: {
      active: string;
      hover: string;
      selected: string;
    };
    error: {
      main: string;
      light: string;
      dark: string;
    };
    success: {
      main: string;
      light: string;
      dark: string;
    };
    warning: {
      main: string;
      light: string;
      dark: string;
    };
  };
  typography: {
    fontFamily: {
      heading: string;
      body: string;
    };
    fontWeight: {
      light: number;
      regular: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    fontSizes: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      "2xl": string;
      "3xl": string;
      "4xl": string;
      "5xl": string;
    };
  };
  borderRadius: {
    none: string;
    small: string;
    medium: string;
    large: string;
    xl: string;
    "2xl": string;
    full: string;
  };
  transitions: {
    default: string;
    fast: string;
    slow: string;
  };
  spacing: (value: number) => string;
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  zIndex: {
    modal: number;
    popup: number;
    header: number;
    dropdown: number;
  };
  breakpoints: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    "2xl": string;
  };
}

export const tokens: Tokens = {
  colors: {
    primary: {
      main: "#182038",
      light: "#2A3352",
      dark: "#0F1525",
      border: "#2A3352",
      hover: "#0F1525",
    },
    secondary: {
      main: "#D97706",
      light: "#F59E0B",
      dark: "#B45309",
      border: "#F59E0B",
      hover: "#B45309",
    },
    background: {
      default: "#F5F5F5",
      paper: "#FFFFFF",
      dark: "#121212",
    },
    text: {
      primary: "#182038",
      secondary: "#4B5563",
      light: "#F5F5F5",
    },
    gradient: {
      primary: "linear-gradient(45deg, #182038 30%, #2A3352 90%)",
      secondary: "linear-gradient(45deg, #D97706 30%, #F59E0B 90%)",
    },
    action: {
      active: "#D97706",
      hover: "#F59E0B",
      selected: "#B45309",
    },
    error: {
      main: "#DC2626",
      light: "#EF4444",
      dark: "#B91C1C",
    },
    success: {
      main: "#059669",
      light: "#10B981",
      dark: "#047857",
    },
    warning: {
      main: "#D97706",
      light: "#F59E0B",
      dark: "#B45309",
    },
  },
  typography: {
    fontFamily: {
      heading: "'Inter', sans-serif",
      body: "'Inter', sans-serif",
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
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
    },
  },
  borderRadius: {
    none: "0",
    small: "0.25rem",
    medium: "0.375rem",
    large: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    full: "9999px",
  },
  transitions: {
    default: "all 0.2s ease-in-out",
    fast: "all 0.1s ease-in-out",
    slow: "all 0.3s ease-in-out",
  },
  spacing: (value: number) => `${value * 0.25}rem`,
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  },
  zIndex: {
    modal: 1000,
    popup: 900,
    header: 800,
    dropdown: 700,
  },
  breakpoints: {
    xs: "320px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
};

// Create a type-safe theme object that matches styled-components DefaultTheme
const theme = {
  colors: {
    primary: tokens.colors.primary,
    secondary: tokens.colors.secondary,
    background: tokens.colors.background,
    text: tokens.colors.text,
    gradient: {
      primary: "linear-gradient(135deg, #182038 0%, #2A3352 100%)",
      secondary: tokens.colors.gradient.secondary,
    },
    action: tokens.colors.action,
    error: tokens.colors.error,
    success: tokens.colors.success,
    warning: tokens.colors.warning,
  },
  typography: tokens.typography,
  spacing: tokens.spacing,
  borderRadius: tokens.borderRadius,
  shadows: tokens.shadows,
  transitions: tokens.transitions,
  zIndex: tokens.zIndex,
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
};

export default theme;
