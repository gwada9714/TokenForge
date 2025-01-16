import React from 'react';
import styled, { css } from 'styled-components';
import { theme } from '../../theme/theme';
import { InputProps, StyledProps } from './types';

interface StyledInputProps {
  hasError?: boolean;
  hasStartIcon?: boolean;
  hasEndIcon?: boolean;
}

const InputWrapper = styled.div<{ fullWidth?: boolean }>`
  display: inline-flex;
  flex-direction: column;
  gap: ${(props: StyledProps) => props.theme.spacing.xs};
  
  ${(props: { fullWidth?: boolean }) => props.fullWidth && css`
    width: 100%;
  `}
`;

const InputLabel = styled.label`
  font-family: ${(props: StyledProps) => props.theme.typography.fontFamily.body};
  font-weight: ${(props: StyledProps) => props.theme.typography.fontWeight.medium};
  font-size: ${(props: StyledProps) => props.theme.typography.fontSize.sm};
  color: ${(props: StyledProps) => props.theme.colors.text.primary};
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledInput = styled.input<StyledInputProps>`
  width: 100%;
  font-family: ${(props: StyledProps) => props.theme.typography.fontFamily.body};
  font-size: ${(props: StyledProps) => props.theme.typography.fontSize.base};
  color: ${(props: StyledProps) => props.theme.colors.text.primary};
  background-color: ${(props: StyledProps) => props.theme.colors.background.default};
  border: 1px solid ${(props: StyledInputProps & StyledProps) => props.hasError ? props.theme.colors.error.main : props.theme.colors.primary.light};
  border-radius: ${(props: StyledProps) => props.theme.borderRadius.md};
  padding: ${(props: StyledProps) => props.theme.spacing.sm} ${(props: StyledProps) => props.theme.spacing.md};
  transition: all ${(props: StyledProps) => props.theme.transitions.default};

  ${(props: StyledInputProps) => props.hasStartIcon && css`
    padding-left: ${theme.spacing.xl};
  `}

  ${(props: StyledInputProps) => props.hasEndIcon && css`
    padding-right: ${theme.spacing.xl};
  `}

  &:focus {
    outline: none;
    border-color: ${(props: StyledInputProps & StyledProps) => props.hasError ? props.theme.colors.error.main : props.theme.colors.secondary.main};
    box-shadow: 0 0 0 2px ${(props: StyledInputProps & StyledProps) => props.hasError ? props.theme.colors.error.main + '40' : props.theme.colors.secondary.main + '40'};
  }

  &:disabled {
    background-color: ${(props: StyledProps) => props.theme.colors.background.dark};
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${(props: StyledProps) => props.theme.colors.text.secondary};
    opacity: 0.7;
  }
`;

const IconWrapper = styled.div<{ position: 'start' | 'end' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${(props: { position: 'start' | 'end' }) => props.position === 'start' ? 'left' : 'right'}: ${theme.spacing.sm};
  color: ${(props: StyledProps) => props.theme.colors.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HelperText = styled.span<{ isError?: boolean }>`
  font-size: ${(props: StyledProps) => props.theme.typography.fontSize.sm};
  color: ${(props: { isError?: boolean } & StyledProps) => props.isError ? props.theme.colors.error.main : props.theme.colors.text.secondary};
`;

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  fullWidth = false,
  startIcon,
  endIcon,
  className,
  ...props
}) => {
  return (
    <InputWrapper fullWidth={fullWidth} className={className}>
      {label && <InputLabel>{label}</InputLabel>}
      <InputContainer>
        {startIcon && <IconWrapper position="start">{startIcon}</IconWrapper>}
        <StyledInput
          hasError={!!error}
          hasStartIcon={!!startIcon}
          hasEndIcon={!!endIcon}
          {...props}
        />
        {endIcon && <IconWrapper position="end">{endIcon}</IconWrapper>}
      </InputContainer>
      {(error || helperText) && (
        <HelperText isError={!!error}>{error || helperText}</HelperText>
      )}
    </InputWrapper>
  );
};
