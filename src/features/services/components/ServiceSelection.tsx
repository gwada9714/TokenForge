import React from 'react';
import styled from 'styled-components';
import { SERVICES } from '../config/services';
import { ServiceType, ServiceFeature } from '../types/services';
import { useService } from '../hooks/useService';
import { Card, Button, Alert, Tooltip } from '@/components/ui';
import { THEME_CONFIG } from '@/config/constants/theme';

interface ServiceSelectionProps {
  onServiceSelected: (serviceType: ServiceType) => void;
}

const ServicesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${THEME_CONFIG.spacing.xl};
  margin: ${THEME_CONFIG.spacing.xl} 0;
`;

const ServiceCard = styled(Card)<{ isSelected?: boolean }>`
  display: flex;
  flex-direction: column;
  padding: ${THEME_CONFIG.spacing.lg};
  border: 2px solid ${({ theme, isSelected }) => 
    isSelected ? theme.colors.primary : 'transparent'};
  transition: ${THEME_CONFIG.transition};

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${THEME_CONFIG.boxShadow};
  }
`;

const ServiceHeader = styled.div`
  margin-bottom: ${THEME_CONFIG.spacing.md};
`;

const ServiceName = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.5rem;
`;

const ServiceDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: ${THEME_CONFIG.spacing.sm} 0;
`;

const PriceContainer = styled.div`
  margin: ${THEME_CONFIG.spacing.md} 0;
  padding: ${THEME_CONFIG.spacing.md};
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${THEME_CONFIG.borderRadius};
`;

const Price = styled.div`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const PriceDetails = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: ${THEME_CONFIG.spacing.xs};
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: ${THEME_CONFIG.spacing.md} 0;
  flex-grow: 1;
`;

const Feature = styled.li`
  display: flex;
  align-items: center;
  margin: ${THEME_CONFIG.spacing.xs} 0;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: help;

  &:before {
    content: "✓";
    color: ${({ theme }) => theme.colors.success};
    margin-right: ${THEME_CONFIG.spacing.sm};
  }
`;

export const ServiceSelection: React.FC<ServiceSelectionProps> = ({ onServiceSelected }) => {
  const { requestQuote, error, currentQuote, isProcessing } = useService();
  const [selectedService, setSelectedService] = React.useState<ServiceType | null>(null);

  const handleServiceClick = async (serviceType: ServiceType) => {
    try {
      setSelectedService(serviceType);
      await requestQuote(serviceType);
      onServiceSelected(serviceType);
    } catch (err) {
      console.error('Erreur lors de la sélection du service:', err);
    }
  };

  const renderFeature = (feature: ServiceFeature) => (
    <Tooltip 
      key={feature.id}
      content={feature.description}
      position="top"
    >
      <Feature>{feature.name}</Feature>
    </Tooltip>
  );

  return (
    <div>
      {error && (
        <div style={{ marginBottom: THEME_CONFIG.spacing.md }}>
          <Alert type="error">{error}</Alert>
        </div>
      )}

      <ServicesContainer>
        {SERVICES.map((service) => (
          <ServiceCard
            key={service.id}
            isSelected={selectedService === service.id}
          >
            <ServiceHeader>
              <ServiceName>{service.name}</ServiceName>
              <ServiceDescription>{service.description}</ServiceDescription>
            </ServiceHeader>

            <PriceContainer>
              <Price>
                À partir de {service.price.baseFee} {service.price.currency}
              </Price>
              {service.price.percentageFee && (
                <PriceDetails>
                  + {service.price.percentageFee}% de commission
                </PriceDetails>
              )}
            </PriceContainer>

            <FeatureList>
              {service.features.map(renderFeature)}
            </FeatureList>

            <Button
              variant="primary"
              fullWidth
              onClick={() => handleServiceClick(service.id)}
              disabled={isProcessing}
            >
              {isProcessing && selectedService === service.id
                ? 'Chargement...'
                : 'Sélectionner'}
            </Button>
          </ServiceCard>
        ))}
      </ServicesContainer>
    </div>
  );
}; 