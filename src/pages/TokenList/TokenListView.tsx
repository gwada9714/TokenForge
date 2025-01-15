import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import { TokenDisplay } from '../../components/TokenDisplay/TokenDisplay';

interface Token {
  address: string;
  name: string;
  symbol: string;
  totalSupply: string;
  features?: {
    mintable: boolean;
    burnable: boolean;
  };
}

interface TokenListViewProps {
  tokens: Token[];
  isLoading?: boolean;
}

export const TokenListView: React.FC<TokenListViewProps> = ({ 
  tokens,
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography>Chargement des tokens...</Typography>
      </Box>
    );
  }

  if (tokens.length === 0) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography>Aucun token trouvé</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {tokens.map((token) => (
        <Grid item xs={12} key={token.address}>
          <TokenDisplay
            token={token}
            variant="card"
          />
        </Grid>
      ))}
    </Grid>
  );
}; 