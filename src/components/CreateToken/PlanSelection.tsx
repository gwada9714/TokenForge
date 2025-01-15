import React from 'react';
import {
  Box,
  Grid,
  Stack,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  Paper,
  useTheme,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { FaHammer, FaGem, FaCrown } from 'react-icons/fa';
import { PlanSelectionProps } from '@/types/components';
import { TokenConfig } from '@/types/token';

const PlanSelection: React.FC<PlanSelectionProps> = ({ setTokenConfig }) => {
  const theme = useTheme();

  const plans = [
    {
      name: 'Apprenti Forgeron',
      price: 'Gratuit',
      icon: FaHammer,
      features: [
        'Création de token simple sur testnet',
        'Fonctionnalités très limitées',
        'Code non audité',
      ],
      buttonText: 'Commencer',
      value: 'apprentice',
    },
    {
      name: 'Forgeron',
      price: '0.3 BNB',
      icon: FaGem,
      features: [
        'Création de token sur mainnet',
        'Fonctionnalités de base',
        'Option de taxe de la forge',
        'Audit de sécurité en option',
        'Support standard',
      ],
      buttonText: 'Choisir ce Plan',
      value: 'smith',
      isPopular: true,
    },
    {
      name: 'Maître Forgeron',
      price: '0.5 BNB',
      icon: FaCrown,
      features: [
        'Toutes les fonctionnalités disponibles',
        'Audit de sécurité inclus',
        'Support prioritaire',
        'Accès aux fonctionnalités avancées',
        'Personnalisation complète',
        'Listing prioritaire',
      ],
      buttonText: 'Devenir Maître',
      value: 'master',
    },
  ];

  const handlePlanSelection = (planValue: string) => {
    setTokenConfig((prev: TokenConfig) => ({
      ...prev,
      plan: planValue,
    }));
  };

  return (
    <Box sx={{ py: 4 }}>
      <Typography 
        variant="h4" 
        component="h2" 
        align="center"
        gutterBottom
        sx={{ mb: 4 }}
      >
        Choisissez votre Plan
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <Grid item xs={12} sm={6} md={4} key={plan.value}>
              <Paper
                elevation={plan.isPopular ? 8 : 1}
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  },
                  ...(plan.isPopular && {
                    borderColor: 'primary.main',
                    borderWidth: 2,
                    borderStyle: 'solid',
                  }),
                }}
              >
                {plan.isPopular && (
                  <Typography
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      bgcolor: 'primary.main',
                      color: 'white',
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.875rem',
                    }}
                  >
                    Populaire
                  </Typography>
                )}

                <Stack spacing={3}>
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Icon size={40} style={{ margin: '0 auto', color: theme.palette.primary.main }} />
                    <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
                      {plan.name}
                    </Typography>
                    <Typography variant="h4" color="primary" fontWeight="bold">
                      {plan.price}
                    </Typography>
                  </Box>

                  <List sx={{ flexGrow: 1 }}>
                    {plan.features.map((feature, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircleIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <Typography variant="body2">{feature}</Typography>
                      </ListItem>
                    ))}
                  </List>

                  <Button
                    variant={plan.isPopular ? 'contained' : 'outlined'}
                    color="primary"
                    size="large"
                    fullWidth
                    onClick={() => handlePlanSelection(plan.value)}
                  >
                    {plan.buttonText}
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default PlanSelection;
