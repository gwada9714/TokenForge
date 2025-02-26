import React, { useState } from 'react';
import styled from 'styled-components';
import { Container, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { motion } from 'framer-motion';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const SectionContainer = styled.section`
  padding: 6rem 0;
  background: ${props => props.theme.colors.background.paper};
  position: relative;
  overflow: hidden;
`;

const Content = styled(Container)`
  position: relative;
  z-index: 2;
`;

const Title = styled(Typography)`
  text-align: center;
  font-family: 'Montserrat', sans-serif;
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: ${props => props.theme.colors.text.primary};
`;

const Subtitle = styled(Typography)`
  text-align: center;
  max-width: 800px;
  margin: 0 auto 4rem;
  color: ${props => props.theme.colors.text.secondary};
`;

const StyledAccordion = styled(Accordion)`
  background: ${props => props.theme.colors.background.default} !important;
  border-radius: 0.5rem !important;
  margin-bottom: 1rem !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;

  &::before {
    display: none;
  }

  &.Mui-expanded {
    margin-bottom: 1rem !important;
  }
`;

const StyledAccordionSummary = styled(AccordionSummary)`
  padding: 1rem 1.5rem;

  .MuiAccordionSummary-content {
    margin: 0;
  }

  .MuiAccordionSummary-expandIconWrapper {
    color: ${props => props.theme.colors.primary.main};
  }
`;

const QuestionText = styled(Typography)`
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const AnswerText = styled(Typography)`
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.6;
`;

const Warning = styled(Typography)`
  color: ${props => props.theme.colors.error.main};
  font-weight: 500;
  margin-top: 1rem;
`;

const faqs = [
  {
    question: "Comment fonctionne la création de token sur TokenForge ?",
    answer: "TokenForge vous permet de créer votre token en quelques étapes simples. Choisissez vos paramètres (nom, symbole, supply, etc.), configurez les options avancées si nécessaire, et déployez votre token. Notre interface intuitive vous guide tout au long du processus."
  },
  {
    question: "Quels sont les frais de création ?",
    answer: "Les frais de base sont de 0.5% + une taxe additionnelle configurable jusqu'à 1.5% qui revient au créateur. En payant en $TKN, vous bénéficiez de réductions significatives. Les frais exacts dépendent du plan choisi et du montant de $TKN détenus."
  },
  {
    question: "Le code est-il audité ?",
    answer: "Actuellement, le code n'est pas audité formellement. Bien que nous ayons mis en place des mesures de sécurité maximales et que notre code soit open-source, nous recommandons aux utilisateurs de procéder avec prudence.",
    warning: "AVERTISSEMENT : L'absence d'audit formel implique des risques potentiels. Investissez de manière responsable."
  },
  {
    question: "Quelles blockchains sont supportées ?",
    answer: "Nous supportons actuellement Ethereum, BSC, Polygon et Avalanche. D'autres chaînes seront ajoutées selon la roadmap et les demandes de la communauté. Les utilisateurs Maître Forgeron ont la priorité pour les nouvelles intégrations."
  },
  {
    question: "Comment fonctionne le staking de $TKN ?",
    answer: "Le staking de $TKN vous permet de gagner des récompenses passives. Les APY varient selon la durée de staking et le montant total staké. Plus vous stakez longtemps, plus les récompenses sont importantes."
  },
  {
    question: "Y a-t-il une protection anti-whale ?",
    answer: "La protection anti-whale a été supprimée pour offrir plus de flexibilité aux créateurs. Nous recommandons aux investisseurs d'être vigilants et de bien étudier la tokenomics de chaque projet.",
    warning: "AVERTISSEMENT : L'absence de protection anti-whale peut entraîner des risques de manipulation de marché."
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

export const FAQSection: React.FC = () => {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <SectionContainer>
      <Content maxWidth="lg">
        <Title variant="h2">
          Questions Fréquentes
        </Title>
        <Subtitle variant="body1">
          Tout ce que vous devez savoir sur TokenForge et la création de tokens
        </Subtitle>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {faqs.map((faq, index) => (
            <motion.div key={index} variants={itemVariants}>
              <StyledAccordion
                expanded={expanded === `panel${index}`}
                onChange={handleChange(`panel${index}`)}
              >
                <StyledAccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                >
                  <QuestionText>
                    {faq.question}
                  </QuestionText>
                </StyledAccordionSummary>
                <AccordionDetails>
                  <AnswerText>
                    {faq.answer}
                  </AnswerText>
                  {faq.warning && (
                    <Warning>
                      {faq.warning}
                    </Warning>
                  )}
                </AccordionDetails>
              </StyledAccordion>
            </motion.div>
          ))}
        </motion.div>
      </Content>
    </SectionContainer>
  );
}; 