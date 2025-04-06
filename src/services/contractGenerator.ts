import { TokenBaseConfig, TokenAdvancedConfig } from "../types/tokens";
import { compile } from "./solc-cdn-loader";

const generateSoliditySource = (
  baseConfig: TokenBaseConfig,
  advancedConfig: TokenAdvancedConfig
): string => {
  return `
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.20;

    import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
    ${
      advancedConfig.burnable
        ? 'import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";'
        : ""
    }
    ${
      advancedConfig.mintable
        ? 'import "@openzeppelin/contracts/access/Ownable.sol";'
        : ""
    }

    contract ${baseConfig.name}Token is ERC20${
    advancedConfig.burnable ? ", ERC20Burnable" : ""
  }${advancedConfig.mintable ? ", Ownable" : ""} {
        constructor() ERC20("${baseConfig.name}", "${baseConfig.symbol}") {
            _mint(msg.sender, ${baseConfig.initialSupply} * 10 ** decimals());
        }

        ${
          advancedConfig.mintable
            ? `
        function mint(address to, uint256 amount) public onlyOwner {
            _mint(to, amount);
        }
        `
            : ""
        }
    }
  `;
};

export async function generateContractBytecode(
  baseConfig: TokenBaseConfig,
  advancedConfig: TokenAdvancedConfig
): Promise<`0x${string}`> {
  const source = generateSoliditySource(baseConfig, advancedConfig);

  try {
    const output = await compile(source);

    if (output.errors?.some((error) => error.severity === "error")) {
      throw new Error(
        "Compilation failed: " +
          output.errors
            .filter((error) => error.severity === "error")
            .map((error) => error.message)
            .join("\n")
      );
    }

    const contractName = `${baseConfig.name}Token`;
    const bytecode =
      output.contracts["contract.sol"][contractName].evm.bytecode.object;

    if (!bytecode) {
      throw new Error("No bytecode generated");
    }

    return `0x${bytecode}` as `0x${string}`;
  } catch (error) {
    console.error("Contract compilation failed:", error);
    throw error;
  }
}
