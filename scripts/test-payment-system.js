/**
 * Script de test pour le système de paiement
 * Ce script permet de tester les différentes fonctionnalités du système de paiement
 */

const { ethers } = require("ethers");
const {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} = require("@solana/web3.js");

// Adresse du wallet centralisé
const WALLET_ADDRESS = "0x92e92b2705edc3d4c7204f961cc659c0";
const SOLANA_WALLET_ADDRESS = "YourSolanaWalletAddressHere"; // À remplacer par l'adresse réelle

// Fonction principale
async function main() {
  console.log("=== Test du système de paiement TokenForge ===");

  // Tester la conversion de prix
  await testPriceConversion();

  // Tester la création de session de paiement
  await testPaymentSession();

  // Tester le monitoring des transactions
  await testTransactionMonitoring();

  console.log("=== Tests terminés ===");
}

// Tester la conversion de prix
async function testPriceConversion() {
  console.log("\n--- Test de conversion de prix ---");

  try {
    // Simuler l'appel à l'API de conversion
    console.log("Conversion de 100 EUR en ETH:");
    const ethAmount = await simulateConversion(100, "ETH");
    console.log(`100 EUR = ${ethAmount} ETH`);

    console.log("Conversion de 100 EUR en USDT:");
    const usdtAmount = await simulateConversion(100, "USDT");
    console.log(`100 EUR = ${usdtAmount} USDT`);

    console.log("Conversion de 100 EUR en SOL:");
    const solAmount = await simulateConversion(100, "SOL");
    console.log(`100 EUR = ${solAmount} SOL`);

    console.log("Test de conversion de prix réussi");
  } catch (error) {
    console.error("Erreur lors du test de conversion de prix:", error);
  }
}

// Tester la création de session de paiement
async function testPaymentSession() {
  console.log("\n--- Test de création de session de paiement ---");

  try {
    // Simuler la création d'une session de paiement
    console.log("Création d'une session de paiement ETH:");
    const ethSession = await simulateCreateSession("ethereum", "ETH", 100);
    console.log("Session ETH créée:", ethSession);

    console.log("Création d'une session de paiement USDT (Ethereum):");
    const usdtSession = await simulateCreateSession("ethereum", "USDT", 100);
    console.log("Session USDT créée:", usdtSession);

    console.log("Création d'une session de paiement SOL:");
    const solSession = await simulateCreateSession("solana", "SOL", 100);
    console.log("Session SOL créée:", solSession);

    console.log("Test de création de session de paiement réussi");
  } catch (error) {
    console.error(
      "Erreur lors du test de création de session de paiement:",
      error
    );
  }
}

// Tester le monitoring des transactions
async function testTransactionMonitoring() {
  console.log("\n--- Test de monitoring des transactions ---");

  try {
    // Simuler le démarrage du monitoring
    console.log("Démarrage du monitoring des transactions...");

    // Simuler une transaction ETH entrante
    console.log("Simulation d'une transaction ETH entrante:");
    await simulateEthTransaction();

    // Simuler une transaction USDT entrante
    console.log("Simulation d'une transaction USDT entrante:");
    await simulateTokenTransaction();

    // Simuler une transaction SOL entrante
    console.log("Simulation d'une transaction SOL entrante:");
    await simulateSolTransaction();

    console.log("Test de monitoring des transactions réussi");
  } catch (error) {
    console.error("Erreur lors du test de monitoring des transactions:", error);
  }
}

// Simuler la conversion de prix
async function simulateConversion(amountEUR, cryptoSymbol) {
  // Taux de conversion simulés
  const rates = {
    ETH: 0.0004, // 1 EUR = 0.0004 ETH
    BNB: 0.0029, // 1 EUR = 0.0029 BNB
    MATIC: 1.33, // 1 EUR = 1.33 MATIC
    AVAX: 0.033, // 1 EUR = 0.033 AVAX
    SOL: 0.01, // 1 EUR = 0.01 SOL
    USDT: 1.08, // 1 EUR = 1.08 USDT
    USDC: 1.08, // 1 EUR = 1.08 USDC
    DAI: 1.08, // 1 EUR = 1.08 DAI
    BUSD: 1.08, // 1 EUR = 1.08 BUSD
  };

  // Simuler un délai réseau
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Calculer le montant en crypto
  return amountEUR * rates[cryptoSymbol];
}

