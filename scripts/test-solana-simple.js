/**
 * Script de test simple pour l'adaptateur Solana
 * Ce script teste les fonctionnalités de base de l'adaptateur Solana
 */

// Importer directement les classes Solana
import { Connection, clusterApiUrl } from '@solana/web3.js';

// Couleurs pour les logs
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Fonction pour logger avec couleur
function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

// Fonction pour tester l'adaptateur Solana
async function testSolanaAdapter() {
    log('Test simple de l\'adaptateur Solana', colors.cyan);
    log('--------------------------------', colors.cyan);

    try {
        // Créer une connexion Solana
        log('1. Création de la connexion Solana...', colors.yellow);
        const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
        log('✅ Connexion Solana créée avec succès', colors.green);

        // Tester la connexion
        log('\n2. Test de la connexion...', colors.yellow);
        const version = await connection.getVersion();
        log(`✅ Version: ${JSON.stringify(version)}`, colors.green);

        // Obtenir le slot actuel
        log('\n3. Obtention du slot actuel...', colors.yellow);
        const slot = await connection.getSlot();
        log(`✅ Slot actuel: ${slot}`, colors.green);

        // Obtenir le blockhash récent
        log('\n4. Obtention du blockhash récent...', colors.yellow);
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        log(`✅ Blockhash récent: ${blockhash}`, colors.green);
        log(`✅ Dernière hauteur de bloc valide: ${lastValidBlockHeight}`, colors.green);

        // Obtenir le prix minimum pour l'exemption de loyer
        log('\n5. Obtention du prix minimum pour l\'exemption de loyer...', colors.yellow);
        const rentExemption = await connection.getMinimumBalanceForRentExemption(100);
        log(`✅ Prix minimum pour l'exemption de loyer (100 bytes): ${rentExemption} lamports`, colors.green);

        log('\nTests terminés avec succès!', colors.green);
    } catch (error) {
        log(`\n❌ Erreur lors des tests: ${error.message}`, colors.red);
        console.error(error);
    }
}

// Exécuter les tests
testSolanaAdapter().catch(error => {
    log(`Erreur non gérée: ${error.message}`, colors.red);
    console.error(error);
});
