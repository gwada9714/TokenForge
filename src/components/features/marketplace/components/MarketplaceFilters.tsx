import React, { useState } from "react";
import { Box, TextField, MenuItem, Button, Grid } from "@mui/material";
import type { MarketplaceFilters as MarketplaceFiltersType } from "../types";

interface MarketplaceFiltersProps {
  onFilter: (filters: MarketplaceFiltersType) => void;
}

export const MarketplaceFilters: React.FC<MarketplaceFiltersProps> = ({
  onFilter,
}) => {
  const [filters, setFilters] = useState<MarketplaceFiltersType>({
    status: "active",
    sortBy: "createdAt",
    sortDirection: "desc",
  });

  const handleChange =
    (field: keyof MarketplaceFiltersType) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newFilters = {
        ...filters,
        [field]: event.target.value,
      };
      setFilters(newFilters);
    };

  const handleApplyFilters = () => {
    onFilter(filters);
  };

  const handleReset = () => {
    const defaultFilters: MarketplaceFiltersType = {
      status: "active",
      sortBy: "createdAt",
      sortDirection: "desc",
    };
    setFilters(defaultFilters);
    onFilter(defaultFilters);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            select
            fullWidth
            label="Statut"
            value={filters.status || ""}
            onChange={handleChange("status")}
            size="small"
          >
            <MenuItem value="active">Actif</MenuItem>
            <MenuItem value="sold">Vendu</MenuItem>
            <MenuItem value="cancelled">Annulé</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            label="Prix Min"
            type="number"
            value={filters.minPrice || ""}
            onChange={handleChange("minPrice")}
            size="small"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            label="Prix Max"
            type="number"
            value={filters.maxPrice || ""}
            onChange={handleChange("maxPrice")}
            size="small"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <TextField
            select
            fullWidth
            label="Trier par"
            value={filters.sortBy || "createdAt"}
            onChange={handleChange("sortBy")}
            size="small"
          >
            <MenuItem value="price">Prix</MenuItem>
            <MenuItem value="createdAt">Date de création</MenuItem>
            <MenuItem value="updatedAt">Dernière mise à jour</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <TextField
            select
            fullWidth
            label="Direction"
            value={filters.sortDirection || "desc"}
            onChange={handleChange("sortDirection")}
            size="small"
          >
            <MenuItem value="asc">Croissant</MenuItem>
            <MenuItem value="desc">Décroissant</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleApplyFilters}
              fullWidth
            >
              Appliquer
            </Button>
            <Button variant="outlined" onClick={handleReset} fullWidth>
              Réinitialiser
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
