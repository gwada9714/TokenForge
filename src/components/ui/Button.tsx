import React from "react";
import styled, { DefaultTheme } from "styled-components";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
}

interface StyledButtonProps extends ButtonProps {
  theme: DefaultTheme;
  $variant: ButtonProps["variant"];
  $size: ButtonProps["size"];
  $fullWidth: boolean;
}

type ColorSet = {
  main: string;
  light: string;
  dark: string;
  border?: string;
  hover?: string;
};

type Colors = {
  primary: ColorSet;
  secondary: ColorSet;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  grey: {
    [key: number]: string;
  };
};

const getButtonStyles = (props: StyledButtonProps) => {
  const { theme, $variant, $size, $fullWidth } = props;
  const { colors, typography, borderRadius, transitions } = theme;
  const themeColors = colors as unknown as Colors;

  const sizeStyles = {
    small: {
      padding: theme.spacing(2),
      fontSize: typography.fontSizes.xs,
    },
    medium: {
      padding: theme.spacing(3),
      fontSize: typography.fontSizes.md,
    },
    large: {
      padding: theme.spacing(4),
      fontSize: typography.fontSizes.lg,
    },
  };

  const variantStyles = {
    primary: {
      backgroundColor: themeColors.primary.main,
      color: themeColors.text.primary,
      "&:hover": {
        backgroundColor: themeColors.primary.dark,
      },
    },
    secondary: {
      backgroundColor: themeColors.secondary.main,
      color: themeColors.text.primary,
      "&:hover": {
        backgroundColor: themeColors.secondary.dark,
      },
    },
    outline: {
      backgroundColor: "transparent",
      border: `1px solid ${themeColors.primary.main}`,
      color: themeColors.primary.main,
      "&:hover": {
        backgroundColor: themeColors.primary.main,
        color: themeColors.text.primary,
      },
    },
  };

  const size = $size || "medium";
  const variant = $variant || "primary";

  return {
    ...sizeStyles[size],
    ...variantStyles[variant],
    width: $fullWidth ? "100%" : "auto",
    borderRadius: borderRadius.medium,
    border: "none",
    cursor: "pointer",
    transition: transitions.default,
    fontFamily: typography.fontFamily.body,
    fontWeight: typography.fontWeight.medium,
    "&:disabled": {
      opacity: 0.5,
      cursor: "not-allowed",
      backgroundColor: themeColors.grey[300],
      color: themeColors.text.disabled,
      border: "none",
    },
  };
};

export const StyledButton = styled.button<StyledButtonProps>`
  ${getButtonStyles}
`;

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "medium",
  fullWidth = false,
  onClick,
  disabled,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick && !disabled) {
      onClick(e);
    }
  };

  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </StyledButton>
  );
};
