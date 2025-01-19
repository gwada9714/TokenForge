import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { DefaultTheme } from 'styled-components';

interface StyledProps {
  theme: DefaultTheme;
}

export const ForgeContainer = styled.div<StyledProps>`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${props => props.theme.spacing(4)};

  ${props => props.theme.breakpoints.up('md')} {
    padding: 0 ${props => props.theme.spacing(6)};
  }
`;

export const ForgeSection = styled.section<StyledProps>`
  padding: ${props => props.theme.spacing(6)} 0;
  position: relative;
  overflow: hidden;

  ${props => props.theme.breakpoints.up('xl')} {
    padding: ${props => props.theme.spacing(8)} 0;
  }
`;

export const ForgeHeading = styled.h1<StyledProps>`
  font-family: ${props => props.theme.typography.fontFamily.heading};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing(4)};
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
  margin-bottom: ${props => props.theme.spacing(2)};
  font-size: ${props => props.theme.typography.fontSizes['2xl']};

  ${props => props.theme.breakpoints.up('md')} {
    font-size: ${props => props.theme.typography.fontSizes['3xl']};
  }
`;

export const ForgeText = styled.p<StyledProps>`
  font-family: ${props => props.theme.typography.fontFamily.body};
  font-weight: ${props => props.theme.typography.fontWeight.normal};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing(2)};
  font-size: ${props => props.theme.typography.fontSizes.md};
  line-height: 1.6;
`;

export const ForgeButton = styled(motion.button)<StyledProps>`
  font-family: ${props => props.theme.typography.fontFamily.body};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  background-color: ${props => props.theme.colors.text.primary};
  color: ${props => props.theme.colors.background.primary};
  padding: ${props => props.theme.spacing(2)} ${props => props.theme.spacing(4)};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  font-size: ${props => props.theme.typography.fontSizes.sm};

  &:hover {
    background-color: ${props => props.theme.colors.text.secondary};
    transform: translateY(-2px);
  }

  ${props => props.theme.breakpoints.up('md')} {
    font-size: ${props => props.theme.typography.fontSizes.md};
  }
`;

export const ForgeCard = styled(motion.div)<StyledProps>`
  background: ${props => props.theme.colors.background.primary};
  padding: ${props => props.theme.spacing(4)};
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateY(-4px);
  }
`;

export const ForgeGrid = styled.div<StyledProps>`
  display: grid;
  gap: ${props => props.theme.spacing(4)};
  grid-template-columns: 1fr;

  ${props => props.theme.breakpoints.up('md')} {
    grid-template-columns: repeat(2, 1fr);
  }

  ${props => props.theme.breakpoints.up('lg')} {
    grid-template-columns: repeat(3, 1fr);
  }
`;

export const ForgeMetallicCard = styled.div<StyledProps>`
  background: ${props => props.theme.colors.forge};
  color: ${props => props.theme.colors.text.primary};
  font-family: ${props => props.theme.typography.fontFamily.body};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: ${props => props.theme.spacing(3)};
  box-shadow: ${props => props.theme.shadows.medium};
  transition: ${props => props.theme.transitions.default};

  ${props => props.theme.breakpoints.up('md')} {
    font-size: ${props => props.theme.typography.fontSizes.md};
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
    background: ${props => props.theme.colors.forge};
    z-index: -1;
    filter: blur(8px);
    opacity: 0.5;
  }
`;
