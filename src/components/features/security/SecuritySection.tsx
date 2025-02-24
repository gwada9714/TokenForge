import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  useTheme,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Gavel as GavelIcon,
  VerifiedUser as VerifiedUserIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface SecurityFeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const SecurityFeature: React.FC<SecurityFeatureProps> = ({
  icon,
  title,
  description,
}) => {
  const theme = useTheme();
  
  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <Box sx={{ color: 'primary.main', mb: 2 }}>{icon}</Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Paper>
  );
};

export const SecuritySection: React.FC = () => {
  const navigate = useNavigate();

  const securityFeatures = [
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Contrats Audités',
      description: 'Tous nos contrats sont audités par des experts en sécurité blockchain',
    },
    {
      icon: <GavelIcon sx={{ fontSize: 40 }} />,
      title: 'Conformité',
      description: 'Respect des normes et bonnes pratiques de l\'industrie',
    },
    {
      icon: <VerifiedUserIcon sx={{ fontSize: 40 }} />,
      title: 'Tests Rigoureux',
      description: 'Tests automatisés et revue de code systématique',
    },
    {
      icon: <WarningIcon sx={{ fontSize: 40 }} />,
      title: 'Alertes & Mises à jour',
      description: 'Système d\'alerte en temps réel et mises à jour de sécurité',
    },
  ];

  return (
    <Box sx={{ py: 8, bgcolor: 'background.default' }}>
      <Container>
        <Typography
          variant="h4"
          component="h2"
          align="center"
          gutterBottom
          sx={{ mb: 6 }}
        >
          Sécurité & Conformité
        </Typography>

        <Grid container spacing={4}>
          {securityFeatures.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <SecurityFeature {...feature} />
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate('/docs/security')}
            startIcon={<SecurityIcon />}
          >
            En savoir plus sur notre sécurité
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default SecuritySection;
