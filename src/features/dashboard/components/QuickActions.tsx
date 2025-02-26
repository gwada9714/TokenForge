import React from 'react';
import { Grid, Button } from '@mui/material';
import { 
  Add as AddIcon,
  AccountBalanceWallet as WalletIcon,
  Lock as LockIcon,
  SwapHoriz as SwapIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Créer un Token',
      icon: <AddIcon />,
      onClick: () => navigate('/create-token'),
      color: 'primary'
    },
    {
      label: 'Staking',
      icon: <LockIcon />,
      onClick: () => navigate('/staking'),
      color: 'secondary'
    },
    {
      label: 'Connecter Wallet',
      icon: <WalletIcon />,
      onClick: () => navigate('/connect-wallet'),
      color: 'info'
    },
    {
      label: 'Échanger',
      icon: <SwapIcon />,
      onClick: () => navigate('/swap'),
      color: 'success'
    }
  ] as const;

  return (
    <Grid container spacing={2}>
      {actions.map((action) => (
        <Grid item xs={12} sm={6} md={3} key={action.label}>
          <Button
            variant="outlined"
            color={action.color}
            startIcon={action.icon}
            onClick={action.onClick}
            fullWidth
            sx={{
              py: 1.5,
              justifyContent: 'flex-start',
              textAlign: 'left'
            }}
          >
            {action.label}
          </Button>
        </Grid>
      ))}
    </Grid>
  );
}; 