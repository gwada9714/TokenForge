import { ethers, BigNumber, Contract, ContractInterface } from 'ethers';
import { EthereumPaymentABI } from './EthereumPaymentABI';

export class EthereumPaymentContract extends Contract {
  constructor(address: string, signerOrProvider: ethers.Signer | ethers.providers.Provider) {
    super(address, EthereumPaymentABI as ContractInterface, signerOrProvider);
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
    return this.functions.isTokenSupported(tokenAddress);
  }

  public async getReceiverAddress(): Promise<string> {
    return this.functions.receiverAddress();
  }
}
