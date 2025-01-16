import { tokens } from './tokens';

export const theme = {
  ...tokens,
  components: {
    button: {
      primary: {
        backgroundColor: tokens.colors.secondary.main,
        color: tokens.colors.text.light,
        '&:hover': {
          backgroundColor: tokens.colors.secondary.light,
        },
      },
      secondary: {
        backgroundColor: 'transparent',
        border: `2px solid ${tokens.colors.secondary.main}`,
        color: tokens.colors.secondary.main,
        '&:hover': {
          backgroundColor: tokens.colors.secondary.main,
          color: tokens.colors.text.light,
        },
      },
    },
    card: {
      backgroundColor: tokens.colors.background.paper,
      borderRadius: tokens.borderRadius.lg,
      padding: tokens.spacing.lg,
      boxShadow: tokens.shadows.md,
    },
    input: {
      backgroundColor: tokens.colors.background.default,
      border: `1px solid ${tokens.colors.primary.light}`,
      borderRadius: tokens.borderRadius.md,
      padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
      '&:focus': {
        borderColor: tokens.colors.secondary.main,
        outline: 'none',
      },
    },
  },
  mixins: {
    flexCenter: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    gradientText: {
      background: `linear-gradient(135deg, ${tokens.colors.secondary.main}, ${tokens.colors.secondary.light})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    forgeEffect: {
      background: `linear-gradient(135deg, ${tokens.colors.primary.dark}, ${tokens.colors.primary.main})`,
      boxShadow: `0 0 15px ${tokens.colors.secondary.main}`,
    },
  },
} as const;

export type Theme = typeof theme;
export default theme;
