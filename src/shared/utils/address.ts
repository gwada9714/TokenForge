/**
 * Utility functions for Ethereum addresses
 */

/**
 * Shortens an Ethereum address for display
 * @param address The full Ethereum address
 * @param chars The number of characters to show at the beginning and end (default: 4)
 * @returns The shortened address (e.g., 0x1234...5678)
 */
export const shortenAddress = (address: string, chars = 4): string => {
  if (!address) return '';
  if (address.length < chars * 2 + 2) return address;
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
};

/**
 * Validates if a string is a valid Ethereum address
 * @param address The address to validate
 * @returns True if the address is valid, false otherwise
 */
export const isValidAddress = (address: string): boolean => {
  if (!address) return false;
  // Basic Ethereum address validation (0x followed by 40 hex characters)
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Checks if an address is a contract address
 * @param address The address to check
 * @param provider The web3 provider
 * @returns A promise that resolves to true if the address is a contract, false otherwise
 */
// Define a minimal interface for the provider
interface Web3Provider {
  getCode: (address: string) => Promise<string>;
}

export const isContractAddress = async (
  address: string,
  provider: Web3Provider
): Promise<boolean> => {
  try {
    const code = await provider.getCode(address);
    // If the code is more than '0x', it's a contract
    return code !== '0x';
  } catch (error) {
    console.error('Error checking if address is contract:', error);
    return false;
  }
};

/**
 * Formats an address with an ENS name if available
 * @param address The Ethereum address
 * @param ensName The ENS name (if available)
 * @returns The formatted address (ENS name or shortened address)
 */
export const formatAddressOrEns = (
  address: string,
  ensName?: string | null
): string => {
  if (ensName) return ensName;
  return shortenAddress(address);
};

/**
 * Checks if two addresses are the same (case-insensitive)
 * @param address1 The first address
 * @param address2 The second address
 * @returns True if the addresses are the same, false otherwise
 */
export const isSameAddress = (
  address1: string,
  address2: string
): boolean => {
  if (!address1 || !address2) return false;
  return address1.toLowerCase() === address2.toLowerCase();
};
