import React from "react";
import styled from "styled-components";
import { Container, Grid } from "@mui/material";
import { motion } from "framer-motion";
import TokenChart from "../common/TokenChart";
import { ForgeHeading } from "../common/ForgeHeading";
import { ParallaxContainer } from "../common/ParallaxContainer";
import { ForgeCard } from "../common/ForgeCard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import TimelineIcon from "@mui/icons-material/Timeline";

const SectionContainer = styled.section`
  padding: 6rem 0;
  background: ${(props) => props.theme.colors.background.paper};
  position: relative;
  overflow: hidden;
`;

const HeaderContainer = styled.div`
  text-align: center;
  margin-bottom: 4rem;
`;

const Subtitle = styled.p`
  color: ${(props) => props.theme.colors.text.secondary};
  font-size: 1.25rem;
  max-width: 600px;
  margin: 1.5rem auto 0;
  line-height: 1.6;
`;

const StatCard = styled(ForgeCard)`
  text-align: center;
  padding: 1.5rem;
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: ${(props) => props.theme.colors.gradient.primary};
  color: ${(props) => props.theme.colors.text.light};
`;

const StatValue = styled.div`
  font-family: ${(props) => props.theme.typography.fontFamily.heading};
  font-size: 1.75rem;
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  color: ${(props) => props.theme.colors.primary.main};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: ${(props) => props.theme.colors.text.secondary};
  font-size: 1rem;
`;

const tokenDistributionData = [
  { name: "Vente Publique", value: 40, color: "#3B82F6" },
  { name: "Équipe", value: 20, color: "#10B981" },
  { name: "Réserve", value: 15, color: "#F59E0B" },
  { name: "Marketing", value: 15, color: "#8B5CF6" },
  { name: "Conseillers", value: 10, color: "#EC4899" },
];

const vestingScheduleData = [
  { name: "Débloqué au TGE", value: 20, color: "#3B82F6" },
  { name: "3 mois", value: 20, color: "#10B981" },
  { name: "6 mois", value: 30, color: "#F59E0B" },
  { name: "12 mois", value: 30, color: "#8B5CF6" },
];

const stats = [
  {
    icon: <AccountBalanceWalletIcon />,
    value: "100M",
    label: "Supply Total",
  },
  {
    icon: <LocalAtmIcon />,
    value: "0.1 ETH",
    label: "Prix Initial",
  },
  {
    icon: <TimelineIcon />,
    value: "4 Ans",
    label: "Période de Vesting",
  },
];

export const TokenEconomicsSection: React.FC = () => {
  return (
    <SectionContainer>
      <Container maxWidth="lg">
        <HeaderContainer>
          <ParallaxContainer speed={0.2}>
            <ForgeHeading level={2} $hasGradient $align="center">
              Tokenomics $TKN
            </ForgeHeading>
            <Subtitle>
              Une distribution équilibrée et un vesting transparent pour assurer
              la stabilité et la croissance à long terme du projet.
            </Subtitle>
          </ParallaxContainer>
        </HeaderContainer>

        <Grid container spacing={4} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} md={4} key={index}>
              <ParallaxContainer speed={0.3}>
                <StatCard>
                  <IconWrapper>{stat.icon}</IconWrapper>
                  <StatValue>{stat.value}</StatValue>
                  <StatLabel>{stat.label}</StatLabel>
                </StatCard>
              </ParallaxContainer>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <ParallaxContainer speed={0.4}>
              <TokenChart
                data={tokenDistributionData}
                title="Distribution des Tokens"
                type="donut"
              />
            </ParallaxContainer>
          </Grid>
          <Grid item xs={12} md={6}>
            <ParallaxContainer speed={0.5}>
              <TokenChart
                data={vestingScheduleData}
                title="Calendrier de Vesting"
                type="pie"
              />
            </ParallaxContainer>
          </Grid>
        </Grid>
      </Container>
    </SectionContainer>
  );
};
