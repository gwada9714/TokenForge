import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '@components/ui/Button';
import { Card } from '@components/ui/Card';

const SectionContainer = styled.section`
  padding: 6rem 2rem;
  background: linear-gradient(135deg, #182038 0%, #2A3352 100%);
  color: #FFFFFF;
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
  margin-bottom: 1rem;

  span {
    background: linear-gradient(135deg, #D97706, #FFD700);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const Description = styled.p`
  font-family: 'Open Sans', sans-serif;
  font-size: 1.125rem;
  color: #F5F5F5;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
`;

const PricingToggle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
`;

const ToggleLabel = styled.span<{ isActive: boolean }>`
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  color: ${props => props.isActive ? '#D97706' : '#F5F5F5'};
  cursor: pointer;
  transition: color 0.2s ease-in-out;
`;

const PricingGrid = styled.div`
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

const PricingCard = styled(Card)<{ isPopular?: boolean }>`
  background: ${props => props.isPopular ? 'linear-gradient(135deg, #182038 0%, #2A3352 100%)' : '#FFFFFF'};
  color: ${props => props.isPopular ? '#FFFFFF' : '#182038'};
  border: ${props => props.isPopular ? '2px solid #D97706' : 'none'};
  position: relative;
  overflow: hidden;

  ${props => props.isPopular && `
    &::before {
      content: 'Plus Populaire';
      position: absolute;
      top: 12px;
      right: -32px;
      background: #D97706;
      color: #FFFFFF;
      padding: 4px 40px;
      font-size: 0.75rem;
      font-weight: 600;
      transform: rotate(45deg);
    }
  `}
`;

const PlanName = styled.h3<{ isPopular?: boolean }>`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: ${props => props.isPopular ? '#FFFFFF' : '#182038'};
`;

const PlanPrice = styled.div<{ isPopular?: boolean }>`
  font-family: 'Montserrat', sans-serif;
  font-size: 3rem;
  font-weight: 700;
  margin: 1.5rem 0;
  color: ${props => props.isPopular ? '#D97706' : '#182038'};

  span {
    font-size: 1rem;
    opacity: 0.7;
  }
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 2rem 0;
`;

const FeatureItem = styled.li<{ isPopular?: boolean }>`
  font-family: 'Open Sans', sans-serif;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: ${props => props.isPopular ? '#F5F5F5' : '#4B5563'};

  svg {
    color: #D97706;
    flex-shrink: 0;
  }
`;

interface PricingPlan {
  name: string;
  price: { monthly: number; annual: number };
  features: string[];
  isPopular?: boolean;
}

const plans: PricingPlan[] = [
  {
    name: "Apprenti Forgeron",
    price: { monthly: 49, annual: 470 },
    features: [
      "1 Token par mois",
      "Déploiement sur 2 blockchains",
      "Support par email",
      "Accès aux templates de base",
      "Analytics basiques"
    ]
  },
  {
    name: "Forgeron",
    price: { monthly: 99, annual: 950 },
    features: [
      "3 Tokens par mois",
      "Déploiement sur 5 blockchains",
      "Support prioritaire 24/7",
      "Templates personnalisables",
      "Analytics avancés",
      "Audit de sécurité basique",
      "Verrouillage de liquidité"
    ],
    isPopular: true
  },
  {
    name: "Maître Forgeron",
    price: { monthly: 199, annual: 1900 },
    features: [
      "Tokens illimités",
      "Toutes les blockchains supportées",
      "Support dédié",
      "Templates sur mesure",
      "Analytics premium",
      "Audit de sécurité complet",
      "Verrouillage de liquidité",
      "Marketing boost",
      "API access"
    ]
  }
];

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
    <path d="M16.667 5L7.5 14.167L3.333 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const PricingSection: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <SectionContainer id="pricing">
      <Content>
        <SectionHeader>
          <Title>
            Choisissez votre <span>plan</span>
          </Title>
          <Description>
            Des solutions adaptées à tous les projets, de l'entrepreneur solo aux grandes entreprises.
          </Description>
        </SectionHeader>

        <PricingToggle>
          <ToggleLabel isActive={!isAnnual} onClick={() => setIsAnnual(false)}>
            Mensuel
          </ToggleLabel>
          <ToggleLabel isActive={isAnnual} onClick={() => setIsAnnual(true)}>
            Annuel (-20%)
          </ToggleLabel>
        </PricingToggle>

        <PricingGrid>
          {plans.map((plan, index) => (
            <PricingCard key={index} isPopular={plan.isPopular} padding="large">
              <PlanName isPopular={plan.isPopular}>{plan.name}</PlanName>
              <PlanPrice isPopular={plan.isPopular}>
                {isAnnual ? plan.price.annual : plan.price.monthly}€
                <span>/{isAnnual ? 'an' : 'mois'}</span>
              </PlanPrice>
              <FeaturesList>
                {plan.features.map((feature, featureIndex) => (
                  <FeatureItem key={featureIndex} isPopular={plan.isPopular}>
                    <CheckIcon />
                    {feature}
                  </FeatureItem>
                ))}
              </FeaturesList>
              <Button
                variant={plan.isPopular ? 'primary' : 'secondary'}
                size="large"
                fullWidth
              >
                Choisir ce plan
              </Button>
            </PricingCard>
          ))}
        </PricingGrid>
      </Content>
    </SectionContainer>
  );
};
