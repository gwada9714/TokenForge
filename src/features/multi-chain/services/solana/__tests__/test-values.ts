import { PublicKey } from '@solana/web3.js';

// Raw addresses as strings
const PROGRAM_ID_STR = '11111111111111111111111111111111';
const RECEIVER_STR = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

// Create PublicKey instances
const PROGRAM_ID = new PublicKey(PROGRAM_ID_STR);
const RECEIVER = new PublicKey(RECEIVER_STR);

export const TEST_VALUES = {
  PROGRAM_ID,
  RECEIVER,
  PROGRAM_ID_STR,
  RECEIVER_STR,
  MOCK_TX_SIG: '5KtPn1KKiRP8HHZP5yk4KvqrwAwZqMwFJRAHiSyNr4yzHcXgwjB5CGxrxvt1RzxKtGHhKqQAPvzwxGfRr6ZsVweE'
} as const;
