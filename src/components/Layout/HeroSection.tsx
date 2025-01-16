import React from 'react';
import styled from 'styled-components';
import { Button } from '@components/ui/Button';

const HeroContainer = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #182038 0%, #2A3352 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('/forge-pattern.svg') repeat;
    opacity: 0.05;
    z-index: 1;
  }

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 60vw;
    height: 60vw;
    background: radial-gradient(circle, #D97706 0%, transparent 70%);
    transform: translate(-50%, -50%);
    opacity: 0.1;
    filter: blur(100px);
    z-index: 1;
  }
`;

const Content = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 4rem;

  @media (max-width: 1024px) {
    flex-direction: column;
    text-align: center;
  }
`;

const TextContent = styled.div`
  flex: 1;
  color: #FFFFFF;
`;

const Title = styled.h1`
  font-family: 'Montserrat', sans-serif;
  font-size: 4rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }

  span {
    background: linear-gradient(135deg, #D97706, #FFD700);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const Subtitle = styled.p`
  font-family: 'Open Sans', sans-serif;
  font-size: 1.25rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  color: #F5F5F5;
  opacity: 0.9;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;

  @media (max-width: 1024px) {
    justify-content: center;
  }

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const IllustrationContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    max-width: 100%;
    height: auto;
    filter: drop-shadow(0 0 20px rgba(217, 119, 6, 0.3));
    animation: float 6s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 3rem;

  @media (max-width: 1024px) {
    justify-content: center;
  }

  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: #D97706;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-size: 0.875rem;
  color: #F5F5F5;
  opacity: 0.8;
`;

export const HeroSection: React.FC = () => {
  return (
    <HeroContainer>
      <Content>
        <TextContent>
          <Title>
            Forge ton avenir dans la <span>blockchain</span>
          </Title>
          <Subtitle>
            Créez, déployez et gérez vos tokens en toute simplicité. Une plateforme puissante pour donner vie à vos projets crypto.
          </Subtitle>
          <ButtonGroup>
            <Button variant="primary" size="large">
              Commencer à Forger
            </Button>
            <Button variant="secondary" size="large">
              Découvrir TokenForge
            </Button>
          </ButtonGroup>
          <StatsContainer>
            <StatItem>
              <StatValue>10K+</StatValue>
              <StatLabel>Tokens Créés</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>50M$</StatValue>
              <StatLabel>Volume Total</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>15+</StatValue>
              <StatLabel>Blockchains</StatLabel>
            </StatItem>
          </StatsContainer>
        </TextContent>
        <IllustrationContainer>
          <img src="/hero-illustration.svg" alt="TokenForge Platform" />
        </IllustrationContainer>
      </Content>
    </HeroContainer>
  );
};
