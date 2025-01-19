import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Link,
  Tooltip,
  IconButton,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { TokenConfig } from '../../types';

interface TokenDetailsProps {
  tokenAddress: string;
  tokenConfig: TokenConfig;
  networkExplorer?: string;
}

export const TokenDetails: React.FC<TokenDetailsProps> = ({
  tokenAddress,
  tokenConfig,
  networkExplorer,
}) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // TODO: Add toast notification
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Token Information
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Name
            </Typography>
            <Typography variant="body1">
              {tokenConfig.name}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Symbol
            </Typography>
            <Typography variant="body1">
              {tokenConfig.symbol}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="textSecondary">
              Contract Address
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                {formatAddress(tokenAddress)}
              </Typography>
              <Tooltip title="Copy Address">
                <IconButton 
                  size="small"
                  onClick={() => copyToClipboard(tokenAddress)}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {networkExplorer && (
                <Link 
                  href={`${networkExplorer}/token/${tokenAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Explorer
                </Link>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Decimals
            </Typography>
            <Typography variant="body1">
              {tokenConfig.decimals}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Total Supply
            </Typography>
            <Typography variant="body1">
              {tokenConfig.totalSupply}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Features
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {tokenConfig.features.mintable && (
                <Chip label="Mintable" color="primary" variant="outlined" />
              )}
              {tokenConfig.features.burnable && (
                <Chip label="Burnable" color="error" variant="outlined" />
              )}
              {tokenConfig.features.pausable && (
                <Chip label="Pausable" color="warning" variant="outlined" />
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default React.memo(TokenDetails);
