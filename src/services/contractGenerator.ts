import { TokenBaseConfig, TokenAdvancedConfig } from '../types/tokens';
import solc from 'solc';

export const generateContractBytecode = async (
  baseConfig: TokenBaseConfig,
  advancedConfig: TokenAdvancedConfig
): Promise<`0x${string}`> => {
  // Générer le code Solidity
  const solidityCode = generateSolidityCode(baseConfig, advancedConfig);
  
  // Préparer l'input pour le compilateur
  const input = {
    language: 'Solidity',
    sources: {
      'Token.sol': {
        content: solidityCode,
      },
    },
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      outputSelection: {
        '*': {
          '*': ['evm.bytecode'],
        },
      },
    },
  };

  // Compiler le code
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  
  // Vérifier les erreurs
  if (output.errors) {
    const errors = output.errors.filter((e: any) => e.severity === 'error');
    if (errors.length > 0) {
      throw new Error(`Compilation failed: ${errors[0].message}`);
    }
  }

  const contractName = `${baseConfig.name.replace(/\s+/g, '')}Token`;
  const bytecode = output.contracts['Token.sol'][contractName].evm.bytecode.object;
  
  return `0x${bytecode}` as `0x${string}`;
};

const generateSolidityCode = (baseConfig: TokenBaseConfig, advancedConfig: TokenAdvancedConfig): string => {
  const imports = [
    "// SPDX-License-Identifier: MIT",
    "pragma solidity ^0.8.20;",
    "",
    "import \"@openzeppelin/contracts/token/ERC20/ERC20.sol\";",
  ];

  if (advancedConfig.burnable) {
    imports.push("import \"@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol\";");
  }
  if (advancedConfig.pausable) {
    imports.push("import \"@openzeppelin/contracts/security/Pausable.sol\";");
  }
  if (advancedConfig.permit) {
    imports.push("import \"@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol\";");
  }
  if (advancedConfig.votes) {
    imports.push("import \"@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol\";");
  }

  const inheritance = ["ERC20"];
  if (advancedConfig.burnable) inheritance.push("ERC20Burnable");
  if (advancedConfig.pausable) inheritance.push("Pausable");
  if (advancedConfig.permit) inheritance.push("ERC20Permit");
  if (advancedConfig.votes) inheritance.push("ERC20Votes");

  const contractName = `${baseConfig.name.replace(/\s+/g, '')}Token`;

  return `
${imports.join("\n")}

contract ${contractName} is ${inheritance.join(", ")} {
    constructor() ERC20("${baseConfig.name}", "${baseConfig.symbol}") {
        _mint(msg.sender, ${baseConfig.initialSupply} * 10 ** decimals());
    }

    ${advancedConfig.mintable ? `
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }` : ''}

    ${advancedConfig.pausable ? `
    function pause() public {
        _pause();
    }

    function unpause() public {
        _unpause();
    }` : ''}
}`;
};
