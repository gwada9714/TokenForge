import { isAddress, getAddress } from "@ethersproject/address";

// Fonction pour valider une adresse
export const validateAddress = (address: string): boolean => {
  return isAddress(address);
};

// Fonction pour raccourcir une adresse
export const shortenAddress = (address: string): string => {
  if (!validateAddress(address)) {
    throw new Error("Format d'adresse invalide");
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Fonction pour obtenir l'adresse avec checksum
export const checksumAddress = (address: string): string => {
  try {
    return getAddress(address);
    return getAddress(address);
  } catch {
    throw new Error("Adresse invalide pour checksum");
    return getAddress(address);
  }
};
