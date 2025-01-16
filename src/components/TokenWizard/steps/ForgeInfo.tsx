import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import BuildIcon from '@mui/icons-material/Build';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import AutorenewIcon from '@mui/icons-material/Autorenew';

const ForgeInfo: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        TokenForge Tax Information
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        The TokenForge platform implements a fixed 1% tax on all token transactions to
        support continuous development and ecosystem growth.
      </Alert>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Tax Distribution
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <AccountBalanceIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="70% TokenForge Treasury"
              secondary="Supports platform development and operations"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <BuildIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="15% Development Fund"
              secondary="Funds new feature development and improvements"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <AutorenewIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="10% Buyback & Burn"
              secondary="Maintains token value through regular buybacks"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <LocalAtmIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="5% Staking Rewards"
              secondary="Rewards token holders who stake their tokens"
            />
          </ListItem>
        </List>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Important Notes
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="• The 1% tax is non-modifiable and applies to all transactions"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="• Tax collection and distribution are fully automated"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="• All tax operations are transparent and verifiable on-chain"
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default ForgeInfo;
