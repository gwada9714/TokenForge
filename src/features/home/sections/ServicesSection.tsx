import React from "react";
import styled from "styled-components";
import { Container, Typography, Grid, Button, Box } from "@mui/material";
import { motion } from "framer-motion";
import LaunchpadIcon from "@mui/icons-material/Rocket";
import StakingIcon from "@mui/icons-material/AccountBalance";
import MarketingIcon from "@mui/icons-material/Campaign";
import KYCIcon from "@mui/icons-material/VerifiedUser";

const SectionContainer = styled.section`
  padding: 6rem 0;
  background: ${(props) => props.theme.colors.background.default};
  position: relative;
  overflow: hidden;
`;

const Content = styled(Container)`
  position: relative;
  z-index: 2;
`;

const Title = styled(Typography)`
  text-align: center;
  font-family: "Montserrat", sans-serif;
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: ${(props) => props.theme.colors.text.primary};
`;

const Subtitle = styled(Typography)`
  text-align: center;
  max-width: 800px;
  margin: 0 auto 3rem;
  color: ${(props) => props.theme.colors.text.secondary};
`;

const ServiceCard = styled(motion.div)`
  padding: 2rem;
  background: ${(props) => props.theme.colors.background.paper};
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  height: 100%;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const IconWrapper = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${(props) => props.theme.colors.primary.main}20;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;

  svg {
    font-size: 30px;
    color: ${(props) => props.theme.colors.primary.main};
  }
`;

const ServiceTitle = styled(Typography)`
  font-family: "Montserrat", sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: ${(props) => props.theme.colors.text.primary};
`;

const ServiceDescription = styled(Typography)`
  color: ${(props) => props.theme.colors.text.secondary};
  margin-bottom: 1.5rem;
  line-height: 1.6;
`;

const services = [
  {
    icon: <LaunchpadIcon />,
    title: "Création de Launchpad (IDO)",
    description:
      "Lancez votre IDO avec des options avancées (différents types d'enchères, intégration de vesting) et des modèles préconfigurés.",
  },
  {
    icon: <StakingIcon />,
    title: "Plateforme de Staking",
    description:
      "Mettez en place une plateforme de staking pour votre token (staking flexible, staking à durée déterminée avec différents APY, récompenses configurables).",
  },
  {
    icon: <MarketingIcon />,
    title: "Assistance Marketing et Listing",
    description:
      "Bénéficiez de notre réseau de partenaires (influenceurs, plateformes d'échange) pour promouvoir votre token.",
  },
  {
    icon: <KYCIcon />,
    title: "KYC (Know Your Customer)",
    description:
      "Renforcez la confiance des investisseurs avec un processus KYC fiable. Bénéficiez d'une réduction sur les autres services.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export const ServicesSection: React.FC = () => {
  return (
    <SectionContainer>
      <Content maxWidth="lg">
        <Title variant="h2">
          Forgez un Écosystème Complet avec nos Services à la Carte
        </Title>
        <Subtitle variant="body1">
          Des services professionnels pour maximiser le succès de votre projet
        </Subtitle>

        <Grid container spacing={4}>
          {services.map((service, index) => (
            <Grid item xs={12} md={6} lg={3} key={index}>
              <ServiceCard
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
              >
                <IconWrapper>{service.icon}</IconWrapper>
                <ServiceTitle variant="h3">{service.title}</ServiceTitle>
                <ServiceDescription>{service.description}</ServiceDescription>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  size="large"
                >
                  En savoir plus
                </Button>
              </ServiceCard>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: "center", mt: 6 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              bgcolor: "#2980B9",
              "&:hover": {
                bgcolor: "#2472A4",
              },
            }}
          >
            Découvrir les Services
          </Button>
        </Box>
      </Content>
    </SectionContainer>
  );
};
