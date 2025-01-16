import React from 'react';
import styled from 'styled-components';
import { Card } from '@components/ui/Card';
import { Button } from '@components/ui/Button';

const SectionContainer = styled.section`
  padding: 6rem 2rem;
  background-color: #F5F5F5;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    background: url('/token-pattern.svg') repeat;
    opacity: 0.05;
    z-index: 1;
  }
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 4rem;
`;

const Title = styled.h2`
  font-family: 'Montserrat', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: #182038;
  margin-bottom: 1rem;

  span {
    color: #D97706;
  }
`;

const Description = styled.p`
  font-family: 'Open Sans', sans-serif;
  font-size: 1.125rem;
  color: #4B5563;
  max-width: 600px;
  margin: 0 auto;
`;

const TokenGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const TokenomicsCard = styled(Card)`
  background: linear-gradient(135deg, #182038 0%, #2A3352 100%);
  color: #FFFFFF;
`;

const TokenomicsTitle = styled.h3`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: #FFFFFF;
`;

const TokenomicsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
`;

const TokenomicsItem = styled.div`
  text-align: center;
`;

const TokenomicsValue = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #D97706;
  margin-bottom: 0.5rem;
`;

const TokenomicsLabel = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-size: 0.875rem;
  color: #F5F5F5;
  opacity: 0.9;
`;

const UtilityList = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const UtilityItem = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-start;
`;

const UtilityIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #D97706, #FFD700);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 24px;
    height: 24px;
    color: #FFFFFF;
  }
`;

const UtilityContent = styled.div``;

const UtilityTitle = styled.h4`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: #182038;
  margin-bottom: 0.5rem;
`;

const UtilityDescription = styled.p`
  font-family: 'Open Sans', sans-serif;
  font-size: 1rem;
  color: #4B5563;
  line-height: 1.6;
`;

const ChartContainer = styled.div`
  margin: 2rem 0;
  height: 200px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CircleChart = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: conic-gradient(
    #D97706 0% 30%,
    #FFD700 30% 50%,
    #182038 50% 70%,
    #2A3352 70% 85%,
    #4B5563 85% 100%
  );
`;

const ChartLegend = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 2rem;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #F5F5F5;
`;

const LegendColor = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background-color: ${props => props.color};
`;

const utilities = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Paiements",
    description: "Utilisez $TKN pour payer les services de la plateforme avec une réduction de 50%."
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Staking",
    description: "Verrouillez vos tokens pour gagner des récompenses et accéder à des fonctionnalités exclusives."
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Gouvernance",
    description: "Participez aux décisions importantes de la plateforme via le système de vote DAO."
  }
];

const tokenomics = [
  { label: "Supply Total", value: "100M" },
  { label: "Circulation", value: "45M" },
  { label: "Prix actuel", value: "$0.85" },
  { label: "Market Cap", value: "$42.5M" }
];

const distribution = [
  { label: "Équipe", value: "30%", color: "#D97706" },
  { label: "Réserve", value: "20%", color: "#FFD700" },
  { label: "Staking", value: "20%", color: "#182038" },
  { label: "Marketing", value: "15%", color: "#2A3352" },
  { label: "Communauté", value: "15%", color: "#4B5563" }
];

export const TokenSection: React.FC = () => {
  return (
    <SectionContainer id="token">
      <Content>
        <SectionHeader>
          <Title>
            Le Token <span>$TKN</span>
          </Title>
          <Description>
            Le cœur de l'écosystème TokenForge, conçu pour récompenser la communauté et alimenter l'innovation.
          </Description>
        </SectionHeader>

        <TokenGrid>
          <TokenomicsCard padding="large">
            <TokenomicsTitle>Tokenomics</TokenomicsTitle>
            <TokenomicsGrid>
              {tokenomics.map((item, index) => (
                <TokenomicsItem key={index}>
                  <TokenomicsValue>{item.value}</TokenomicsValue>
                  <TokenomicsLabel>{item.label}</TokenomicsLabel>
                </TokenomicsItem>
              ))}
            </TokenomicsGrid>

            <ChartContainer>
              <CircleChart />
            </ChartContainer>

            <ChartLegend>
              {distribution.map((item, index) => (
                <LegendItem key={index}>
                  <LegendColor color={item.color} />
                  {item.label} - {item.value}
                </LegendItem>
              ))}
            </ChartLegend>

            <Button variant="secondary" size="large" fullWidth style={{ marginTop: '2rem' }}>
              Voir le Smart Contract
            </Button>
          </TokenomicsCard>

          <UtilityList>
            {utilities.map((utility, index) => (
              <UtilityItem key={index}>
                <UtilityIcon>
                  {utility.icon}
                </UtilityIcon>
                <UtilityContent>
                  <UtilityTitle>{utility.title}</UtilityTitle>
                  <UtilityDescription>{utility.description}</UtilityDescription>
                </UtilityContent>
              </UtilityItem>
            ))}
          </UtilityList>
        </TokenGrid>
      </Content>
    </SectionContainer>
  );
};
