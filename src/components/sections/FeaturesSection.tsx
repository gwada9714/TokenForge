import React from 'react';
import styled from 'styled-components';
import { Card } from '@components/ui/Card';

const SectionContainer = styled.section`
  padding: 6rem 2rem;
  background-color: #F5F5F5;
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 4rem;
`;

const Title = styled.h2`
  font-family: 'Montserrat', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: #182038;
  margin-bottom: 1rem;

  span {
    color: #D97706;
  }
`;

const Description = styled.p`
  font-family: 'Open Sans', sans-serif;
  font-size: 1.125rem;
  color: #4B5563;
  max-width: 600px;
  margin: 0 auto;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled(Card)`
  height: 100%;
  transition: transform 0.3s ease-in-out;

  &:hover {
    transform: translateY(-8px);
  }
`;

const IconContainer = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #182038, #2A3352);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;

  svg {
    width: 32px;
    height: 32px;
    color: #D97706;
  }
`;

const FeatureTitle = styled.h3`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: #182038;
  margin-bottom: 0.75rem;
`;

const FeatureDescription = styled.p`
  font-family: 'Open Sans', sans-serif;
  font-size: 1rem;
  color: #4B5563;
  line-height: 1.6;
`;

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Déploiement Multi-Chain",
    description: "Déployez vos tokens sur plusieurs blockchains en quelques clics. Support pour Ethereum, BSC, Polygon et plus."
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Sécurité Maximale",
    description: "Code audité, verrouillage de liquidité automatique et mécanismes anti-whale intégrés pour une sécurité optimale."
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Personnalisation Avancée",
    description: "Configurez tous les aspects de votre token : nom, symbole, supply, taxes, limites de transaction et plus encore."
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Performance Optimale",
    description: "Smart contracts optimisés pour minimiser les coûts de gas et maximiser l'efficacité des transactions."
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Support Communautaire",
    description: "Accédez à notre communauté active et à notre support technique 24/7 pour vous accompagner dans votre projet."
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Analytics Intégrés",
    description: "Suivez les performances de votre token en temps réel avec des tableaux de bord détaillés et des métriques avancées."
  }
];

export const FeaturesSection: React.FC = () => {
  return (
    <SectionContainer id="features">
      <Content>
        <SectionHeader>
          <Title>
            Les <span>outils</span> pour forger votre succès
          </Title>
          <Description>
            Découvrez les fonctionnalités qui font de TokenForge la plateforme de référence pour la création et la gestion de tokens.
          </Description>
        </SectionHeader>

        <FeaturesGrid>
          {features.map((feature, index) => (
            <FeatureCard key={index} variant="elevated" padding="large">
              <IconContainer>
                {feature.icon}
              </IconContainer>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </FeatureCard>
          ))}
        </FeaturesGrid>
      </Content>
    </SectionContainer>
  );
};
