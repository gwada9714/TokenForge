import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
} from '@mui/material';
import { TokenConfig } from '../../../types';

interface TokenVerificationProps {
  config: TokenConfig | null;
  plan: 'basic' | 'premium' | null;
}

const TokenVerification: React.FC<TokenVerificationProps> = ({
  config,
  plan,
}) => {
  if (!config || !plan) {
    return (
      <Alert severity="error">
        Please complete the previous steps first
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Review Your Token Configuration
      </Typography>

      <List>
        <ListItem>
          <ListItemText
            primary="Token Name"
            secondary={config.name}
          />
        </ListItem>
        <Divider />

        <ListItem>
          <ListItemText
            primary="Token Symbol"
            secondary={config.symbol}
          />
        </ListItem>
        <Divider />

        <ListItem>
          <ListItemText
            primary="Decimals"
            secondary={config.decimals}
          />
        </ListItem>
        <Divider />

        <ListItem>
          <ListItemText
            primary="Total Supply"
            secondary={config.totalSupply}
          />
        </ListItem>
        <Divider />

        <ListItem>
          <ListItemText
            primary="Selected Plan"
            secondary={plan.charAt(0).toUpperCase() + plan.slice(1)}
          />
        </ListItem>
        <Divider />

        <ListItem>
          <ListItemText
            primary="Features"
            secondary={
              <Box component="span" sx={{ display: 'block', mt: 1 }}>
                <Typography variant="body2" component="div">
                  • Mintable: {config.features.mintable ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="body2" component="div">
                  • Burnable: {config.features.burnable ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="body2" component="div">
                  • Pausable: {config.features.pausable ? 'Yes' : 'No'}
                </Typography>
              </Box>
            }
          />
        </ListItem>
      </List>

      <Alert severity="info" sx={{ mt: 2 }}>
        Please review the configuration carefully. Once deployed, the token contract cannot be modified.
      </Alert>
    </Box>
  );
};

export default React.memo(TokenVerification);
