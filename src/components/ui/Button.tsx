import React from 'react';
import styled, { css } from 'styled-components';
import { theme } from '../../theme/theme';
import { ButtonProps, StyledProps } from './types';

const StyledButton = styled.button<ButtonProps>`
  font-family: ${(props: StyledProps) => props.theme.typography.fontFamily.heading};
  font-weight: ${(props: StyledProps) => props.theme.typography.fontWeight.semibold};
  border-radius: ${(props: StyledProps) => props.theme.borderRadius.md};
  transition: all ${(props: StyledProps) => props.theme.transitions.default};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${(props: StyledProps) => props.theme.spacing.sm};
  
  ${(props: ButtonProps) => props.fullWidth && css`
    width: 100%;
  `}

  ${(props: ButtonProps) => {
    switch (props.size) {
      case 'small':
        return css`
          padding: ${theme.spacing.xs} ${theme.spacing.sm};
          font-size: ${theme.typography.fontSize.sm};
        `;
      case 'large':
        return css`
          padding: ${theme.spacing.md} ${theme.spacing.lg};
          font-size: ${theme.typography.fontSize.lg};
        `;
      default:
        return css`
          padding: ${theme.spacing.sm} ${theme.spacing.md};
          font-size: ${theme.typography.fontSize.base};
        `;
    }
  }}

  ${(props: ButtonProps) => {
    switch (props.variant) {
      case 'secondary':
        return css`
          background-color: transparent;
          border: 2px solid ${theme.colors.secondary.main};
          color: ${theme.colors.secondary.main};

          &:hover:not(:disabled) {
            background-color: ${theme.colors.secondary.main};
            color: ${theme.colors.text.light};
          }
        `;
      case 'text':
        return css`
          background-color: transparent;
          border: none;
          color: ${theme.colors.secondary.main};
          padding: ${theme.spacing.xs};

          &:hover:not(:disabled) {
            background-color: ${theme.colors.secondary.main}20;
          }
        `;
      default:
        return css`
          background-color: ${theme.colors.secondary.main};
          border: none;
          color: ${theme.colors.text.light};

          &:hover:not(:disabled) {
            background-color: ${theme.colors.secondary.light};
            transform: translateY(-1px);
            box-shadow: 0 4px 6px -1px ${theme.colors.secondary.main}40;
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  ${(props: ButtonProps) => props.isLoading && css`
    position: relative;
    color: transparent;
    pointer-events: none;

    &::after {
      content: '';
      position: absolute;
      width: 1em;
      height: 1em;
      border: 2px solid ${theme.colors.text.light};
      border-radius: 50%;
      border-right-color: transparent;
      animation: spin 1s linear infinite;
    }
  `}

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  isLoading = false,
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      isLoading={isLoading}
      {...props}
    >
      {children}
    </StyledButton>
  );
};
