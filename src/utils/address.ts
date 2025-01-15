import { ethers } from "ethers";

/**
 * Valide une adresse Ethereum
 * @param address Adresse à valider
 * @returns boolean
 */
export const validateAddress = (address: string): boolean => {
  try {
    return ethers.utils.isAddress(address);
  } catch {
    return false;
  }
};

/**
 * Raccourcit une adresse Ethereum pour l'affichage
 * @param address Adresse à raccourcir
 * @returns string Format: 0x1234...5678
 */
export const shortenAddress = (address: string): string => {
  if (!validateAddress(address)) {
    throw new Error("Format d'adresse invalide");
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Retourne l'adresse avec checksum
 * @param address Adresse à convertir
 * @returns string Adresse avec checksum
 */
export const checksumAddress = (address: string): string => {
  if (!validateAddress(address)) {
    throw new Error("Format d'adresse invalide");
  }
  return ethers.utils.getAddress(address);
};