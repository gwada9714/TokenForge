import { type Address } from 'viem';
import { ChainId } from '../../types/Chain';
import { EVMBaseService } from '../EVMBaseService';
import { polygonConfig } from '../../config/chains';
import { PROVIDERS } from '../../config/dependencies';

// ABI et Bytecode pour le contrat ERC20 de Polygon
const POLYGON_ERC20_BYTECODE = `608060405234801561001057600080fd5b506040516103bc3803806103bc83398101604081905261002f91610074565b600381805461003c906100d4565b6100479291906100b4565b5050600481805461003c906100d4565b6000602082840312156100865761008561012f565b5b81516001600160a01b038116811461009e5761009d61012f565b92915050565b6000815180845260005b818110156100c8576020818501810151868301820152016100ac565b818111156100da576000602083870101525b50601f01601f19169290920160200192915050565b600181811c908216806100e857607f821691505b60208210811415610109576108f46108f4565b50919050565b601f82111561012a57600081815260208120601f850160051c810160208610156101075750805b601f850160051c820191505b818110156101265782815560010161011d565b5050505b505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6102608061016e6000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063095ea7b31461003b578063a9059cbb14610066575b600080fd5b61004e610049366004610195565b610091565b604051901515815260200160405180910390f35b61004e610074366004610195565b6100fe565b6000336001600160a01b038416148061008c5750336000908152600160209081526040808320848452909152902054155b92915050565b60006001600160a01b0383166100a657600080fd5b336000818152600160209081526040808320878452825280832086905551938290039283908082858560051c82870101915050600082866000526020600020905b81548152906001019060200180831161010257829003601f168201915b505050505091505092915050565b80356001600160a01b038116811461012857600080fd5b919050565b634e487b7160e01b600052604160045260246000fd5b600080604083850312156101585761015761012d565b5b61016183610111565b915060208301356001600160a01b038116811461017e5761017d61012d565b809150509250929050565b6000602082840312156101a7576101a661012d565b5061008c83610111565b6000602082840312156101c4576101c361012d565b5035919050565b600080604083850312156101e0576101df61012d565b5b6101e983610111565b946020939093013593505050565b600080600060608486031215610210576102106102d2565b5b610219846101f1565b925060208401359150604084013567ffffffffffffffff8082111561023f5761023e6102d2565b604051601f8301601f19908116603f011681019082821181831017156102675761026661012d565b8160405283815286602085880101111561028157610280610280565b8286015b8481101561029c578035835260209283019201610285565b509695505050505050565b6000806000606084860312156102bf576102be6102d2565b506102c8846101f1565b925060208401359150604084013590509250925092565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fdfe`;

export class PolygonService extends EVMBaseService {
  private priceApiUrl: string;

