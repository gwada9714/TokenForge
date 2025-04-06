import React from "react";
import {
  Box,
  Typography,
  Container,
  Button,
  Stack,
  Grid,
  useTheme,
  SvgIcon,
} from "@mui/material";
import { Link } from "react-router-dom";

const Home = () => {
  const theme = useTheme();

  return (
    <Box>
      {/* Hero Section */}
      <Container maxWidth="lg">
        <Stack component={Box} textAlign="center" spacing={4} py={8}>
          <Typography variant="h2" component="h1" gutterBottom>
            TokenForge :{" "}
            <Typography
              variant="h2"
              component="span"
              sx={{
                background: "linear-gradient(to right, orange, red)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Forgez votre Avenir Crypto
            </Typography>
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            Créez des tokens personnalisés en quelques clics. Notre plateforme
            combine puissance et simplicité pour vous permettre de forger des
            tokens sur mesure, en toute sécurité.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              component={Link}
              to="/tokens/create"
              variant="contained"
              color="primary"
              size="large"
            >
              Commencer à Forger
            </Button>
            <Button
              component={Link}
              to="/learn"
              variant="outlined"
              color="primary"
              size="large"
            >
              En savoir plus
            </Button>
          </Stack>
        </Stack>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          <Feature
            title="Sécurité Renforcée"
            text="Audits de sécurité et verrouillage de liquidité intégré pour protéger votre projet."
            icon={<SecurityIcon />}
          />
          <Feature
            title="Personnalisation Totale"
            text="Configurez chaque aspect de votre token selon vos besoins spécifiques."
            icon={<CustomizationIcon />}
          />
          <Feature
            title="Support Multi-Chain"
            text="Déployez vos tokens sur les principales blockchains en un clic."
            icon={<MultiChainIcon />}
          />
        </Grid>
      </Container>
    </Box>
  );
};

interface FeatureProps {
  title: string;
  text: string;
  icon: React.ReactElement;
}

function Feature({ title, text, icon }: FeatureProps) {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Stack spacing={2} textAlign="center">
        {React.cloneElement(icon, { sx: { fontSize: 40 } })}
        <Typography variant="h6">{title}</Typography>
        <Typography color="text.secondary">{text}</Typography>
      </Stack>
    </Grid>
  );
}

const SecurityIcon = (props: any) => (
  <SvgIcon {...props}>
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6c1.4 0 2.8 1.1 2.8 2.5V11c.6 0 1.2.6 1.2 1.2v3.5c0 .7-.6 1.3-1.2 1.3H9.2c-.7 0-1.2-.6-1.2-1.2v-3.5c0-.7.6-1.2 1.2-1.2V9.5C9.2 8.1 10.6 7 12 7zm0 1c-.8 0-1.5.7-1.5 1.5V11h3V9.5c0-.8-.7-1.5-1.5-1.5z" />
  </SvgIcon>
);

const CustomizationIcon = (props: any) => (
  <SvgIcon {...props}>
    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
  </SvgIcon>
);

const MultiChainIcon = (props: any) => (
  <SvgIcon {...props}>
    <path d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z" />
  </SvgIcon>
);

export default Home;
