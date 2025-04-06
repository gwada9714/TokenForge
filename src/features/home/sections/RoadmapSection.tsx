import React from "react";
import styled from "styled-components";
import { Container, Typography, Box } from "@mui/material";
import { motion } from "framer-motion";
import TimelineIcon from "@mui/icons-material/Timeline";

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
  margin: 0 auto 4rem;
  color: ${(props) => props.theme.colors.text.secondary};
`;

const TimelineContainer = styled.div`
  position: relative;
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 0;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 2px;
    height: 100%;
    background: ${(props) => props.theme.colors.primary.main}40;
  }

  @media (max-width: 768px) {
    &::before {
      left: 2rem;
    }
  }
`;

const TimelineItem = styled(motion.div)<{ $isRight?: boolean }>`
  display: flex;
  justify-content: ${(props) => (props.$isRight ? "flex-end" : "flex-start")};
  padding-left: ${(props) => (props.$isRight ? "0" : "50%")};
  padding-right: ${(props) => (props.$isRight ? "50%" : "0")};
  margin-bottom: 4rem;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    width: 20px;
    height: 20px;
    background: ${(props) => props.theme.colors.primary.main};
    border-radius: 50%;
    left: 50%;
    transform: translateX(-50%);
    top: 0;
  }

  @media (max-width: 768px) {
    padding-left: 4rem !important;
    padding-right: 0 !important;
    justify-content: flex-start !important;

    &::before {
      left: 2rem;
    }
  }
`;

const TimelineContent = styled(Box)`
  background: ${(props) => props.theme.colors.background.paper};
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 80%;
  max-width: 500px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Phase = styled(Typography)`
  font-family: "Montserrat", sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: ${(props) => props.theme.colors.primary.main};
`;

const DateRange = styled(Typography)`
  font-size: 0.875rem;
  color: ${(props) => props.theme.colors.text.secondary};
  margin-bottom: 1rem;
`;

const Milestones = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    margin-bottom: 0.5rem;
    color: ${(props) => props.theme.colors.text.primary};
    display: flex;
    align-items: center;

    &::before {
      content: "•";
      color: ${(props) => props.theme.colors.primary.main};
      font-weight: bold;
      margin-right: 0.5rem;
    }
  }
`;

const phases = [
  {
    phase: "Phase 1",
    date: "Q4 2023 - Q1 2024",
    milestones: [
      "Développement du MVP",
      "Lancement du Token $TKN (IDO)",
      "Mise en place du support et de la communauté",
    ],
  },
  {
    phase: "Phase 2",
    date: "Q2 - Q3 2024",
    milestones: [
      "Déploiement des options Forgeron et Maître Forgeron",
      "Intégration complète de la Taxe de la Forge",
      "Développement des services à la carte",
    ],
  },
  {
    phase: "Phase 3",
    date: "Q4 2024 - Q1 2025",
    milestones: [
      "Expansion multi-chain",
      "Lancement du programme de partenariat API",
      "Développement de la gouvernance du fonds de développement",
    ],
  },
];

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export const RoadmapSection: React.FC = () => {
  return (
    <SectionContainer>
      <Content maxWidth="lg">
        <Title variant="h2">Feuille de Route : L'Avenir de TokenForge</Title>
        <Subtitle variant="body1">
          Notre vision pour l'évolution de TokenForge, avec des objectifs clairs
          et des étapes définies.
        </Subtitle>

        <TimelineContainer>
          {phases.map((phase, index) => (
            <TimelineItem
              key={index}
              $isRight={index % 2 === 1}
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              <TimelineContent>
                <Phase variant="h3">{phase.phase}</Phase>
                <DateRange variant="subtitle2">{phase.date}</DateRange>
                <Milestones>
                  {phase.milestones.map((milestone, idx) => (
                    <li key={idx}>{milestone}</li>
                  ))}
                </Milestones>
              </TimelineContent>
            </TimelineItem>
          ))}
        </TimelineContainer>

        <Typography
          variant="body2"
          align="center"
          sx={{
            mt: 4,
            color: "text.secondary",
            fontStyle: "italic",
          }}
        >
          * Cette feuille de route est susceptible d'évoluer en fonction des
          conditions du marché et des retours de la communauté.
        </Typography>
      </Content>
    </SectionContainer>
  );
};
