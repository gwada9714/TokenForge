import React from "react";
import {
  Box,
  TextField,
  Typography,
  Grid,
  InputAdornment,
} from "@mui/material";

interface TokenConfigurationProps {
  data: {
    name: string;
    symbol: string;
    supply: string;
    decimals: string;
  };
  onUpdate: (data: Partial<TokenConfigurationProps["data"]>) => void;
}

const TokenConfiguration: React.FC<TokenConfigurationProps> = ({
  data,
  onUpdate,
}) => {
  const handleChange =
    (field: keyof typeof data) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({ [field]: event.target.value });
    };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Configure Your Token
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Set the basic parameters for your token.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Token Name"
            value={data.name}
            onChange={handleChange("name")}
            helperText="The full name of your token (e.g., 'Ethereum')"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Token Symbol"
            value={data.symbol}
            onChange={handleChange("symbol")}
            helperText="The symbol of your token (e.g., 'ETH')"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Total Supply"
            type="number"
            value={data.supply}
            onChange={handleChange("supply")}
            helperText="The total number of tokens to create"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">Tokens</InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Decimals"
            type="number"
            value={data.decimals}
            onChange={handleChange("decimals")}
            helperText="Number of decimal places (usually 18)"
            InputProps={{
              inputProps: {
                min: 0,
                max: 18,
              },
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default TokenConfiguration;
