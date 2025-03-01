import React from 'react';
import { Card, CardContent, Typography, Button, Box, Chip, Stack } from '@mui/material';
import { TokenInfo } from '../hooks/useTokenData';
import { shortenAddress } from '../utils/address';

interface TokenCardProps {
  token: TokenInfo;
  onAction?: (tokenAddress: string, action?: string) => void;
}

export const TokenCard: React.FC<TokenCardProps> = ({ token, onAction }) => {
  const handleAction = (action: string) => {
    if (onAction) {
      onAction(token.address, action);
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <Card sx={{ mb: 2, overflow: 'visible' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" component="div">
              {token.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {token.symbol} • {shortenAddress(token.address)}
            </Typography>
            {token.createdAt && (
              <Typography variant="caption" color="text.secondary">
                Créé le {formatDate(token.createdAt)}
              </Typography>
            )}
          </Box>
          <Box>
            <Chip 
              label={`Supply: ${token.totalSupply}`} 
              color="primary" 
              variant="outlined" 
              size="small" 
              sx={{ mr: 1 }}
            />
            {token.balance && (
              <Chip 
                label={`Balance: ${token.balance}`} 
                color="success" 
                variant="outlined" 
                size="small" 
              />
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
          {token.features && Object.entries(token.features)
            .filter(([_, enabled]) => enabled)
            .map(([feature]) => (
              <Chip 
                key={feature} 
                label={feature} 
                size="small" 
                sx={{ fontSize: '0.7rem' }}
              />
            ))}
        </Box>

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button 
            size="small" 
            variant="outlined"
            onClick={() => handleAction('transfer')}
          >
            Transférer
          </Button>
          {token.features?.mintable && (
            <Button 
              size="small" 
              variant="outlined" 
              color="success"
              onClick={() => handleAction('mint')}
            >
              Mint
            </Button>
          )}
          {token.features?.burnable && (
            <Button 
              size="small" 
              variant="outlined" 
              color="error"
              onClick={() => handleAction('burn')}
            >
              Burn
            </Button>
          )}
          <Button 
            size="small" 
            variant="contained"
            onClick={() => handleAction('manage')}
          >
            Gérer
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};
