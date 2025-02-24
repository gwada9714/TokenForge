import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useMarketplace } from '../hooks/useMarketplace';
import { MarketplaceItem as MarketplaceItemType } from '../types';
import { MarketplaceFilters } from './MarketplaceFilters';
import { MarketplaceStats } from './MarketplaceStats';
import { MarketplaceItem } from './MarketplaceItem';

export const MarketplaceList: React.FC = () => {
  const {
    items,
    stats,
    isLoading,
    error,
    loadItems,
    loadStats,
  } = useMarketplace();

  useEffect(() => {
    loadItems();
    loadStats();
  }, [loadItems, loadStats]);

  if (isLoading && items.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <MarketplaceStats stats={stats} />
      <MarketplaceFilters onFilter={loadItems} />
      
      {items.length === 0 ? (
        <Typography variant="body1" textAlign="center" sx={{ mt: 4 }}>
          Aucun item disponible dans le marketplace
        </Typography>
      ) : (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {items.map((item: MarketplaceItemType) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <MarketplaceItem item={item} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};
