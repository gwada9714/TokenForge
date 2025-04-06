import React from "react";
import { Card, CardContent, Grid, Typography } from "@mui/material";
import type { MarketplaceStats as MarketplaceStatsType } from "../types";

interface MarketplaceStatsProps {
  stats: MarketplaceStatsType;
}

export const MarketplaceStats: React.FC<MarketplaceStatsProps> = ({
  stats,
}) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Items
            </Typography>
            <Typography variant="h5">{stats.totalItems}</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Volume Total
            </Typography>
            <Typography variant="h5">{stats.totalVolume}</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Items Actifs
            </Typography>
            <Typography variant="h5">{stats.activeItems}</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Items Vendus
            </Typography>
            <Typography variant="h5">{stats.soldItems}</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
