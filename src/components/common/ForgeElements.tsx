import styled from 'styled-components';
import { motion } from 'framer-motion';
import { DefaultTheme } from 'styled-components';

interface StyledProps {
  theme: DefaultTheme;
}

export const ForgeContainer = styled.div<StyledProps>`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing(4)}rem;
`;

export const ForgeSection = styled.section<StyledProps>`
  padding: ${({ theme }) => theme.spacing(16)}rem 0;
  position: relative;
  overflow: hidden;
`;

export const ForgeHeading = styled.h1<StyledProps>`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing(4)}rem;
  text-align: center;
`;

export const ForgeSubheading = styled.h2<StyledProps>`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing(2)}rem;
`;

export const ForgeText = styled.p<StyledProps>`
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.6;
  margin-bottom: ${({ theme }) => theme.spacing(2)}rem;
`;

export const ForgeButton = styled(motion.button)<StyledProps>`
  background: ${({ theme }) => theme.colors.primary.main};
  color: ${({ theme }) => theme.colors.text.light};
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  padding: ${({ theme }) => theme.spacing(1)}rem ${({ theme }) => theme.spacing(4)}rem;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: none;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.default};

  &:hover {
    background: ${({ theme }) => theme.colors.primary.dark};
    transform: translateY(-2px);
  }

  &.secondary {
    background: ${({ theme }) => theme.colors.secondary.main};

    &:hover {
      background: ${({ theme }) => theme.colors.secondary.dark};
    }
  }
`;

export const ForgeCard = styled(motion.div)<StyledProps>`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  padding: ${({ theme }) => theme.spacing(8)}rem;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  transition: ${({ theme }) => theme.transitions.default};

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.large};
  }
`;

export const ForgeGrid = styled.div<StyledProps>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing(8)}rem;
  margin: ${({ theme }) => theme.spacing(8)}rem 0;
`;

export const ForgeMetallicCard = styled(ForgeCard)<StyledProps>`
  background: ${({ theme }) => theme.colors.forge.metallic};
  color: ${({ theme }) => theme.colors.text.light};
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
    background: ${({ theme }) => theme.colors.forge.glow};
    border-radius: inherit;
    z-index: -1;
    opacity: 0;
    transition: ${({ theme }) => theme.transitions.default};
  }

  &:hover:before {
    opacity: 1;
  }
`;
