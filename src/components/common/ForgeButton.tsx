import React from 'react';
import styled, { css } from 'styled-components';
import { forgeGlow, hover } from './styles/animations';

interface ForgeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  $isGlowing?: boolean;
  $isAnimated?: boolean;
}

const getVariantStyles = (variant: ForgeButtonProps['variant'] = 'primary') => {
  const variants = {
    primary: css`
      background: ${props => props.theme.colors.primary};
      color: ${props => props.theme.colors.text.primary};
      &:hover {
        background: ${props => props.theme.colors.primary};
        opacity: 0.9;
      }
    `,
    secondary: css`
      background: ${props => props.theme.colors.secondary};
      color: ${props => props.theme.colors.text.primary};
      &:hover {
        background: ${props => props.theme.colors.secondary};
        opacity: 0.9;
      }
    `,
    outline: css`
      background: transparent;
      color: ${props => props.theme.colors.primary};
      border: 2px solid ${props => props.theme.colors.primary};
      &:hover {
        background: ${props => props.theme.colors.primary};
        color: ${props => props.theme.colors.text.primary};
      }
    `
  };
  return variants[variant];
};

const getSizeStyles = (size: ForgeButtonProps['size'] = 'medium') => {
  const sizes = {
    small: css`
      padding: ${props => props.theme.spacing(1)} ${props => props.theme.spacing(2)};
      font-size: ${props => props.theme.typography.fontSizes.sm};
    `,
    medium: css`
      padding: ${props => props.theme.spacing(2)} ${props => props.theme.spacing(4)};
      font-size: ${props => props.theme.typography.fontSizes.md};
    `,
    large: css`
      padding: ${props => props.theme.spacing(3)} ${props => props.theme.spacing(6)};
      font-size: ${props => props.theme.typography.fontSizes.lg};
    `
  };
  return sizes[size];
};

const StyledButton = styled.button<ForgeButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing(1)};
  border: none;
  border-radius: ${props => props.theme.borderRadius.medium};
  font-family: ${props => props.theme.typography.fontFamily.body};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: ${props => props.theme.transitions.default};
  position: relative;
  overflow: hidden;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  ${props => getVariantStyles(props.variant)}
  ${props => getSizeStyles(props.size)}
  ${props => props.$isGlowing && css`
    &:before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: ${props.theme.colors.primary};
      z-index: -1;
      filter: blur(8px);
      opacity: 0.5;
    }
  `}
  ${props => props.$isAnimated && css`
    &:hover {
      transform: translateY(-2px);
      ${hover}
    }
  `}
`;

export const ForgeButton: React.FC<ForgeButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  $isGlowing = false,
  $isAnimated = true,
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      $isGlowing={$isGlowing}
      $isAnimated={$isAnimated}
      {...props}
    >
      {children}
    </StyledButton>
  );
};
