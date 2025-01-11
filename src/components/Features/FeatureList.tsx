import React from 'react';
import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SavingsIcon from '@mui/icons-material/Savings';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <CardContent sx={{ flexGrow: 1 }}>
      <Box sx={{ mb: 2, color: 'primary.main' }}>
        {icon}
      </Box>
      <Typography variant="h6" component="h3" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {description}
      </Typography>
    </CardContent>
  </Card>
);

export const FeatureList: React.FC = () => {
  const features = [
    {
      title: 'Sécurisé',
      description: 'Smart contracts audités et testés pour une sécurité maximale',
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
    },
    {
      title: 'Rapide',
      description: 'Création de token en quelques minutes seulement',
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
    },
    {
      title: 'Compatible ERC20',
      description: 'Tokens 100% compatibles avec les standards ERC20',
      icon: <AccountBalanceIcon sx={{ fontSize: 40 }} />,
    },
    {
      title: 'Économique',
      description: 'Frais de déploiement optimisés et transparents',
      icon: <SavingsIcon sx={{ fontSize: 40 }} />,
    },
  ];

  return (
    <Grid container spacing={4}>
      {features.map((feature, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <FeatureCard {...feature} />
        </Grid>
      ))}
    </Grid>
  );
};
