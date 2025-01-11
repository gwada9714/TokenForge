import { Address, isAddress } from 'viem';
import { TokenBaseConfig, TokenAdvancedConfig } from '../types/tokens';
import { TEST_WALLET_ADDRESS } from '../config/constants';

export interface ValidationError {
  field: string;
  message: string;
}

export const validateAddress = (address: string): boolean => {
  if (!address) return false;
  return isAddress(address);
};

export const validateBaseConfig = (config: TokenBaseConfig): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!config.name) {
    errors.push({
      field: 'name',
      message: 'Token name is required'
    });
  }

  if (!config.symbol) {
    errors.push({
      field: 'symbol',
      message: 'Token symbol is required'
    });
  } else if (!/^[A-Z0-9]+$/.test(config.symbol)) {
    errors.push({
      field: 'symbol',
      message: 'Symbol must contain only uppercase letters and numbers'
    });
  }

  if (config.decimals < 0 || config.decimals > 18) {
    errors.push({
      field: 'decimals',
      message: 'Decimals must be between 0 and 18'
    });
  }

  if (!config.initialSupply || parseFloat(config.initialSupply) <= 0) {
    errors.push({
      field: 'initialSupply',
      message: 'Initial supply must be greater than 0'
    });
  }

  return errors;
};

export const validateAdvancedConfig = (config: TokenAdvancedConfig): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (config.asset && !validateAddress(config.asset)) {
    errors.push({
      field: 'asset',
      message: 'Invalid asset address'
    });
  }

  if (config.maxSupply && parseFloat(config.maxSupply) <= 0) {
    errors.push({
      field: 'maxSupply',
      message: 'Max supply must be greater than 0'
    });
  }

  if (config.depositLimit && parseFloat(config.depositLimit) <= 0) {
    errors.push({
      field: 'depositLimit',
      message: 'Deposit limit must be greater than 0'
    });
  }

  if (config.baseURI && !config.baseURI.startsWith('http')) {
    errors.push({
      field: 'baseURI',
      message: 'Base URI must be a valid URL'
    });
  }

  return errors;
};

export const getDefaultOwner = (address?: Address): Address => {
  return address || TEST_WALLET_ADDRESS as Address;
};
