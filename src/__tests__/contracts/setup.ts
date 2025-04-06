import { expect } from "chai";
import {
  createTestClient,
  http,
  publicActions,
  walletActions,
  type Address,
  type Chain,
  type ContractFunctionName,
  type Account,
  keccak256,
  toBytes,
} from "viem";
import { BASE_TAX_RATE } from "./constants";
import TaxDistributorArtifact from "../../../artifacts/contracts/TaxDistributor.sol/TaxDistributor.json" assert { type: "json" };
import TaxSystemArtifact from "../../../artifacts/contracts/TokenForgeTaxSystem.sol/TokenForgeTaxSystem.json" assert { type: "json" };
import FactoryArtifact from "../../../artifacts/contracts/TokenForgeFactory.sol/TokenForgeFactory.json" assert { type: "json" };
import { TokenType } from "../../types/tokens";
import type {
  TokenDeploymentConfig,
  TokenDeploymentResult,
} from "../../types/tokens";
import type {
  ChainTestEnvironment,
  ExtendedTestClient,
} from "../../types/test";
import type { SupportedChain } from "../../types/chains";
import { SUPPORTED_CHAINS } from "../../types/chains";

// Définition de l'ABI de la Factory
const FACTORY_ABI = FactoryArtifact.abi;

// Types pour les contrats
type ContractTypes = {
  TaxDistributor: typeof TaxDistributorArtifact;
  TaxSystem: typeof TaxSystemArtifact;
  Factory: typeof FactoryArtifact;
};

// Event signature
const TOKEN_CREATED_TOPIC = keccak256(
  toBytes("TokenCreated(address,address,uint8)")
);

// Types spécifiques pour le déploiement
interface ContractDeploymentParams<T extends keyof ContractTypes> {
  artifact: ContractTypes[T];
  args: readonly unknown[];
  account: Address;
  name: T;
  chain?: Chain;
}

// Type pour les paramètres de configuration du système de taxe
interface TaxSystemConfig {
  factory: Address;
  baseRate: bigint;
  treasury: Address;
  chain?: Chain;
}

// Fonction utilitaire pour valider le bytecode
function validateBytecode(bytecode: string): `0x${string}` {
  if (!bytecode) {
    throw new Error("Bytecode cannot be empty");
  }
  const cleanBytecode = bytecode.startsWith("0x") ? bytecode : `0x${bytecode}`;
  if (!/^0x[0-9a-fA-F]+$/.test(cleanBytecode)) {
    throw new Error("Invalid bytecode format");
  }
  return cleanBytecode as `0x${string}`;
}

async function deployAndVerifyContract<T extends keyof ContractTypes>(
  client: ExtendedTestClient,
  params: ContractDeploymentParams<T>
): Promise<Address> {
  console.log(`Deploying ${params.name}...`);

  const deploymentData = {
    abi: params.artifact.abi,
    bytecode: validateBytecode(params.artifact.bytecode),
    args: params.args,
    account: { address: params.account } as Account,
    chain: params.chain,
  };

  try {
    const hash = await client.deployContract(deploymentData);
    const receipt = await client.waitForTransactionReceipt({ hash });

    if (!receipt.status || receipt.status === "reverted") {
      throw new Error(`${params.name} deployment failed`);
    }
    if (!receipt.contractAddress) {
      throw new Error(`No contract address returned for ${params.name}`);
    }

    const contractAddress = receipt.contractAddress as Address;
    console.log(`${params.name} deployed at:`, contractAddress);
    return contractAddress;
  } catch (error) {
    console.error(`Failed to deploy ${params.name}:`, error);
    throw error;
  }
}

async function configureTaxSystem(
  client: ExtendedTestClient,
  config: TaxSystemConfig,
  taxSystemAddress: Address,
  owner: Address
): Promise<void> {
  console.log("Configuring tax system...");

  try {
    const writeConfig = {
      address: taxSystemAddress,
      abi: TaxSystemArtifact.abi,
      functionName: "configureTax",
      args: [config.factory, config.baseRate, config.treasury] as const,
      account: { address: owner } as Account,
      chain: config.chain,
    } as const;

    const hash = await client.writeContract(writeConfig);
    const receipt = await client.waitForTransactionReceipt({ hash });

    if (!receipt.status || receipt.status === "reverted") {
      throw new Error("Tax system configuration failed");
    }

    console.log(
      "Configured tax system with base rate:",
      config.baseRate.toString()
    );
  } catch (error) {
    console.error("Failed to configure tax system:", error);
    throw error;
  }
}

