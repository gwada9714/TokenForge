import React from 'react';
import styled from 'styled-components';
import { SPACING } from '@/config/constants/theme';

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
}

const AlertContainer = styled.div<{ type: AlertProps['type'] }>`
  padding: ${SPACING.md} ${SPACING.lg};
  border-radius: ${props => props.theme.borderRadius};
  display: flex;
  align-items: flex-start;
  gap: ${SPACING.md};
  
  ${props => {
    switch (props.type) {
      case 'success':
        return `
          background-color: ${props.theme.colors.success}20;
          border: 1px solid ${props.theme.colors.success};
          color: ${props.theme.colors.success};
        `;
      case 'warning':
        return `
          background-color: ${props.theme.colors.warning}20;
          border: 1px solid ${props.theme.colors.warning};
          color: ${props.theme.colors.warning};
        `;
      case 'error':
        return `
          background-color: ${props.theme.colors.error}20;
          border: 1px solid ${props.theme.colors.error};
          color: ${props.theme.colors.error};
        `;
      default:
        return `
          background-color: ${props.theme.colors.info}20;
          border: 1px solid ${props.theme.colors.info};
          color: ${props.theme.colors.info};
        `;
    }
  }}
`;

const AlertContent = styled.div`
  flex: 1;
`;

const AlertTitle = styled.h4`
  margin: 0 0 ${SPACING.xs};
  font-weight: 600;
`;

const AlertMessage = styled.div`
  color: ${props => props.theme.colors.text.primary};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: ${SPACING.xs};
  color: currentColor;
  opacity: 0.7;
  transition: ${props => props.theme.transition};
  
  &:hover {
    opacity: 1;
  }
`;

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  onClose,
}) => {
  return (
    <AlertContainer type={type}>
      <AlertContent>
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertMessage>{children}</AlertMessage>
      </AlertContent>
      {onClose && (
        <CloseButton onClick={onClose}>×</CloseButton>
      )}
    </AlertContainer>
  );
}; 