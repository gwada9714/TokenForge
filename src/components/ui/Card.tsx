import React from 'react';
import styled from 'styled-components';
import { SPACING } from '@/config/constants/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'small' | 'medium' | 'large';
}

const StyledCard = styled.div<CardProps>`
  padding: ${props => {
    switch (props.padding) {
      case 'small':
        return SPACING.sm;
      case 'large':
        return SPACING.xl;
      default:
        return SPACING.lg;
    }
  }};
  
  border-radius: ${props => props.theme.borderRadius};
  background-color: ${props => props.theme.colors.background.primary};
  
  ${props => {
    switch (props.variant) {
      case 'outlined':
        return `
          border: 1px solid ${props.theme.colors.border};
        `;
      case 'elevated':
        return `
          box-shadow: ${props.theme.boxShadow};
        `;
      default:
        return `
          border: none;
          box-shadow: ${props.theme.boxShadow};
        `;
    }
  }}
`;

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
}) => {
  return (
    <StyledCard variant={variant} padding={padding}>
      {children}
    </StyledCard>
  );
};
