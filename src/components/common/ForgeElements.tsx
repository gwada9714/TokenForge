import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Theme } from '../../styles/styled';

export const ForgeContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${props => props.theme.spacing.md};
`;

export const ForgeSection = styled.section`
  padding: ${props => props.theme.spacing.xl} 0;
  position: relative;
  overflow: hidden;
`;

export const ForgeHeading = styled.h1`
  font-family: ${props => props.theme.typography.fontFamily.heading};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.md};
  text-align: center;
`;

export const ForgeSubheading = styled.h2`
  font-family: ${props => props.theme.typography.fontFamily.heading};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

export const ForgeText = styled.p`
  font-family: ${props => props.theme.typography.fontFamily.body};
  color: ${props => props.theme.colors.text.primary};
  line-height: 1.6;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

export const ForgeButton = styled(motion.button)`
  background: ${props => props.theme.colors.primary.main};
  color: ${props => props.theme.colors.text.light};
  font-family: ${props => props.theme.typography.fontFamily.body};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  padding: ${props => `${props.theme.spacing.sm} ${props.theme.spacing.md}`};
  border-radius: ${props => props.theme.borderRadius.md};
  border: none;
  cursor: pointer;
  transition: ${props => props.theme.transitions.default};

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
`;

export const ForgeCard = styled(motion.div)`
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  box-shadow: ${props => props.theme.shadows.md};
  transition: ${props => props.theme.transitions.default};

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

export const ForgeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${props => props.theme.spacing.xl};
  margin: ${props => props.theme.spacing.xl} 0;
`;

export const ForgeMetallicCard = styled(ForgeCard)`
  background: ${props => props.theme.colors.forge.metallic};
  color: ${props => props.theme.colors.text.light};
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

export const ForgeGlowingBorder = styled.div`
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
