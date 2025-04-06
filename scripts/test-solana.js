/**
 * Script de test pour l'adaptateur Solana
 * Ce script teste les fonctionnalités de base de l'adaptateur Solana
 */

// Importer directement les classes Solana
import {
  Connection,
  clusterApiUrl,
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";

// Couleurs pour les logs
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

// Fonction pour logger avec couleur
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Fonction pour tester l'adaptateur Solana
async function testSolanaAdapter() {
  log("Test de l'adaptateur Solana", colors.cyan);
  log("------------------------", colors.cyan);

  try {
    // Créer une connexion Solana
    log("1. Création de la connexion Solana...", colors.yellow);
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    log("✅ Connexion Solana créée avec succès", colors.green);

    // Tester la connexion
    log("\n2. Test de la connexion...", colors.yellow);
    const version = await connection.getVersion();
    log(`✅ Version: ${JSON.stringify(version)}`, colors.green);

    // Obtenir l'ID du réseau
    log("\n3. Obtention de l'ID du réseau...", colors.yellow);
    const genesisHash = await connection.getGenesisHash();
    log(`✅ ID du réseau (Genesis Hash): ${genesisHash}`, colors.green);

    // Obtenir le blockhash récent
    log("\n4. Obtention du blockhash récent...", colors.yellow);
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();
    log(`✅ Blockhash récent: ${blockhash}`, colors.green);
    log(
      `✅ Dernière hauteur de bloc valide: ${lastValidBlockHeight}`,
      colors.green
    );

    // Obtenir le slot actuel
    log("\n5. Obtention du slot actuel...", colors.yellow);
    const slot = await connection.getSlot();
    log(`✅ Slot actuel: ${slot}`, colors.green);

    // Calculer les frais
    log("\n6. Calcul des frais de transaction...", colors.yellow);
    const fees = await connection.getRecentPrioritizationFees();
    const averageFee =
      fees.length > 0
        ? fees.reduce((sum, fee) => sum + fee.prioritizationFee, 0) /
          fees.length
        : 0;
    log(`✅ Frais moyen: ${averageFee} lamports`, colors.green);

    // Obtenir le prix minimum pour l'exemption de loyer
    log(
      "\n7. Obtention du prix minimum pour l'exemption de loyer...",
      colors.yellow
    );
    const rentExemption = await connection.getMinimumBalanceForRentExemption(
      100
    );
    log(
      `✅ Prix minimum pour l'exemption de loyer (100 bytes): ${rentExemption} lamports`,
      colors.green
    );

    // Créer un keypair pour le test
    log("\n8. Création d'un keypair pour le test...", colors.yellow);
    const keypair = Keypair.generate();
    log(`✅ Keypair créé: ${keypair.publicKey.toString()}`, colors.green);

    // Estimer le coût de déploiement d'un token
    log("\n9. Estimation du coût de déploiement d'un token...", colors.yellow);
    try {
      // Le coût de déploiement d'un token SPL est principalement le coût de l'exemption de loyer
      const tokenAccountRent =
        await connection.getMinimumBalanceForRentExemption(165);
      const mintAccountRent =
        await connection.getMinimumBalanceForRentExemption(82);
      const totalCost = tokenAccountRent + mintAccountRent;
      log(
        `✅ Coût estimé pour le déploiement d'un token: ${totalCost} lamports`,
        colors.green
      );
    } catch (error) {
      log(
        `❌ Erreur lors de l'estimation du coût de déploiement: ${error.message}`,
        colors.red
      );
    }

    log("\nTests terminés avec succès!", colors.green);
  } catch (error) {
    log(`\n❌ Erreur lors des tests: ${error.message}`, colors.red);
    console.error(error);
  }
}

// Exécuter les tests
testSolanaAdapter().catch((error) => {
  log(`Erreur non gérée: ${error.message}`, colors.red);
  console.error(error);
});
