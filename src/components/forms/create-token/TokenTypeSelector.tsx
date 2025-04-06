import React from "react";
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";

export type TokenType = "ERC20" | "ERC721" | "ERC1155";

interface TokenTypeSelectorProps {
  selectedType: TokenType | null;
  onTypeSelect: (type: TokenType) => void;
}

export const TokenTypeSelector: React.FC<TokenTypeSelectorProps> = ({
  selectedType,
  onTypeSelect,
}) => {
  const handleChange = (
    _: React.MouseEvent<HTMLElement>,
    newType: TokenType | null
  ) => {
    if (newType) {
      onTypeSelect(newType);
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
      <ToggleButtonGroup
        value={selectedType}
        exclusive
        onChange={handleChange}
        aria-label="token type"
      >
        <ToggleButton value="ERC20" aria-label="ERC20">
          ERC20
        </ToggleButton>
        <ToggleButton value="ERC721" aria-label="ERC721">
          ERC721
        </ToggleButton>
        <ToggleButton value="ERC1155" aria-label="ERC1155">
          ERC1155
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};
