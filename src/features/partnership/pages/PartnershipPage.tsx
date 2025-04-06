import React from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
} from "@mui/material";
import { motion } from "framer-motion";
import { styled } from "@mui/material/styles";
import HandshakeIcon from "@mui/icons-material/Handshake";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import GroupIcon from "@mui/icons-material/Group";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const StyledSection = styled("section")(({ theme: muiTheme }) => ({
  padding: muiTheme.spacing(8, 0),
  backgroundColor: muiTheme.palette.background.default,
}));

const StyledCard = styled(Card)(() => ({
  height: "100%",
  textAlign: "center",
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-8px)",
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  marginBottom: theme.spacing(2),
  "& > svg": {
    fontSize: 48,
    color: theme.palette.primary.main,
  },
}));

interface Benefit {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const benefits: Benefit[] = [
  {
    icon: <HandshakeIcon />,
    title: "Collaboration Stratégique",
    description:
      "Accédez à notre réseau d&apos;experts et bénéficiez de conseils personnalisés pour votre projet.",
  },
  {
    icon: <MonetizationOnIcon />,
    title: "Avantages Financiers",
    description:
      "Profitez de réductions exclusives sur nos services et de commissions préférentielles.",
  },
  {
    icon: <GroupIcon />,
    title: "Communauté Privilégiée",
    description:
      "Rejoignez une communauté dynamique de professionnels et d&apos;entrepreneurs de la blockchain.",
  },
  {
    icon: <TrendingUpIcon />,
    title: "Croissance Accélérée",
    description:
      "Bénéficiez de notre expertise marketing et de notre support pour développer votre projet.",
  },
];

// Uncomment when needed
// const tiers = [
//   {
//     title: "Partenaire Standard",
//     price: "Gratuit",
//     features: [
//       "API de base",
//       "Support communautaire",
//       "5% de commission sur les revenus",
//       "Logo sur notre site"
//     ]
//   },
//   {
//     title: "Partenaire Premium",
//     price: "500 $TKN/mois",
//     features: [
//       "API complète",
//       "Support dédié",
//       "15% de commission sur les revenus",
//       "Logo mis en avant",
//       "Accès anticipé aux nouvelles fonctionnalités"
//     ]
//   },
//   {
//     title: "Partenaire Enterprise",
//     price: "Sur mesure",
//     features: [
//       "API personnalisée",
//       "Support prioritaire 24/7",
//       "Commission négociable",
//       "Co-marketing",
//       "Intégration personnalisée",
//       "Formation dédiée"
//     ]
//   }
// ];

const PartnershipPage: React.FC = () => {
  return (
    <StyledSection>
      <Container maxWidth="lg">
        <Box mb={8} textAlign="center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h2" component="h1" gutterBottom>
              Programme de Partenariat
            </Typography>
            <Typography variant="h5" color="textSecondary" paragraph>
              Rejoignez TokenForge et développez votre activité dans
              l&apos;écosystème blockchain
            </Typography>
            <Button
              variant="contained"
              size="large"
              color="primary"
              sx={{ mt: 2 }}
              href="mailto:partnership@tokenforge.com"
            >
              Devenir Partenaire
            </Button>
          </motion.div>
        </Box>

        <Grid container spacing={4}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <StyledCard>
                  <CardContent>
                    <IconWrapper>{benefit.icon}</IconWrapper>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {benefit.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {benefit.description}
                    </Typography>
                  </CardContent>
                </StyledCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Box mt={8} textAlign="center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Typography variant="h4" component="h2" gutterBottom>
              Pourquoi devenir partenaire ?
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              En tant que partenaire TokenForge, vous bénéficiez d&apos;un accès
              privilégié à notre technologie, notre expertise et notre réseau.
              Nous vous accompagnons dans le développement de votre activité et
              vous offrons des conditions préférentielles sur l&apos;ensemble de
              nos services.
            </Typography>
            <Button
              variant="outlined"
              size="large"
              color="primary"
              sx={{ mt: 2 }}
              href="/docs/partnership"
            >
              En savoir plus
            </Button>
          </motion.div>
        </Box>
      </Container>
    </StyledSection>
  );
};

export default PartnershipPage;
