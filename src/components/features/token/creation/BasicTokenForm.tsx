import React, { useState } from "react";
import { Box, TextField, FormControl, FormHelperText } from "@mui/material";
import { TokenBaseConfig } from "../../types/tokens";
import { validatePositiveNumber } from "../../utils/validation";

interface BasicTokenFormProps {
  config: TokenBaseConfig;
  onConfigChange: (config: TokenBaseConfig) => void;
}

type FormErrors = Partial<Record<keyof TokenBaseConfig, string>>;

export const BasicTokenForm: React.FC<BasicTokenFormProps> = ({
  config,
  onConfigChange,
}) => {
  const [errors, setErrors] = useState<FormErrors>({});

  const validateField = (
    field: keyof TokenBaseConfig,
    value: string | number
  ): string | undefined => {
    const newValue = value.toString().trim();

    switch (field) {
      case "name":
        if (!newValue) {
          return "Token name is required";
        }
        if (newValue.length > 50) {
          return "Token name must be less than 50 characters";
        }
        break;

      case "symbol":
        if (!newValue) {
          return "Token symbol is required";
        }
        if (!/^[A-Z0-9]+$/.test(newValue)) {
          return "Symbol must contain only uppercase letters and numbers";
        }
        if (newValue.length > 11) {
          return "Symbol must be less than 11 characters";
        }
        break;

      case "decimals":
        if (!newValue) {
          return "Decimals is required";
        }
        const decimals = parseInt(newValue);
        if (isNaN(decimals) || decimals < 0 || decimals > 18) {
          return "Decimals must be between 0 and 18";
        }
        break;

      case "initialSupply":
        if (!newValue) {
          return "Initial supply is required";
        }
        if (!validatePositiveNumber(newValue)) {
          return "Initial supply must be a positive number";
        }
        break;
    }
    return undefined;
  };

  const handleChange =
    (field: keyof TokenBaseConfig) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      const error = validateField(field, value);

      setErrors((prev) => ({
        ...prev,
        [field]: error,
      }));

      if (!error) {
        let parsedValue: string | number = value;
        if (field === "decimals") {
          parsedValue = parseInt(value) || 0;
        }

        onConfigChange({
          ...config,
          [field]: parsedValue,
        });
      }
    };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <FormControl fullWidth error={!!errors.name}>
        <TextField
          label="Token Name"
          value={config.name}
          onChange={handleChange("name")}
          error={!!errors.name}
          helperText={errors.name || "The name of your token"}
          placeholder="e.g., My Token"
        />
      </FormControl>

      <FormControl fullWidth error={!!errors.symbol}>
        <TextField
          label="Token Symbol"
          value={config.symbol}
          onChange={handleChange("symbol")}
          error={!!errors.symbol}
          helperText={
            errors.symbol || "The symbol of your token (e.g., BTC, ETH)"
          }
          placeholder="e.g., TKN"
        />
      </FormControl>

      <FormControl fullWidth error={!!errors.decimals}>
        <TextField
          label="Decimals"
          type="number"
          value={config.decimals}
          onChange={handleChange("decimals")}
          error={!!errors.decimals}
          helperText={errors.decimals || "Number of decimal places (0-18)"}
          inputProps={{ min: 0, max: 18 }}
        />
      </FormControl>

      <FormControl fullWidth error={!!errors.initialSupply}>
        <TextField
          label="Initial Supply"
          value={config.initialSupply}
          onChange={handleChange("initialSupply")}
          error={!!errors.initialSupply}
          helperText={
            errors.initialSupply || "The initial amount of tokens to mint"
          }
          placeholder="e.g., 1000000"
        />
        <FormHelperText>
          This will be multiplied by 10^(decimals) to get the actual supply
        </FormHelperText>
      </FormControl>
    </Box>
  );
};