export async function setupChainTestEnvironment(
  chain: SupportedChain
): Promise<ChainTestEnvironment> {
  console.log(`Setting up test environment for ${chain.name}...`);

  try {
    const client = createTestClient({
      chain,
      mode: "anvil",
      transport: http(),
    })
      .extend(publicActions)
      .extend(walletActions) as unknown as ExtendedTestClient;

    // Get test accounts
    const accounts = await client.getAddresses();
    if (accounts.length < 6) {
      throw new Error(`Not enough test accounts on ${chain.name}`);
    }
    const [owner, treasury, development, buyback, staking, user] = accounts;

    // Récupérer la configuration de la chaîne
    const chainConfig = SUPPORTED_CHAINS[chain.id];
    if (!chainConfig) {
      throw new Error(`Chain ${chain.name} is not supported`);
    }

    // Deploy contracts
    const taxDistributorAddress = await deployAndVerifyContract(client, {
      artifact: TaxDistributorArtifact,
      args: [treasury, development, buyback, staking],
      account: owner,
      name: "TaxDistributor",
      chain,
    });

    const taxSystemAddress = await deployAndVerifyContract(client, {
      artifact: TaxSystemArtifact,
      args: [taxDistributorAddress],
      account: owner,
      name: "TaxSystem",
      chain,
    });

    const factoryAddress = await deployAndVerifyContract(client, {
      artifact: FactoryArtifact,
      args: [treasury, taxSystemAddress],
      account: owner,
      name: "Factory",
      chain,
    });

    // Configure tax system
    await configureTaxSystem(
      client,
      {
        factory: factoryAddress,
        baseRate: BASE_TAX_RATE,
        treasury,
        chain,
      },
      taxSystemAddress,
      owner
    );

    console.log("Test environment setup completed!");

    return {
      chain,
      owner,
      treasury,
      development,
      buyback,
      staking,
      user,
      factory: factoryAddress,
      client,
    };
  } catch (error) {
    console.error(`Failed to setup test environment for ${chain.name}:`, error);
    throw error;
  }
}

export async function deployTokenOnChain(
  chain: SupportedChain,
  config: TokenDeploymentConfig,
  environment: ChainTestEnvironment
): Promise<TokenDeploymentResult> {
  console.log(`Deploying ${config.tokenType} token on ${chain.name}...`);

  try {
    const { client, factory, owner } = environment;

    // Préparer les arguments en fonction du type de token
    const baseArgs = [
      config.name,
      config.symbol,
      config.decimals,
      config.initialSupply,
      config.maxSupply,
      config.isBurnable,
      config.isMintable,
      config.isPausable,
    ] as const;

    let deployArgs;
    let functionName: ContractFunctionName<typeof FACTORY_ABI>;

    switch (config.tokenType) {
      case TokenType.STANDARD:
        deployArgs = baseArgs;
        functionName = "createStandardToken";
        break;

      case TokenType.TAX:
        if (!config.options?.taxConfig) {
          throw new Error("Tax configuration required for tax token");
        }
        deployArgs = [
          ...baseArgs,
          config.options.taxConfig.buyTax,
          config.options.taxConfig.sellTax,
          config.options.taxConfig.transferTax,
          config.options.taxConfig.taxRecipient,
        ] as const;
        functionName = "createTaxToken";
        break;

      case TokenType.LIQUIDITY:
        if (!config.options?.liquidityConfig) {
          throw new Error(
            "Liquidity configuration required for liquidity token"
          );
        }
        deployArgs = [
          ...baseArgs,
          config.options.liquidityConfig.router,
          config.options.liquidityConfig.pair,
          config.options.liquidityConfig.lockDuration,
        ] as const;
        functionName = "createLiquidityToken";
        break;

      case TokenType.STAKING:
        if (!config.options?.stakingConfig) {
          throw new Error("Staking configuration required for staking token");
        }
        deployArgs = [
          ...baseArgs,
          config.options.stakingConfig.rewardRate,
          config.options.stakingConfig.stakingDuration,
          config.options.stakingConfig.earlyWithdrawalPenalty,
        ] as const;
        functionName = "createStakingToken";
        break;

      default:
        throw new Error(`Unsupported token type: ${config.tokenType}`);
    }

    // Préparer les paramètres de déploiement
    const writeConfig = {
      address: factory,
      abi: FACTORY_ABI,
      functionName,
      args: deployArgs,
      account: { address: owner } as Account,
      chain,
    } as const;

    // Déployer le token
    const hash = await client.writeContract(writeConfig);
    const receipt = await client.waitForTransactionReceipt({ hash });

    if (!receipt.status || receipt.status === "reverted") {
      throw new Error(`Token deployment failed on ${chain.name}`);
    }

    // Récupérer l'adresse du token depuis les logs
    const tokenCreatedLog = receipt.logs.find(
      (log) => log.topics[0] === TOKEN_CREATED_TOPIC
    );

    if (!tokenCreatedLog) {
      throw new Error(`Could not find token address in logs on ${chain.name}`);
    }

    const tokenAddress = tokenCreatedLog.address as Address;
    console.log(
      `${config.tokenType} token deployed at ${tokenAddress} on ${chain.name}`
    );

    return {
      address: tokenAddress,
      tokenType: config.tokenType,
      chain: {
        id: chain.id,
        name: chain.name,
      },
      deploymentTx: hash,
      timestamp: Math.floor(Date.now() / 1000),
    };
  } catch (error) {
    console.error(
      `Failed to deploy ${config.tokenType} token on ${chain.name}:`,
      error
    );
    throw error;
  }
}

