import React from 'react';
import styled from 'styled-components';
import { Container, Typography, Grid, Button, Box } from '@mui/material';
import { motion } from 'framer-motion';
import CodeIcon from '@mui/icons-material/Code';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SupportIcon from '@mui/icons-material/Support';
import VisibilityIcon from '@mui/icons-material/Visibility';

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
  margin: 0 auto 3rem;
  color: ${props => props.theme.colors.text.secondary};
`;

const PartnerCard = styled(motion.div)`
  padding: 2rem;
  background: ${props => props.theme.colors.background.default};
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const IconWrapper = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary.main}20;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;

  svg {
    font-size: 30px;
    color: ${props => props.theme.colors.primary.main};
  }
`;

const BenefitTitle = styled(Typography)`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: ${props => props.theme.colors.text.primary};
`;

const BenefitDescription = styled(Typography)`
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.6;
  flex-grow: 1;
  margin-bottom: 1.5rem;
`;

const APISection = styled(Box)`
  margin-top: 4rem;
  padding: 3rem;
  background: linear-gradient(135deg, #182038 0%, #2A3352 100%);
  border-radius: 1rem;
  color: white;
  text-align: center;
`;

const benefits = [
  {
    icon: <MonetizationOnIcon />,
    title: "Revenus Partagés",
    description: "Bénéficiez d'un modèle de partage de revenus attractif basé sur le volume de tokens créés via votre intégration."
  },
  {
    icon: <CodeIcon />,
    title: "API Robuste",
    description: "Accédez à notre API complète et documentée pour intégrer la création de tokens dans votre plateforme."
  },
  {
    icon: <SupportIcon />,
    title: "Support Technique Dédié",
    description: "Profitez d'un support technique prioritaire et d'une assistance pour l'intégration."
  },
  {
    icon: <VisibilityIcon />,
    title: "Visibilité Accrue",
    description: "Gagnez en visibilité grâce à notre programme de partenariat et nos canaux de communication."
  }
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

export const PartnershipSection: React.FC = () => {
  return (
    <SectionContainer>
      <Content maxWidth="lg">
        <Title variant="h2">
          Programme de Partenariat : Intégrez la Puissance de TokenForge
        </Title>
        <Subtitle variant="body1">
          Vous êtes un développeur ou une plateforme DeFi ? Rejoignez notre programme de partenariat 
          et bénéficiez d'avantages exclusifs.
        </Subtitle>

        <Grid container spacing={4}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} md={6} lg={3} key={index}>
              <PartnerCard
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
              >
                <IconWrapper>
                  {benefit.icon}
                </IconWrapper>
                <BenefitTitle variant="h3">
                  {benefit.title}
                </BenefitTitle>
                <BenefitDescription>
                  {benefit.description}
                </BenefitDescription>
              </PartnerCard>
            </Grid>
          ))}
        </Grid>

        <APISection>
          <Typography variant="h4" gutterBottom>
            API TokenForge
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, maxWidth: '800px', mx: 'auto' }}>
            Notre API permet une intégration simple et rapide de la création de tokens dans votre application.
            Documentation complète, environnement de test et exemples de code fournis.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              bgcolor: '#8E44AD',
              '&:hover': {
                bgcolor: '#703688'
              }
            }}
          >
            Devenir Partenaire
          </Button>
        </APISection>
      </Content>
    </SectionContainer>
  );
}; 