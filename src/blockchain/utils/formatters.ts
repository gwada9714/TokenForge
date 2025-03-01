import { formatUnits, parseUnits } from 'viem';

/**
 * Utilitaires pour le formatage des données blockchain
 */

/**
 * Formate un montant en wei/gwei en une valeur lisible en ETH/BNB/etc.
 * @param amount Montant en wei/gwei
 * @param decimals Nombre de décimales (par défaut 18 pour ETH)
 * @returns Montant formaté
 */
export const formatAmount = (amount: bigint, decimals: number = 18): string => {
  return formatUnits(amount, decimals);
};

/**
 * Formate un montant en ETH/BNB/etc. avec un symbole
 * @param amount Montant en wei/gwei
 * @param symbol Symbole de la crypto-monnaie
 * @param decimals Nombre de décimales (par défaut 18 pour ETH)
 * @returns Montant formaté avec symbole
 */
export const formatCurrency = (amount: bigint, symbol: string, decimals: number = 18): string => {
  const formatted = formatUnits(amount, decimals);
  return `${formatted} ${symbol}`;
};

/**
 * Convertit une valeur ETH/BNB/etc. en wei/gwei
 * @param amount Montant en ETH/BNB/etc.
 * @param decimals Nombre de décimales (par défaut 18 pour ETH)
 * @returns Montant en wei/gwei
 */
export const parseAmount = (amount: string, decimals: number = 18): bigint => {
  return parseUnits(amount, decimals);
};

/**
 * Formate une adresse blockchain pour l'affichage
 * @param address Adresse complète
 * @param startChars Nombre de caractères à afficher au début (par défaut 6)
 * @param endChars Nombre de caractères à afficher à la fin (par défaut 4)
 * @returns Adresse formatée (ex: 0x1234...5678)
 */
export const formatAddress = (address: string, startChars: number = 6, endChars: number = 4): string => {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

/**
 * Formate un hash de transaction pour l'affichage
 * @param hash Hash de transaction complet
 * @param startChars Nombre de caractères à afficher au début (par défaut 10)
 * @param endChars Nombre de caractères à afficher à la fin (par défaut 10)
 * @returns Hash formaté (ex: 0x1234567890...1234567890)
 */
export const formatTransactionHash = (hash: string, startChars: number = 10, endChars: number = 10): string => {
  if (!hash) return '';
  if (hash.length <= startChars + endChars) return hash;
  
  return `${hash.slice(0, startChars)}...${hash.slice(-endChars)}`;
};

/**
 * Formate un timestamp en date lisible
 * @param timestamp Timestamp en secondes ou millisecondes
 * @returns Date formatée
 */
export const formatTimestamp = (timestamp: number): string => {
  // Convertir en millisecondes si nécessaire
  const timestampMs = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
  const date = new Date(timestampMs);
  
  return date.toLocaleString();
};

/**
 * Formate un nombre avec séparateurs de milliers
 * @param value Nombre à formater
 * @param decimals Nombre de décimales à afficher (par défaut 2)
 * @returns Nombre formaté
 */
export const formatNumber = (value: number, decimals: number = 2): string => {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Formate un pourcentage
 * @param value Valeur du pourcentage (ex: 0.05 pour 5%)
 * @param decimals Nombre de décimales à afficher (par défaut 2)
 * @returns Pourcentage formaté
 */
export const formatPercent = (value: number, decimals: number = 2): string => {
  return `${(value * 100).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
};

/**
 * Formate un montant en fonction de sa taille
 * @param amount Montant à formater
 * @returns Montant formaté avec l'unité appropriée (K, M, B, T)
 */
export const formatLargeNumber = (amount: number): string => {
  if (amount < 1000) {
    return amount.toString();
  } else if (amount < 1000000) {
    return `${(amount / 1000).toFixed(2)}K`;
  } else if (amount < 1000000000) {
    return `${(amount / 1000000).toFixed(2)}M`;
  } else if (amount < 1000000000000) {
    return `${(amount / 1000000000).toFixed(2)}B`;
  } else {
    return `${(amount / 1000000000000).toFixed(2)}T`;
  }
};
