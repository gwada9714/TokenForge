import { createTheme, Theme, ThemeOptions } from "@mui/material/styles";
import { Components } from "@mui/material/styles";
import {
  COLORS,
  FORGE_COLORS,
  BLOCKCHAIN_COLORS,
  SPACING,
  THEME_CONFIG,
} from "@/config/constants/theme";

// Extend the Material-UI theme interface
declare module "@mui/material/styles" {
  interface Theme {
    gradient: {
      primary: string;
      secondary: string;
      forge: string;
      ember: string;
      gold: string;
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
    ember: {
      main: string;
      dark: string;
      light: string;
      border: string;
      hover: string;
      metallic: string;
      glow: string;
    };
    gold: {
      main: string;
      dark: string;
      light: string;
      border: string;
      hover: string;
      metallic: string;
      glow: string;
    };
    blockchain: {
      ethereum: string;
      binance: string;
      polygon: string;
      avalanche: string;
      solana: {
        from: string;
        to: string;
      };
      arbitrum: string;
    };
    effects: {
      forgeGlow: string;
      metalShine: string;
      heatEffect: string;
      circuitPattern: string;
      metalTexture: string;
    };
  }

  interface ThemeOptions {
    gradient?: {
      primary?: string;
      secondary?: string;
      forge?: string;
      ember?: string;
      gold?: string;
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
    ember?: {
      main?: string;
      dark?: string;
      light?: string;
      border?: string;
      hover?: string;
      metallic?: string;
      glow?: string;
    };
    gold?: {
      main?: string;
      dark?: string;
      light?: string;
      border?: string;
      hover?: string;
      metallic?: string;
      glow?: string;
    };
    blockchain?: {
      ethereum?: string;
      binance?: string;
      polygon?: string;
      avalanche?: string;
      solana?: {
        from?: string;
        to?: string;
      };
      arbitrum?: string;
    };
    effects?: {
      forgeGlow?: string;
      metalShine?: string;
      heatEffect?: string;
      circuitPattern?: string;
      metalTexture?: string;
    };
  }

  interface Palette {
    gradient: {
      primary: string;
      secondary: string;
      forge: string;
      ember: string;
      gold: string;
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
    ember: {
      main: string;
      dark: string;
      light: string;
      border: string;
      hover: string;
      metallic: string;
      glow: string;
    };
    gold: {
      main: string;
      dark: string;
      light: string;
      border: string;
      hover: string;
      metallic: string;
      glow: string;
    };
    blockchain: {
      ethereum: string;
      binance: string;
      polygon: string;
      avalanche: string;
      solana: {
        from: string;
        to: string;
      };
      arbitrum: string;
    };
  }

