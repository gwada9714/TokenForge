import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  TokenDeploymentService,
  TokenDeploymentOptions,
} from "../TokenDeploymentService";
import { IBlockchainService } from "../../interfaces/IBlockchainService";
import { createPublicClient, createWalletClient, http } from "viem";
import { hardhat } from "viem/chains";

// Mock du service blockchain
class MockBlockchainService implements IBlockchainService {
  private connected: boolean = false;
  private provider: any;
  private signer: any;

  constructor() {
    // Créer un client public viem pour Hardhat
    this.provider = createPublicClient({
      chain: hardhat,
      transport: http("http://127.0.0.1:8545"),
    });

    // Créer un client wallet viem pour Hardhat
    this.signer = createWalletClient({
      chain: hardhat,
      transport: http("http://127.0.0.1:8545"),
    });
  }

  async connect(): Promise<boolean> {
    this.connected = true;
    return true;
  }

  async disconnect(): Promise<boolean> {
    this.connected = false;
    return true;
  }

  async isConnected(): Promise<boolean> {
    return this.connected;
  }

  getProvider(): any {
    return this.provider;
  }

  getSigner(): any {
    return this.signer;
  }

  async getAccounts(): Promise<string[]> {
    return ["0x70997970C51812dc3A010C7d01b50e0d17dc79C8"];
  }

  async getChainId(): Promise<number> {
    return 31337; // Hardhat chain ID
  }

  async getNetworkId(): Promise<number> {
    return 31337; // Hardhat network ID
  }

  async getBalance(address: string): Promise<bigint> {
    return BigInt(1000000000000000000); // 1 ETH
  }

  async signMessage(message: string, address?: string): Promise<string> {
    return "0x1234567890abcdef";
  }

  async verifySignature(
    message: string,
    signature: string,
    address: string
  ): Promise<boolean> {
    return true;
  }

  async estimateGas(transaction: any): Promise<bigint> {
    return BigInt(5000000);
  }
}

