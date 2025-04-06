import { parseEther } from "ethers";

// Taux de taxe
export const BASE_TAX_RATE = 50n; // 0.5%
export const MAX_ADDITIONAL_TAX_RATE = 150n; // 1.5%

// Montants de tokens pour les tests
export const INITIAL_SUPPLY = parseEther("1000000"); // 1M tokens
export const MAX_TX_AMOUNT = parseEther("10000"); // 1% du supply total
export const MAX_WALLET_SIZE = parseEther("20000"); // 2% du supply total

// Paramètres de test
export const TEST_TOKEN_PARAMS = {
  name: "Test Token",
  symbol: "TEST",
  decimals: 18,
  totalSupply: INITIAL_SUPPLY,
  maxTxAmount: MAX_TX_AMOUNT,
  maxWalletSize: MAX_WALLET_SIZE,
  additionalTaxRate: 100, // 1%
};
