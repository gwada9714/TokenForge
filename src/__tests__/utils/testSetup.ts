import { TokenDeploymentService } from "../../features/token-creation/services/tokenDeploymentService";
import { TokenForgeFactory } from "../../contracts/typechain-types";
import { mockPublicClient, mockWalletClient } from "../mocks/clients";
import { parseEther, getContract } from "viem";
import { TokenForgeABI } from "../../contracts/abis/TokenForgeABI";

export interface TestEnvironment {
  deploymentService: TokenDeploymentService;
  tokenFactory: TokenForgeFactory;
}

export async function setupTestEnvironment(): Promise<TestEnvironment> {
  // Configuration du service de déploiement
  const deploymentService = new TokenDeploymentService(
    mockPublicClient,
    mockWalletClient
  );

  // Configuration de la factory de tokens
  const tokenFactory = getContract({
    address: "0x1234567890123456789012345678901234567890",
    abi: TokenForgeABI,
    publicClient: mockPublicClient,
    walletClient: mockWalletClient,
  }) as unknown as TokenForgeFactory;

  return {
    deploymentService,
    tokenFactory,
  };
}
