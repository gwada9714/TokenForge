import { Link } from 'react-router-dom';
import React from "react";
import styled, { css } from "styled-components";
import { StyledButtonProps, StyledProps } from "./types";

type ButtonComponentProps = StyledButtonProps & StyledProps & {
  to?: string;
  component?: React.ElementType;
};

const baseStyles = css<ButtonComponentProps>`
  font-family: ${(props) => props.theme.typography.fontFamily.heading};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  border-radius: ${(props) => props.theme.borderRadius.medium};
  transition: ${(props) => props.theme.transitions.default};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${(props) => props.theme.spacing(2)};
  text-decoration: none;

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
      case "secondary":
        return css`
          background-color: transparent;
          border: 2px solid ${colors.secondary};
          color: ${colors.secondary};
          
          &:hover {
            background-color: ${colors.secondary};
            color: ${colors.white};
          }
          
          &:disabled {
            border-color: ${colors.disabled};
            color: ${colors.disabled};
          }
        `;
      case "text":
        return css`
          background-color: transparent;
          border: none;
          color: ${colors.text};
          
          &:hover {
            background-color: ${colors.hover};
          }
          
          &:disabled {
            color: ${colors.disabled};
          }
        `;
      default:
        return css`
          background-color: ${colors.primary};
          border: none;
          color: ${colors.white};
          
          &:hover {
            background-color: ${colors.primaryDark};
          }
          
          &:disabled {
            background-color: ${colors.disabled};
          }
        `;
    }
  }}
`;

const StyledButtonBase = styled.button<ButtonComponentProps>`
  ${baseStyles}
`;

const StyledLink = styled(Link)<ButtonComponentProps>`
  ${baseStyles}
`;

export const StyledButton: React.FC<ButtonComponentProps> = ({
  children,
  $variant = "primary",
  $size = "medium",
  $fullWidth = false,
  $isLoading = false,
  to,
  component,
  ...props
}) => {
  const buttonProps = {
    $variant,
    $size,
    $fullWidth,
    $isLoading,
    ...props,
  };

  if (component) {
    const Component = component;
    return <Component {...buttonProps}>{children}</Component>;
  }

  if (to) {
    return (
      <StyledLink to={to} {...buttonProps}>
        {children}
      </StyledLink>
    );
  }

  return (
    <StyledButtonBase {...buttonProps}>
      {children}
    </StyledButtonBase>
  );
};

export default StyledButton;
