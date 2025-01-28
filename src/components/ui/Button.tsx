import React from "react";
import styled, { css } from "styled-components";
import { StyledButtonProps, StyledProps } from "./types";

type ButtonComponentProps = StyledButtonProps & StyledProps;

const StyledButtonBase = styled.button<ButtonComponentProps>`
  font-family: ${(props) => props.theme.typography.fontFamily.heading};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  border-radius: ${(props) => props.theme.borderRadius.medium};
  transition: ${(props) => props.theme.transitions.default};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${(props) => props.theme.spacing(2)};

  ${(props) =>
    props.$fullWidth &&
    css`
      width: 100%;
    `}

  ${(props) => {
    switch (props.$size) {
      case "small":
        return css`
          padding: ${props.theme.spacing(1)} ${props.theme.spacing(2)};
          font-size: ${props.theme.typography.fontSizes.xs};
        `;
      case "large":
        return css`
          padding: ${props.theme.spacing(3)} ${props.theme.spacing(4)};
          font-size: ${props.theme.typography.fontSizes.xl};
        `;
      default:
        return css`
          padding: ${props.theme.spacing(2)} ${props.theme.spacing(3)};
          font-size: ${props.theme.typography.fontSizes.md};
        `;
    }
  }}

  ${(props) => {
    const { colors } = props.theme;
    
    switch (props.$variant) {
      case "secondary": {
        return css`
          background-color: transparent;
          border: 2px solid ${colors.secondary};
          color: ${colors.secondary};

          &:hover:not(:disabled) {
            background-color: ${colors.text.secondary};
            color: ${colors.text.primary};
          }
        `;
      }
      case "text": {
        return css`
          background-color: transparent;
          border: none;
          color: ${colors.primary};
          padding: ${props.theme.spacing(1)};

          &:hover:not(:disabled) {
            background-color: ${colors.text.secondary}20;
          }
        `;
      }
      default: {
        return css`
          background-color: ${colors.primary};
          border: none;
          color: ${colors.text.primary};

          &:hover:not(:disabled) {
            background-color: ${colors.text.secondary};
            transform: translateY(-1px);
            box-shadow: 0 4px 6px -1px ${colors.primary}40;
          }
        `;
      }
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  ${(props) =>
    props.$isLoading &&
    css`
      position: relative;
      color: transparent;
      pointer-events: none;

      &::after {
        content: "";
        position: absolute;
        width: 1em;
        height: 1em;
        border: 2px solid ${props.theme.colors.text.primary};
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

export const StyledButton: React.FC<StyledButtonProps> = ({
  children,
  $variant = "primary",
  $size = "medium",
  $fullWidth = false,
  $isLoading = false,
  ...props
}) => {
  return (
    <StyledButtonBase
      $variant={$variant}
      $size={$size}
      $fullWidth={$fullWidth}
      $isLoading={$isLoading}
      {...props}
    >
      {children}
    </StyledButtonBase>
  );
};
