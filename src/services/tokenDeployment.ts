import { type PublicClient, type WalletClient, parseUnits } from "viem";
import { getTokenFactoryContract } from "./contracts";
import {
  TokenBaseConfig,
  TokenAdvancedConfig,
  TokenDeploymentStatus,
} from "../types/tokens";

export async function deployToken(
  baseConfig: TokenBaseConfig,
  advancedConfig: TokenAdvancedConfig,
  walletClient: WalletClient,
  publicClient: PublicClient
): Promise<TokenDeploymentStatus> {
  try {
    const factoryAddress = process.env.VITE_TOKEN_FACTORY_ADDRESS;
    if (!factoryAddress || !factoryAddress.startsWith("0x")) {
      throw new Error("Invalid token factory address");
    }

    const contract = getTokenFactoryContract(factoryAddress as `0x${string}`);

    const initialSupply = parseUnits(
      baseConfig.initialSupply.toString(),
      baseConfig.decimals
    );

    const account = await walletClient
      .getAddresses()
      .then((addresses) => addresses[0]);
    if (!account) {
      throw new Error("No account available");
    }

    const { request } = await publicClient.simulateContract({
      ...contract,
      functionName: "createToken",
      args: [
        baseConfig.name,
        baseConfig.symbol,
        baseConfig.decimals,
        initialSupply,
        advancedConfig.burnable,
        advancedConfig.mintable,
        advancedConfig.pausable,
      ],
      account,
    });

    const hash = await walletClient.writeContract(request);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status === "success") {
      return {
        status: "success",
        contractAddress: receipt.contractAddress as `0x${string}`,
        txHash: hash,
      };
    } else {
      return {
        status: "error",
        error: "Transaction failed",
      };
    }
  } catch (error: any) {
    return {
      status: "error",
      error: error.message || "Unknown error occurred",
    };
  }
}
