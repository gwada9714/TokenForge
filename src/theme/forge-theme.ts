import { createTheme, Theme, ThemeOptions } from "@mui/material/styles";
import { Components } from "@mui/material/styles";

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
    secondary: '#4A5568'
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F7FAFC'
  },
  primary: {
    main: '#182038',
    light: '#2a3654',
    dark: '#0f1525',
    contrastText: '#FFFFFF'
  },
  secondary: {
    main: '#D97706',
    light: '#f59e0b',
    dark: '#92400e',
    contrastText: '#FFFFFF'
  },
  success: {
    main: '#059669',
    light: '#10b981',
    dark: '#047857',
    contrastText: '#FFFFFF'
  },
  warning: {
    main: '#D97706',
    light: '#f59e0b',
    dark: '#92400e',
    contrastText: '#FFFFFF'
  },
  forge: {
    main: '#182038',
    dark: '#0f1525',
    light: '#2a3654',
    border: '#2d3748',
    hover: '#2a3654',
    metallic: '#4a5568',
    glow: '#6b7280'
  },
  ember: '#D97706'
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
  small: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  large: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
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

const components: Components<Theme> = {
  MuiButton: {
    variants: [
      {
        props: { variant: "forge" },
        style: {
          background: colors.forge.main,
          color: "#FFFFFF",
          "&:hover": {
            background: colors.forge.hover,
          },
        },
      },
      {
        props: { variant: "ember" },
        style: {
          background: colors.ember,
          color: "#FFFFFF",
          "&:hover": {
            background: colors.warning.light,
          },
        },
      },
    ],
  },
  MuiPaper: {
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
            borderColor: colors.forge.main,
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
    values: breakpoints.values,
  },
  palette: {
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    warning: colors.warning,
    background: {
      default: colors.background.primary,
      paper: colors.background.secondary
    },
    text: colors.text,
    gradient: {
      primary: "linear-gradient(135deg, #182038 0%, #2a3654 100%)",
      secondary: "linear-gradient(135deg, #D97706 0%, #f59e0b 100%)",
      forge: "linear-gradient(45deg, #182038 0%, #2a3654 50%, #182038 100%)",
    },
    forge: colors.forge,
  },
  typography: {
    fontFamily: typography.fontFamily.body,
    h1: {
      fontFamily: typography.fontFamily.heading,
      fontSize: typography.fontSizes["5xl"],
      fontWeight: typography.fontWeight.bold,
    },
    h2: {
      fontFamily: typography.fontFamily.heading,
      fontSize: typography.fontSizes["4xl"],
      fontWeight: typography.fontWeight.bold,
    },
    h3: {
      fontFamily: typography.fontFamily.heading,
      fontSize: typography.fontSizes["3xl"],
      fontWeight: typography.fontWeight.semibold,
    },
    h4: {
      fontFamily: typography.fontFamily.heading,
      fontSize: typography.fontSizes["2xl"],
      fontWeight: typography.fontWeight.semibold,
    },
    h5: {
      fontFamily: typography.fontFamily.heading,
      fontSize: typography.fontSizes.xl,
      fontWeight: typography.fontWeight.medium,
    },
    h6: {
      fontFamily: typography.fontFamily.heading,
      fontSize: typography.fontSizes.lg,
      fontWeight: typography.fontWeight.medium,
    },
    body1: {
      fontSize: typography.fontSizes.md,
    },
    body2: {
      fontSize: typography.fontSizes.sm,
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  zIndex,
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
