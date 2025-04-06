import React from "react";
import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Paper,
  Grid,
} from "@mui/material";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import AddCircleIcon from "@mui/icons-material/AddCircle";

interface TokenFeaturesProps {
  data: {
    features: {
      mint: boolean;
      burn: boolean;
    };
  };
  onUpdate: (data: { features: { mint: boolean; burn: boolean } }) => void;
}

const TokenFeatures: React.FC<TokenFeaturesProps> = ({ data, onUpdate }) => {
  const handleFeatureChange =
    (feature: "mint" | "burn") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        features: {
          ...data.features,
          [feature]: event.target.checked,
        },
      });
    };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Optional Features
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Select additional features for your token.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <AddCircleIcon color="primary" />
              <Box>
                <Typography variant="subtitle1">Mint Function</Typography>
                <Typography variant="body2" color="text.secondary">
                  Allows creating additional tokens after deployment
                </Typography>
              </Box>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={data.features.mint}
                  onChange={handleFeatureChange("mint")}
                />
              }
              label="Enable Minting"
            />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <LocalFireDepartmentIcon color="primary" />
              <Box>
                <Typography variant="subtitle1">Burn Function</Typography>
                <Typography variant="body2" color="text.secondary">
                  Allows destroying tokens to reduce total supply
                </Typography>
              </Box>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={data.features.burn}
                  onChange={handleFeatureChange("burn")}
                />
              }
              label="Enable Burning"
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TokenFeatures;
