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
  }
  interface ThemeOptions {
    gradient?: {
      primary?: string;
      secondary?: string;
      forge?: string;
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
  },
  ember: {
    main: "#FF4B2B",
    dark: "#E63A1F",
    light: "#FF6C5A",
    border: "#FFCDD2",
    hover: "#FF5A40",
  },
  background: {
    default: "#ffffff",
    paper: "#f8fafc",
    dark: "#1e293b",
  },
  text: {
    primary: "#1e293b",
    secondary: "#64748b",
    light: "#f8fafc",
  },
  gradient: {
    primary: "linear-gradient(45deg, #182038 30%, #2a3654 90%)",
    secondary: "linear-gradient(45deg, #D97706 30%, #f59e0b 90%)",
    forge: "linear-gradient(45deg, #FF6B2B 30%, #FF8C5A 90%)",
  },
  warning: {
    main: "#f59e0b",
    light: "#fbbf24",
    dark: "#d97706",
  },
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
  palette: {
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    warning: colors.warning,
    background: colors.background,
    text: colors.text,
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  gradient: {
    primary: "linear-gradient(45deg, #182038 30%, #2a3654 90%)",
    secondary: "linear-gradient(45deg, #D97706 30%, #f59e0b 90%)",
    forge: "linear-gradient(45deg, #FF6B2B 30%, #FF8C5A 90%)",
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
