import { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

export interface BaseProps {
  className?: string;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, BaseProps {
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export interface CardProps extends BaseProps {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  onClick?: () => void;
  interactive?: boolean;
  children: ReactNode;
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement>, BaseProps {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

export interface StyledProps {
  theme: any;
}