// Tests spécifiques par chaîne et par type de token
describe("Token Deployment Tests", () => {
  const chains = Object.values(SUPPORTED_CHAINS).map((config) => config.chain);

  chains.forEach((chain) => {
    describe(`${chain.name} Token Deployments`, () => {
      let environment: ChainTestEnvironment;

      before(async () => {
        environment = await setupChainTestEnvironment(chain);
      });

      it(`should deploy a standard token on ${chain.name}`, async () => {
        const config: TokenDeploymentConfig = {
          name: "Standard Test Token",
          symbol: "STD",
          decimals: 18,
          initialSupply: BigInt(1000000),
          maxSupply: BigInt(1000000),
          isBurnable: true,
          isMintable: true,
          isPausable: true,
          tokenType: TokenType.STANDARD,
        };

        const result = await deployTokenOnChain(chain, config, environment);
        expect(result.address).to.match(/^0x[a-fA-F0-9]{40}$/);
        expect(result.tokenType).to.equal(TokenType.STANDARD);
        expect(result.chain.id).to.equal(chain.id);
      });

      it(`should deploy a tax token on ${chain.name}`, async () => {
        const config: TokenDeploymentConfig = {
          name: "Tax Test Token",
          symbol: "TAX",
          decimals: 18,
          initialSupply: BigInt(1000000),
          maxSupply: BigInt(1000000),
          isBurnable: true,
          isMintable: true,
          isPausable: true,
          tokenType: TokenType.TAX,
          options: {
            taxConfig: {
              buyTax: 5,
              sellTax: 5,
              transferTax: 2,
              taxRecipient: environment.treasury,
            },
          },
        };

        const result = await deployTokenOnChain(chain, config, environment);
        expect(result.address).to.match(/^0x[a-fA-F0-9]{40}$/);
        expect(result.tokenType).to.equal(TokenType.TAX);
        expect(result.chain.id).to.equal(chain.id);
      });

      it(`should deploy a liquidity token on ${chain.name}`, async () => {
        const chainConfig = SUPPORTED_CHAINS[chain.id];
        const config: TokenDeploymentConfig = {
          name: "Liquidity Test Token",
          symbol: "LIQ",
          decimals: 18,
          initialSupply: BigInt(1000000),
          maxSupply: BigInt(1000000),
          isBurnable: true,
          isMintable: true,
          isPausable: true,
          tokenType: TokenType.LIQUIDITY,
          options: {
            liquidityConfig: {
              router: chainConfig.routerAddress,
              pair: chainConfig.routerAddress, // À remplacer par la vraie paire
              lockDuration: 180, // 180 jours
            },
          },
        };

        const result = await deployTokenOnChain(chain, config, environment);
        expect(result.address).to.match(/^0x[a-fA-F0-9]{40}$/);
        expect(result.tokenType).to.equal(TokenType.LIQUIDITY);
        expect(result.chain.id).to.equal(chain.id);
      });

      it(`should deploy a staking token on ${chain.name}`, async () => {
        const config: TokenDeploymentConfig = {
          name: "Staking Test Token",
          symbol: "STK",
          decimals: 18,
          initialSupply: BigInt(1000000),
          maxSupply: BigInt(1000000),
          isBurnable: true,
          isMintable: true,
          isPausable: true,
          tokenType: TokenType.STAKING,
          options: {
            stakingConfig: {
              rewardRate: 10, // 10% APY
              stakingDuration: 365, // 1 an
              earlyWithdrawalPenalty: 20, // 20% de pénalité
            },
          },
        };

        const result = await deployTokenOnChain(chain, config, environment);
        expect(result.address).to.match(/^0x[a-fA-F0-9]{40}$/);
        expect(result.tokenType).to.equal(TokenType.STAKING);
        expect(result.chain.id).to.equal(chain.id);
      });

      // Tests de vérification post-déploiement
      afterEach(async () => {
        // Vérifier que le token est bien déployé et fonctionnel
        // Vérifier les paramètres spécifiques au type de token
        // Vérifier les permissions et les rôles
      });
    });
  });
});

export { expect };
