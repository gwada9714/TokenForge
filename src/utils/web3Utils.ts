import { formatUnits, parseUnits, hexToBigInt } from "viem";
import { ethers, type BigNumberish } from "ethers";
import { type Address } from "viem";

/**
 * Utilitaires Web3 consolidés pour TokenForge
 */

/**
 * Convertit une valeur pour l'affichage avec le nombre de décimales spécifié
 */
export const formatValue = (
  value: bigint | BigNumberish,
  decimals: number = 18
): string => {
  if (typeof value === "bigint") {
    return formatUnits(value, decimals);
  }
  return ethers.formatUnits(value, decimals);
};

/**
 * Parse une chaîne en valeur bigint avec le nombre de décimales spécifié
 */
export const parseValue = (value: string, decimals: number = 18): bigint => {
  return parseUnits(value, decimals);
};

/**
 * Compare deux valeurs (bigint ou BigNumber) avec un opérateur spécifié
 */
export const compareValues = (
  value1: bigint | BigNumberish,
  value2: bigint | BigNumberish,
  operator: ">" | "<" | ">=" | "<=" | "==" = ">"
): boolean => {
  const v1 = typeof value1 === "bigint" ? value1 : BigInt(value1.toString());
  const v2 = typeof value2 === "bigint" ? value2 : BigInt(value2.toString());

  switch (operator) {
    case ">":
      return v1 > v2;
    case "<":
      return v1 < v2;
    case ">=":
      return v1 >= v2;
    case "<=":
      return v1 <= v2;
    case "==":
      return v1 === v2;
    default:
      return false;
  }
};

/**
 * Convertit une valeur bigint en chaîne hexadécimale préfixée par 0x
 */
export const toHexString = (value: bigint): `0x${string}` => {
  if (value < 0n) {
    throw new Error("Cannot convert negative bigint to hex string");
  }
  return `0x${value.toString(16)}` as `0x${string}`;
};

/**
 * Convertit une chaîne hexadécimale en bigint
 */
export const fromHexString = (hex: `0x${string}`): bigint => {
  return hexToBigInt(hex);
};

/**
 * Type guard pour vérifier si une valeur est une chaîne hexadécimale valide
 */
export const isHexString = (value: string): value is `0x${string}` => {
  return value.startsWith("0x") && /^0x[0-9a-fA-F]*$/.test(value);
};

/**
 * Normalise une adresse Ethereum
 */
export const normalizeAddress = (address: string): Address => {
  if (!address.startsWith("0x")) {
    return `0x${address}` as Address;
  }
  return address.toLowerCase() as Address;
};

/**
 * Formate un timestamp en date lisible
 */
export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString();
};

/**
 * Calcule le temps restant jusqu'à une date donnée
 */
export const calculateTimeRemaining = (targetTimestamp: number): number => {
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, targetTimestamp - now);
};
