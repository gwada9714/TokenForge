import React from 'react';
import styled, { css } from 'styled-components';
import { theme } from '../../theme/theme';
import { CardProps, StyledProps } from './types';

const StyledCard = styled.div<CardProps>`
  background-color: ${(props: StyledProps) => props.theme.colors.background.paper};
  border-radius: ${(props: StyledProps) => props.theme.borderRadius.lg};
  transition: all ${(props: StyledProps) => props.theme.transitions.default};

  ${(props: CardProps) => {
    switch (props.padding) {
      case 'none':
        return css`padding: 0;`;
      case 'small':
        return css`padding: ${theme.spacing.sm};`;
      case 'large':
        return css`padding: ${theme.spacing.xl};`;
      default:
        return css`padding: ${theme.spacing.lg};`;
    }
  }}

  ${(props: CardProps) => {
    switch (props.variant) {
      case 'elevated':
        return css`
          box-shadow: ${theme.shadows.lg};
        `;
      case 'outlined':
        return css`
          border: 1px solid ${theme.colors.primary.light};
        `;
      default:
        return css`
          box-shadow: ${theme.shadows.md};
        `;
    }
  }}

  ${(props: CardProps) => props.interactive && css`
    cursor: pointer;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${theme.shadows.lg};
    }
    
    &:active {
      transform: translateY(-1px);
    }
  `}
`;

const CardHeader = styled.div`
  margin-bottom: ${(props: StyledProps) => props.theme.spacing.md};
`;

const CardTitle = styled.h3`
  font-family: ${(props: StyledProps) => props.theme.typography.fontFamily.heading};
  font-weight: ${(props: StyledProps) => props.theme.typography.fontWeight.bold};
  color: ${(props: StyledProps) => props.theme.colors.text.primary};
  margin-bottom: ${(props: StyledProps) => props.theme.spacing.xs};
`;

const CardSubtitle = styled.p`
  color: ${(props: StyledProps) => props.theme.colors.text.secondary};
  font-size: ${(props: StyledProps) => props.theme.typography.fontSize.sm};
`;

const CardContent = styled.div``;

const CardFooter = styled.div`
  margin-top: ${(props: StyledProps) => props.theme.spacing.md};
  display: flex;
  justify-content: flex-end;
  gap: ${(props: StyledProps) => props.theme.spacing.sm};
`;

export const Card: React.FC<CardProps> & {
  Header: typeof CardHeader;
  Title: typeof CardTitle;
  Subtitle: typeof CardSubtitle;
  Content: typeof CardContent;
  Footer: typeof CardFooter;
} = ({
  variant = 'default',
  padding = 'medium',
  className,
  onClick,
  interactive = false,
  children,
  ...props
}) => {
  return (
    <StyledCard
      variant={variant}
      padding={padding}
      className={className}
      onClick={onClick}
      interactive={interactive || !!onClick}
      {...props}
    >
      {children}
    </StyledCard>
  );
};

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Subtitle = CardSubtitle;
Card.Content = CardContent;
Card.Footer = CardFooter;
