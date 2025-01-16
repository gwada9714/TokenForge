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
      background: ${props => props.theme.colors.primary.main};
      color: ${props => props.theme.colors.text.light};
      &:hover {
        background: ${props => props.theme.colors.primary.dark};
      }
    `,
    secondary: css`
      background: ${props => props.theme.colors.secondary.main};
      color: ${props => props.theme.colors.text.light};
      &:hover {
        background: ${props => props.theme.colors.secondary.dark};
      }
    `,
    outline: css`
      background: transparent;
      color: ${props => props.theme.colors.primary.main};
      border: 2px solid ${props => props.theme.colors.primary.main};
      &:hover {
        background: ${props => props.theme.colors.primary.main}10;
      }
    `
  };
  return variants[variant];
};

const getSizeStyles = (size: ForgeButtonProps['size'] = 'medium') => {
  const sizes = {
    small: css`
      padding: 8px 16px;
      font-size: 14px;
    `,
    medium: css`
      padding: 12px 24px;
      font-size: 16px;
    `,
    large: css`
      padding: 16px 32px;
      font-size: 18px;
    `
  };
  return sizes[size];
};

const StyledButton = styled.button<ForgeButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  font-family: ${props => props.theme.typography.fontFamily.heading};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  ${props => getVariantStyles(props.variant)}
  ${props => getSizeStyles(props.size)}

  ${props => props.$isGlowing && css`
    animation: ${forgeGlow} 2s infinite;
  `}

  ${props => props.$isAnimated && css`
    &:hover {
      animation: ${hover} 1s infinite;
      transform: translateY(-2px);
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      120deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: 0.5s;
  }

  &:hover:before {
    left: 100%;
  }
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