  interface PaletteOptions {
    gradient?: {
      primary?: string;
      secondary?: string;
      forge?: string;
      ember?: string;
      gold?: string;
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
    ember?: {
      main?: string;
      dark?: string;
      light?: string;
      border?: string;
      hover?: string;
      metallic?: string;
      glow?: string;
    };
    gold?: {
      main?: string;
      dark?: string;
      light?: string;
      border?: string;
      hover?: string;
      metallic?: string;
      glow?: string;
    };
    blockchain?: {
      ethereum?: string;
      binance?: string;
      polygon?: string;
      avalanche?: string;
      solana?: {
        from?: string;
        to?: string;
      };
      arbitrum?: string;
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
        disabled: string;
      };
      background: {
        default: string;
        paper: string;
      };
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
      error: {
        main: string;
        light: string;
        dark: string;
      };
      info: {
        main: string;
        light: string;
        dark: string;
      };
      grey: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
      };
      forge: {
        main: string;
        light: string;
        dark: string;
        border: string;
        hover: string;
        metallic: string;
        glow: string;
      };
      ember: {
        main: string;
        light: string;
        dark: string;
        border: string;
        hover: string;
        metallic: string;
        glow: string;
      };
      gold: {
        main: string;
        light: string;
        dark: string;
        border: string;
        hover: string;
        metallic: string;
        glow: string;
      };
      gradient: {
        primary: string;
        secondary: string;
        forge: string;
        ember: string;
        gold: string;
      };
      blockchain: {
        ethereum: string;
        binance: string;
        polygon: string;
        avalanche: string;
        solana: {
          from: string;
          to: string;
        };
        arbitrum: string;
      };
    };
    typography: {
      fontFamily: {
        heading: string;
        body: string;
        code: string;
      };
      fontWeight: {
        light: number;
        regular: number;
        medium: number;
        semibold: number;
        bold: number;
        extraBold: number;
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
      headings: {
        h1: {
          fontSize: string;
          lineHeight: string;
          fontWeight: number;
          letterSpacing: string;
          fontFamily: string;
        };
        h2: {
          fontSize: string;
          lineHeight: string;
          fontWeight: number;
          fontFamily: string;
        };
        h3: {
          fontSize: string;
          lineHeight: string;
          fontWeight: number;
          fontFamily: string;
        };
        h4: {
          fontSize: string;
          lineHeight: string;
          fontWeight: number;
          fontFamily: string;
        };
        h5: {
          fontSize: string;
          lineHeight: string;
          fontWeight: number;
          fontFamily: string;
          textTransform: string;
        };
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
      none: string;
      small: string;
      medium: string;
      large: string;
      xl: string;
      "2xl": string;
      full: string;
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
    effects: {
      forgeGlow: string;
      metalShine: string;
      heatEffect: string;
      circuitPattern: string;
      metalTexture: string;
    };
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsVariantOverrides {
    forge: true;
    ember: true;
    gold: true;
  }
}

declare module "@mui/material/Paper" {
  interface PaperPropsVariantOverrides {
    forge: true;
    ember: true;
    gold: true;
  }
}

declare module "@mui/material/Card" {
  interface CardPropsVariantOverrides {
    forge: true;
    ember: true;
    gold: true;
    // premium: true; // Commenté car il cause des problèmes de type
  }
}

// Thème "La Forge Numérique"
const colors = {
  text: {
    primary: COLORS.text, // Blanc ivoire
    secondary: COLORS.textSecondary, // Gris acier
    disabled: "#9ca3af",
  },
  background: {
    default: COLORS.background, // Bleu nuit profond
    paper: COLORS.surface, // Version plus claire du bleu nuit
  },
  primary: {
    main: COLORS.primary, // Bleu nuit profond
    light: COLORS.primaryLight,
    dark: COLORS.primaryDark,
    contrastText: FORGE_COLORS.ivory, // Blanc ivoire
  },
  secondary: {
    main: COLORS.secondary, // Orange incandescent
    light: COLORS.secondaryLight,
    dark: COLORS.secondaryDark,
    contrastText: FORGE_COLORS.ivory, // Blanc ivoire
  },
  success: {
    main: COLORS.success, // Vert émeraude
    light: "#86efac", // Version plus claire
    dark: "#059669", // Version plus foncée
    contrastText: FORGE_COLORS.ivory, // Blanc ivoire
  },
  warning: {
    main: COLORS.warning, // Ambre (même que l'orange)
    light: COLORS.secondaryLight,
    dark: COLORS.secondaryDark,
    contrastText: FORGE_COLORS.ivory, // Blanc ivoire
  },
  error: {
    main: COLORS.error, // Rouge rubis
    light: "#fca5a5", // Version plus claire
    dark: "#b91c1c", // Version plus foncée
    contrastText: FORGE_COLORS.ivory, // Blanc ivoire
  },
  info: {
    main: COLORS.info, // Bleu électrique
    light: "#93c5fd", // Version plus claire
    dark: "#1d4ed8", // Version plus foncée
    contrastText: FORGE_COLORS.ivory, // Blanc ivoire
  },
  forge: {
    main: COLORS.primary, // Bleu nuit profond
    dark: COLORS.primaryDark,
    light: COLORS.primaryLight,
    border: FORGE_COLORS.steel, // Gris acier
    hover: COLORS.primaryLight,
    metallic: FORGE_COLORS.steel, // Gris acier
    glow: COLORS.info, // Bleu électrique
  },
  ember: {
    main: COLORS.secondary, // Orange incandescent
    dark: COLORS.secondaryDark,
    light: COLORS.secondaryLight,
    border: COLORS.secondaryLight,
    hover: COLORS.secondaryDark,
    metallic: "#B87333", // Cuivre métallique
    glow: "#FFA500", // Lueur orange
  },
  gold: {
    main: COLORS.gold, // Doré métallique
    dark: "#B7950B", // Version plus foncée
    light: "#F5D76E", // Version plus claire
    border: "#F5D76E",
    hover: "#B7950B",
    metallic: COLORS.gold, // Doré métallique
    glow: "#FFD700", // Lueur dorée
  },
};

const typography = {
  fontFamily: {
    heading: THEME_CONFIG.typography.fontFamily.heading,
    body: THEME_CONFIG.typography.fontFamily.body,
    code: THEME_CONFIG.typography.fontFamily.code,
  },
  fontWeight: {
    light: THEME_CONFIG.typography.fontWeightLight,
    regular: THEME_CONFIG.typography.fontWeightRegular,
    medium: THEME_CONFIG.typography.fontWeightMedium,
    semibold: THEME_CONFIG.typography.fontWeightSemiBold,
    bold: THEME_CONFIG.typography.fontWeightBold,
    extraBold: THEME_CONFIG.typography.fontWeightExtraBold,
  },
  fontSizes: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    md: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
  },
};

const breakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920,
  },
  up: (key: string) =>
    `@media (min-width: ${
      breakpoints.values[key as keyof typeof breakpoints.values]
    }px)`,
  down: (key: string) =>
    `@media (max-width: ${
      breakpoints.values[key as keyof typeof breakpoints.values] - 0.05
    }px)`,
  between: (start: string, end: string) =>
    `@media (min-width: ${
      breakpoints.values[start as keyof typeof breakpoints.values]
    }px) and (max-width: ${
      breakpoints.values[end as keyof typeof breakpoints.values] - 0.05
    }px)`,
};

const spacing = (value: number) => `${value * 0.25}rem`;

const borderRadius = {
  small: THEME_CONFIG.shape.borderRadius.small + "px",
  medium: THEME_CONFIG.shape.borderRadius.medium + "px",
  large: THEME_CONFIG.shape.borderRadius.large + "px",
};

const shadows = {
  small: THEME_CONFIG.shadows.small,
  medium: THEME_CONFIG.shadows.medium,
  large: THEME_CONFIG.shadows.large,
};

const transitions = {
  default: THEME_CONFIG.transitions.normal,
  fast: THEME_CONFIG.transitions.fast,
  slow: THEME_CONFIG.transitions.slow,
};

const zIndex = {
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500,
};

// Effets spécifiques au thème "La Forge Numérique"
const effects = {
  forgeGlow: `0 0 10px ${COLORS.secondary}`,
  metalShine: `linear-gradient(45deg, ${FORGE_COLORS.steel}22 0%, ${FORGE_COLORS.steel}88 50%, ${FORGE_COLORS.steel}22 100%)`,
  heatEffect: `linear-gradient(45deg, ${COLORS.secondary} 0%, ${COLORS.secondaryLight} 50%, ${COLORS.secondary} 100%)`,
  circuitPattern: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10h80v80h-80z' fill='none' stroke='%23475569' stroke-width='0.5' stroke-opacity='0.1'/%3E%3C/svg%3E")`,
  metalTexture: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.05' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.1'/%3E%3C/svg%3E")`,
};

// Composants personnalisés pour le thème "La Forge Numérique"
const components: Components<Theme> = {
  MuiCssBaseline: {
    styleOverrides: `
      @font-face {
        font-family: 'Space Grotesk';
        font-style: normal;
        font-display: swap;
        font-weight: 400;
        src: local('Space Grotesk'), url('/fonts/SpaceGrotesk-Regular.woff2') format('woff2');
      }
      @font-face {
        font-family: 'Space Grotesk';
        font-style: normal;
        font-display: swap;
        font-weight: 500;
        src: local('Space Grotesk Medium'), url('/fonts/SpaceGrotesk-Medium.woff2') format('woff2');
      }
      @font-face {
        font-family: 'Space Grotesk';
        font-style: normal;
        font-display: swap;
        font-weight: 700;
        src: local('Space Grotesk Bold'), url('/fonts/SpaceGrotesk-Bold.woff2') format('woff2');
      }
      @font-face {
        font-family: 'Space Grotesk';
        font-style: normal;
        font-display: swap;
        font-weight: 800;
        src: local('Space Grotesk ExtraBold'), url('/fonts/SpaceGrotesk-Bold.woff2') format('woff2');
      }
      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-display: swap;
        font-weight: 300;
        src: local('Inter Light'), url('/fonts/Inter-Light.woff2') format('woff2');
      }
      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-display: swap;
        font-weight: 400;
        src: local('Inter Regular'), url('/fonts/Inter-Regular.woff2') format('woff2');
      }
      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-display: swap;
        font-weight: 500;
        src: local('Inter Medium'), url('/fonts/Inter-Medium.woff2') format('woff2');
      }
      @font-face {
        font-family: 'JetBrains Mono';
        font-style: normal;
        font-display: swap;
        font-weight: 400;
        src: local('JetBrains Mono Regular'), url('/fonts/JetBrainsMono-Regular.woff2') format('woff2');
      }
    `,
  },
  MuiButton: {
    variants: [
      {
        props: { variant: "forge" },
        style: {
          background: colors.forge.main,
          color: FORGE_COLORS.ivory,
          "&:hover": {
            background: colors.forge.hover,
            boxShadow: effects.forgeGlow,
          },
        },
      },
      {
        props: { variant: "ember" },
        style: {
          background: colors.ember.main,
          color: FORGE_COLORS.ivory,
          "&:hover": {
            background: colors.ember.hover,
            boxShadow: `0 0 10px ${colors.ember.glow}`,
          },
        },
      },
      {
        props: { variant: "gold" },
        style: {
          background: colors.gold.main,
          color: FORGE_COLORS.charcoal,
          "&:hover": {
            background: colors.gold.hover,
            boxShadow: `0 0 10px ${colors.gold.glow}`,
          },
        },
      },
    ],
    styleOverrides: {
      root: {
        borderRadius: borderRadius.small,
        textTransform: "none",
        fontFamily: typography.fontFamily.heading,
        fontWeight: typography.fontWeight.medium,
        transition: transitions.default,
      },
    },
  },
  MuiPaper: {
    variants: [
      {
        props: { variant: "forge" },
        style: {
          background: `linear-gradient(135deg, ${colors.forge.dark} 0%, ${colors.forge.main} 100%)`,
          borderLeft: `4px solid ${colors.forge.metallic}`,
          color: FORGE_COLORS.ivory,
        },
      },
      {
        props: { variant: "ember" },
        style: {
          background: `linear-gradient(135deg, ${colors.ember.dark} 0%, ${colors.ember.main} 100%)`,
          borderLeft: `4px solid ${colors.ember.metallic}`,
          color: FORGE_COLORS.ivory,
        },
      },
      {
        props: { variant: "gold" },
        style: {
          background: `linear-gradient(135deg, ${colors.gold.dark} 0%, ${colors.gold.main} 100%)`,
          borderLeft: `4px solid ${colors.gold.metallic}`,
          color: FORGE_COLORS.charcoal,
        },
      },
    ],
    styleOverrides: {
      root: {
        borderRadius: borderRadius.medium,
        backgroundImage: "none",
      },
    },
  },
  MuiCard: {
    variants: [
      {
        props: { variant: "forge" },
        style: {
          background: `linear-gradient(135deg, ${colors.forge.dark} 0%, ${colors.forge.main} 100%)`,
          border: `1px solid ${colors.forge.border}`,
          color: FORGE_COLORS.ivory,
        },
      },
      {
        props: { variant: "ember" },
        style: {
          background: `linear-gradient(135deg, ${colors.ember.dark} 0%, ${colors.ember.main} 100%)`,
          border: `1px solid ${colors.ember.border}`,
          color: FORGE_COLORS.ivory,
        },
      },
      {
        props: { variant: "gold" },
        style: {
          background: `linear-gradient(135deg, ${colors.gold.dark} 0%, ${colors.gold.main} 100%)`,
          border: `1px solid ${colors.gold.border}`,
          color: FORGE_COLORS.charcoal,
        },
      },
      // Note: La variante "premium" est commentée car elle n'est pas compatible avec le type PaperPropsVariantOverrides
      // {
      //   props: { variant: "premium" },
      //   style: {
      //     background: `linear-gradient(135deg, ${colors.forge.dark} 0%, ${colors.forge.main} 100%)`,
      //     border: `2px solid ${colors.gold.main}`,
      //     color: FORGE_COLORS.ivory,
      //     boxShadow: `0 0 15px ${colors.gold.glow}33`,
      //     "&:hover": {
      //       boxShadow: `0 0 20px ${colors.gold.glow}66`,
      //     },
      //   },
      // },
    ],
    styleOverrides: {
      root: {
        borderRadius: borderRadius.medium,
        overflow: "hidden",
        transition: transitions.default,
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        "& .MuiOutlinedInput-root": {
          borderRadius: borderRadius.small,
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
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: borderRadius.small,
        fontFamily: typography.fontFamily.heading,
        fontWeight: typography.fontWeight.medium,
      },
    },
  },
};

// Options de thème pour le thème "La Forge Numérique"
const themeOptions: ThemeOptions = {
  breakpoints: {
    values: breakpoints.values,
  },
  palette: {
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
    background: {
      default: colors.background.default,
      paper: colors.background.paper,
    },
    text: colors.text,
    gradient: {
      primary: COLORS.gradient.primary,
      secondary: COLORS.gradient.secondary,
      forge: COLORS.gradient.forge,
      ember: COLORS.gradient.ember,
      gold: COLORS.gradient.gold,
    },
    forge: colors.forge,
    ember: colors.ember,
    gold: colors.gold,
    blockchain: BLOCKCHAIN_COLORS,
  },
  typography: {
    fontFamily: typography.fontFamily.body,
    h1: THEME_CONFIG.typography.h1,
    h2: THEME_CONFIG.typography.h2,
    h3: THEME_CONFIG.typography.h3,
    h4: THEME_CONFIG.typography.h4,
    h5: {
      ...THEME_CONFIG.typography.h5,
      textTransform: THEME_CONFIG.typography.h5.textTransform as
        | "uppercase"
        | "lowercase"
        | "capitalize"
        | "none",
    },
    h6: {
      fontFamily: typography.fontFamily.heading,
      fontSize: typography.fontSizes.lg,
      fontWeight: typography.fontWeight.medium,
    },
    body1: {
      fontSize: typography.fontSizes.md,
      fontFamily: typography.fontFamily.body,
    },
    body2: {
      fontSize: typography.fontSizes.sm,
      fontFamily: typography.fontFamily.body,
    },
    button: {
      fontFamily: typography.fontFamily.heading,
      fontWeight: typography.fontWeight.medium,
      textTransform: "none",
    },
    caption: {
      fontSize: typography.fontSizes.xs,
      fontFamily: typography.fontFamily.body,
    },
    overline: {
      fontSize: typography.fontSizes.xs,
      fontFamily: typography.fontFamily.heading,
      fontWeight: typography.fontWeight.medium,
      textTransform: "uppercase",
      letterSpacing: "0.1em",
    },
  },
  shape: {
    borderRadius: THEME_CONFIG.shape.borderRadius.medium,
  },
  spacing: SPACING.unit,
  shadows: [
    "none",
    THEME_CONFIG.shadows.small,
    THEME_CONFIG.shadows.small,
    THEME_CONFIG.shadows.small,
    THEME_CONFIG.shadows.medium,
    THEME_CONFIG.shadows.medium,
    THEME_CONFIG.shadows.medium,
    THEME_CONFIG.shadows.medium,
    THEME_CONFIG.shadows.medium,
    THEME_CONFIG.shadows.large,
    THEME_CONFIG.shadows.large,
    THEME_CONFIG.shadows.large,
    THEME_CONFIG.shadows.large,
    THEME_CONFIG.shadows.large,
    THEME_CONFIG.shadows.large,
    THEME_CONFIG.shadows.large,
    THEME_CONFIG.shadows.large,
    THEME_CONFIG.shadows.large,
    THEME_CONFIG.shadows.large,
    THEME_CONFIG.shadows.large,
    THEME_CONFIG.shadows.large,
    THEME_CONFIG.shadows.large,
    THEME_CONFIG.shadows.large,
    THEME_CONFIG.shadows.large,
    THEME_CONFIG.shadows.large,
  ],
  zIndex,
  components,
  effects,
};

// Création du thème "La Forge Numérique"
export const forgeTheme = createTheme(themeOptions);

// Export du thème pour styled-components
export const styledTheme = {
  colors: {
    text: colors.text,
    background: colors.background,
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
    grey: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: FORGE_COLORS.steel,
      700: "#374151",
      800: FORGE_COLORS.charcoal,
      900: COLORS.primary,
    },
    forge: colors.forge,
    ember: colors.ember,
    gold: colors.gold,
    gradient: COLORS.gradient,
    blockchain: BLOCKCHAIN_COLORS,
  },
  typography,
  spacing,
  breakpoints,
  borderRadius: {
    none: "0",
    small: borderRadius.small,
    medium: borderRadius.medium,
    large: borderRadius.large,
    xl: "0.75rem",
    "2xl": "1rem",
    full: "9999px",
  },
  shadows,
  transitions,
  zIndex,
  effects,
};
