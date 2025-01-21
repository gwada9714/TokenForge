import { createAuthError, AUTH_ERROR_CODES } from '../errors/AuthError';

const REQUIRED_CHAIN_ID = 1; // Ethereum Mainnet

class ConfigService {
  private static instance: ConfigService;

  private constructor() {}

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  public getRequiredChainId(): number {
    return REQUIRED_CHAIN_ID;
  }

  public async getCurrentChainId(): Promise<number | null> {
    if (!window.ethereum) {
      throw createAuthError(AUTH_ERROR_CODES.PROVIDER_ERROR, 'No Ethereum provider found', { error: 'Provider not available' });
    }

    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      return parseInt(chainId as string, 16);
    } catch (error) {
      throw createAuthError(AUTH_ERROR_CODES.PROVIDER_ERROR, 'Failed to get current chain ID', { error });
    }
  }
}

export const configService = ConfigService.getInstance();
