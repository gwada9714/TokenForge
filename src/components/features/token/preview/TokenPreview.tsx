import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
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
  const generateContractCode = React.useCallback(() => {
    const imports = [
      "// SPDX-License-Identifier: MIT",
      "pragma solidity ^0.8.20;",
      "",
      'import "@openzeppelin/contracts/token/ERC20/ERC20.sol";',
      ...(advancedConfig.burnable
        ? [
            'import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";',
          ]
        : []),
      ...(advancedConfig.pausable
        ? ['import "@openzeppelin/contracts/security/Pausable.sol";']
        : []),
      ...(advancedConfig.permit
        ? [
            'import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";',
          ]
        : []),
      ...(advancedConfig.votes
        ? [
            'import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";',
          ]
        : []),
    ];

    const inheritance = [
      "ERC20",
      ...(advancedConfig.burnable ? ["ERC20Burnable"] : []),
      ...(advancedConfig.pausable ? ["Pausable"] : []),
      ...(advancedConfig.permit ? ["ERC20Permit"] : []),
      ...(advancedConfig.votes ? ["ERC20Votes"] : []),
    ];

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

    return code.trim();
  }, [baseConfig, advancedConfig]);

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Aperçu du Contrat
      </Typography>
      <Box sx={{ maxHeight: "500px", overflow: "auto" }}>
        <SyntaxHighlighter
          language="solidity"
          style={atomOneDark}
          customStyle={{ borderRadius: "4px" }}
          showLineNumbers
        >
          {generateContractCode()}
        </SyntaxHighlighter>
      </Box>
    </Paper>
  );
};
