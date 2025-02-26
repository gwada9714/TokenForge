import React from 'react';
import styled from 'styled-components';
import { Container, Typography, Grid, Button } from '@mui/material';
import { motion } from 'framer-motion';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

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
  max-width: 600px;
  margin: 0 auto 3rem;
  color: ${props => props.theme.colors.text.secondary};
`;

const PricingCard = styled(motion.div)<{ $featured?: boolean }>`
  padding: 2rem;
  background: ${props => props.$featured ? 
    'linear-gradient(135deg, #182038 0%, #2A3352 100%)' : 
    props.theme.colors.background.default};
  border-radius: 1rem;
  box-shadow: ${props => props.$featured ? 
    '0 8px 32px rgba(0, 0, 0, 0.2)' : 
    '0 4px 20px rgba(0, 0, 0, 0.1)'};
  height: 100%;
  position: relative;
  overflow: hidden;
  
  ${props => props.$featured && `
    &:before {
      content: 'Recommandé';
      position: absolute;
      top: 1rem;
      right: -2rem;
      background: ${props.theme.colors.primary.main};
      color: white;
      padding: 0.5rem 3rem;
      transform: rotate(45deg);
      font-size: 0.875rem;
    }
  `}
`;

const PlanName = styled(Typography)<{ $featured?: boolean }>`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: ${props => props.$featured ? 'white' : props.theme.colors.text.primary};
`;

const Price = styled(Typography)<{ $featured?: boolean }>`
  font-family: 'Montserrat', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: ${props => props.$featured ? 'white' : props.theme.colors.text.primary};
  
  span {
    font-size: 1rem;
    opacity: 0.7;
  }
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 2rem;
`;

const FeatureItem = styled.li<{ $featured?: boolean }>`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  color: ${props => props.$featured ? 'white' : props.theme.colors.text.primary};
  
  svg {
    margin-right: 0.5rem;
    color: ${props => props.$featured ? 
      props.theme.colors.primary.main : 
      props.theme.colors.success.main};
  }
  
  &.unavailable {
    opacity: 0.5;
    svg {
      color: ${props => props.theme.colors.error.main};
    }
  }
`;

const plans = [
  {
    name: "Apprenti Forgeron",
    price: "Gratuit",
    features: [
      { text: "Création sur Testnet uniquement", available: true },
      { text: "Fonctionnalités très limitées", available: true },
      { text: "Pas de taxe", available: true },
      { text: "Support communautaire", available: true },
      { text: "Accès au Mainnet", available: false },
      { text: "Options avancées", available: false }
    ]
  },
  {
    name: "Forgeron",
    price: "0.2 BNB",
    featured: true,
    features: [
      { text: "Création sur Mainnet", available: true },
      { text: "Fonctionnalités complètes", available: true },
      { text: "Taxe de base 0.5%", available: true },
      { text: "Taxe additionnelle configurable", available: true },
      { text: "Support standard", available: true },
      { text: "Multi-chain", available: true }
    ]
  },
  {
    name: "Maître Forgeron",
    price: "0.5 BNB",
    features: [
      { text: "Tous les avantages Forgeron", available: true },
      { text: "Support prioritaire", available: true },
      { text: "Accès anticipé nouveautés", available: true },
      { text: "Priorité ajout blockchains", available: true },
      { text: "Réduction services à la carte", available: true },
      { text: "Badge vérifié", available: true }
    ]
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

export const PricingSection: React.FC = () => {
  return (
    <SectionContainer>
      <Content maxWidth="lg">
        <Title variant="h2">
          Choisissez Votre Voie de Forgeron
        </Title>
        <Subtitle variant="body1">
          Des options flexibles pour tous les projets. Payez en $TKN et bénéficiez de réductions significatives.
        </Subtitle>

        <Grid container spacing={4}>
          {plans.map((plan, index) => (
            <Grid item xs={12} md={4} key={index}>
              <PricingCard
                $featured={plan.featured}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
              >
                <PlanName $featured={plan.featured} variant="h3">
                  {plan.name}
                </PlanName>
                <Price $featured={plan.featured}>
                  {plan.price}
                  <span> en $TKN</span>
                </Price>
                <FeatureList>
                  {plan.features.map((feature, idx) => (
                    <FeatureItem 
                      key={idx}
                      $featured={plan.featured}
                      className={!feature.available ? 'unavailable' : ''}
                    >
                      {feature.available ? <CheckIcon /> : <CloseIcon />}
                      {feature.text}
                    </FeatureItem>
                  ))}
                </FeatureList>
                <Button
                  variant={plan.featured ? "contained" : "outlined"}
                  color="primary"
                  fullWidth
                  size="large"
                  sx={{
                    py: 1.5,
                    color: plan.featured ? 'white' : undefined
                  }}
                >
                  Choisir ce Plan
                </Button>
              </PricingCard>
            </Grid>
          ))}
        </Grid>

        <Typography 
          variant="body2" 
          align="center" 
          sx={{ mt: 4, opacity: 0.7 }}
        >
          * Tous les prix sont payables en $TKN pour bénéficier d'une réduction significative.
          La taxe additionnelle est configurable par le créateur du token et lui revient intégralement.
        </Typography>
      </Content>
    </SectionContainer>
  );
}; 