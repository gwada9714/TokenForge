// Script pour exécuter des actions administratives sur le contrat TokenForgeFactory
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import readline from 'readline';

// Initialiser dotenv
dotenv.config();

// ABI pour les fonctions administratives du contrat TokenForgeFactory
const TOKEN_FORGE_FACTORY_ABI = [
    {
        "inputs": [],
        "name": "owner",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "pause",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "unpause",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "paused",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdrawFees",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// Créer une interface readline pour l'interaction utilisateur
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Fonction pour poser une question et attendre la réponse
function question(query) {
    return new Promise(resolve => {
        rl.question(query, resolve);
    });
}

async function main() {
    // Adresse du contrat déployé
    const contractAddress = "0x7B0a208A773b7C2aD925Be156d8b25F8695107D9";
    console.log(`Actions administratives pour le contrat à l'adresse : ${contractAddress}`);

    try {
        // Créer un provider pour le réseau
        const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia.publicnode.com');

        // Vérifier si une clé privée est disponible
        if (!process.env.PRIVATE_KEY) {
            console.error("Erreur: Aucune clé privée trouvée dans les variables d'environnement.");
            console.log("Ajoutez votre clé privée dans le fichier .env: PRIVATE_KEY=votre_clé_privée");
            process.exit(1);
        }

        // Créer un wallet avec la clé privée
        const privateKey = process.env.PRIVATE_KEY.startsWith('0x')
            ? process.env.PRIVATE_KEY
            : `0x${process.env.PRIVATE_KEY}`;

        const wallet = new ethers.Wallet(privateKey, provider);
        console.log(`Adresse du wallet: ${wallet.address}`);

        // Créer une instance du contrat avec le signer
        const contract = new ethers.Contract(contractAddress, TOKEN_FORGE_FACTORY_ABI, wallet);

        // Vérifier si l'utilisateur est le propriétaire
        const owner = await contract.owner();
        if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
            console.error("Erreur: Vous n'êtes pas le propriétaire du contrat.");
            console.log(`Propriétaire actuel: ${owner}`);
            console.log(`Votre adresse: ${wallet.address}`);
            process.exit(1);
        }

        console.log("✅ Vous êtes le propriétaire du contrat");

        // Vérifier l'état actuel du contrat
        const isPaused = await contract.paused();
        console.log(`État actuel du contrat: ${isPaused ? "Pausé" : "Actif"}`);

        // Menu des actions disponibles
        console.log("\nActions disponibles:");
        console.log("1. Mettre en pause le contrat");
        console.log("2. Réactiver le contrat");
        console.log("3. Retirer les frais");
        console.log("4. Quitter");

        const choice = await question("\nChoisissez une action (1-4): ");

        switch (choice) {
            case "1": // Pause
                if (isPaused) {
                    console.log("Le contrat est déjà en pause.");
                } else {
                    console.log("Mise en pause du contrat...");
                    const tx = await contract.pause();
                    console.log(`Transaction envoyée: ${tx.hash}`);
                    console.log("En attente de confirmation...");
                    await tx.wait();
                    console.log("✅ Contrat mis en pause avec succès!");
                }
                break;

            case "2": // Unpause
                if (!isPaused) {
                    console.log("Le contrat est déjà actif.");
                } else {
                    console.log("Réactivation du contrat...");
                    const tx = await contract.unpause();
                    console.log(`Transaction envoyée: ${tx.hash}`);
                    console.log("En attente de confirmation...");
                    await tx.wait();
                    console.log("✅ Contrat réactivé avec succès!");
                }
                break;

            case "3": // Withdraw Fees
                console.log("Retrait des frais...");
                try {
                    const tx = await contract.withdrawFees();
                    console.log(`Transaction envoyée: ${tx.hash}`);
                    console.log("En attente de confirmation...");
                    await tx.wait();
                    console.log("✅ Frais retirés avec succès!");
                } catch (error) {
                    if (error.message.includes("No fees to withdraw")) {
                        console.log("Aucun frais à retirer.");
                    } else {
                        throw error;
                    }
                }
                break;

            case "4": // Quit
                console.log("Opération annulée.");
                break;

            default:
                console.log("Option invalide.");
                break;
        }

    } catch (error) {
        console.error("Erreur lors de l'exécution de l'action:", error);
    } finally {
        rl.close();
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
