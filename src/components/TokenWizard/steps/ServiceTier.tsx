import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import StarIcon from '@mui/icons-material/Star';
import { TKN_TOKEN_ADDRESS } from '@/constants/tokenforge';

interface ServiceTierProps {
  data: {
    serviceTier: string;
  };
  onUpdate: (data: { serviceTier: string }) => void;
}

const ServiceTier: React.FC<ServiceTierProps> = ({ data, onUpdate }) => {
  const handleTierSelect = (tier: string) => () => {
    onUpdate({ serviceTier: tier });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Choose Service Tier
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Select the service tier that best fits your needs.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: data.serviceTier === 'basic' ? 'primary.main' : 'divider',
              height: '100%',
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Typography variant="h5">Basic Forge</Typography>
            </Box>
            <Typography variant="h4" color="primary" gutterBottom>
              100 TKN
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Standard Token Creation" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Basic Features (Mint, Burn)" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Community Support" />
              </ListItem>
            </List>
            <Button
              fullWidth
              variant={data.serviceTier === 'basic' ? 'contained' : 'outlined'}
              onClick={handleTierSelect('basic')}
              sx={{ mt: 2 }}
            >
              Select Basic
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: data.serviceTier === 'premium' ? 'primary.main' : 'divider',
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 20,
                right: -30,
                transform: 'rotate(45deg)',
                bgcolor: 'primary.main',
                color: 'white',
                px: 4,
                py: 0.5,
              }}
            >
              RECOMMENDED
            </Box>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <StarIcon color="primary" />
              <Typography variant="h5">Master Forge</Typography>
            </Box>
            <Typography variant="h4" color="primary" gutterBottom>
              1000 TKN
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="All Basic Features" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Priority Support" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Advanced Security Features" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Marketing Support" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Listing Assistance" />
              </ListItem>
            </List>
            <Button
              fullWidth
              variant={data.serviceTier === 'premium' ? 'contained' : 'outlined'}
              onClick={handleTierSelect('premium')}
              sx={{ mt: 2 }}
              color="primary"
            >
              Select Premium
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ServiceTier;
