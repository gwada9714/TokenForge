import React from "react";
import styled from "styled-components";
import { THEME_CONFIG } from "@/config/constants/theme";

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  helperText?: string;
}

const StyledTextArea = styled.textarea<{ hasError?: boolean }>`
  width: 100%;
  padding: ${THEME_CONFIG.spacing.sm} ${THEME_CONFIG.spacing.md};
  border-radius: ${(props) => props.theme.borderRadius};
  border: 1px solid
    ${(props) =>
      props.hasError ? props.theme.colors.error : props.theme.colors.border};
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
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
  display: block;
  font-size: 0.75rem;
  margin-top: ${THEME_CONFIG.spacing.xs};
  color: ${(props) =>
    props.isError
      ? props.theme.colors.error
      : props.theme.colors.text.secondary};
`;

export const TextArea: React.FC<TextAreaProps> = ({
  error,
  helperText,
  ...props
}) => {
  return (
    <div>
      <StyledTextArea hasError={!!error} {...props} />
      {(error || helperText) && (
        <HelperText isError={!!error}>{error || helperText}</HelperText>
      )}
    </div>
  );
};
