import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
} from '@mui/material';

interface PlanSelectionProps {
  selectedPlan: 'basic' | 'premium' | null;
  onPlanSelect: (plan: 'basic' | 'premium') => void;
  tokenBalance?: {
    decimals: number;
    formatted: string;
    symbol: string;
    value: bigint;
  };
  premiumPrice: string;
  basicPrice: string;
  discount: number;
}

const PlanSelection: React.FC<PlanSelectionProps> = ({
  selectedPlan,
  onPlanSelect,
  tokenBalance,
  premiumPrice,
  basicPrice,
  discount,
}) => {
  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              height: '100%',
              border: selectedPlan === 'basic' ? 2 : 1,
              borderColor: selectedPlan === 'basic' ? 'primary.main' : 'divider'
            }}
          >
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Basic Plan
              </Typography>
              <Typography variant="h4" color="primary" gutterBottom>
                {basicPrice} ETH
              </Typography>
              <Box my={2}>
                <Typography variant="body1" paragraph>
                  Features included:
                </Typography>
                <ul>
                  <li>Standard ERC20 Token</li>
                  <li>Basic Token Features</li>
                  <li>Burnable Function</li>
                </ul>
              </Box>
              <Button
                variant={selectedPlan === 'basic' ? 'contained' : 'outlined'}
                fullWidth
                onClick={() => onPlanSelect('basic')}
              >
                Select Basic
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              height: '100%',
              border: selectedPlan === 'premium' ? 2 : 1,
              borderColor: selectedPlan === 'premium' ? 'primary.main' : 'divider'
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" gutterBottom>
                  Premium Plan
                </Typography>
                <Chip label="Recommended" color="primary" />
              </Box>
              <Typography variant="h4" color="primary" gutterBottom>
                {premiumPrice} ETH
              </Typography>
              {tokenBalance && (
                <Typography variant="body2" color="text.secondary">
                  Pay with TKN for {discount}% discount
                </Typography>
              )}
              <Box my={2}>
                <Typography variant="body1" paragraph>
                  All Basic features plus:
                </Typography>
                <ul>
                  <li>Mintable Function</li>
                  <li>Pausable Function</li>
                  <li>Advanced Access Control</li>
                  <li>Priority Support</li>
                </ul>
              </Box>
              <Button
                variant={selectedPlan === 'premium' ? 'contained' : 'outlined'}
                fullWidth
                onClick={() => onPlanSelect('premium')}
                color="primary"
              >
                Select Premium
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default React.memo(PlanSelection);
