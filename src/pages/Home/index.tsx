import React from 'react';
import styled from 'styled-components';
import { APP_NAME } from '@/config/constants';
import { Container, Title, Button, Text } from '@/components/common/styles';
import { SPACING } from '@/config/constants/theme';

const HomeContainer = styled(Container)`
  text-align: center;
  padding: ${SPACING['2xl']} ${SPACING.xl};
`;

const HomeTitle = styled(Title)`
  font-size: 3rem;
`;

const Description = styled(Text)`
  font-size: 1.25rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: ${SPACING['2xl']};
`;

const CTAButton = styled(Button)`
  padding: ${SPACING.md} ${SPACING.xl};
  font-size: 1.125rem;
`;

/**
 * Page d'accueil de l'application
 * Présente une vue d'ensemble de TokenForge avec un appel à l'action
 */
export default function Home() {
  return (
    <HomeContainer>
      <HomeTitle>Bienvenue sur {APP_NAME}</HomeTitle>
      <Description>
        La plateforme de gestion de tokens nouvelle génération.
        Créez, gérez et suivez vos tokens en toute simplicité.
      </Description>
      <CTAButton>Commencer maintenant</CTAButton>
    </HomeContainer>
  );
}