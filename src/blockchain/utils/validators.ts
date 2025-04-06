import { isAddress } from "viem";
import { TokenConfig } from "../types";

/**
 * Utilitaires de validation pour les adresses et configurations blockchain
 */

/**
 * Valide une adresse Ethereum/EVM
 * @param address Adresse à valider
 * @returns true si l'adresse est valide, false sinon
 */
export const validateEvmAddress = (address: string): boolean => {
  return isAddress(address);
};

/**
 * Valide une adresse Solana
 * @param address Adresse à valider
 * @returns true si l'adresse est valide, false sinon
 */
export const validateSolanaAddress = (address: string): boolean => {
  // Adresse Solana: 44 caractères, base58
  const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{44}$/;
  return solanaAddressRegex.test(address);
};

/**
 * Valide une adresse en fonction de la blockchain
 * @param address Adresse à valider
 * @param chainName Nom de la blockchain
 * @returns true si l'adresse est valide, false sinon
 */
export const validateAddress = (
  address: string,
  chainName: string
): boolean => {
  if (chainName.toLowerCase() === "solana") {
    return validateSolanaAddress(address);
  }
  return validateEvmAddress(address);
};

/**
 * Valide une configuration de token
 * @param config Configuration du token
 * @returns Objet contenant le résultat de la validation et les erreurs éventuelles
 */
export const validateTokenConfig = (
  config: TokenConfig
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validation du nom
  if (!config.name) {
    errors.push("Token name is required");
  } else if (config.name.length < 1 || config.name.length > 50) {
    errors.push("Token name must be between 1 and 50 characters");
  }

  // Validation du symbole
  if (!config.symbol) {
    errors.push("Token symbol is required");
  } else if (config.symbol.length < 1 || config.symbol.length > 10) {
    errors.push("Token symbol must be between 1 and 10 characters");
  }

  // Validation des décimales
  if (config.decimals === undefined) {
    errors.push("Token decimals are required");
  } else if (config.decimals < 0 || config.decimals > 18) {
    errors.push("Token decimals must be between 0 and 18");
  }

  // Validation de l'offre initiale
  if (config.initialSupply === undefined) {
    errors.push("Initial supply is required");
  } else if (
    typeof config.initialSupply === "number" &&
    config.initialSupply <= 0
  ) {
    errors.push("Initial supply must be greater than 0");
  }

  // Validation de l'offre maximale si définie
  if (config.maxSupply !== undefined) {
    if (typeof config.maxSupply === "number" && config.maxSupply <= 0) {
      errors.push("Max supply must be greater than 0");
    }
    if (
      (typeof config.initialSupply === "number" &&
        typeof config.maxSupply === "number" &&
        config.initialSupply > config.maxSupply) ||
      (typeof config.initialSupply === "bigint" &&
        typeof config.maxSupply === "bigint" &&
        config.initialSupply > config.maxSupply)
    ) {
      errors.push("Initial supply cannot be greater than max supply");
    }
  }

  // Validation des configurations anti-whale si activées
  if (config.antiWhale?.enabled) {
    if (config.antiWhale.maxTransferPercent !== undefined) {
      if (
        config.antiWhale.maxTransferPercent <= 0 ||
        config.antiWhale.maxTransferPercent > 100
      ) {
        errors.push("Max transfer percent must be between 0 and 100");
      }
    }
  }

  // Validation des configurations de taxe si activées
  if (config.taxable?.enabled) {
    if (config.taxable.buyTaxPercent !== undefined) {
      if (
        config.taxable.buyTaxPercent < 0 ||
        config.taxable.buyTaxPercent > 25
      ) {
        errors.push("Buy tax percent must be between 0 and 25");
      }
    }
    if (config.taxable.sellTaxPercent !== undefined) {
      if (
        config.taxable.sellTaxPercent < 0 ||
        config.taxable.sellTaxPercent > 25
      ) {
        errors.push("Sell tax percent must be between 0 and 25");
      }
    }
    if (config.taxable.transferTaxPercent !== undefined) {
      if (
        config.taxable.transferTaxPercent < 0 ||
        config.taxable.transferTaxPercent > 25
      ) {
        errors.push("Transfer tax percent must be between 0 and 25");
      }
    }
    if (config.taxable.taxRecipient !== undefined) {
      if (!validateEvmAddress(config.taxable.taxRecipient)) {
        errors.push("Tax recipient address is invalid");
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
