import React from "react";
import { Box, Typography, Paper, Grid, Chip, Divider } from "@mui/material";

interface SummaryProps {
  data: {
    blockchain: string;
    name: string;
    symbol: string;
    supply: string;
    decimals: string;
    features: {
      mint: boolean;
      burn: boolean;
    };
    serviceTier: string;
  };
}

const Summary: React.FC<SummaryProps> = ({ data }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Review Your Token Configuration
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Please review all details before proceeding with deployment.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Basic Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography color="text.secondary">Token Name</Typography>
                <Typography variant="h6">{data.name}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography color="text.secondary">Token Symbol</Typography>
                <Typography variant="h6">{data.symbol}</Typography>
              </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography color="text.secondary">Total Supply</Typography>
                <Typography variant="h6">{data.supply}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography color="text.secondary">Decimals</Typography>
                <Typography variant="h6">{data.decimals}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Network & Features
            </Typography>
            <Box mb={2}>
              <Typography color="text.secondary">Blockchain</Typography>
              <Chip
                label={data.blockchain.toUpperCase()}
                color="primary"
                sx={{ mt: 1 }}
              />
            </Box>
            <Typography color="text.secondary" gutterBottom>
              Enabled Features
            </Typography>
            <Box display="flex" gap={1}>
              {data.features.mint && <Chip label="Mintable" color="success" />}
              {data.features.burn && <Chip label="Burnable" color="success" />}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Service Tier & Fees
            </Typography>
            <Box mb={2}>
              <Typography color="text.secondary">Selected Tier</Typography>
              <Chip
                label={
                  data.serviceTier === "premium"
                    ? "Master Forge"
                    : "Basic Forge"
                }
                color={data.serviceTier === "premium" ? "secondary" : "default"}
                sx={{ mt: 1 }}
              />
            </Box>
            <Typography color="text.secondary" gutterBottom>
              TokenForge Tax
            </Typography>
            <Typography>Fixed 1% on all transactions</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Summary;
