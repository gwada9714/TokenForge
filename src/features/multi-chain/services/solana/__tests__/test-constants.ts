import { PublicKey } from '@solana/web3.js';

// Raw addresses as strings
export const PROGRAM_ID_STR = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
export const RECEIVER_STR = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
export const MOCK_TX_SIG = '5KtPn1KKiRP8HHZP5yk4KvqrwAwZqMwFJRAHiSyNr4yzHcXgwjB5CGxrxvt1RzxKtGHhKqQAPvzwxGfRr6ZsVweE';

// PublicKey instances
export const PROGRAM_ID = new PublicKey(PROGRAM_ID_STR);
export const RECEIVER = new PublicKey(RECEIVER_STR);

// Network constants
export const MOCK_ENDPOINT = 'https://api.mainnet-beta.solana.com';
export const LOCAL_ENDPOINT = 'http://localhost:8899';

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred',
  TRANSACTION_ERROR: 'Transaction failed',
  TIMEOUT_ERROR: 'Operation timed out'
} as const;
