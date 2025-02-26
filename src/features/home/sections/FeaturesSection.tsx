import React from 'react';
import styled from 'styled-components';
import { Container, Typography, Grid, Box } from '@mui/material';
import { motion } from 'framer-motion';
import InterfaceIcon from '@mui/icons-material/TouchApp';
import CustomizeIcon from '@mui/icons-material/Build';
import SecurityIcon from '@mui/icons-material/Security';
import EconomyIcon from '@mui/icons-material/AccountBalance';

const SectionContainer = styled.section`
  padding: 6rem 0;
  background: ${props => props.theme.colors.background.default};
  position: relative;
  overflow: hidden;
`;

const Content = styled(Container)`
  position: relative;
  z-index: 2;
`;

const Title = styled(Typography)`
  text-align: center;
  font-family: 'Montserrat', sans-serif;
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 3rem;
  color: ${props => props.theme.colors.text.primary};

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const FeatureCard = styled(motion.div)`
  padding: 2rem;
  background: ${props => props.theme.colors.background.paper};
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  height: 100%;
  
  h3 {
    font-family: 'Montserrat', sans-serif;
    font-size: 1.5rem;
    font-weight: 600;
    margin: 1rem 0;
    color: ${props => props.theme.colors.text.primary};
  }

  p {
    color: ${props => props.theme.colors.text.secondary};
    line-height: 1.6;
  }
`;

const IconWrapper = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary.main}20;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;

  svg {
    font-size: 30px;
    color: ${props => props.theme.colors.primary.main};
  }
`;

const features = [
  {
    icon: <InterfaceIcon />,
    title: "Création Intuitive & Guidée",
    description: "Interface simple, création guidée pas-à-pas. Lancez-vous sans coder ! Mode 'Découverte' avec exemples et modèles. Infobulles explicatives pour les options avancées."
  },
  {
    icon: <CustomizeIcon />,
    title: "Personnalisation Avancée",
    description: "Multi-chain (ETH, BSC, Polygon, AVAX...), options avancées (mint, burn manuel & automatique, blacklist, renonciation à la propriété avec avertissement clair). Créez un token à votre image."
  },
  {
    icon: <SecurityIcon />,
    title: "Sécurité Renforcée",
    description: "Code open-source. Sécurité maximale malgré l'absence d'audit formel pour le moment. (Code non audité - voir les risques dans la FAQ)"
  },
  {
    icon: <EconomyIcon />,
    title: "Taxe de la Forge : Gagnant-Gagnant",
    description: "Modèle économique unique : 0.5% de taxe de base + jusqu'à 1.5% de taxe additionnelle configurable par le créateur. Un système transparent qui profite à tous."
  }
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

export const FeaturesSection: React.FC = () => {
  return (
    <SectionContainer>
      <Content maxWidth="lg">
        <Title variant="h2">
          Pourquoi Choisir TokenForge ?
        </Title>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <FeatureCard
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
              >
                <IconWrapper>
                  {feature.icon}
                </IconWrapper>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </FeatureCard>
            </Grid>
          ))}
        </Grid>
      </Content>
    </SectionContainer>
  );
}; 