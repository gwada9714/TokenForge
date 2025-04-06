import React from "react";
import styled, { css } from "styled-components";
import { fadeIn } from "./styles/animations";

export interface ForgeCardProps {
  variant?: "default" | "elevated" | "outlined";
  $isAnimated?: boolean;
  $hasShadow?: boolean;
  children: React.ReactNode;
  className?: string;
}

const getVariantStyles = (variant: ForgeCardProps["variant"] = "default") => {
  const variants = {
    default: css`
      background: ${(props) => props.theme.colors.background.paper};
    `,
    elevated: css`
      background: ${(props) => props.theme.colors.background.paper};
      box-shadow: 0 4px 20px rgba(24, 32, 56, 0.1);
    `,
    outlined: css`
      background: transparent;
      border: 2px solid ${(props) => props.theme.colors.primary.main}20;
    `,
  };
  return variants[variant];
};

const StyledCard = styled.div<ForgeCardProps>`
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  ${(props) => getVariantStyles(props.variant)}

  ${(props) =>
    props.$isAnimated &&
    css`
      animation: ${fadeIn} 0.5s ease-out;
    `}

  ${(props) =>
    props.$hasShadow &&
    css`
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 30px rgba(24, 32, 56, 0.15);
      }
    `}

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(
      90deg,
      ${(props) => props.theme.colors.primary.main},
      ${(props) => props.theme.colors.secondary.main}
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover:before {
    opacity: 1;
  }
`;

export const ForgeCard: React.FC<ForgeCardProps> = ({
  children,
  variant = "default",
  $isAnimated = true,
  $hasShadow = true,
  className,
  ...props
}) => {
  return (
    <StyledCard
      variant={variant}
      $isAnimated={$isAnimated}
      $hasShadow={$hasShadow}
      className={className}
      {...props}
    >
      {children}
    </StyledCard>
  );
};
