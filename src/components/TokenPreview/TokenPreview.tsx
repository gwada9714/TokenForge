import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { TokenBaseConfig, TokenAdvancedConfig } from "../../types/tokens";

interface TokenPreviewProps {
  baseConfig: TokenBaseConfig;
  advancedConfig: TokenAdvancedConfig;
}

export const TokenPreview: React.FC<TokenPreviewProps> = ({
  baseConfig,
  advancedConfig,
}) => {
  const generateContractCode = () => {
    const imports = [
      "// SPDX-License-Identifier: MIT",
      "pragma solidity ^0.8.20;",
      "",
      'import "@openzeppelin/contracts/token/ERC20/ERC20.sol";',
    ];

    if (advancedConfig.burnable) {
      imports.push(
        'import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";',
      );
    }
    if (advancedConfig.pausable) {
      imports.push('import "@openzeppelin/contracts/security/Pausable.sol";');
    }
    if (advancedConfig.permit) {
      imports.push(
        'import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";',
      );
    }
    if (advancedConfig.votes) {
      imports.push(
        'import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";',
      );
    }

    const inheritance = ["ERC20"];
    if (advancedConfig.burnable) inheritance.push("ERC20Burnable");
    if (advancedConfig.pausable) inheritance.push("Pausable");
    if (advancedConfig.permit) inheritance.push("ERC20Permit");
    if (advancedConfig.votes) inheritance.push("ERC20Votes");

    const contractName = `${baseConfig.name.replace(/\s+/g, "")}Token`;

    const code = `
${imports.join("\n")}

contract ${contractName} is ${inheritance.join(", ")} {
    constructor() ERC20("${baseConfig.name}", "${baseConfig.symbol}") {
        _mint(msg.sender, ${baseConfig.initialSupply} * 10 ** decimals());
    }

    ${
      advancedConfig.mintable
        ? `
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }`
        : ""
    }

    ${
      advancedConfig.pausable
        ? `
    function pause() public {
        _pause();
    }

    function unpause() public {
        _unpause();
    }`
        : ""
    }
}`;

    return code;
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Contract Preview
      </Typography>
      <Box sx={{ maxHeight: "500px", overflow: "auto" }}>
        <SyntaxHighlighter
          language="solidity"
          style={atomOneDark}
          customStyle={{ borderRadius: "4px" }}
        >
          {generateContractCode()}
        </SyntaxHighlighter>
      </Box>
    </Paper>
  );
};
