import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Container, Title, Text } from '@/components/common/styles';
import { PlanSelection } from '@/features/pricing/components/PlanSelection';
import { PlanType } from '@/features/pricing/types/plans';
import { SPACING } from '@/config/constants/theme';

const PlansContainer = styled(Container)`
  max-width: 1200px;
  padding: ${SPACING['2xl']} ${SPACING.xl};
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${SPACING['2xl']};
`;

const PageTitle = styled(Title)`
  font-size: 2.5rem;
  margin-bottom: ${SPACING.md};
`;

const Description = styled(Text)`
  font-size: 1.125rem;
  max-width: 800px;
  margin: 0 auto ${SPACING.xl};
`;

const Features = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${SPACING.xl};
  margin-bottom: ${SPACING['2xl']};
`;

const Feature = styled.div`
  text-align: center;
  padding: ${SPACING.lg};

  h3 {
    font-size: 1.25rem;
    margin-bottom: ${SPACING.sm};
    color: ${props => props.theme.colors.text.primary};
  }

  p {
    color: ${props => props.theme.colors.text.secondary};
  }
`;

const FAQ = styled.div`
  margin-top: ${SPACING['2xl']};
  padding-top: ${SPACING['2xl']};
  border-top: 1px solid ${props => props.theme.colors.border};

  h2 {
    text-align: center;
    margin-bottom: ${SPACING.xl};
    font-size: 2rem;
  }
`;

const FAQItem = styled.div`
  margin-bottom: ${SPACING.xl};

  h3 {
    font-size: 1.25rem;
    margin-bottom: ${SPACING.sm};
    color: ${props => props.theme.colors.text.primary};
  }

  p {
    color: ${props => props.theme.colors.text.secondary};
  }
`;

export default function Plans() {
  const navigate = useNavigate();

  const handlePlanSelected = (planId: PlanType) => {
    // Rediriger vers la page de création de token avec le plan sélectionné
    navigate('/create-token', { state: { selectedPlan: planId } });
  };

  return (
    <PlansContainer>
      <Header>
        <PageTitle>Choisissez votre Plan</PageTitle>
        <Description>
          Découvrez nos différents plans adaptés à vos besoins. De l'apprentissage
          à la maîtrise, nous avons la solution qu'il vous faut.
        </Description>
      </Header>

      <Features>
        <Feature>
          <h3>Sécurité Maximale</h3>
          <p>
            Tous nos contrats sont audités et sécurisés pour garantir la protection
            de vos tokens.
          </p>
        </Feature>
        <Feature>
          <h3>Support Dédié</h3>
          <p>
            Une équipe d'experts à votre disposition pour vous accompagner à chaque
            étape.
          </p>
        </Feature>
        <Feature>
          <h3>Multi-Chain</h3>
          <p>
            Déployez vos tokens sur différentes blockchains selon vos besoins.
          </p>
        </Feature>
      </Features>

      <PlanSelection onPlanSelected={handlePlanSelected} />

      <FAQ>
        <h2>Questions Fréquentes</h2>
        <FAQItem>
          <h3>Comment choisir le bon plan ?</h3>
          <p>
            Le choix du plan dépend de vos besoins. Le plan Apprenti est parfait
            pour débuter et tester, le plan Forgeron pour les projets sérieux, et
            le plan Maître Forgeron pour une expérience complète avec support
            prioritaire.
          </p>
        </FAQItem>
        <FAQItem>
          <h3>Puis-je changer de plan plus tard ?</h3>
          <p>
            Oui, vous pouvez upgrader votre plan à tout moment pour accéder à plus
            de fonctionnalités.
          </p>
        </FAQItem>
        <FAQItem>
          <h3>Quels sont les moyens de paiement acceptés ?</h3>
          <p>
            Nous acceptons les paiements en BNB, ETH, MATIC et certains stablecoins
            selon le réseau choisi.
          </p>
        </FAQItem>
      </FAQ>
    </PlansContainer>
  );
} 