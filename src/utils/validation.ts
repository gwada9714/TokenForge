/**
 * Utility functions for form validation
 */

/**
 * Validates if a string is a valid Ethereum address
 * @param address The address to validate
 * @returns True if the address is valid, false otherwise
 */
export const validateAddress = (address: string): boolean => {
  if (!address) return false;
  // Basic Ethereum address validation (0x followed by 40 hex characters)
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Validates if a number is positive
 * @param value The value to validate
 * @returns True if the value is a positive number, false otherwise
 */
export const validatePositiveNumber = (value: string | number): boolean => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return !isNaN(num) && num > 0;
};

/**
 * Validates if a number is within a range
 * @param value The value to validate
 * @param min The minimum value (inclusive)
 * @param max The maximum value (inclusive)
 * @returns True if the value is within the range, false otherwise
 */
export const validateNumberInRange = (
  value: string | number,
  min: number,
  max: number
): boolean => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return !isNaN(num) && num >= min && num <= max;
};

/**
 * Validates if a string is not empty
 * @param value The value to validate
 * @returns True if the value is not empty, false otherwise
 */
export const validateNotEmpty = (value: string): boolean => {
  return value !== undefined && value !== null && value.trim() !== "";
};

/**
 * Validates if a string is a valid token symbol (3-10 uppercase letters)
 * @param value The value to validate
 * @returns True if the value is a valid token symbol, false otherwise
 */
export const validateTokenSymbol = (value: string): boolean => {
  return /^[A-Z]{3,10}$/.test(value);
};

/**
 * Validates if a string is a valid token name (3-50 characters)
 * @param value The value to validate
 * @returns True if the value is a valid token name, false otherwise
 */
export const validateTokenName = (value: string): boolean => {
  return value.length >= 3 && value.length <= 50;
};
