import React from "react";
import {
  Box,
  FormControlLabel,
  Switch,
  Typography,
  Tooltip,
  IconButton,
  Paper,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { TokenAdvancedConfig } from "../../types/tokens";

interface AdvancedTokenFormProps {
  config: TokenAdvancedConfig;
  onConfigChange: (config: TokenAdvancedConfig) => void;
  disabled?: boolean;
}

interface FeatureOption {
  key: keyof TokenAdvancedConfig;
  label: string;
  description: string;
  tooltip: string;
}

const features: FeatureOption[] = [
  {
    key: "mintable",
    label: "Mintable",
    description: "Allow creating new tokens after deployment",
    tooltip:
      "Enables the creation of new tokens by authorized addresses after the initial deployment.",
  },
  {
    key: "burnable",
    label: "Burnable",
    description: "Allow token holders to burn their tokens",
    tooltip:
      "Allows token holders to permanently destroy (burn) their own tokens, reducing the total supply.",
  },
  {
    key: "pausable",
    label: "Pausable",
    description: "Allow pausing all token transfers",
    tooltip:
      "Enables authorized addresses to pause all token transfers in case of emergency.",
  },
  {
    key: "permit",
    label: "Permit",
    description: "Enable gasless approvals",
    tooltip: "Implements EIP-2612 for gasless approvals using signatures.",
  },
  {
    key: "votes",
    label: "Votes",
    description: "Enable governance features",
    tooltip: "Adds voting capabilities for governance purposes.",
  },
];

export const AdvancedTokenForm: React.FC<AdvancedTokenFormProps> = ({
  config,
  onConfigChange,
  disabled = false,
}) => {
  const handleChange =
    (key: keyof TokenAdvancedConfig) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onConfigChange({
        ...config,
        [key]: event.target.checked,
      });
    };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Advanced Features
      </Typography>

      <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
        <Box display="grid" gap={2}>
          {features.map(({ key, label, description, tooltip }) => (
            <Box
              key={key}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="subtitle1">{label}</Typography>
                  <Tooltip title={tooltip}>
                    <IconButton size="small">
                      <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {description}
                </Typography>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={
                      typeof config[key] === "boolean" ? config[key] : false
                    }
                    onChange={handleChange(key)}
                    disabled={disabled}
                  />
                }
                label=""
              />
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};
