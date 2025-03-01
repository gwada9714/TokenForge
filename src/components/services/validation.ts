/**
 * Validation service for token creation and management
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
 * Validates token creation parameters
 * @param params The token parameters to validate
 * @returns An object with validation results
 */
export const validateTokenParams = (params: {
  name: string;
  symbol: string;
  totalSupply: string;
  decimals: string;
}): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  // Validate name
  if (!params.name || params.name.trim() === '') {
    errors.name = 'Le nom du token est requis';
  } else if (params.name.length < 3 || params.name.length > 50) {
    errors.name = 'Le nom du token doit contenir entre 3 et 50 caractères';
  }
  
  // Validate symbol
  if (!params.symbol || params.symbol.trim() === '') {
    errors.symbol = 'Le symbole du token est requis';
  } else if (!/^[A-Z]{2,10}$/.test(params.symbol)) {
    errors.symbol = 'Le symbole doit contenir entre 2 et 10 lettres majuscules';
  }
  
  // Validate total supply
  if (!params.totalSupply || params.totalSupply.trim() === '') {
    errors.totalSupply = 'L\'offre totale est requise';
  } else {
    try {
      const supply = parseFloat(params.totalSupply);
      if (isNaN(supply) || supply <= 0) {
        errors.totalSupply = 'L\'offre totale doit être un nombre positif';
      } else if (supply > 1e30) {
        errors.totalSupply = 'L\'offre totale est trop élevée';
      }
    } catch (error) {
      errors.totalSupply = 'L\'offre totale doit être un nombre valide';
    }
  }
  
  // Validate decimals
  if (!params.decimals || params.decimals.trim() === '') {
    errors.decimals = 'Les décimales sont requises';
  } else {
    try {
      const decimals = parseInt(params.decimals, 10);
      if (isNaN(decimals) || decimals < 0 || decimals > 18) {
        errors.decimals = 'Les décimales doivent être comprises entre 0 et 18';
      }
    } catch (error) {
      errors.decimals = 'Les décimales doivent être un nombre entier valide';
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates tax configuration
 * @param taxConfig The tax configuration to validate
 * @returns An object with validation results
 */
export const validateTaxConfig = (taxConfig: {
  buyTax: string;
  sellTax: string;
  transferTax: string;
  marketingWallet: string;
  developmentWallet: string;
}): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  // Validate tax percentages
  const validateTaxPercentage = (value: string, field: string) => {
    if (value === undefined || value === null || value.trim() === '') {
      errors[field] = 'Ce champ est requis';
      return;
    }
    
    try {
      const tax = parseFloat(value);
      if (isNaN(tax) || tax < 0 || tax > 25) {
        errors[field] = 'La taxe doit être comprise entre 0 et 25%';
      }
    } catch (error) {
      errors[field] = 'La taxe doit être un nombre valide';
    }
  };
  
  validateTaxPercentage(taxConfig.buyTax, 'buyTax');
  validateTaxPercentage(taxConfig.sellTax, 'sellTax');
  validateTaxPercentage(taxConfig.transferTax, 'transferTax');
  
  // Validate wallet addresses
  if (taxConfig.marketingWallet && !validateAddress(taxConfig.marketingWallet)) {
    errors.marketingWallet = 'Adresse de portefeuille marketing invalide';
  }
  
  if (taxConfig.developmentWallet && !validateAddress(taxConfig.developmentWallet)) {
    errors.developmentWallet = 'Adresse de portefeuille de développement invalide';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};
