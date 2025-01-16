/**
 * Tronque une adresse Ethereum pour l'affichage
 * @param address L'adresse complète
 * @param startLength Nombre de caractères au début (défaut: 6)
 * @param endLength Nombre de caractères à la fin (défaut: 4)
 */
export const truncateAddress = (address: string, startLength = 6, endLength = 4): string => {
  if (!address) return '';
  if (address.length <= startLength + endLength) return address;
  
  const start = address.slice(0, startLength);
  const end = address.slice(-endLength);
  
  return `${start}...${end}`;
};

/**
 * Formate un montant avec le bon nombre de décimales
 * @param amount Le montant à formater
 * @param decimals Le nombre de décimales
 */
export const formatAmount = (amount: string, decimals: number): string => {
  const num = parseFloat(amount);
  if (isNaN(num)) return '0';
  return num.toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};

/**
 * Formate un nombre
 * @param value La valeur à formater
 * @param decimals Le nombre de décimales (défaut: 2)
 */
export const formatNumber = (value: string | number, decimals = 2): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';
  
  if (num > 1000000000) {
    return (num / 1000000000).toFixed(decimals) + 'B';
  } else if (num > 1000000) {
    return (num / 1000000).toFixed(decimals) + 'M';
  } else if (num > 1000) {
    return (num / 1000).toFixed(decimals) + 'K';
  }
  
  return num.toFixed(decimals);
};

/**
 * Formate une date en format local
 * @param date La date à formater
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Raccourcit une adresse
 * @param address L'adresse à raccourcir
 */
export const shortenAddress = (address: string): string => {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};