import React from 'react';
import styled from 'styled-components';
import { Button } from '../ui/Button';

const HeroContainer = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 6rem 2rem;
  position: relative;
  background: ${({ theme }) => theme.colors.gradient.primary};
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('/hero-pattern.svg') repeat;
    opacity: 0.05;
    z-index: 1;
  }
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const HeroText = styled.div`
  color: ${({ theme }) => theme.colors.text.light};
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  font-size: ${({ theme }) => theme.typography.fontSize['5xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: 1.5rem;
  line-height: 1.2;

  span {
    background: ${({ theme }) => theme.colors.gradient.secondary};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
  }
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  margin-bottom: 2rem;
  opacity: 0.9;
  line-height: 1.6;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    justify-content: center;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-top: 3rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const StatItem = styled.div`
  text-align: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  backdrop-filter: blur(10px);
`;

const StatValue = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  opacity: 0.9;
`;

const HeroImage = styled.div`
  img {
    width: 100%;
    height: auto;
    border-radius: ${({ theme }) => theme.borderRadius.lg};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: none;
  }
`;

const stats = [
  { value: '10K+', label: 'Tokens Créés' },
  { value: '$500M+', label: 'Valeur Totale' },
  { value: '50+', label: 'Blockchains' },
  { value: '99.9%', label: 'Disponibilité' }
];

export const HeroSection: React.FC = () => {
  return (
    <HeroContainer>
      <Content>
        <HeroText>
          <Title>
            Créez vos tokens en <span>quelques clics</span>
          </Title>
          <Subtitle>
            TokenForge simplifie la création et le déploiement de tokens sur multiple blockchains. 
            Sécurisé, rapide et professionnel.
          </Subtitle>
          <ButtonGroup>
            <Button variant="primary" size="large">
              Commencer
            </Button>
            <Button variant="secondary" size="large">
              Voir la démo
            </Button>
          </ButtonGroup>
          <StatsGrid>
            {stats.map((stat, index) => (
              <StatItem key={index}>
                <StatValue>{stat.value}</StatValue>
                <StatLabel>{stat.label}</StatLabel>
              </StatItem>
            ))}
          </StatsGrid>
        </HeroText>
        <HeroImage>
          <img src="/hero-image.png" alt="TokenForge Platform" />
        </HeroImage>
      </Content>
    </HeroContainer>
  );
};
