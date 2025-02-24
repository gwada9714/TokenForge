import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Container, Title, Text } from '@/components/ui';
import { ServiceSelection } from '@/features/services/components/ServiceSelection';
import { ServiceType } from '@/features/services/types/services';
import { spacing } from '@/theme';

const ServicesContainer = styled(Container)`
  max-width: 1200px;
  padding: ${spacing.xl} ${spacing.md};
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${spacing.xxl};
`;

const PageTitle = styled(Title)`
  margin-bottom: ${spacing.md};
`;

const Description = styled(Text)`
  max-width: 800px;
  margin: 0 auto;
  color: ${({ theme }) => theme.colors.textLight};
`;

const Features = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${spacing.xl};
  margin: ${spacing.xxl} 0;
`;

const Feature = styled.div`
  text-align: center;
  padding: ${spacing.lg};

  h3 {
    margin: ${spacing.md} 0;
    color: ${({ theme }) => theme.colors.text};
  }

  p {
    color: ${({ theme }) => theme.colors.textLight};
  }
`;

const FAQ = styled.div`
  margin-top: ${spacing.xxl};
`;

const FAQTitle = styled(Title)`
  text-align: center;
  margin-bottom: ${spacing.xl};
`;

const FAQItem = styled.div`
  margin-bottom: ${spacing.lg};

  h4 {
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${spacing.sm};
  }

  p {
    color: ${({ theme }) => theme.colors.textLight};
  }
`;

export const Services: React.FC = () => {
  const navigate = useNavigate();

  const handleServiceSelected = (serviceType: ServiceType) => {
    navigate('/service-configuration', { state: { serviceType } });
  };

  return (
    <ServicesContainer>
      <Header>
        <PageTitle>Services à la carte</PageTitle>
        <Description>
          Découvrez notre gamme de services professionnels pour maximiser le potentiel 
          de vos tokens et projets blockchain. Choisissez le service qui correspond 
          le mieux à vos besoins.
        </Description>
      </Header>

      <Features>
        <Feature>
          <h3>Sécurité Maximale</h3>
          <p>
            Tous nos services sont audités et sécurisés par des experts en blockchain
            pour garantir la protection de vos actifs.
          </p>
        </Feature>
        <Feature>
          <h3>Support Dédié</h3>
          <p>
            Une équipe d'experts à votre disposition pour vous accompagner à chaque
            étape de votre projet.
          </p>
        </Feature>
        <Feature>
          <h3>Multi-Chain</h3>
          <p>
            Déployez vos services sur les principales blockchains du marché pour
            une portée maximale.
          </p>
        </Feature>
      </Features>

      <ServiceSelection onServiceSelected={handleServiceSelected} />

      <FAQ>
        <FAQTitle level={2}>Questions Fréquentes</FAQTitle>
        
        <FAQItem>
          <h4>Comment choisir le service adapté ?</h4>
          <p>
            Analysez vos besoins actuels et vos objectifs. Notre équipe est disponible
            pour vous conseiller dans votre choix. Vous pouvez également commencer
            par un service de base et évoluer selon vos besoins.
          </p>
        </FAQItem>

        <FAQItem>
          <h4>Quels sont les délais de mise en place ?</h4>
          <p>
            Les délais varient selon le service choisi. Le launchpad peut être
            configuré en quelques heures, tandis que le staking peut nécessiter
            quelques jours pour une configuration optimale.
          </p>
        </FAQItem>

        <FAQItem>
          <h4>Quels sont les moyens de paiement acceptés ?</h4>
          <p>
            Nous acceptons les paiements en ETH, BNB et USDT. Les prix sont
            calculés en temps réel selon le cours du marché.
          </p>
        </FAQItem>
      </FAQ>
    </ServicesContainer>
  );
}; 