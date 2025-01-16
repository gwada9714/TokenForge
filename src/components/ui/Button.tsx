import React from "react";
import styled, { css } from "styled-components";
import { ButtonProps, StyledProps } from "./types";

const StyledButton = styled.button<ButtonProps>`
  font-family: ${(props: StyledProps) =>
    props.theme.typography.fontFamily.heading};
  font-weight: ${(props: StyledProps) =>
    props.theme.typography.fontWeight.semibold};
  border-radius: ${(props: StyledProps) => props.theme.borderRadius.md};
  transition: ${(props: StyledProps) => props.theme.transitions.default};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${(props: StyledProps) => props.theme.spacing.sm};

  ${(props: ButtonProps & StyledProps) =>
    props.$fullWidth &&
    css`
      width: 100%;
    `}

  ${(props: ButtonProps & StyledProps) => {
    switch (props.size) {
      case "small":
        return css`
          padding: ${props.theme.spacing.xs} ${props.theme.spacing.sm};
          font-size: ${props.theme.typography.fontSize.sm};
        `;
      case "large":
        return css`
          padding: ${props.theme.spacing.md} ${props.theme.spacing.lg};
          font-size: ${props.theme.typography.fontSize.lg};
        `;
      default:
        return css`
          padding: ${props.theme.spacing.sm} ${props.theme.spacing.md};
          font-size: ${props.theme.typography.fontSize.base};
        `;
    }
  }}

  ${(props: ButtonProps & StyledProps) => {
    switch (props.variant) {
      case "secondary":
        return css`
          background-color: transparent;
          border: 2px solid ${props.theme.colors.secondary.main};
          color: ${props.theme.colors.secondary.main};

          &:hover:not(:disabled) {
            background-color: ${props.theme.colors.secondary.main};
            color: ${props.theme.colors.text.light};
          }
        `;
      case "text":
        return css`
          background-color: transparent;
          border: none;
          color: ${props.theme.colors.secondary.main};
          padding: ${props.theme.spacing.xs};

          &:hover:not(:disabled) {
            background-color: ${props.theme.colors.secondary.main}20;
          }
        `;
      default:
        return css`
          background-color: ${props.theme.colors.primary.main};
          border: none;
          color: ${props.theme.colors.text.light};

          &:hover:not(:disabled) {
            background-color: ${props.theme.colors.primary.light};
            transform: translateY(-1px);
            box-shadow: 0 4px 6px -1px ${props.theme.colors.primary.main}40;
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  ${(props: ButtonProps & StyledProps) =>
    props.isLoading &&
    css`
      position: relative;
      color: transparent;
      pointer-events: none;

      &::after {
        content: "";
        position: absolute;
        width: 1em;
        height: 1em;
        border: 2px solid ${props.theme.colors.text.light};
        border-radius: 50%;
        border-right-color: transparent;
        animation: spin 1s linear infinite;
      }
    `}

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "medium",
  $fullWidth = false,
  isLoading = false,
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      $fullWidth={$fullWidth}
      isLoading={isLoading}
      {...props}
    >
      {children}
    </StyledButton>
  );
};