// Tests d'intégration pour TokenDeploymentService
describe("TokenDeploymentService - Integration Tests", () => {
  let tokenDeploymentService: TokenDeploymentService;
  let mockBlockchainService: IBlockchainService;

  beforeEach(() => {
    // Réinitialiser les mocks
    vi.resetAllMocks();

    // Créer une instance du service
    tokenDeploymentService = TokenDeploymentService.getInstance();

    // Créer et enregistrer le service blockchain mock
    mockBlockchainService = new MockBlockchainService();
    tokenDeploymentService.registerBlockchainService(
      "ethereum",
      mockBlockchainService
    );

    // Se connecter au service blockchain
    mockBlockchainService.connect();
  });

  afterEach(() => {
    // Déconnecter le service blockchain
    mockBlockchainService.disconnect();
  });

  it("devrait vérifier si un service blockchain est enregistré", async () => {
    // Vérifier que le service ethereum est enregistré
    expect(tokenDeploymentService.hasBlockchainService("ethereum")).toBe(true);

    // Vérifier qu'un service non enregistré retourne false
    expect(tokenDeploymentService.hasBlockchainService("unknown")).toBe(false);
  });

  it("devrait déployer un token standard avec succès", async () => {
    // Créer les options de déploiement
    const options: TokenDeploymentOptions = {
      name: "Test Token",
      symbol: "TEST",
      decimals: 18,
      totalSupply: "1000000",
      features: {
        burnable: true,
        mintable: true,
        pausable: false,
        taxable: false,
        reflective: false,
      },
      ownerAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      network: "ethereum",
    };

    // Mock de la méthode executeDeployment pour éviter le déploiement réel
    const executeDeploymentSpy = vi
      .spyOn(tokenDeploymentService as any, "executeDeployment")
      .mockResolvedValue({
        address: "0x1234567890123456789012345678901234567890",
        deployTransaction: {
          hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
          blockNumber: 123456,
          gasLimit: BigInt(5000000),
        },
      });

    // Déployer le token
    const result = await tokenDeploymentService.deployToken(options);

    // Vérifier que le déploiement a réussi
    expect(result.success).toBe(true);
    expect(result.contractAddress).toBe(
      "0x1234567890123456789012345678901234567890"
    );
    expect(result.transactionHash).toBe(
      "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
    );
    expect(result.network).toBe("ethereum");

    // Vérifier que executeDeployment a été appelé avec les bons arguments
    expect(executeDeploymentSpy).toHaveBeenCalled();
  });

  it("devrait échouer si le service blockchain n'est pas disponible", async () => {
    // Créer les options de déploiement pour une blockchain non enregistrée
    const options: TokenDeploymentOptions = {
      name: "Test Token",
      symbol: "TEST",
      decimals: 18,
      totalSupply: "1000000",
      features: {
        burnable: true,
        mintable: true,
        pausable: false,
        taxable: false,
        reflective: false,
      },
      ownerAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      network: "unknown",
    };

    // Déployer le token
    const result = await tokenDeploymentService.deployToken(options);

    // Vérifier que le déploiement a échoué
    expect(result.success).toBe(false);
    expect(result.error).toContain("Service blockchain non disponible");
  });

  it("devrait déterminer le bon type de contrat en fonction des fonctionnalités", () => {
    // Accéder à la méthode privée determineContractType
    const determineContractType = (
      tokenDeploymentService as any
    ).determineContractType.bind(tokenDeploymentService);

    // Tester différentes combinaisons de fonctionnalités
    expect(
      determineContractType({
        burnable: false,
        mintable: false,
        pausable: false,
        taxable: false,
        reflective: false,
      })
    ).toBe("StandardToken");

    expect(
      determineContractType({
        burnable: true,
        mintable: false,
        pausable: false,
        taxable: false,
        reflective: false,
      })
    ).toBe("BurnableToken");

    expect(
      determineContractType({
        burnable: false,
        mintable: true,
        pausable: false,
        taxable: false,
        reflective: false,
      })
    ).toBe("MintableToken");

    expect(
      determineContractType({
        burnable: true,
        mintable: true,
        pausable: false,
        taxable: false,
        reflective: false,
      })
    ).toBe("MintableBurnableToken");

    expect(
      determineContractType({
        burnable: true,
        mintable: true,
        pausable: true,
        taxable: false,
        reflective: false,
      })
    ).toBe("FullFeaturedToken");

    expect(
      determineContractType({
        burnable: false,
        mintable: false,
        pausable: false,
        taxable: true,
        reflective: false,
      })
    ).toBe("TaxableToken");

    expect(
      determineContractType({
        burnable: false,
        mintable: false,
        pausable: false,
        taxable: false,
        reflective: true,
      })
    ).toBe("ReflectiveToken");
  });

  it("devrait vérifier si un token est déployé", async () => {
    // Mock de la méthode getCode du provider
    const getCodeSpy = vi.fn().mockImplementation((address: string) => {
      if (address === "0x1234567890123456789012345678901234567890") {
        return "0x1234"; // Code non vide = contrat déployé
      } else {
        return "0x"; // Code vide = contrat non déployé
      }
    });

    // Remplacer la méthode getCode du provider
    vi.spyOn(mockBlockchainService.getProvider(), "getCode").mockImplementation(
      getCodeSpy
    );

    // Mock du provider pour éviter les erreurs
    const mockProvider = {
      getCode: getCodeSpy,
    };

    // Remplacer la méthode getProvider pour retourner notre mock
    vi.spyOn(mockBlockchainService, "getProvider").mockReturnValue(
      mockProvider
    );

    // Vérifier un contrat déployé
    const isDeployed1 = await tokenDeploymentService.isTokenDeployed(
      "0x1234567890123456789012345678901234567890",
      "ethereum"
    );
    expect(isDeployed1).toBe(true);

    // Vérifier un contrat non déployé
    const isDeployed2 = await tokenDeploymentService.isTokenDeployed(
      "0x0987654321098765432109876543210987654321",
      "ethereum"
    );
    expect(isDeployed2).toBe(false);
  });

  it("devrait récupérer l'historique des déploiements", async () => {
    // Déployer un token (avec mock)
    vi.spyOn(
      tokenDeploymentService as any,
      "executeDeployment"
    ).mockResolvedValue({
      address: "0x1234567890123456789012345678901234567890",
      deployTransaction: {
        hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        blockNumber: 123456,
        gasLimit: BigInt(5000000),
      },
    });

    await tokenDeploymentService.deployToken({
      name: "Test Token",
      symbol: "TEST",
      decimals: 18,
      totalSupply: "1000000",
      features: {
        burnable: true,
        mintable: true,
        pausable: false,
        taxable: false,
        reflective: false,
      },
      ownerAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      network: "ethereum",
    });

    // Récupérer l'historique des déploiements
    const history = tokenDeploymentService.getDeploymentHistory();

    // Vérifier que l'historique contient le déploiement
    expect(history.length).toBeGreaterThan(0);
    expect(history[0].success).toBe(true);
    expect(history[0].contractAddress).toBe(
      "0x1234567890123456789012345678901234567890"
    );
    expect(history[0].network).toBe("ethereum");
  });
});
