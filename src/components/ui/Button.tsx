import React from 'react';
import styled from 'styled-components';
import { SPACING } from '@/config/constants/theme';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

const StyledButton = styled.button<ButtonProps>`
  padding: ${props => {
    switch (props.size) {
      case 'small':
        return `${SPACING.xs} ${SPACING.sm}`;
      case 'large':
        return `${SPACING.md} ${SPACING.xl}`;
      default:
        return `${SPACING.sm} ${SPACING.lg}`;
    }
  }};
  
  font-size: ${props => {
    switch (props.size) {
      case 'small':
        return '0.875rem';
      case 'large':
        return '1.125rem';
      default:
        return '1rem';
    }
  }};
  
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  border-radius: ${props => props.theme.borderRadius};
  border: none;
  cursor: pointer;
  transition: ${props => props.theme.transition};
  
  ${props => {
    switch (props.variant) {
      case 'secondary':
        return `
          background-color: ${props.theme.colors.secondary};
          color: ${props.theme.colors.background.primary};
          &:hover {
            opacity: 0.9;
          }
        `;
      case 'outline':
        return `
          background-color: transparent;
          border: 1px solid ${props.theme.colors.primary};
          color: ${props.theme.colors.primary};
          &:hover {
            background-color: ${props.theme.colors.primary};
            color: ${props.theme.colors.background.primary};
          }
        `;
      default:
        return `
          background-color: ${props.theme.colors.primary};
          color: ${props.theme.colors.background.primary};
          &:hover {
            opacity: 0.9;
          }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      {...props}
    >
      {children}
    </StyledButton>
  );
};
