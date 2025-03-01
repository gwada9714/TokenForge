// Thème "La Forge Numérique"
export const THEME = {
  // Couleurs primaires
  PRIMARY: '#0F172A', // Bleu nuit profond
  PRIMARY_LIGHT: '#1E293B', // Version plus claire du bleu nuit
  PRIMARY_DARK: '#0B1222', // Version plus foncée du bleu nuit
  SECONDARY: '#F59E0B', // Orange incandescent
  SECONDARY_LIGHT: '#FBBF24', // Version plus claire de l'orange
  SECONDARY_DARK: '#D97706', // Version plus foncée de l'orange
  GOLD: '#D4AF37', // Doré métallique pour éléments premium
  SUCCESS: '#10B981', // Vert émeraude
  WARNING: '#F59E0B', // Ambre (même que l'orange incandescent)
  ERROR: '#EF4444', // Rouge rubis
  INFO: '#3B82F6', // Bleu électrique
};

// Couleurs secondaires
export const FORGE_COLORS = {
  steel: '#475569', // Gris acier
  electric: '#3B82F6', // Bleu électrique
  ivory: '#F8FAFC', // Blanc ivoire
  charcoal: '#1E293B', // Noir charbon
  gold: '#D4AF37', // Doré métallique
};

// Couleurs blockchain-spécifiques
export const BLOCKCHAIN_COLORS = {
  ethereum: '#627EEA', // Violet
  binance: '#F3BA2F', // Jaune
  polygon: '#8247E5', // Mauve
  avalanche: '#E84142', // Rouge intense
  solana: {
    from: '#9945FF', // Début du dégradé
    to: '#14F195', // Fin du dégradé
  },
  arbitrum: '#28A0F0', // Bleu ciel
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
  gold: THEME.GOLD,
  success: THEME.SUCCESS,
  warning: THEME.WARNING,
  error: THEME.ERROR,
  info: THEME.INFO,
  text: FORGE_COLORS.ivory, // Texte principal en blanc ivoire (pour fond sombre)
  textSecondary: FORGE_COLORS.steel, // Texte secondaire en gris acier
  background: THEME.PRIMARY, // Fond principal en bleu nuit
  surface: THEME.PRIMARY_LIGHT, // Surface en version plus claire du bleu nuit
  // Couleurs forge
  forge: {
    steel: FORGE_COLORS.steel,
    electric: FORGE_COLORS.electric,
    ivory: FORGE_COLORS.ivory,
    charcoal: FORGE_COLORS.charcoal,
    gold: FORGE_COLORS.gold,
  },
  // Gradients
  gradient: {
    primary: `linear-gradient(135deg, ${THEME.PRIMARY} 0%, ${THEME.PRIMARY_LIGHT} 100%)`,
    secondary: `linear-gradient(135deg, ${THEME.SECONDARY} 0%, ${THEME.SECONDARY_LIGHT} 100%)`,
    forge: `linear-gradient(45deg, ${THEME.PRIMARY} 0%, ${THEME.PRIMARY_LIGHT} 50%, ${THEME.PRIMARY} 100%)`,
    ember: `linear-gradient(45deg, ${THEME.SECONDARY} 0%, ${THEME.SECONDARY_LIGHT} 50%, ${THEME.SECONDARY} 100%)`,
    gold: `linear-gradient(45deg, ${THEME.GOLD} 0%, #F5D76E 50%, ${THEME.GOLD} 100%)`,
  },
};

export const SPACING = {
  unit: 8, // 8px base unit
  xs: 4, // 4px
  sm: 8, // 8px
  md: 16, // 16px
  lg: 24, // 24px
  xl: 32, // 32px
  xxl: 48, // 48px
};

export const THEME_CONFIG = {
  typography: {
    // Police principale pour les titres et éléments interactifs
    fontFamily: {
      heading: '"Space Grotesk", "Inter", sans-serif',
      body: '"Inter", sans-serif',
      code: '"JetBrains Mono", monospace',
    },
    fontSize: 16,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightSemiBold: 600,
    fontWeightBold: 700,
    fontWeightExtraBold: 800,
    // Hiérarchie des titres
    h1: {
      fontSize: '2.5rem', // 40px
      lineHeight: '3rem', // 48px
      fontWeight: 800, // Extra-Bold
      letterSpacing: '0.02em', // Lettrage étendu
      fontFamily: '"Space Grotesk", sans-serif',
    },
    h2: {
      fontSize: '2rem', // 32px
      lineHeight: '2.5rem', // 40px
      fontWeight: 700, // Bold
      fontFamily: '"Space Grotesk", sans-serif',
    },
    h3: {
      fontSize: '1.5rem', // 24px
      lineHeight: '2rem', // 32px
      fontWeight: 700, // Bold
      fontFamily: '"Space Grotesk", sans-serif',
    },
    h4: {
      fontSize: '1.25rem', // 20px
      lineHeight: '1.75rem', // 28px
      fontWeight: 500, // Medium
      fontFamily: '"Space Grotesk", sans-serif',
    },
    h5: {
      fontSize: '1rem', // 16px
      lineHeight: '1.5rem', // 24px
      fontWeight: 500, // Medium
      fontFamily: '"Space Grotesk", sans-serif',
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: {
      small: 4, // 4px
      medium: 8, // 8px
      large: 12, // 12px
    },
  },
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.3)',
    medium: '0 4px 8px rgba(0, 0, 0, 0.4)',
    large: '0 8px 16px rgba(0, 0, 0, 0.5)',
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
    // Transitions personnalisées
    fast: '0.15s ease-out',
    normal: '0.3s ease-out',
    slow: '0.5s ease-out',
  },
};
