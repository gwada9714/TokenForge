import { createTheme, Theme, ThemeOptions } from "@mui/material/styles";
import { Components } from "@mui/material/styles";
import { PaletteColor, PaletteColorOptions } from "@mui/material";

// Extend the Material-UI theme interface
declare module "@mui/material/styles" {
  interface Theme {
    gradient: {
      primary: string;
      secondary: string;
      forge: string;
    };
    forge: {
      main: string;
      dark: string;
      light: string;
      border: string;
      hover: string;
      metallic: string;
      glow: string;
    };
  }
  interface ThemeOptions {
    gradient?: {
      primary?: string;
      secondary?: string;
      forge?: string;
    };
    forge?: {
      main?: string;
      dark?: string;
      light?: string;
      border?: string;
      hover?: string;
      metallic?: string;
      glow?: string;
    };
  }
  interface Palette {
    success: PaletteColor;
    gradient: {
      primary: string;
      secondary: string;
      forge: string;
    };
    forge: {
      main: string;
      dark: string;
      light: string;
      border: string;
      hover: string;
      metallic: string;
      glow: string;
    };
  }
  interface PaletteOptions {
    success?: PaletteColorOptions;
    gradient?: {
      primary?: string;
      secondary?: string;
      forge?: string;
    };
    forge?: {
      main?: string;
      dark?: string;
      light?: string;
      border?: string;
      hover?: string;
      metallic?: string;
      glow?: string;
    };
  }
}

// Extend styled-components theme
declare module "styled-components" {
  export interface DefaultTheme {
    colors: typeof colors;
    typography: {
      fontFamily: {
        heading: string;
        body: string;
      };
      fontWeight: {
        normal: number;
        medium: number;
        semibold: number;
        bold: number;
      };
      fontSizes: {
        small: string;
        medium: string;
        large: string;
      };
    };
    spacing: (value: number) => string;
    borderRadius: {
      small: string;
      medium: string;
      large: string;
    };
    shadows: {
      small: string;
      medium: string;
      large: string;
    };
    transitions: {
      default: string;
      fast: string;
      slow: string;
    };
    zIndex: {
      appBar: number;
      drawer: number;
      modal: number;
      snackbar: number;
      tooltip: number;
    };
    breakpoints: {
      values: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
      };
      up: (key: string) => string;
      down: (key: string) => string;
      between: (start: string, end: string) => string;
    };
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsVariantOverrides {
    forge: true;
    ember: true;
  }
}

declare module "@mui/material/Paper" {
  interface PaperPropsVariantOverrides {
    forge: true;
    ember: true;
  }
}

const colors = {
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
  success: {
    main: "#059669",
    light: "#34d399",
    dark: "#047857",
  },
  forge: {
    main: "#FF6B2B",
    dark: "#E65A1F",
    light: "#FF8C5A",
    border: "#FFE0B2",
    hover: "#FF7A40",
    metallic: "#FFC107",
    glow: "#FFD700",
  },
  ember: {
    main: "#FF4B2B",
    dark: "#E63A1F",
    light: "#FF6C5A",
    border: "#FFCDD2",
    hover: "#FF5A40",
  },
  background: {
    default: "#F5F5F5",
    paper: "#FFFFFF",
    dark: "#1e293b",
  },
  text: {
    primary: "#1F2937",
    secondary: "#6B7280",
    light: "#f8fafc",
  },
  gradient: {
    primary: "linear-gradient(135deg, #182038 0%, #2a3654 100%)",
    secondary: "linear-gradient(135deg, #D97706 0%, #f59e0b 100%)",
    forge: "linear-gradient(45deg, #182038 0%, #2a3654 50%, #182038 100%)",
  },
  warning: {
    main: "#f59e0b",
    light: "#fbbf24",
    dark: "#d97706",
  },
};

const spacing = {
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
  '4xl': '6rem',
};

const spacingFunction = (value: number): string => `${value * 0.25}rem`;

const components: Components<Omit<Theme, "components">> = {
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: "none",
        borderRadius: "8px",
        padding: "8px 16px",
      },
    },
    variants: [
      {
        props: { variant: "forge" },
        style: {
          backgroundColor: colors.forge.main,
          color: "#ffffff",
          "&:hover": {
            backgroundColor: colors.forge.hover,
          },
          "&:active": {
            backgroundColor: colors.forge.dark,
          },
        },
      },
      {
        props: { variant: "ember" },
        style: {
          backgroundColor: colors.ember.main,
          color: "#ffffff",
          "&:hover": {
            backgroundColor: colors.ember.hover,
          },
          "&:active": {
            backgroundColor: colors.ember.dark,
          },
        },
      },
    ],
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: "16px",
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
      },
    },
    variants: [
      {
        props: { variant: "forge" },
        style: {
          borderLeft: `4px solid ${colors.forge.main}`,
        },
      },
      {
        props: { variant: "ember" },
        style: {
          borderLeft: `4px solid ${colors.ember.main}`,
        },
      },
    ],
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        "& .MuiOutlinedInput-root": {
          borderRadius: "8px",
          "& fieldset": {
            borderColor: colors.forge.border,
          },
          "&:hover fieldset": {
            borderColor: colors.forge.hover,
          },
          "&.Mui-focused fieldset": {
            borderColor: colors.forge.main,
          },
        },
      },
    },
  },
};

const themeOptions: ThemeOptions = {
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  palette: {
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    background: colors.background,
    text: colors.text,
    warning: colors.warning,
    gradient: colors.gradient,
    forge: colors.forge,
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  zIndex: {
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
  },
  components,
};

export const forgeTheme = createTheme(themeOptions);

export const styledTheme = {
  colors,
  typography: {
    fontFamily: {
      heading: '"Inter", "Helvetica", "Arial", sans-serif',
      body: '"Inter", "Helvetica", "Arial", sans-serif',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    fontSizes: {
      small: '0.875rem',
      medium: '1rem',
      large: '1.125rem',
    },
  },
  spacing: spacingFunction,
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
  },
  shadows: {
    small: '0 2px 4px rgba(0,0,0,0.1)',
    medium: '0 4px 8px rgba(0,0,0,0.1)',
    large: '0 8px 16px rgba(0,0,0,0.1)',
  },
  transitions: {
    default: '0.3s ease-in-out',
    fast: '0.15s ease-in-out',
    slow: '0.5s ease-in-out',
  },
  zIndex: {
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
    up: (key: string) => `@media (min-width: ${
      key === 'xs' ? 0 : key === 'sm' ? 600 : key === 'md' ? 960 : key === 'lg' ? 1280 : 1920
    }px)`,
    down: (key: string) => `@media (max-width: ${
      key === 'xs' ? 599 : key === 'sm' ? 959 : key === 'md' ? 1279 : key === 'lg' ? 1919 : 9999
    }px)`,
    between: (start: string, end: string) => {
      const min = start === 'xs' ? 0 : start === 'sm' ? 600 : start === 'md' ? 960 : start === 'lg' ? 1280 : 1920;
      const max = end === 'xs' ? 599 : end === 'sm' ? 959 : end === 'md' ? 1279 : end === 'lg' ? 1919 : 9999;
      return `@media (min-width: ${min}px) and (max-width: ${max}px)`;
    },
  },
};
