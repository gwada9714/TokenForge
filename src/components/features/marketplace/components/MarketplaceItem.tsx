import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
} from "@mui/material";
import type { MarketplaceItem as MarketplaceItemType } from "../types";

interface MarketplaceItemProps {
  item: MarketplaceItemType;
}

export const MarketplaceItem: React.FC<MarketplaceItemProps> = ({ item }) => {
  const statusColors = {
    active: "success",
    sold: "error",
    cancelled: "default",
  };

  return (
    <Card>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6" component="div">
            {item.name}
          </Typography>
          <Chip
            data-testid="status-chip"
            label={item.status}
            color={statusColors[item.status] as "success" | "error" | "default"}
            size="small"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {item.description}
        </Typography>

        <Box mt={2}>
          <Typography variant="subtitle2" gutterBottom>
            Prix
          </Typography>
          <Typography variant="h6" color="primary">
            {item.price} {item.tokenSymbol}
          </Typography>
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          mt={1}
        >
          Vendeur: {item.seller}
        </Typography>
      </CardContent>

      <CardActions>
        <Button
          size="small"
          color="primary"
          variant="contained"
          fullWidth
          disabled={item.status !== "active"}
        >
          Acheter
        </Button>
      </CardActions>
    </Card>
  );
};
