import { type Address } from "viem";
import { hexToBigInt } from "viem";

/**
 * Utilitaires de conversion pour les valeurs Web3
 */

/**
 * Convertit un bigint en bigint compatible Ethereum
 * @param value Valeur bigint à convertir
 * @returns bigint
 */
export const toHexString = (value: bigint): bigint => {
  if (value < 0n) {
    throw new Error("Cannot convert negative bigint");
  }
  return hexToBigInt(`0x${value.toString(16)}`);
};

/**
 * Convertit une chaîne hexadécimale en bigint
 * @param hex Chaîne hexadécimale avec préfixe 0x
 * @returns Valeur bigint
 */
export const fromHexString = (hex: `0x${string}`): bigint => {
  return BigInt(hex);
};

/**
 * Type guard pour vérifier si une valeur est une chaîne hexadécimale valide
 * @param value Valeur à vérifier
 * @returns boolean
 */
export const isHexString = (value: string): value is `0x${string}` => {
  return value.startsWith("0x") && /^0x[0-9a-fA-F]*$/.test(value);
};

/**
 * Normalise une adresse Ethereum
 * @param address Adresse à normaliser
 * @returns Adresse normalisée
 */
export const normalizeAddress = (address: string): Address => {
  if (!address.startsWith("0x")) {
    return `0x${address}` as Address;
  }
  return address.toLowerCase() as Address;
};
