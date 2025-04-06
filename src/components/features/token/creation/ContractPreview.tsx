import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { TokenBaseConfig, TokenAdvancedConfig } from "../../types/tokens";
import { TokenType } from "./TokenTypeSelector";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ContractPreviewProps {
  tokenType: TokenType;
  baseConfig: TokenBaseConfig;
  advancedConfig: TokenAdvancedConfig;
}

type ContractFeature = string;

export const ContractPreview: React.FC<ContractPreviewProps> = ({
  tokenType,
  baseConfig,
  advancedConfig,
}) => {
  const getParents = (): ContractFeature[] => {
    const parents: ContractFeature[] = [tokenType];

    // Add features based on token type
    if (tokenType === "ERC20") {
      if (advancedConfig.burnable) parents.push("ERC20Burnable");
      if (advancedConfig.mintable) parents.push("ERC20Mintable");
      if (advancedConfig.pausable) parents.push("Pausable");
      if (advancedConfig.permit) parents.push("ERC20Permit");
      if (advancedConfig.votes) parents.push("ERC20Votes");
    } else if (tokenType === "ERC721") {
      if (advancedConfig.burnable) parents.push("ERC721Burnable");
      if (advancedConfig.pausable) parents.push("Pausable");
      if (advancedConfig.votes) parents.push("ERC721Votes");
    } else if (tokenType === "ERC1155") {
      if (advancedConfig.burnable) parents.push("ERC1155Burnable");
      if (advancedConfig.pausable) parents.push("Pausable");
    }

    // Common features
    if (advancedConfig.accessControl === "roles") {
      parents.push("AccessControlEnumerable");
    } else if (advancedConfig.accessControl === "ownable") {
      parents.push("Ownable");
    }

    return parents;
  };

  const generateContractCode = () => {
    const parents = getParents();

    if (advancedConfig.upgradeable) {
      return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/${tokenType}/${tokenType}Upgradeable.sol";
${parents
  .slice(1)
  .map(
    (p) =>
      `import "@openzeppelin/contracts-upgradeable/token/${tokenType}/${p}Upgradeable.sol";`
  )
  .join("\n")}

contract ${baseConfig.name}Token is ${parents
        .map((p) => `${p}Upgradeable`)
        .join(", ")} {
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) public initializer {
        __${parents[0]}_init("${baseConfig.name}", "${baseConfig.symbol}");
        ${parents
          .slice(1)
          .map((p) => `__${p}_init();`)
          .join("\n        ")}
        ${
          baseConfig.initialSupply && tokenType === "ERC20"
            ? `_mint(initialOwner, ${baseConfig.initialSupply});`
            : ""
        }
        ${
          typeof advancedConfig.accessControl === "string" &&
          advancedConfig.accessControl === "roles"
            ? "_grantRole(DEFAULT_ADMIN_ROLE, initialOwner);"
            : typeof advancedConfig.accessControl === "string" &&
              advancedConfig.accessControl === "ownable"
            ? "_transferOwnership(initialOwner);"
            : ""
        }
    }
}`;
    }

    return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/${tokenType}/${tokenType}.sol";
${parents
  .slice(1)
  .map((p) => `import "@openzeppelin/contracts/token/${tokenType}/${p}.sol";`)
  .join("\n")}

contract ${baseConfig.name}Token is ${parents.join(", ")} {
    constructor(
        string memory name,
        string memory symbol
    ) ${parents[0]}("${baseConfig.name}", "${baseConfig.symbol}") {
        ${
          baseConfig.initialSupply && tokenType === "ERC20"
            ? `_mint(msg.sender, ${baseConfig.initialSupply});`
            : ""
        }
        ${
          typeof advancedConfig.accessControl === "string" &&
          advancedConfig.accessControl === "roles"
            ? "_grantRole(DEFAULT_ADMIN_ROLE, msg.sender);"
            : ""
        }
    }
}`;
  };

  const contractCode = generateContractCode();

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Contract Preview
      </Typography>
      <Paper sx={{ p: 2 }}>
        <SyntaxHighlighter
          language="solidity"
          style={tomorrow}
          customStyle={{ margin: 0 }}
        >
          {contractCode}
        </SyntaxHighlighter>
      </Paper>
    </Box>
  );
};
