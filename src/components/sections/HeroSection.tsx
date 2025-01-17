import React from 'react';
import styled from 'styled-components';
import { Container, Box } from '@mui/material';
import { ForgeButton } from '../common/ForgeButton';
import { ForgeHeading } from '../common/ForgeHeading';
import { ParallaxContainer } from '../common/ParallaxContainer';
import ForgeBackground from '../common/ForgeBackground';
import { useNavigate } from 'react-router-dom';

const HeroContainer = styled.section`
  position: relative;
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  padding: 4rem 0;
  overflow: hidden;
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  text-align: center;
  color: ${props => props.theme.colors.text.light};
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
`;

const FloatingElement = styled.div<{ $delay?: number }>`
  animation: float 6s ease-in-out infinite;
  animation-delay: ${props => props.$delay || 0}s;

  @keyframes float {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
    100% {
      transform: translateY(0px);
    }
  }
`;

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <HeroContainer>
      <ForgeBackground sparkleCount={20} />
      
      <Container maxWidth="lg">
        <Content>
          <ParallaxContainer speed={0.3}>
            <FloatingElement>
              <ForgeHeading 
                level={1} 
                $hasGradient 
                $align="center"
              >
                TokenForge : Forgez votre Avenir Crypto
              </ForgeHeading>
            </FloatingElement>
          </ParallaxContainer>

          <ParallaxContainer speed={0.4}>
            <FloatingElement $delay={0.2}>
              <Subtitle>
                Créez et déployez vos tokens en toute simplicité. Une plateforme complète
                pour donner vie à vos projets blockchain avec des outils puissants et intuitifs.
              </Subtitle>
            </FloatingElement>
          </ParallaxContainer>

          <ParallaxContainer speed={0.5}>
            <FloatingElement $delay={0.4}>
              <ButtonContainer>
                <ForgeButton 
                  variant="secondary"
                  size="large"
                  $isGlowing
                  onClick={() => navigate('/create')}
                >
                  Forge ton Token
                </ForgeButton>
                <ForgeButton 
                  variant="outline"
                  size="large"
                  onClick={() => navigate('/about')}
                >
                  Découvrir la Forge
                </ForgeButton>
              </ButtonContainer>
            </FloatingElement>
          </ParallaxContainer>
        </Content>
      </Container>
    </HeroContainer>
  );
};
