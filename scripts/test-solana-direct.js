/**
 * Script de test direct pour l'adaptateur Solana
 * Ce script teste les fonctionnalités de base de l'adaptateur Solana en important directement les classes
 */

import { SolanaBlockchainService, SolanaPaymentService, SolanaTokenService } from '../src/blockchain/adapters/solana.js';

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
  log('Test direct de l\'adaptateur Solana', colors.cyan);
  log('-------------------------------', colors.cyan);

  try {
    // Créer un service blockchain Solana
    log('1. Création du service blockchain Solana...', colors.yellow);
    const solanaService = new SolanaBlockchainService();
    log('✅ Service blockchain Solana créé avec succès', colors.green);

    // Tester la connexion
    log('\n2. Test de la connexion...', colors.yellow);
    const isConnected = await solanaService.isConnected();
    log(`✅ Connexion: ${isConnected ? 'OK' : 'NON'}`, isConnected ? colors.green : colors.red);

    // Obtenir l'ID du réseau
    log('\n3. Obtention de l\'ID du réseau...', colors.yellow);
    const networkId = await solanaService.getNetworkId();
    log(`✅ ID du réseau: ${networkId}`, colors.green);

    // Créer un service de paiement Solana
    log('\n4. Création du service de paiement Solana...', colors.yellow);
    const paymentService = new SolanaPaymentService();
    log('✅ Service de paiement Solana créé avec succès', colors.green);

    // Calculer les frais
    log('\n5. Calcul des frais...', colors.yellow);
    const fees = await paymentService.calculateFees(1000000000n);
    log(`✅ Frais: ${fees} lamports`, colors.green);

    // Créer un service de token Solana
    log('\n6. Création du service de token Solana...', colors.yellow);
    const tokenService = new SolanaTokenService();
    log('✅ Service de token Solana créé avec succès', colors.green);

    // Valider une configuration de token
    log('\n7. Validation d\'une configuration de token...', colors.yellow);
    const tokenConfig = {
      name: 'Test Token',
      symbol: 'TEST',
      decimals: 9,
      initialSupply: 1000000
    };
    const validationResult = tokenService.validateTokenConfig(tokenConfig);
    log(`✅ Validation: ${validationResult.valid ? 'OK' : 'NON'}`, validationResult.valid ? colors.green : colors.red);
    if (!validationResult.valid) {
      log(`Erreurs: ${validationResult.errors.join(', ')}`, colors.red);
    }

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
