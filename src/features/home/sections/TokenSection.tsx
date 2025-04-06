import React from "react";
import styled from "styled-components";
import { Container, Typography, Grid, Button, Box } from "@mui/material";
import { motion } from "framer-motion";
import TokenIcon from "@mui/icons-material/Token";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import StarIcon from "@mui/icons-material/Star";

const SectionContainer = styled.section`
  padding: 6rem 0;
  background: linear-gradient(135deg, #182038 0%, #2a3352 100%);
  position: relative;
  overflow: hidden;
  color: white;
`;

const GlowEffect = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 60vw;
  height: 60vw;
  background: radial-gradient(
    circle,
    ${(props) => props.theme.colors.primary.main} 0%,
    transparent 70%
  );
  transform: translate(-50%, -50%);
  opacity: 0.1;
  filter: blur(100px);
  z-index: 1;
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

  span {
    background: linear-gradient(
      135deg,
      ${(props) => props.theme.colors.primary.main},
      #ffd700
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const Subtitle = styled(Typography)`
  text-align: center;
  max-width: 800px;
  margin: 0 auto 3rem;
  opacity: 0.9;
`;

const TokenCard = styled(motion.div)`
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  height: 100%;
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

const FeatureTitle = styled(Typography)`
  font-family: "Montserrat", sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const FeatureDescription = styled(Typography)`
  opacity: 0.8;
  line-height: 1.6;
`;

const StakingInfo = styled(Box)`
  margin-top: 4rem;
  text-align: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const features = [
  {
    icon: <LocalGasStationIcon />,
    title: "Réduction sur les Frais",
    description:
      "Payez les frais de création avec des réductions progressives selon le montant détenu ou le volume de transactions.",
  },
  {
    icon: <AccountBalanceIcon />,
    title: "Staking Récompensé",
    description:
      "Stakez vos $TKN pour des récompenses passives. Interface intuitive et statistiques claires sur les récompenses.",
  },
  {
    icon: <StarIcon />,
    title: "Avantages Premium",
    description:
      "Accédez à des fonctionnalités exclusives et bénéficiez de réductions sur les services à la carte.",
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

export const TokenSection: React.FC = () => {
  return (
    <SectionContainer>
      <GlowEffect
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      <Content maxWidth="lg">
        <Title variant="h2">
          <span>$TKN</span> : Le Cœur Battant de TokenForge
        </Title>
        <Subtitle variant="body1">
          Découvrez le $TKN, le carburant de l'écosystème TokenForge. Un token
          utilitaire qui vous offre des avantages exclusifs.
        </Subtitle>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <TokenCard
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
              >
                <IconWrapper>{feature.icon}</IconWrapper>
                <FeatureTitle variant="h3">{feature.title}</FeatureTitle>
                <FeatureDescription>{feature.description}</FeatureDescription>
              </TokenCard>
            </Grid>
          ))}
        </Grid>

        <StakingInfo>
          <Typography variant="h4" gutterBottom>
            Staking $TKN
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Plus vous stakez longtemps, plus vos récompenses sont importantes.
            APY variable selon la durée de staking et le montant total staké.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              bgcolor: "#FF8C00",
              "&:hover": {
                bgcolor: "#E67E00",
              },
            }}
          >
            En Savoir Plus sur le $TKN
          </Button>
        </StakingInfo>
      </Content>
    </SectionContainer>
  );
};
