// Script pour déboguer les tests Ethereum
import { createPublicClient, http, createWalletClient } from "viem";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Vérifier si le fichier ethereum.ts existe
const ethereumPath = path.resolve("./src/blockchain/adapters/ethereum.ts");
console.log(
  "Vérification du fichier ethereum.ts:",
  fs.existsSync(ethereumPath)
);

// Importer directement le contenu du fichier
console.log("Importation du module ethereum...");
import * as EthereumModule from "../src/blockchain/adapters/ethereum.js";

// Vérifier ce qui est exporté
console.log("Contenu du module ethereum:", Object.keys(EthereumModule));

// Extraire les classes
const {
  EthereumBlockchainService,
  EthereumPaymentService,
  EthereumTokenService,
} = EthereumModule;

// Initialiser dotenv
dotenv.config();

// Créer un mock du client public
const mockPublicClient = {
  getBalance: async () => 10n * 10n ** 18n,
  getChainId: async () => 1,
  estimateGas: async () => 21000n,
  getGasPrice: async () => 2000000000n,
  getTransaction: async (params) => {
    console.log("Mock getTransaction called with params:", params);
    if (params.hash === "0xvalidtransactionhash") {
      console.log("Returning valid transaction data");
      return {
        hash: "0xvalidtransactionhash",
        blockNumber: 1234567n,
        confirmations: 10,
      };
    }
    console.log("Returning null (transaction not found)");
    return null;
  },
  getBlock: async () => ({
    hash: "0xblock",
    number: 1000n,
    timestamp: 1625097600n,
    transactions: [],
  }),
  waitForTransactionReceipt: async () => ({
    status: "success",
    blockNumber: 1000n,
  }),
  readContract: async () => true,
  getBytecode: async () => "0x1234",
};

// Créer un mock du client wallet
const mockWalletClient = {
  getAddresses: async () => ["0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"],
  deployContract: async () => ({
    hash: "0xcontractdeploymenthash",
  }),
  writeContract: async () => "0xtransactionhash",
  sendTransaction: async () => "0xtransactionhash",
};

async function testPaymentVerification() {
  console.log("\n=== Test de vérification de paiement ===");
  try {
    // Créer le service de paiement
    const service = new EthereumPaymentService({});

    // Injecter le client public mock
    // @ts-ignore - Accès à une propriété privée pour le test
    service.provider = {
      publicClient: mockPublicClient,
      walletClient: mockWalletClient,
    };

    console.log("Service créé et configuré");

    // Test avec une transaction valide
    console.log("\nTest avec une transaction valide:");
    const validResult = await service.verifyPayment("0xvalidtransactionhash");
    console.log("Résultat pour transaction valide:", validResult);

    // Test avec une transaction invalide
    console.log("\nTest avec une transaction invalide:");
    const invalidResult = await service.verifyPayment(
      "0xinvalidtransactionhash"
    );
    console.log("Résultat pour transaction invalide:", invalidResult);

    console.log("Test de vérification de paiement terminé");
  } catch (error) {
    console.error("Erreur lors du test de vérification de paiement:", error);
  }
}

async function testTokenDeployment() {
  console.log("\n=== Test de déploiement de token ===");
  try {
    // Créer le service de token
    const service = new EthereumTokenService({});

    // Injecter le client wallet mock
    // @ts-ignore - Accès à une propriété privée pour le test
    service.provider = {
      publicClient: mockPublicClient,
      walletClient: mockWalletClient,
    };

    console.log("Service créé et configuré");
    console.log("Service:", JSON.stringify(service, null, 2));

    // Configuration du token
    const tokenConfig = {
      name: "Test Token",
      symbol: "TEST",
      decimals: 18,
      initialSupply: 1000000,
    };

    console.log("Configuration du token:", tokenConfig);

    // Déployer le token
    console.log("Déploiement du token...");
    const result = await service.deployToken(tokenConfig);
    console.log("Résultat du déploiement:", result);

    console.log("Test de déploiement de token terminé");
  } catch (error) {
    console.error("Erreur lors du test de déploiement de token:", error);
  }
}

async function main() {
  console.log("=== Débogage des tests Ethereum ===\n");

  // Test de vérification de paiement
  await testPaymentVerification();

  // Test de déploiement de token
  await testTokenDeployment();

  console.log("\n=== Débogage terminé ===");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
