// Script complet pour tester les fonctionnalités Ethereum
import { ethers } from "ethers";
import { createPublicClient, http, createWalletClient, parseEther } from "viem";
import { sepolia } from "viem/chains";
import dotenv from "dotenv";

// Initialiser dotenv
dotenv.config();

async function testEthersConnection() {
  console.log("\n=== Test de connexion avec ethers.js ===");
  try {
    // Créer un provider pour le testnet Sepolia
    const provider = new ethers.JsonRpcProvider(
      "https://ethereum-sepolia.publicnode.com"
    );
    console.log("Provider connecté au testnet Sepolia");

    // Obtenir les informations du réseau
    const network = await provider.getNetwork();
    console.log("Réseau:", {
      name: network.name,
      chainId: network.chainId.toString(),
    });

    // Obtenir le dernier numéro de bloc
    const blockNumber = await provider.getBlockNumber();
    console.log("Numéro du dernier bloc:", blockNumber);

    // Obtenir le dernier bloc
    const block = await provider.getBlock(blockNumber);
    console.log("Hash du dernier bloc:", block.hash);
    console.log(
      "Timestamp du dernier bloc:",
      new Date(block.timestamp * 1000).toISOString()
    );

    // Obtenir le prix du gaz
    const gasPrice = await provider.getFeeData();
    console.log("Prix du gaz (wei):", gasPrice.gasPrice.toString());

    console.log("Test ethers.js réussi!");
  } catch (error) {
    console.error("Erreur lors du test ethers.js:", error);
  }
}

async function testViemConnection() {
  console.log("\n=== Test de connexion avec viem ===");
  try {
    // Créer un client public pour le testnet Sepolia
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http("https://ethereum-sepolia.publicnode.com"),
    });
    console.log("Client public connecté au testnet Sepolia");

    // Obtenir l'ID de la chaîne
    const chainId = await publicClient.getChainId();
    console.log("ID de la chaîne:", chainId);

    // Obtenir le dernier numéro de bloc
    const blockNumber = await publicClient.getBlockNumber();
    console.log("Numéro du dernier bloc:", blockNumber);

    // Obtenir le dernier bloc
    const block = await publicClient.getBlock();
    console.log("Hash du dernier bloc:", block.hash);
    console.log(
      "Timestamp du dernier bloc:",
      new Date(Number(block.timestamp) * 1000).toISOString()
    );
    console.log(
      "Transactions dans le dernier bloc:",
      block.transactions.length
    );

    // Obtenir le prix du gaz
    const gasPrice = await publicClient.getGasPrice();
    console.log("Prix du gaz (wei):", gasPrice);

    console.log("Test viem réussi!");
  } catch (error) {
    console.error("Erreur lors du test viem:", error);
  }
}

async function testContractInteraction() {
  console.log("\n=== Test d'interaction avec un contrat ===");
  try {
    // Adresse d'un contrat ERC20 connu sur Sepolia (USDC)
    const contractAddress = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

    // ABI minimal pour un token ERC20 avec stateMutability explicite
    const abi = [
      {
        inputs: [],
        name: "name",
        outputs: [{ name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "symbol",
        outputs: [{ name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "decimals",
        outputs: [{ name: "", type: "uint8" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "totalSupply",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
    ];

    // Créer un provider et un contrat en lecture seule
    const provider = new ethers.JsonRpcProvider(
      "https://ethereum-sepolia.publicnode.com"
    );

    // Utiliser le provider directement pour les opérations en lecture seule
    const contract = new ethers.Contract(contractAddress, abi, provider);

    // Lire les informations du token
    const name = await contract.name();
    const symbol = await contract.symbol();
    const decimals = await contract.decimals();
    const totalSupply = await contract.totalSupply();

    console.log("Informations du token:");
    console.log("- Nom:", name);
    console.log("- Symbole:", symbol);
    console.log("- Décimales:", decimals);
    console.log("- Supply totale:", totalSupply.toString());

    console.log("Test d'interaction avec un contrat réussi!");
  } catch (error) {
    console.error("Erreur lors du test d'interaction avec un contrat:", error);
  }
}

async function main() {
  console.log("=== Tests complets des fonctionnalités Ethereum ===\n");

  // Test de connexion avec ethers.js
  await testEthersConnection();

  // Test de connexion avec viem
  await testViemConnection();

  // Test d'interaction avec un contrat
  await testContractInteraction();

  console.log("\n=== Tous les tests Ethereum sont terminés ===");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
