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
    colors: {
      text: {
        primary: string;
        secondary: string;
      };
      background: {
        primary: string;
        secondary: string;
      };
      primary: string;
      secondary: string;
      success: string;
      warning: string;
      forge: string;
      ember: string;
    };
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
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
        '2xl': string;
        '3xl': string;
        '4xl': string;
        '5xl': string;
      };
    };
    spacing: (value: number) => string;
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
  text: {
    primary: '#1A1A1A',
    secondary: '#4A4A4A'
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F5F5'
  },
  primary: '#3B82F6',
  secondary: '#10B981',
  success: '#22C55E',
  warning: '#F59E0B',
  forge: '#6366F1',
  ember: '#EF4444'
};

const typography = {
  fontFamily: {
    heading: '"Inter", sans-serif',
    body: '"Inter", sans-serif'
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
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem'
  }
};

const breakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920
  },
  up: (key: string) => `@media (min-width: ${breakpoints.values[key as keyof typeof breakpoints.values]}px)`,
  down: (key: string) => `@media (max-width: ${breakpoints.values[key as keyof typeof breakpoints.values] - 0.05}px)`,
  between: (start: string, end: string) => `@media (min-width: ${breakpoints.values[start as keyof typeof breakpoints.values]}px) and (max-width: ${breakpoints.values[end as keyof typeof breakpoints.values] - 0.05}px)`
};

const spacing = (value: number) => `${value * 0.25}rem`;

const borderRadius = {
  small: '0.25rem',
  medium: '0.5rem',
  large: '1rem'
};

const shadows = {
  small: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  medium: '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
  large: '0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)'
};

const transitions = {
  default: '0.3s ease-in-out',
  fast: '0.15s ease-in-out',
  slow: '0.5s ease-in-out'
};

const zIndex = {
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500
};

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
          backgroundColor: colors.forge,
          color: "#ffffff",
          "&:hover": {
            backgroundColor: colors.forge,
          },
          "&:active": {
            backgroundColor: colors.forge,
          },
        },
      },
      {
        props: { variant: "ember" },
        style: {
          backgroundColor: colors.ember,
          color: "#ffffff",
          "&:hover": {
            backgroundColor: colors.ember,
          },
          "&:active": {
            backgroundColor: colors.ember,
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
          borderLeft: `4px solid ${colors.forge}`,
        },
      },
      {
        props: { variant: "ember" },
        style: {
          borderLeft: `4px solid ${colors.ember}`,
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
            borderColor: colors.forge,
          },
          "&:hover fieldset": {
            borderColor: colors.forge,
          },
          "&.Mui-focused fieldset": {
            borderColor: colors.forge,
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
    gradient: {
      primary: "linear-gradient(135deg, #182038 0%, #2a3654 100%)",
      secondary: "linear-gradient(135deg, #D97706 0%, #f59e0b 100%)",
      forge: "linear-gradient(45deg, #182038 0%, #2a3654 50%, #182038 100%)",
    },
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
  typography,
  spacing,
  breakpoints,
  borderRadius,
  shadows,
  transitions,
  zIndex
};
