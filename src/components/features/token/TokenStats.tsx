import React from "react";
import { Box, Typography, Paper, Grid, Divider } from "@mui/material";

interface TokenStatsProps {
  totalSupply?: string;
  holders?: number;
  transactions?: number;
  price?: string;
  marketCap?: string;
  volume24h?: string;
  liquidity?: string;
}

export const TokenStats: React.FC<TokenStatsProps> = ({
  totalSupply = "0",
  holders = 0,
  transactions = 0,
  price = "0",
  marketCap = "0",
  volume24h = "0",
  liquidity = "0",
}) => {
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Statistiques du Token
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Offre Totale
              </Typography>
              <Typography variant="h6">{totalSupply}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Détenteurs
              </Typography>
              <Typography variant="h6">{holders}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Transactions
              </Typography>
              <Typography variant="h6">{transactions}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Prix
              </Typography>
              <Typography variant="h6">${price}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Capitalisation
              </Typography>
              <Typography variant="h6">${marketCap}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Volume (24h)
              </Typography>
              <Typography variant="h6">${volume24h}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Liquidité
              </Typography>
              <Typography variant="h6">${liquidity}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};
