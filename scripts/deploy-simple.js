import {
  createPublicClient,
  createWalletClient,
  http,
  parseUnits,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger et vérifier le .env
const envPath = path.resolve(__dirname, "../.env");
console.log("Chemin du fichier .env:", envPath);
console.log("Le fichier .env existe:", fs.existsSync(envPath));

try {
  dotenv.config({ path: envPath });
} catch (error) {
  console.error("Erreur lors du chargement du .env:", error);
  process.exit(1);
}

// Charger le bytecode et l'ABI depuis le fichier compiled.json
const compiledPath = path.join(__dirname, "../src/contracts/compiled.json");
const compiled = JSON.parse(fs.readFileSync(compiledPath, "utf8"));
const CONTRACT_BYTECODE = compiled.bytecode;
const customERC20ABI = compiled.abi;

console.log("PRIVATE_KEY est défini:", !!process.env.PRIVATE_KEY);

if (!process.env.PRIVATE_KEY) {
  throw new Error("Please set your PRIVATE_KEY in the .env file");
}

async function main() {
  // Créer le compte à partir de la clé privée
  const account = privateKeyToAccount(process.env.PRIVATE_KEY);

  // Créer les clients viem avec Alchemy
  const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
  if (!ALCHEMY_API_KEY) {
    throw new Error("Please set your ALCHEMY_API_KEY in the .env file");
  }
  const transport = http(
    `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  );

  const publicClient = createPublicClient({
    chain: sepolia,
    transport,
  });

  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport,
  });

  // Configuration du token de test
  const name = "Test Token";
  const symbol = "TEST";
  const decimals = 18;
  const initialSupply = parseUnits("1000000", decimals);
  const mintable = true;
  const burnable = true;
  const pausable = true;
  const permit = false;
  const votes = false;

  console.log("Déploiement du token de test...");
  console.log("Configuration:", {
    name,
    symbol,
    decimals,
    initialSupply: initialSupply.toString(),
    mintable,
    burnable,
    pausable,
    permit,
    votes,
  });

  try {
    // Déployer le contrat
    const hash = await walletClient.deployContract({
      abi: customERC20ABI,
      bytecode: CONTRACT_BYTECODE,
      args: [
        name,
        symbol,
        decimals,
        initialSupply,
        mintable,
        burnable,
        pausable,
        permit,
        votes,
      ],
      chain: sepolia,
    });

    console.log("Transaction hash:", hash);

    // Attendre la confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (!receipt.contractAddress) {
      throw new Error("Contract address not found in receipt");
    }

    console.log("Token déployé avec succès !");
    console.log("Adresse du contrat:", receipt.contractAddress);
    console.log("Hash de la transaction:", hash);
    console.log("Numéro du bloc:", receipt.blockNumber);
  } catch (error) {
    console.error("Erreur lors du déploiement:", error);
  }
}

main().catch(console.error);
