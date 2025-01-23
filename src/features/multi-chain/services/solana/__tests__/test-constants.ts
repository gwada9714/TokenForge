import { PublicKey } from '@solana/web3.js';

export const TEST_VALUES = {
  PROGRAM_ID: new PublicKey('11111111111111111111111111111111'),
  RECEIVER: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'), // USDC mint address
  // Une signature valide fait 88 caractères en base58
  MOCK_TX_SIG: '5KtPn1KKiRP8HHZP5yk4KvqrwAwZqMwFJRAHiSyNr4yzHcXgwjB5CGxrxvt1RzxKtGHhKqQAPvzwxGfRr6ZsVweE'
} as const;
