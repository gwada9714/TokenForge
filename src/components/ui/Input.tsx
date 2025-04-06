import React from "react";
import styled from "styled-components";
import { SPACING } from "@/config/constants/theme";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

const InputWrapper = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  width: ${(props) => (props.fullWidth ? "100%" : "auto")};
`;

const Label = styled.label`
  color: ${(props) => props.theme.colors.text.secondary};
  margin-bottom: ${SPACING.xs};
  font-size: 0.875rem;
`;

const StyledInput = styled.input<{ hasError?: boolean }>`
  padding: ${SPACING.sm} ${SPACING.md};
  border-radius: ${(props) => props.theme.borderRadius};
  border: 1px solid
    ${(props) =>
      props.hasError ? props.theme.colors.error : props.theme.colors.border};
  font-size: 1rem;
  transition: ${(props) => props.theme.transition};

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: 0 0 0 2px ${(props) => props.theme.colors.primary}20;
  }

  &:disabled {
    background-color: ${(props) => props.theme.colors.background.secondary};
    cursor: not-allowed;
  }
`;

const HelperText = styled.span<{ isError?: boolean }>`
  font-size: 0.75rem;
  margin-top: ${SPACING.xs};
  color: ${(props) =>
    props.isError
      ? props.theme.colors.error
      : props.theme.colors.text.secondary};
`;

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  fullWidth = false,
  ...props
}) => {
  return (
    <InputWrapper fullWidth={fullWidth}>
      {label && <Label>{label}</Label>}
      <StyledInput hasError={!!error} {...props} />
      {(error || helperText) && (
        <HelperText isError={!!error}>{error || helperText}</HelperText>
      )}
    </InputWrapper>
  );
};
