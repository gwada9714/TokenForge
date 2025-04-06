import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Button, Box } from "@mui/material";
import { RealTimeMetrics } from "@/components/features/analytics/RealTimeMetrics";

const HeroContainer = styled.section`
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: linear-gradient(135deg, #182038 0%, #2a3352 100%);
`;

const BackgroundPattern = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("/assets/images/forge-pattern.svg") repeat;
  opacity: 0.05;
  z-index: 1;
`;

const GlowEffect = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 60vw;
  height: 60vw;
  background: radial-gradient(circle, #d97706 0%, transparent 70%);
  transform: translate(-50%, -50%);
  opacity: 0.1;
  filter: blur(100px);
  z-index: 1;
`;

const Content = styled(Container)`
  position: relative;
  z-index: 2;
  text-align: center;
  color: #ffffff;
`;

const Title = styled(Typography)`
  font-family: "Montserrat", sans-serif;
  font-size: 4rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }

  span {
    background: linear-gradient(135deg, #d97706, #ffd700);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const Subtitle = styled(Typography)`
  font-size: 1.25rem;
  max-width: 600px;
  margin: 0 auto 2rem;
  opacity: 0.9;
`;

const ButtonGroup = styled(Box)`
  display: flex;
  gap: 1rem;
  justify-content: center;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
  }
`;

const StatsContainer = styled(Box)`
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-top: 3rem;

  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <HeroContainer>
      <BackgroundPattern />
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Title variant="h1">
            Forge Your <span>Crypto Future</span>
          </Title>

          <Subtitle variant="h5">La Forge de Tokens Accessible à Tous</Subtitle>

          <ButtonGroup>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate("/create")}
              sx={{
                bgcolor: "#FF8C00",
                "&:hover": {
                  bgcolor: "#E67E00",
                },
                px: 4,
                py: 1.5,
                borderRadius: 2,
              }}
            >
              Créer Mon Token
            </Button>

            <Button
              variant="outlined"
              size="large"
              sx={{
                color: "white",
                borderColor: "white",
                "&:hover": {
                  borderColor: "#FF8C00",
                  color: "#FF8C00",
                },
                px: 4,
                py: 1.5,
                borderRadius: 2,
              }}
              onClick={() => navigate("/learn")}
            >
              En savoir plus
            </Button>
          </ButtonGroup>

          <StatsContainer>
            <RealTimeMetrics />
          </StatsContainer>
        </motion.div>
      </Content>
    </HeroContainer>
  );
};
