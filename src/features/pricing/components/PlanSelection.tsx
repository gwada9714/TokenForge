import React from "react";
import styled from "styled-components";
import { PLANS } from "../config/plans";
import { PlanType } from "../types/plans";
import { usePayment } from "../hooks/usePayment";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { SPACING } from "@/config/constants/theme";

const PlansContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${SPACING.xl};
  padding: ${SPACING.xl};
`;

const PlanCard = styled(Card)<{ recommended?: boolean }>`
  display: flex;
  flex-direction: column;
  padding: ${SPACING.xl};
  position: relative;
  border: ${(props) =>
    props.recommended ? `2px solid ${props.theme.colors.primary}` : "none"};

  ${(props) =>
    props.recommended &&
    `
    &::before {
      content: 'Recommandé';
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background-color: ${props.theme.colors.primary};
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.875rem;
    }
  `}
`;

const PlanHeader = styled.div`
  text-align: center;
  margin-bottom: ${SPACING.lg};
`;

const PlanName = styled.h3`
  font-size: 1.5rem;
  margin-bottom: ${SPACING.xs};
  color: ${(props) => props.theme.colors.text.primary};
`;

const PlanDescription = styled.p`
  color: ${(props) => props.theme.colors.text.secondary};
  margin-bottom: ${SPACING.md};
`;

const PlanPrice = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${(props) => props.theme.colors.primary};
  margin-bottom: ${SPACING.lg};
  text-align: center;

  span {
    font-size: 1rem;
    color: ${(props) => props.theme.colors.text.secondary};
  }
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
`;

const Feature = styled.li<{ included: boolean }>`
  display: flex;
  align-items: center;
  margin-bottom: ${SPACING.sm};
  color: ${(props) =>
    props.included
      ? props.theme.colors.text.primary
      : props.theme.colors.text.secondary};

  &::before {
    content: ${(props) => (props.included ? '"✓"' : '"×"')};
    margin-right: ${SPACING.sm};
    color: ${(props) =>
      props.included ? props.theme.colors.success : props.theme.colors.error};
  }
`;

const ActionButton = styled(Button)`
  margin-top: ${SPACING.lg};
`;

interface PlanSelectionProps {
  onPlanSelected?: (planId: PlanType) => void;
}

export const PlanSelection: React.FC<PlanSelectionProps> = ({
  onPlanSelected,
}) => {
  const { initiatePayment, isProcessing, error } = usePayment();

  const handlePlanSelection = async (planId: PlanType) => {
    try {
      await initiatePayment(planId);
      onPlanSelected?.(planId);
    } catch (err) {
      // L'erreur est déjà gérée dans le hook usePayment
    }
  };

  return (
    <div>
      {error && (
        <Alert type="error" title="Erreur de paiement">
          {error}
        </Alert>
      )}

      <PlansContainer>
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            recommended={plan.recommended}
            variant="elevated"
          >
            <PlanHeader>
              <PlanName>{plan.name}</PlanName>
              <PlanDescription>{plan.description}</PlanDescription>
            </PlanHeader>

            <PlanPrice>
              {plan.price.amount} <span>{plan.price.currency}</span>
            </PlanPrice>

            <FeatureList>
              {plan.features.map((feature) => (
                <Feature key={feature.id} included={feature.included}>
                  {feature.name}
                </Feature>
              ))}
            </FeatureList>

            <ActionButton
              onClick={() => handlePlanSelection(plan.id)}
              disabled={isProcessing}
              fullWidth
            >
              {isProcessing ? "Traitement..." : "Sélectionner"}
            </ActionButton>
          </PlanCard>
        ))}
      </PlansContainer>
    </div>
  );
};
