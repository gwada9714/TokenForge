import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { DefaultTheme } from 'styled-components';

interface StyledProps {
  theme: DefaultTheme;
}

export const ForgeContainer = styled.div<StyledProps>`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${props => props.theme.spacing.medium};

  ${props => props.theme.breakpoints.up('md')} {
    padding: 0 ${props => props.theme.spacing.large};
  }
`;

export const ForgeSection = styled.section<StyledProps>`
  padding: ${props => props.theme.spacing.large} 0;
  position: relative;
  overflow: hidden;

  ${props => props.theme.breakpoints.up('md')} {
    padding: ${props => props.theme.spacing.large} 0;
  }
`;

export const ForgeHeading = styled.h1<StyledProps>`
  font-family: ${props => props.theme.typography.fontFamily.heading};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.medium};
  text-align: center;
  font-size: ${props => props.theme.typography.fontSizes['3xl']};

  ${props => props.theme.breakpoints.up('md')} {
    font-size: ${props => props.theme.typography.fontSizes['4xl']};
  }

  ${props => props.theme.breakpoints.up('lg')} {
    font-size: ${props => props.theme.typography.fontSizes['5xl']};
  }
`;

export const ForgeSubheading = styled.h2<StyledProps>`
  font-family: ${props => props.theme.typography.fontFamily.heading};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.small};
  font-size: ${props => props.theme.typography.fontSizes['2xl']};

  ${props => props.theme.breakpoints.up('md')} {
    font-size: ${props => props.theme.typography.fontSizes['3xl']};
  }
`;

export const ForgeText = styled.p<StyledProps>`
  font-family: ${props => props.theme.typography.fontFamily.body};
  color: ${props => props.theme.colors.text.primary};
  line-height: 1.6;
  margin-bottom: ${props => props.theme.spacing.small};
  font-size: ${props => props.theme.typography.fontSizes.sm};

  ${props => props.theme.breakpoints.up('md')} {
    font-size: ${props => props.theme.typography.fontSizes.base};
  }
`;

export const ForgeButton = styled(motion.button)<StyledProps>`
  background: ${props => props.theme.colors.primary.main};
  color: ${props => props.theme.colors.text.light};
  font-family: ${props => props.theme.typography.fontFamily.body};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  padding: ${props => `${props.theme.spacing.small} ${props.theme.spacing.medium}`};
  border-radius: ${props => props.theme.borderRadius.md};
  border: none;
  cursor: pointer;
  transition: ${props => props.theme.transitions.default};
  font-size: ${props => props.theme.typography.fontSizes.sm};

  ${props => props.theme.breakpoints.up('md')} {
    font-size: ${props => props.theme.typography.fontSizes.base};
  }

  &:hover {
    background: ${props => props.theme.colors.primary.dark};
    transform: translateY(-2px);
  }

  &.secondary {
    background: ${props => props.theme.colors.secondary.main};

    &:hover {
      background: ${props => props.theme.colors.secondary.dark};
    }
  }

  ${props => props.theme.breakpoints.up('md')} {
    padding: ${props => props.theme.spacing.large};
  }
`;

export const ForgeCard = styled(motion.div)<StyledProps>`
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.large};
  box-shadow: ${props => props.theme.shadows.md};
  transition: ${props => props.theme.transitions.default};

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.lg};
  }

  ${props => props.theme.breakpoints.up('md')} {
    padding: ${props => props.theme.spacing.large};
  }
`;

export const ForgeGrid = styled.div<StyledProps>`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${props => props.theme.spacing.medium};
  margin: ${props => props.theme.spacing.large} 0;

  ${props => props.theme.breakpoints.up('sm')} {
    grid-template-columns: repeat(2, 1fr);
    gap: ${props => props.theme.spacing.medium};
  }

  ${props => props.theme.breakpoints.up('md')} {
    grid-template-columns: repeat(3, 1fr);
    gap: ${props => props.theme.spacing.large};
  }

  ${props => props.theme.breakpoints.up('lg')} {
    grid-template-columns: repeat(4, 1fr);
  }
`;

export const ForgeMetallicCard = styled(ForgeCard)`
  background: ${props => props.theme.colors.forge.metallic};
  color: ${props => props.theme.colors.text.light};
  font-family: ${props => props.theme.typography.fontFamily.body};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  font-size: ${props => props.theme.typography.fontSizes.sm};

  ${props => props.theme.breakpoints.up('md')} {
    font-size: ${props => props.theme.typography.fontSizes.base};
  }
  position: relative;
  overflow: hidden;

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1));
    pointer-events: none;
  }
`;

export const ForgeGlowingBorder = styled.div<StyledProps>`
  position: relative;
  
  &:before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: ${props => props.theme.colors.forge.glow};
    border-radius: inherit;
    z-index: -1;
    opacity: 0;
    transition: ${props => props.theme.transitions.default};
  }

  &:hover:before {
    opacity: 1;
  }
`;
