import { ethers } from "ethers";

/**
 * Valide une adresse Ethereum
 */
export const validateAddress = (address: string): boolean => {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
};

/**
 * Raccourcit une adresse Ethereum pour l'affichage
 */
export const shortenAddress = (address: string): string => {
  if (!validateAddress(address)) {
    throw new Error("Format d'adresse invalide");
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Retourne l'adresse avec checksum
 */
export const checksumAddress = (address: string): string => {
  try {
    return ethers.getAddress(address);
  } catch {
    throw new Error("Adresse invalide pour checksum");
  }
};