import { 
  Address, 
  PublicClient, 
  WalletClient,
  Hash,
  decodeEventLog,
  Abi
} from 'viem';

const CONTRACT_ABI = [
  // Ajout des définitions d'ABI explicites
  {
    type: 'function',
    name: 'processPayment',
    inputs: [
      { type: 'address', name: 'tokenAddress' },
      { type: 'uint256', name: 'amount' },
      { type: 'string', name: 'sessionId' }
    ],
    outputs: [],
    stateMutability: 'payable'
  },
  {
    type: 'function',
    name: 'isTokenSupported',
    inputs: [{ type: 'address', name: 'tokenAddress' }],
    outputs: [{ type: 'bool' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'receiverAddress',
    inputs: [],
    outputs: [{ type: 'address' }],
    stateMutability: 'view'
  },
  {
    type: 'event',
    name: 'PaymentProcessed',
    inputs: [
      { type: 'address', name: 'payer', indexed: true },
      { type: 'uint256', name: 'amount', indexed: false },
      { type: 'string', name: 'sessionId', indexed: false }
    ]
  }
] as const;

export class EthereumPaymentContract {
  private address: Address;
  private publicClient: PublicClient;
  private walletClient: WalletClient;
  private abi: Abi;

  constructor(
    address: Address,
    publicClient: PublicClient,
    walletClient: WalletClient
  ) {
    this.address = address;
    this.publicClient = publicClient;
    this.walletClient = walletClient;
    this.abi = CONTRACT_ABI;
  }

  public async processPayment(
    tokenAddress: Address,
    amount: bigint,
    sessionId: string,
    options: { gasLimit?: bigint; value?: bigint } = {}
  ): Promise<Hash> {
    const account = await this.walletClient.account;
    if (!account) throw new Error('No account connected');

    const { request } = await this.publicClient.simulateContract({
      address: this.address,
      abi: this.abi,
      functionName: 'processPayment',
      args: [tokenAddress, amount, sessionId],
      account,
      ...options
    });

    return this.walletClient.writeContract(request);
  }

  public async isTokenSupported(tokenAddress: Address): Promise<boolean> {
    const result = await this.publicClient.readContract({
      address: this.address,
      abi: this.abi,
      functionName: 'isTokenSupported',
      args: [tokenAddress]
    }) as boolean;

    return result;
  }

  public async getReceiverAddress(): Promise<Address> {
    const result = await this.publicClient.readContract({
      address: this.address,
      abi: this.abi,
      functionName: 'receiverAddress',
      args: []
    }) as Address;

    return result;
  }

  private unsubscribeEvent?: () => void;

  public async watchPaymentProcessed(
    onEvent: (payer: Address, amount: bigint, sessionId: string) => void
  ): Promise<() => void> {
    const unwatch = await this.publicClient.watchContractEvent({
      address: this.address,
      abi: this.abi,
      eventName: 'PaymentProcessed',
      onLogs: logs => {
        for (const log of logs) {
          const event = decodeEventLog({
            abi: this.abi,
            data: log.data,
            topics: log.topics
          });
          const [payer, amount, sessionId] = event.args as [Address, bigint, string];
          onEvent(payer, amount, sessionId);
        }
      }
    });

    this.unsubscribeEvent = unwatch;
    return unwatch;
  }

  public cleanup(): void {
    if (this.unsubscribeEvent) {
      this.unsubscribeEvent();
    }
  }
}
