import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Tab,
  Tabs,
  Divider,
} from '@mui/material';
import { TokenInfo } from '../../types/tokens';
import { TokenDetails } from './TokenDetails';
import { TokenOperations } from './TokenOperations';
import { TokenHistory } from './TokenHistory';

interface TokenManagerProps {
  token: TokenInfo;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`token-tabpanel-${index}`}
    aria-labelledby={`token-tab-${index}`}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

export const TokenManager: React.FC<TokenManagerProps> = ({ token }) => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Card>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              {token.name} ({token.symbol})
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {token.address}
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="token management tabs"
              variant="fullWidth"
            >
              <Tab label="Détails" id="token-tab-0" />
              <Tab label="Opérations" id="token-tab-1" />
              <Tab label="Historique" id="token-tab-2" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <TokenDetails token={token} />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <TokenOperations token={token} />
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <TokenHistory token={token} />
            </TabPanel>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
