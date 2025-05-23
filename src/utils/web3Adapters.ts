import { formatUnits, parseUnits } from "viem";
import { ethers } from "ethers";
import type { BigNumberish } from "ethers";

/**
 * Adaptateurs pour la compatibilité entre les différentes bibliothèques Web3
 */

/**
 * Convertit une valeur pour l'affichage
 */
export const formatValue = (value: bigint | BigNumberish): string => {
  if (typeof value === "bigint") {
    // Utilisez directement formatUnits pour les bigint avec viem
    return formatUnits(value, 18);
  }
  // Pour ethers, utilisez formatUnits
  return ethers.formatUnits(value, 18);
};

/**
 * Parse une chaîne en valeur bigint
 */
export const parseValue = (value: string): bigint => {
  // Utilisez parseUnits de viem pour convertir une chaîne en bigint
  return parseUnits(value, 18);
};

/**
 * Compare deux valeurs (bigint ou BigNumber) avec un opérateur spécifié
 * @param value1 Première valeur à comparer
 * @param value2 Deuxième valeur à comparer
 * @param operator Opérateur de comparaison ('>', '<', '>=', '<=', '==')
 * @returns boolean Résultat de la comparaison
 */
export const compareValues = (
  value1: bigint | BigNumberish,
  value2: bigint | BigNumberish,
  operator: ">" | "<" | ">=" | "<=" | "==" = ">"
): boolean => {
  // Convertir les BigNumber en bigint si nécessaire
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
 * @throws {Error} Si la valeur est négative
 */
export const toHexString = (value: bigint): `0x${string}` => {
  if (value < 0n) {
    throw new Error("Cannot convert negative bigint to hex string");
  }
  return `0x${value.toString(16)}` as `0x${string}`;
};
