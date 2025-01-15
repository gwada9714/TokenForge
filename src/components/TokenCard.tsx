// src/components/TokenCard/TokenCard.tsx
import { memo } from 'react';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import { truncateAddress } from '../utils';

interface TokenCardProps {
  token: {
    address: string;
    symbol: string;
    balance: string;
  };
  onAction: (address: string) => void;
}

const TokenCard = memo(({ token, onAction }: TokenCardProps) => {
  return (
    <Card 
      sx={{ 
        minWidth: 275,
        transition: '0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.shadows[4]
        }
      }}
    >
      <CardContent>
        <Typography variant="h5" component="h3" gutterBottom>
          {token.symbol}
        </Typography>
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            Address: {truncateAddress(token.address)}
          </Typography>
          <Typography variant="body1">
            Balance: {token.balance}
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => onAction(token.address)}
          sx={{ mt: 2 }}
        >
          Manage Token
        </Button>
      </CardContent>
    </Card>
  );
});

TokenCard.displayName = 'TokenCard';

export default TokenCard;