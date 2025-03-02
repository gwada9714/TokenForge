// src/components/TokenManager/TokenManager.tsx
import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Tab,
  Tabs,
  Divider,
} from "@mui/material";
import { TokenInfo } from "../../../../types/tokens";
import TokenDetails from "./TokenDetails";
import { TokenOperations } from "./TokenOperations";
import { TokenHistory } from "./TokenHistory";

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

const a11yProps = (index: number) => ({
  id: `token-tab-${index}`,
  'aria-controls': `token-tabpanel-${index}`,
});

export const TokenManager: React.FC<TokenManagerProps> = ({ token }) => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOperationComplete = () => {
    // Rafraîchir les données du token si nécessaire
    console.log("Operation completed");
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
              <Tab label="Details" {...a11yProps(0)} />
              <Tab label="Operations" {...a11yProps(1)} />
              <Tab label="History" {...a11yProps(2)} />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <TokenDetails token={token} />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <TokenOperations
                token={token}
                onOperationComplete={handleOperationComplete}
              />
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