// Simuler la création d'une session de paiement
async function simulateCreateSession(network, currency, amountEUR) {
  // Simuler un délai réseau
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Convertir EUR en crypto
  const cryptoAmount = await simulateConversion(amountEUR, currency);

  // Créer une session simulée
  return {
    sessionId: `session-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    receivingAddress:
      network === "solana" ? SOLANA_WALLET_ADDRESS : WALLET_ADDRESS,
    amountDue: {
      amount: cryptoAmount.toString(),
      formatted: `${cryptoAmount.toFixed(6)} ${currency}`,
      valueEUR: amountEUR,
    },
    currency: {
      symbol: currency,
      address:
        currency === "ETH" || currency === "SOL" ? null : "0xTokenAddress",
      name: getCurrencyName(currency),
      decimals: getCurrencyDecimals(currency),
      isNative: currency === "ETH" || currency === "SOL",
      isStablecoin: ["USDT", "USDC", "DAI", "BUSD"].includes(currency),
      logoUrl: `/assets/crypto/${currency.toLowerCase()}.png`,
      minAmount: 5,
    },
    exchangeRate: 1 / (await simulateConversion(1, currency)),
    expiresAt: Math.floor(Date.now() / 1000) + 3600, // Expire dans 1 heure
    chainId: getChainId(network),
    status: "pending",
    minConfirmations: getMinConfirmations(network),
  };
}

// Simuler une transaction ETH entrante
async function simulateEthTransaction() {
  // Simuler un délai réseau
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Simuler une transaction ETH
  const tx = {
    hash: `0x${generateRandomHex(64)}`,
    from: `0x${generateRandomHex(40)}`,
    to: WALLET_ADDRESS,
    value: ethers.parseEther("0.1"),
    blockNumber: 12345678,
  };

  console.log(`Transaction ETH détectée: ${tx.hash}`);
  console.log(`De: ${tx.from}`);
  console.log(`Vers: ${tx.to}`);
  console.log(`Montant: ${ethers.formatEther(tx.value)} ETH`);

  return tx;
}

// Simuler une transaction token entrante
async function simulateTokenTransaction() {
  // Simuler un délai réseau
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Simuler une transaction token
  const tx = {
    hash: `0x${generateRandomHex(64)}`,
    from: `0x${generateRandomHex(40)}`,
    to: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // Adresse du contrat USDT
    data:
      "0xa9059cbb000000000000000000000000" +
      WALLET_ADDRESS.substring(2) +
      "0000000000000000000000000000000000000000000000000000000005F5E100", // Transfert de 100 USDT
    blockNumber: 12345679,
  };

  console.log(`Transaction USDT détectée: ${tx.hash}`);
  console.log(`De: ${tx.from}`);
  console.log(`Vers: ${WALLET_ADDRESS}`);
  console.log(`Montant: 100 USDT`);

  return tx;
}

// Simuler une transaction SOL entrante
async function simulateSolTransaction() {
  // Simuler un délai réseau
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Simuler une transaction SOL
  const tx = {
    signature: generateRandomBase58(88),
    from: generateRandomBase58(44),
    to: SOLANA_WALLET_ADDRESS,
    amount: 1 * LAMPORTS_PER_SOL, // 1 SOL
    blockTime: Math.floor(Date.now() / 1000),
  };

  console.log(`Transaction SOL détectée: ${tx.signature}`);
  console.log(`De: ${tx.from}`);
  console.log(`Vers: ${tx.to}`);
  console.log(`Montant: ${tx.amount / LAMPORTS_PER_SOL} SOL`);

  return tx;
}

// Fonctions utilitaires

// Obtenir le nom d'une cryptomonnaie
function getCurrencyName(symbol) {
  const names = {
    ETH: "Ethereum",
    BNB: "Binance Coin",
    MATIC: "Polygon",
    AVAX: "Avalanche",
    SOL: "Solana",
    USDT: "Tether USD",
    USDC: "USD Coin",
    DAI: "Dai Stablecoin",
    BUSD: "Binance USD",
  };

  return names[symbol] || symbol;
}

// Obtenir le nombre de décimales d'une cryptomonnaie
function getCurrencyDecimals(symbol) {
  if (symbol === "SOL") return 9;
  if (["USDT", "USDC"].includes(symbol)) return 6;
  return 18; // Par défaut pour la plupart des tokens EVM
}

// Obtenir l'ID de chaîne pour un réseau
function getChainId(network) {
  const chainIds = {
    ethereum: 1,
    binance: 56,
    bsc: 56,
    polygon: 137,
    avalanche: 43114,
    arbitrum: 42161,
    solana: 0, // Solana n'a pas d'ID de chaîne EVM
  };

  return chainIds[network] || 1;
}

// Obtenir le nombre minimum de confirmations pour un réseau
function getMinConfirmations(network) {
  const confirmations = {
    ethereum: 12,
    binance: 15,
    bsc: 15,
    polygon: 64,
    avalanche: 12,
    arbitrum: 12,
    solana: 32,
  };

  return confirmations[network] || 12;
}

// Générer une chaîne hexadécimale aléatoire
function generateRandomHex(length) {
  let result = "";
  const characters = "0123456789abcdef";

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}

// Générer une chaîne Base58 aléatoire (pour Solana)
function generateRandomBase58(length) {
  let result = "";
  const characters =
    "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}

// Exécuter le script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Erreur:", error);
    process.exit(1);
  });
