// Updated script to test admin functions using ES modules and ethers.js v6
import { ethers } from "ethers";
import dotenv from "dotenv";

// Initialize dotenv
dotenv.config();

// ABI for the TokenForgeFactory contract with admin functions
const TOKEN_FORGE_FACTORY_ABI = [
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawFees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getTokenCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "tknToken",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "treasury",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "taxSystem",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
];

async function main() {
  // Use the deployed contract address
  const contractAddress = "0x7B0a208A773b7C2aD925Be156d8b25F8695107D9";
  console.log(`Test du contrat à l'adresse : ${contractAddress}`);

  try {
    // Create a provider for the network
    const provider = new ethers.JsonRpcProvider(
      process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia.publicnode.com"
    );

    // Create a contract instance for read-only operations
    const contract = new ethers.Contract(
      contractAddress,
      TOKEN_FORGE_FACTORY_ABI,
      provider
    );

    // Get the signer's wallet if available
    let wallet = null;
    let signerAddress = "Clé privée non disponible";
    let isOwner = false;

    try {
      if (process.env.PRIVATE_KEY) {
        // Make sure the private key has the 0x prefix
        const privateKey = process.env.PRIVATE_KEY.startsWith("0x")
          ? process.env.PRIVATE_KEY
          : `0x${process.env.PRIVATE_KEY}`;

        wallet = new ethers.Wallet(privateKey, provider);
        signerAddress = wallet.address;
      }
    } catch (error) {
      console.log("Erreur lors de la création du wallet:", error.message);
      signerAddress = "Erreur avec la clé privée";
    }

    // 1. Check contract owner
    console.log("\n1. Vérification du propriétaire");
    const owner = await contract.owner();
    console.log(`Propriétaire actuel : ${owner}`);
    console.log(`Votre adresse : ${signerAddress}`);

    if (owner.toLowerCase() === signerAddress.toLowerCase()) {
      console.log("✅ Vous êtes le propriétaire du contrat");
      isOwner = true;
    } else {
      console.log("❌ Vous n'êtes pas le propriétaire du contrat");
    }

    // 2. Check contract state
    console.log("\n2. Vérification de l'état du contrat");
    const isPaused = await contract.paused();
    console.log(`État actuel : ${isPaused ? "Pausé" : "Actif"}`);

    // 3. Check token count
    console.log("\n3. Vérification du nombre de tokens créés");
    const tokenCount = await contract.getTokenCount();
    console.log(`Nombre total de tokens créés : ${tokenCount}`);

    // 4. Check contract addresses
    console.log("\n4. Vérification des adresses associées");
    const tknTokenAddress = await contract.tknToken();
    const treasuryAddress = await contract.treasury();
    const taxSystemAddress = await contract.taxSystem();

    console.log(`Adresse du token TKN : ${tknTokenAddress}`);
    console.log(`Adresse du trésor : ${treasuryAddress}`);
    console.log(`Adresse du système de taxe : ${taxSystemAddress}`);

    // 5. Test admin functions if user is owner and has a wallet
    if (isOwner && wallet) {
      console.log("\n5. Test des fonctions d'administration");

      // Create a contract instance with the signer
      const contractWithSigner = new ethers.Contract(
        contractAddress,
        TOKEN_FORGE_FACTORY_ABI,
        wallet
      );

      // Check current pause state
      const currentPauseState = await contract.paused();
      console.log(`État actuel : ${currentPauseState ? "Pausé" : "Actif"}`);

      console.log(
        "\nPour exécuter des fonctions d'administration (pause, unpause, withdrawFees),"
      );
      console.log(
        "vous devez utiliser un script séparé avec des confirmations de transaction."
      );
      console.log(
        "Ces opérations modifient l'état de la blockchain et nécessitent des frais de gaz."
      );
    }
  } catch (error) {
    console.error("Erreur lors des tests:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