  constructor() {
    super(ChainId.POLYGON, polygonConfig);
    this.priceApiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd&x_cg_demo_api_key=${PROVIDERS.COINGECKO_KEY}`;
  }

  private getViemChain() {
    return {
      id: this.chainConfig.chainId,
      name: this.chainConfig.name,
      network: this.chainConfig.name.toLowerCase(),
      nativeCurrency: this.chainConfig.nativeCurrency,
      rpcUrls: {
        default: {
          http: this.chainConfig.rpcUrls
        },
        public: {
          http: this.chainConfig.rpcUrls
        }
      }
    };
  }

  async getNativeTokenPrice(): Promise<number> {
    try {
      const response = await fetch(this.priceApiUrl);
      const data = await response.json();
      return data['matic-network'].usd;
    } catch (error) {
      console.error('Failed to fetch MATIC price:', error);
      return 0;
    }
  }

  async createToken(params: {
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    owner: Address;
  }): Promise<Address> {
    if (!this.client) await this.initProvider();
    const walletClient = await this.getWalletClient();

    if (!walletClient.account) {
      throw new Error('No account connected');
    }

    try {
      const bytecode = POLYGON_ERC20_BYTECODE as `0x${string}`;
      const hash = await walletClient.deployContract({
        abi: [
          {
            type: 'constructor',
            inputs: [
              { name: 'name_', type: 'string' },
              { name: 'symbol_', type: 'string' },
              { name: 'decimals_', type: 'uint8' },
              { name: 'totalSupply_', type: 'uint256' },
              { name: 'owner_', type: 'address' }
            ],
            stateMutability: 'nonpayable'
          }
        ],
        bytecode,
        args: [
          params.name,
          params.symbol,
          params.decimals,
          BigInt(params.totalSupply),
          params.owner
        ],
        account: walletClient.account,
        chain: this.getViemChain()
      });
      
      // TODO: Attendre la confirmation et récupérer l'adresse du contrat
      return hash as Address;
    } catch (error: any) {
      throw new Error(`Failed to create token on Polygon: ${error.message}`);
    }
  }

  async addLiquidity(params: {
    tokenAddress: Address;
    amount: bigint;
    deadline?: number;
  }): Promise<boolean> {
    if (!this.client) await this.initProvider();
    const walletClient = await this.getWalletClient();

    if (!walletClient.account) {
      throw new Error('No account connected');
    }

    // Utiliser QuickSwap (clone d'Uniswap sur Polygon)
    const QUICKSWAP_ROUTER_ADDRESS = '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff' as const;

    try {
      const { request } = await this.client.simulateContract({
        account: walletClient.account,
        address: QUICKSWAP_ROUTER_ADDRESS,
        abi: [
          {
            name: 'addLiquidityETH',
            type: 'function',
            stateMutability: 'payable',
            inputs: [
              { name: 'token', type: 'address' },
              { name: 'amountTokenDesired', type: 'uint256' },
              { name: 'amountTokenMin', type: 'uint256' },
              { name: 'amountETHMin', type: 'uint256' },
              { name: 'to', type: 'address' },
              { name: 'deadline', type: 'uint256' }
            ],
            outputs: [
              { name: 'amountToken', type: 'uint256' },
              { name: 'amountETH', type: 'uint256' },
              { name: 'liquidity', type: 'uint256' }
            ]
          }
        ],
        functionName: 'addLiquidityETH',
        args: [
          params.tokenAddress,
          params.amount,
          BigInt(0), // amountTokenMin
          BigInt(0), // amountETHMin
          walletClient.account.address,
          BigInt(params.deadline || Math.floor(Date.now() / 1000) + 60 * 20)
        ],
        chain: this.getViemChain()
      });

      const hash = await walletClient.writeContract(request);
      return !!hash;
    } catch (error: any) {
      throw new Error(`Failed to add liquidity on Polygon: ${error.message}`);
    }
  }

  async removeLiquidity(params: {
    tokenAddress: Address;
    amount: bigint;
    deadline?: number;
  }): Promise<boolean> {
    if (!this.client) await this.initProvider();
    const walletClient = await this.getWalletClient();

    if (!walletClient.account) {
      throw new Error('No account connected');
    }

    const QUICKSWAP_ROUTER_ADDRESS = '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff' as const;

    try {
      const { request } = await this.client.simulateContract({
        account: walletClient.account,
        address: QUICKSWAP_ROUTER_ADDRESS,
        abi: [
          {
            name: 'removeLiquidityETH',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'token', type: 'address' },
              { name: 'liquidity', type: 'uint256' },
              { name: 'amountTokenMin', type: 'uint256' },
              { name: 'amountETHMin', type: 'uint256' },
              { name: 'to', type: 'address' },
              { name: 'deadline', type: 'uint256' }
            ],
            outputs: [
              { name: 'amountToken', type: 'uint256' },
              { name: 'amountETH', type: 'uint256' }
            ]
          }
        ],
        functionName: 'removeLiquidityETH',
        args: [
          params.tokenAddress,
          params.amount,
          BigInt(0), // amountTokenMin
          BigInt(0), // amountETHMin
          walletClient.account.address,
          BigInt(params.deadline || Math.floor(Date.now() / 1000) + 60 * 20)
        ],
        chain: this.getViemChain()
      });

      const hash = await walletClient.writeContract(request);
      return !!hash;
    } catch (error: any) {
      throw new Error(`Failed to remove liquidity on Polygon: ${error.message}`);
    }
  }

  async stake(params: {
    tokenAddress: Address;
    amount: bigint;
    duration?: number;
  }): Promise<boolean> {
    if (!this.client) await this.initProvider();
    const walletClient = await this.getWalletClient();

    if (!walletClient.account) {
      throw new Error('No account connected');
    }

    try {
      const { request } = await this.client.simulateContract({
        account: walletClient.account,
        address: params.tokenAddress,
        abi: [
          {
            name: 'stake',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'amount', type: 'uint256' },
              { name: 'duration', type: 'uint256' }
            ],
            outputs: [{ type: 'bool' }]
          }
        ],
        functionName: 'stake',
        args: [
          params.amount,
          BigInt(params.duration || 0)
        ],
        chain: this.getViemChain()
      });

      const hash = await walletClient.writeContract(request);
      return !!hash;
    } catch (error: any) {
      throw new Error(`Failed to stake tokens on Polygon: ${error.message}`);
    }
  }

  async unstake(params: {
    tokenAddress: Address;
    amount: bigint;
  }): Promise<boolean> {
    if (!this.client) await this.initProvider();
    const walletClient = await this.getWalletClient();

    if (!walletClient.account) {
      throw new Error('No account connected');
    }

    try {
      const { request } = await this.client.simulateContract({
        account: walletClient.account,
        address: params.tokenAddress,
        abi: [
          {
            name: 'unstake',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [{ name: 'amount', type: 'uint256' }],
            outputs: [{ type: 'bool' }]
          }
        ],
        functionName: 'unstake',
        args: [params.amount],
        chain: this.getViemChain()
      });

      const hash = await walletClient.writeContract(request);
      return !!hash;
    } catch (error: any) {
      throw new Error(`Failed to unstake tokens on Polygon: ${error.message}`);
    }
  }
}
