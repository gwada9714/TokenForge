import { config } from 'dotenv';
import { createPublicClient, createWalletClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { hardhat } from 'viem/chains';
import { TokenForgeFactoryABI } from '../src/abi/TokenForgeFactory';
import fs from 'fs';
import path from 'path';

// Charger les variables d'environnement
config();

async function main() {
    // Configuration addresses from .env
    const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS;
    const TAX_SYSTEM_ADDRESS = process.env.TAX_SYSTEM_ADDRESS;
    const TKN_TOKEN_ADDRESS = process.env.TKN_TOKEN_ADDRESS;
    const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
    const RPC_URL = process.env.RPC_URL || 'http://localhost:8545';
    const CHAIN_ID = parseInt(process.env.CHAIN_ID || '1');

    if (!TREASURY_ADDRESS || !TAX_SYSTEM_ADDRESS || !TKN_TOKEN_ADDRESS || !PRIVATE_KEY) {
        throw new Error("Missing required environment variables");
    }

    try {
        // Créer le compte à partir de la clé privée
        const account = privateKeyToAccount(`0x${PRIVATE_KEY}`);

        // Créer les clients viem
        const publicClient = createPublicClient({
            chain: {
                ...hardhat,
                id: CHAIN_ID,
            },
            transport: http(RPC_URL),
        });

        const walletClient = createWalletClient({
            account,
            chain: {
                ...hardhat,
                id: CHAIN_ID,
            },
            transport: http(RPC_URL),
        });

        console.log("Deploying contracts with the account:", account.address);

        // Lire le bytecode du contrat
        const contractPath = path.join(__dirname, '../artifacts/contracts/TokenForgeFactory.sol/TokenForgeFactory.json');
        const contractJson = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
        const bytecode = contractJson.bytecode;

        console.log("Deploying TokenForgeFactory with parameters:");
        console.log("TKN Token:", TKN_TOKEN_ADDRESS);
        console.log("Treasury:", TREASURY_ADDRESS);
        console.log("Tax System:", TAX_SYSTEM_ADDRESS);

        // Déployer le contrat
        const hash = await walletClient.deployContract({
            abi: TokenForgeFactoryABI.abi,
            bytecode: bytecode as `0x${string}`,
            args: [], // Le constructeur n'a pas d'arguments selon l'ABI
        });

        // Attendre la confirmation de la transaction
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        const contractAddress = receipt.contractAddress;

        if (!contractAddress) {
            throw new Error("Contract address not found in transaction receipt");
        }

        console.log("TokenForgeFactory deployed to:", contractAddress);
        console.log("Owner address:", TREASURY_ADDRESS);

        // Vérifier le contrat sur Etherscan
        if (process.env.ETHERSCAN_API_KEY) {
            console.log("Contract deployed. To verify on Etherscan, run:");
            console.log(`npx hardhat verify --network ${process.env.NETWORK} ${contractAddress} ${TKN_TOKEN_ADDRESS} ${TREASURY_ADDRESS} ${TAX_SYSTEM_ADDRESS}`);
        }

        // Sauvegarder l'adresse du contrat dans un fichier de configuration
        const deploymentInfo = {
            tokenForgeFactory: contractAddress,
            treasury: TREASURY_ADDRESS,
            taxSystem: TAX_SYSTEM_ADDRESS,
            tknToken: TKN_TOKEN_ADDRESS,
            network: process.env.NETWORK || 'unknown',
            chainId: CHAIN_ID,
            deploymentDate: new Date().toISOString(),
        };

        const deploymentPath = path.join(__dirname, '../deployment-info.json');
        fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
        console.log(`Deployment information saved to ${deploymentPath}`);

    } catch (error) {
        console.error("Deployment failed:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
