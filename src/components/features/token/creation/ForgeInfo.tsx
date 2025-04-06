import React from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { Info, CheckCircle } from "@mui/icons-material";
import { ForgeFeesService } from "@/services/forgeFeesService";

interface ForgeInfoProps {
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
  onUpdate: (data: Partial<ForgeInfoProps["data"]>) => void;
}

const ForgeInfo: React.FC<ForgeInfoProps> = ({ data, onUpdate }) => {
  const feesInfo = ForgeFeesService.getForgeFeesInfo();

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        Taxe de la Forge
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" color="text.secondary">
          {feesInfo.description}
        </Typography>
      </Box>

      <Typography variant="h6" gutterBottom>
        Distribution des Taxes
      </Typography>

      <List>
        {feesInfo.benefits.map((benefit, index) => (
          <ListItem key={index}>
            <ListItemIcon>
              <CheckCircle color="primary" />
            </ListItemIcon>
            <ListItemText primary={benefit} />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mt: 2 }}>
        <Typography
          variant="body2"
          color="warning.main"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <Info sx={{ mr: 1 }} />
          Cette taxe est une partie intégrante de l'écosystème TokenForge et ne
          peut pas être modifiée.
        </Typography>
      </Box>
    </Paper>
  );
};

export default ForgeInfo;
