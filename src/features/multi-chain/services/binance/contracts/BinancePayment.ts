import { ethers, BigNumber, Contract, ContractInterface } from 'ethers';
import { BINANCE_PAYMENT_ABI } from './BinancePaymentABI';

export class BinancePaymentContract extends Contract {
  constructor(address: string, signerOrProvider: ethers.Signer | ethers.providers.Provider) {
    super(address, BINANCE_PAYMENT_ABI as ContractInterface, signerOrProvider);
  }

  public async processPayment(
    tokenAddress: string,
    amount: BigNumber,
    sessionId: string,
    options: ethers.PayableOverrides = {}
  ): Promise<ethers.ContractTransaction> {
    return this.functions.processPayment(tokenAddress, amount, sessionId, options);
  }

  public async isTokenSupported(tokenAddress: string): Promise<boolean> {
    return this.functions.supportedTokens(tokenAddress);
  }

  public async getReceiverAddress(): Promise<string> {
    return this.functions.receiverAddress();
  }
}
