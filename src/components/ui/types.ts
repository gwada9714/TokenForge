import { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { DefaultTheme } from "styled-components";
import { Tokens } from "@/theme/tokens";

declare module "styled-components" {
  export interface DefaultTheme extends Tokens {}
}

export interface BaseProps {
  className?: string;
}

export interface StyledButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    BaseProps {
  $variant?: "primary" | "secondary" | "text";
  $size?: "small" | "medium" | "large";
  $fullWidth?: boolean;
  $isLoading?: boolean;
  to?: string;
  onClick?: () => void;
}

export interface CardProps extends BaseProps {
  variant?: "default" | "elevated" | "outlined";
  $padding?: "none" | "small" | "medium" | "large";
  onClick?: () => void;
  $interactive?: boolean;
  children: ReactNode;
}

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    BaseProps {
  label?: string;
  error?: string;
  helperText?: string;
  $fullWidth?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

// This is used internally by styled-components
export interface StyledProps {
  theme?: any;
  as?: any;
  forwardedAs?: any;
}
