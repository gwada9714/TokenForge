import React from 'react';
import styled from 'styled-components';
import { Container, Grid } from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SecurityIcon from '@mui/icons-material/Security';
import CodeIcon from '@mui/icons-material/Code';
import BoltIcon from '@mui/icons-material/Bolt';
import BarChartIcon from '@mui/icons-material/BarChart';
import GroupsIcon from '@mui/icons-material/Groups';
import { ForgeHeading } from '../common/ForgeHeading';
import { FeatureCard } from '../common/FeatureCard';
import { ParallaxContainer } from '../common/ParallaxContainer';

const SectionContainer = styled.section`
  padding: 6rem 0;
  background: ${props => props.theme.colors.background.default};
  position: relative;
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      ${props => props.theme.colors.primary.main}40,
      transparent
    );
  }
`;

const HeaderContainer = styled.div`
  text-align: center;
  margin-bottom: 4rem;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 1.25rem;
  max-width: 600px;
  margin: 1.5rem auto 0;
  line-height: 1.6;
`;

const StyledFeatureCard = styled(FeatureCard)<{ $delay: number }>`
  height: 100%;
  opacity: 0;
  animation: fadeSlideUp 0.6s ease-out forwards;
  animation-delay: ${props => props.$delay}s;

  @keyframes fadeSlideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const features = [
  {
    icon: <RocketLaunchIcon />,
    title: 'Déploiement Rapide',
    description: 'Créez et déployez vos tokens en quelques minutes grâce à notre interface intuitive et nos templates optimisés.'
  },
  {
    icon: <SecurityIcon />,
    title: 'Sécurité Maximale',
    description: 'Profitez de smart contracts audités et de mécanismes de sécurité avancés pour protéger vos tokens.'
  },
  {
    icon: <CodeIcon />,
    title: 'Personnalisation Totale',
    description: 'Configurez chaque aspect de votre token selon vos besoins spécifiques avec notre éditeur avancé.'
  },
  {
    icon: <BoltIcon />,
    title: 'Multi-Chain',
    description: 'Déployez sur plusieurs blockchains en un clic et gérez tous vos tokens depuis une seule interface.'
  },
  {
    icon: <BarChartIcon />,
    title: 'Analytics Intégrés',
    description: 'Suivez les performances de vos tokens avec des tableaux de bord détaillés et des métriques en temps réel.'
  },
  {
    icon: <GroupsIcon />,
    title: 'Gouvernance DAO',
    description: 'Implémentez facilement des mécanismes de gouvernance pour votre communauté avec nos outils DAO.'
  }
];

export const FeaturesSection: React.FC = () => {
  return (
    <SectionContainer>
      <Container maxWidth="lg">
        <HeaderContainer>
          <ParallaxContainer speed={0.2}>
            <ForgeHeading level={2} $hasGradient $align="center">
              Fonctionnalités Puissantes
            </ForgeHeading>
            <Subtitle>
              Découvrez tous les outils nécessaires pour créer, déployer et gérer
              vos tokens en toute confiance.
            </Subtitle>
          </ParallaxContainer>
        </HeaderContainer>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <ParallaxContainer speed={0.1 * (index + 1)}>
                <StyledFeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  $delay={0.2 * index}
                />
              </ParallaxContainer>
            </Grid>
          ))}
        </Grid>
      </Container>
    </SectionContainer>
  );
};
