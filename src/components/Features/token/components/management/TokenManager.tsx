import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import { TokenData } from '../../../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`token-tabpanel-${index}`}
      aria-labelledby={`token-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `token-tab-${index}`,
    'aria-controls': `token-tabpanel-${index}`,
  };
};

interface TokenManagerProps {
  tokenAddress: string;
}

export const TokenManager: React.FC<TokenManagerProps> = ({ tokenAddress }) => {
  const [value, setValue] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [token, setToken] = React.useState<TokenData | null>(null);

  // Fetch token data
  React.useEffect(() => {
    const fetchToken = async () => {
      try {
        // TODO: Implement token fetching logic
        setLoading(false);
      } catch (error) {
        console.error('Error fetching token:', error);
        setLoading(false);
      }
    };

    fetchToken();
  }, [tokenAddress]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!token) {
    return (
      <Box>
        <Typography color="error">Token not found</Typography>
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {token.name} ({token.symbol})
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="token management tabs">
            <Tab label="Details" {...a11yProps(0)} />
            <Tab label="Operations" {...a11yProps(1)} />
            <Tab label="History" {...a11yProps(2)} />
          </Tabs>
        </Box>

        <TabPanel value={value} index={0}>
          <Box>
            <Typography variant="body1">
              <strong>Address:</strong> {token.address}
            </Typography>
            <Typography variant="body1">
              <strong>Total Supply:</strong> {token.totalSupply}
            </Typography>
            <Typography variant="body1">
              <strong>Decimals:</strong> {token.decimals}
            </Typography>
            <Typography variant="body1">
              <strong>Features:</strong>
            </Typography>
            <ul>
              <li>Mintable: {token.features.mintable ? 'Yes' : 'No'}</li>
              <li>Burnable: {token.features.burnable ? 'Yes' : 'No'}</li>
              <li>Pausable: {token.features.pausable ? 'Yes' : 'No'}</li>
            </ul>
          </Box>
        </TabPanel>

        <TabPanel value={value} index={1}>
          {/* TODO: Add TokenOperations component */}
          <Typography>Token operations will be available here</Typography>
        </TabPanel>

        <TabPanel value={value} index={2}>
          {/* TODO: Add TokenHistory component */}
          <Typography>Transaction history will be available here</Typography>
        </TabPanel>
      </CardContent>
    </Card>
  );
};

export default React.memo(TokenManager);
