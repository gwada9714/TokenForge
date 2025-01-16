import React from 'react';
import { Container, Typography, Grid, Card, CardContent, CardActions, Button, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const plans = [
  {
    title: 'Apprenti Forgeron',
    price: '0.05 ETH',
    features: [
      'Création de token ERC20 basique',
      'Support communautaire',
      'Documentation détaillée',
      'Déploiement sur testnet'
    ],
    buttonText: 'Commencer',
    buttonVariant: 'outlined'
  },
  {
    title: 'Forgeron',
    price: '0.15 ETH',
    features: [
      'Toutes les fonctionnalités Apprenti',
      'Fonctions avancées (Mint, Burn, Pause)',
      'Verrouillage de liquidité',
      'Support prioritaire',
      'Audit de sécurité basique'
    ],
    buttonText: 'Choisir',
    buttonVariant: 'contained',
    highlighted: true
  },
  {
    title: 'Maître Forgeron',
    price: '0.3 ETH',
    features: [
      'Toutes les fonctionnalités Forgeron',
      'Tokenomics personnalisée',
      'Audit de sécurité complet',
      'Support dédié 24/7',
      'Listing sur DEX automatisé',
      'Marketing package'
    ],
    buttonText: 'Contacter',
    buttonVariant: 'outlined'
  }
];

const Pricing: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography
        variant="h4"
        component="h1"
        align="center"
        gutterBottom
        className="font-heading font-bold text-primary-main"
      >
        Plans & Tarifs
      </Typography>
      
      <Typography
        variant="subtitle1"
        align="center"
        color="text.secondary"
        component="p"
        sx={{ mb: 6 }}
      >
        Choisissez le plan qui correspond à vos besoins
      </Typography>

      <Grid container spacing={4} alignItems="flex-start">
        {plans.map((plan) => (
          <Grid
            item
            key={plan.title}
            xs={12}
            sm={6}
            md={4}
          >
            <Card
              className={`h-full flex flex-col ${
                plan.highlighted
                  ? 'shadow-forge-hover border-2 border-secondary-main'
                  : 'shadow-forge hover:shadow-forge-hover'
              }`}
            >
              <CardContent className="flex-grow">
                <Typography
                  variant="h5"
                  component="h2"
                  align="center"
                  gutterBottom
                  className="font-heading font-bold"
                >
                  {plan.title}
                </Typography>
                <Typography
                  variant="h4"
                  component="div"
                  align="center"
                  className="my-4 font-bold text-secondary-main"
                >
                  {plan.price}
                </Typography>
                <List>
                  {plan.features.map((feature) => (
                    <ListItem key={feature} className="px-0">
                      <ListItemIcon className="min-w-0 mr-2">
                        <CheckCircleIcon className="text-secondary-main" />
                      </ListItemIcon>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
              <CardActions className="justify-center pb-4">
                <Button
                  variant={plan.buttonVariant as 'text' | 'outlined' | 'contained'}
                  color="primary"
                  size="large"
                  className={`w-3/4 ${
                    plan.buttonVariant === 'contained'
                      ? 'bg-secondary-main hover:bg-secondary-light'
                      : ''
                  }`}
                >
                  {plan.buttonText}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Pricing;
