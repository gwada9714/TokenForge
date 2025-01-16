import React from 'react';
import styled, { css } from 'styled-components';
import { CardProps } from './types';

const StyledCard = styled.div<CardProps>`
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  transition: all ${({ theme }) => theme.transitions.default};

  ${({ theme, $padding }) => {
    switch ($padding) {
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

  ${({ theme, $interactive }) => $interactive && css`
    cursor: pointer;
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${theme.shadows.md};
    }
    &:active {
      transform: translateY(-1px);
    }
  `}
`;

const CardHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const CardTitle = styled.h3`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const CardSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const CardContent = styled.div``;

const CardFooter = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const Card: React.FC<CardProps> & {
  Header: typeof CardHeader;
  Title: typeof CardTitle;
  Subtitle: typeof CardSubtitle;
  Content: typeof CardContent;
  Footer: typeof CardFooter;
} = ({
  variant = 'default',
  $padding = 'medium',
  className,
  onClick,
  $interactive = false,
  children,
  ...props
}) => {
  return (
    <StyledCard
      variant={variant}
      $padding={$padding}
      className={className}
      onClick={onClick}
      $interactive={$interactive || !!onClick}
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

export default Card;
