import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Container, Typography, Box } from '@mui/material';

const SectionContainer = styled.section`
  padding: 6rem 0;
  background: ${props => props.theme.colors.background.paper};
  position: relative;
  overflow: hidden;
`;

const Content = styled(Container)`
  position: relative;
  z-index: 2;
  text-align: center;
`;

const Title = styled(Typography)`
  font-family: 'Montserrat', sans-serif;
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: ${props => props.theme.colors.text.primary};

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const Description = styled(Typography)`
  font-size: 1.125rem;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.8;
  color: ${props => props.theme.colors.text.secondary};
`;

const fadeInUpVariants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

export const IntroductionSection: React.FC = () => {
  return (
    <SectionContainer>
      <Content maxWidth="lg">
        <motion.div
          variants={fadeInUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <Title variant="h2">
            TokenForge : Votre Plateforme de Création de Tokens Simplifiée
          </Title>
          
          <Description variant="body1">
            TokenForge démocratise la création de tokens. Notre interface intuitive et nos fonctionnalités 
            puissantes vous permettent de lancer votre propre cryptomonnaie en quelques minutes, sans 
            aucune connaissance en codage. De l'idée à la réalité, TokenForge vous accompagne à chaque étape.
          </Description>
        </motion.div>
      </Content>
    </SectionContainer>
  );
}; 