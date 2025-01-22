import { ethers } from 'ethers';

export const BINANCE_PAYMENT_ABI = [
  // Events
  "event PaymentReceived(address indexed payer, address indexed token, uint256 amount, string serviceType, string sessionId)",
  "event PaymentRefunded(address indexed recipient, address indexed token, uint256 amount, string sessionId)",
  
  // View functions
  "function receiverAddress() view returns (address)",
  "function supportedTokens(address) view returns (bool)",
  
  // State changing functions
  "function payWithToken(address tokenAddress, uint256 amount, string calldata serviceType, string calldata sessionId)",
  "function payWithBNB(string calldata serviceType, string calldata sessionId) payable",
  "function setTokenSupport(address tokenAddress, bool isSupported)",
  "function refundToken(address tokenAddress, address to, uint256 amount, string calldata sessionId)",
  "function refundBNB(address to, uint256 amount, string calldata sessionId)",
  "function pause()",
  "function unpause()"
];

export interface PaymentReceivedEvent {
  payer: string;
  token: string;
  amount: ethers.BigNumber;
  serviceType: string;
  sessionId: string;
}

export interface PaymentRefundedEvent {
  recipient: string;
  token: string;
  amount: ethers.BigNumber;
  sessionId: string;
}

export class BinancePaymentContract {
  private contract: ethers.Contract;

  constructor(
    address: string,
    signerOrProvider: ethers.Signer | ethers.providers.Provider
  ) {
    this.contract = new ethers.Contract(
      address,
      BINANCE_PAYMENT_ABI,
      signerOrProvider
    );
  }

  public async payWithToken(
    tokenAddress: string,
    amount: ethers.BigNumber,
    serviceType: string,
    sessionId: string
  ): Promise<ethers.ContractTransaction> {
    return this.contract.payWithToken(tokenAddress, amount, serviceType, sessionId);
  }

  public async payWithBNB(
    amount: ethers.BigNumber,
    serviceType: string,
    sessionId: string
  ): Promise<ethers.ContractTransaction> {
    return this.contract.payWithBNB(serviceType, sessionId, { value: amount });
  }

  public async isTokenSupported(tokenAddress: string): Promise<boolean> {
    return this.contract.supportedTokens(tokenAddress);
  }

  public async getReceiverAddress(): Promise<string> {
    return this.contract.receiverAddress();
  }

  public onPaymentReceived(
    callback: (event: PaymentReceivedEvent) => void
  ): ethers.Contract {
    this.contract.on(
      'PaymentReceived',
      (payer, token, amount, serviceType, sessionId) => {
        callback({
          payer,
          token,
          amount,
          serviceType,
          sessionId
        });
      }
    );
    return this.contract;
  }

  public onPaymentRefunded(
    callback: (event: PaymentRefundedEvent) => void
  ): ethers.Contract {
    this.contract.on(
      'PaymentRefunded',
      (recipient, token, amount, sessionId) => {
        callback({
          recipient,
          token,
          amount,
          sessionId
        });
      }
    );
    return this.contract;
  }

  public removeAllListeners(): void {
    this.contract.removeAllListeners();
  }
}
