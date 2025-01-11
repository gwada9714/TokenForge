import { TokenBaseConfig, TokenAdvancedConfig } from '../types/tokens';

// @ts-ignore
import solc from 'solc';

const generateSoliditySource = (baseConfig: TokenBaseConfig, advancedConfig: TokenAdvancedConfig): string => {
  return `
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.20;

    import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
    ${advancedConfig.burnable ? 'import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";' : ''}
    ${advancedConfig.mintable ? 'import "@openzeppelin/contracts/access/Ownable.sol";' : ''}

    contract ${baseConfig.name}Token is ERC20${advancedConfig.burnable ? ', ERC20Burnable' : ''}${advancedConfig.mintable ? ', Ownable' : ''} {
        constructor() ERC20("${baseConfig.name}", "${baseConfig.symbol}") {
            _mint(msg.sender, ${baseConfig.initialSupply} * 10 ** decimals());
        }

        ${advancedConfig.mintable ? `
        function mint(address to, uint256 amount) public onlyOwner {
            _mint(to, amount);
        }
        ` : ''}
    }
  `;
};

export const generateContractBytecode = async (
  baseConfig: TokenBaseConfig,
  advancedConfig: TokenAdvancedConfig
): Promise<`0x${string}`> => {
  const source = generateSoliditySource(baseConfig, advancedConfig);

  const input = {
    language: 'Solidity',
    sources: {
      'token.sol': {
        content: source,
      },
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['*'],
        },
      },
    },
  };

  try {
    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    if (output.errors) {
      const errors = output.errors.filter((error: any) => error.severity === 'error');
      if (errors.length > 0) {
        throw new Error(`Compilation errors: ${errors.map((e: any) => e.message).join('\n')}`);
      }
    }

    const bytecode = output.contracts['token.sol'][`${baseConfig.name}Token`].evm.bytecode.object;
    return `0x${bytecode}` as `0x${string}`;
  } catch (error) {
    console.error('Contract compilation error:', error);
    throw new Error('Failed to compile contract');
  }
};
