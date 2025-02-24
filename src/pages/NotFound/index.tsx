import React from 'react';
import styled from 'styled-components';
import { LinkButton, Container, Title, Text } from '@/components/common/styles';
import { SPACING } from '@/config/constants/theme';

const NotFoundContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
`;

const ErrorCode = styled(Title)`
  font-size: 6rem;
  color: var(--color-primary);
  margin-bottom: ${SPACING.sm};
`;

const Message = styled(Text)`
  font-size: 1.125rem;
  margin-bottom: ${SPACING.xl};
  max-width: 500px;
`;

/**
 * Page 404 - Page non trouvée
 * Affichée lorsqu'une route n'existe pas
 */
export default function NotFound() {
  return (
    <NotFoundContainer>
      <ErrorCode>404</ErrorCode>
      <Title as="h2" style={{ fontSize: '2rem', marginBottom: SPACING.lg }}>
        Page non trouvée
      </Title>
      <Message>
        Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
      </Message>
      <LinkButton to="/">Retour à l'accueil</LinkButton>
    </NotFoundContainer>
  );
} 