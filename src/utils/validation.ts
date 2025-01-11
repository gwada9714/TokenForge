/**
 * Validates if a string represents a positive number
 * @param amount The string to validate
 * @returns true if the string represents a positive number
 */
export const validatePositiveNumber = (amount: string): boolean => {
  if (!amount || amount.trim() === '') {
    return false;
  }

  // Remove any commas from the number
  const cleanAmount = amount.replace(/,/g, '');

  // First try as integer
  try {
    const num = BigInt(cleanAmount);
    return num >= BigInt(0);
  } catch {
    // If it's not a valid BigInt, try as decimal
    return /^\d+(\.\d+)?$/.test(cleanAmount) && parseFloat(cleanAmount) >= 0;
  }
};

/**
 * Validates if a string represents a valid Ethereum address
 * @param address The address to validate
 * @returns true if the address is valid
 */
export const validateAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Validates if a URI is valid
 * @param uri The URI to validate
 * @returns true if the URI is valid
 */
export const validateURI = (uri: string): boolean => {
  if (!uri) return true; // Empty URI is valid
  try {
    new URL(uri);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validates if a number is within a range
 * @param value The value to validate
 * @param min The minimum allowed value
 * @param max The maximum allowed value
 * @returns true if the value is within range
 */
export const validateRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};
