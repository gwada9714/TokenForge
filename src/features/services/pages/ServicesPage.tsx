import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';

const services = [
  {
    title: 'Création de Token',
    description: 'Créez votre propre token personnalisé en quelques clics'
  },
  {
    title: 'Gestion de Token',
    description: 'Gérez et suivez vos tokens existants'
  },
  {
    title: 'Analyse de Token',
    description: 'Obtenez des insights détaillés sur vos tokens'
  }
];

export const ServicesPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Nos Services
      </Typography>
      <Grid container spacing={3}>
        {services.map((service, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {service.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {service.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
