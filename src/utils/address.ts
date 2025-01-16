import { ethers } from "ethers";
import { type Address } from 'viem';

/**
 * Valide une adresse Ethereum
 * @param address Adresse à valider
 * @returns boolean
 */
export const validateAddress = (address: string | null | undefined): boolean => {
  if (!address) return false;
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
};

/**
 * Convertit une adresse en format checksum
 * @param address Adresse à convertir
 * @returns string Adresse avec checksum
 */
export const checksumAddress = (address: string): string => {
  try {
    return ethers.getAddress(address);
  } catch {
    return address;
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
 * Formate une adresse Ethereum avec checksum
 * @param address Adresse à formater
 * @returns string Adresse avec checksum
 */
export const formatAddress = (address: string): Address => {
  if (!address) {
    throw new Error("Format d'adresse invalide: l'adresse est vide");
  }
  
  // Remove spaces and convert to lowercase
  const cleanAddress = address.trim().toLowerCase();
  
  // Add 0x prefix if missing
  const prefixedAddress = cleanAddress.startsWith('0x') ? cleanAddress : `0x${cleanAddress}`;
  
  // Validate the address format
  if (!validateAddress(prefixedAddress)) {
    throw new Error(`Format d'adresse invalide: ${address}`);
  }
  
  // Return checksummed address
  try {
    return ethers.getAddress(prefixedAddress) as Address;
  } catch (e) {
    const error = e as Error;
    throw new Error(`Erreur lors du formatage de l'adresse: ${error.message}`);
  }
};