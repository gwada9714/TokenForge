import { 
  Address, 
  PublicClient, 
  WalletClient,
  Hash,
  decodeEventLog,
  Abi
} from 'viem';

const CONTRACT_ABI = [
  {
    type: 'event',
    name: 'PaymentReceived',
    inputs: [
      { type: 'address', name: 'payer', indexed: true },
      { type: 'address', name: 'token', indexed: true },
      { type: 'uint256', name: 'amount', indexed: false },
      { type: 'string', name: 'serviceType', indexed: false },
      { type: 'string', name: 'sessionId', indexed: false }
    ]
  },
  {
    type: 'event',
    name: 'PaymentRefunded',
    inputs: [
      { type: 'address', name: 'recipient', indexed: true },
      { type: 'address', name: 'token', indexed: true },
      { type: 'uint256', name: 'amount', indexed: false },
      { type: 'string', name: 'sessionId', indexed: false }
    ]
  },
  {
    type: 'function',
    name: 'receiverAddress',
    inputs: [],
    outputs: [{ type: 'address' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'supportedTokens',
    inputs: [{ type: 'address', name: 'token' }],
    outputs: [{ type: 'bool' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'getGasPrice',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'payWithToken',
    inputs: [
      { type: 'address', name: 'tokenAddress' },
      { type: 'uint256', name: 'amount' },
      { type: 'string', name: 'serviceType' },
      { type: 'string', name: 'sessionId' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'payWithMatic',
    inputs: [
      { type: 'string', name: 'serviceType' },
      { type: 'string', name: 'sessionId' }
    ],
    outputs: [],
    stateMutability: 'payable'
  }
] as const;

export interface PaymentReceivedEvent {
  payer: Address;
  token: Address;
  amount: bigint;
  serviceType: string;
  sessionId: string;
}

export interface PaymentRefundedEvent {
  recipient: Address;
  token: Address;
  amount: bigint;
  sessionId: string;
}

export class PolygonPaymentContract {
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

  public async payWithToken(
    tokenAddress: Address,
    amount: bigint,
    serviceType: string,
    sessionId: string,
    options: { gasLimit?: bigint; maxFeePerGas?: bigint } = {}
  ): Promise<Hash> {
    const account = await this.walletClient.account;
    if (!account) throw new Error('No account connected');

    const { request } = await this.publicClient.simulateContract({
      address: this.address,
      abi: this.abi,
      functionName: 'payWithToken',
      args: [tokenAddress, amount, serviceType, sessionId],
      account,
      ...options
    });

    return this.walletClient.writeContract(request);
  }

  public async payWithMatic(
    serviceType: string,
    sessionId: string,
    value: bigint,
    options: { gasLimit?: bigint; maxFeePerGas?: bigint } = {}
  ): Promise<Hash> {
    const account = await this.walletClient.account;
    if (!account) throw new Error('No account connected');

    const { request } = await this.publicClient.simulateContract({
      address: this.address,
      abi: this.abi,
      functionName: 'payWithMatic',
      args: [serviceType, sessionId],
      account,
      value,
      ...options
    });

    return this.walletClient.writeContract(request);
  }

  public async isTokenSupported(tokenAddress: Address): Promise<boolean> {
    const result = await this.publicClient.readContract({
      address: this.address,
      abi: this.abi,
      functionName: 'supportedTokens',
      args: [tokenAddress]
    }) as boolean;

    return result;
  }

  public async getGasPrice(): Promise<bigint> {
    const result = await this.publicClient.readContract({
      address: this.address,
      abi: this.abi,
      functionName: 'getGasPrice',
      args: []
    }) as bigint;

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

  private unsubscribeEvents?: (() => void)[];

  public async watchPaymentReceived(
    onEvent: (event: PaymentReceivedEvent) => void
  ): Promise<() => void> {
    const unwatch = await this.publicClient.watchContractEvent({
      address: this.address,
      abi: this.abi,
      eventName: 'PaymentReceived',
      onLogs: logs => {
        for (const log of logs) {
          const event = decodeEventLog({
            abi: this.abi,
            data: log.data,
            topics: log.topics
          });
          const [payer, token, amount, serviceType, sessionId] = event.args as [Address, Address, bigint, string, string];
          onEvent({ payer, token, amount, serviceType, sessionId });
        }
      }
    });

    this.unsubscribeEvents = [...(this.unsubscribeEvents || []), unwatch];
    return unwatch;
  }

  public async watchPaymentRefunded(
    onEvent: (event: PaymentRefundedEvent) => void
  ): Promise<() => void> {
    const unwatch = await this.publicClient.watchContractEvent({
      address: this.address,
      abi: this.abi,
      eventName: 'PaymentRefunded',
      onLogs: logs => {
        for (const log of logs) {
          const event = decodeEventLog({
            abi: this.abi,
            data: log.data,
            topics: log.topics
          });
          const [recipient, token, amount, sessionId] = event.args as [Address, Address, bigint, string];
          onEvent({ recipient, token, amount, sessionId });
        }
      }
    });

    this.unsubscribeEvents = [...(this.unsubscribeEvents || []), unwatch];
    return unwatch;
  }

  public cleanup(): void {
    if (this.unsubscribeEvents) {
      this.unsubscribeEvents.forEach(unsubscribe => unsubscribe());
      this.unsubscribeEvents = [];
    }
  }
}
