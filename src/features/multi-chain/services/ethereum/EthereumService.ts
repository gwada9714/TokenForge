import {
  parseUnits,
  type Address,
  ContractFunctionExecutionError,
  type Chain,
} from "viem";
import { ChainId } from "../../types/Chain";
import { EVMBaseService } from "../EVMBaseService";
import { ethereumConfig } from "../../config/chains";
import { PROVIDERS } from "../../config/dependencies";

// ABI et Bytecode pour le contrat ERC20 d'Ethereum
const ERC20_ABI = [
  {
    inputs: [
      { name: "name_", type: "string" },
      { name: "symbol_", type: "string" },
      { name: "decimals_", type: "uint8" },
      { name: "totalSupply_", type: "uint256" },
      { name: "owner_", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
] as const;

const ERC20_BYTECODE =
  "0x608060405234801561001057600080fd5b506040516103bc3803806103bc83398101604081905261002f91610074565b600381805461003c906100d4565b6100479291906100b4565b5050600481805461003c906100d4565b6000602082840312156100865761008561012f565b5b81516001600160a01b038116811461009e5761009d61012f565b92915050565b6000815180845260005b818110156100c8576020818501810151868301820152016100ac565b818111156100da576000602083870101525b50601f01601f19169290920160200192915050565b600181811c908216806100e857607f821691505b60208210811415610109576108f46108f4565b50919050565b601f82111561012a57600081815260208120601f850160051c810160208610156101075750805b601f850160051c820191505b818110156101265782815560010161011d565b5050505b505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6102608061016e6000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063095ea7b31461003b578063a9059cbb14610066575b600080fd5b61004e610049366004610195565b610091565b604051901515815260200160405180910390f35b61004e610074366004610195565b6100fe565b6000336001600160a01b038416148061008c5750336000908152600160209081526040808320848452909152902054155b92915050565b60006001600160a01b0383166100a657600080fd5b336000818152600160209081526040808320878452825280832086905551938290039283908082858560051c82870101915050600082866000526020600020905b81548152906001019060200180831161010257829003601f168201915b505050505091505092915050565b80356001600160a01b038116811461012857600080fd5b919050565b634e487b7160e01b600052604160045260246000fd5b600080604083850312156101585761015761012d565b5b61016183610111565b915060208301356001600160a01b038116811461017e5761017d61012d565b809150509250929050565b6000602082840312156101a7576101a661012d565b5061008c83610111565b6000602082840312156101c4576101c361012d565b5035919050565b600080604083850312156101e0576101df61012d565b5b6101e983610111565b946020939093013593505050565b600080600060608486031215610210576102106102d2565b5b610219846101f1565b925060208401359150604084013567ffffffffffffffff8082111561023f5761023e6102d2565b604051601f8301601f19908116603f011681019082821181831017156102675761026661012d565b8160405283815286602085880101111561028157610280610280565b8286015b8481101561029c578035835260209283019201610285565b509695505050505050565b6000806000606084860312156102bf576102be6102d2565b506102c8846101f1565b925060208401359150604084013590509250925092565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fdfe" as const;

// Configuration de la chaîne Ethereum pour viem
const viemChainConfig: Chain = {
  id: Number(ethereumConfig.id),
  name: ethereumConfig.name,
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ethereumConfig.rpcUrls,
      webSocket: [],
    },
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: ethereumConfig.blockExplorerUrls[0],
      apiUrl: `${ethereumConfig.blockExplorerUrls[0]}/api`,
    },
  },
};

export class EthereumService extends EVMBaseService {
  private priceApiUrl: string;

  constructor() {
    super(ChainId.ETH, ethereumConfig);
    this.priceApiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&x_cg_demo_api_key=${PROVIDERS.COINGECKO_KEY}`;
  }

  async getNativeTokenPrice(): Promise<number> {
    try {
      const response = await fetch(this.priceApiUrl);
      const data = await response.json();
      return data.ethereum.usd;
    } catch (error) {
      console.error("Failed to fetch ETH price:", error);
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
    const account = await walletClient.getAddresses();

    try {
      const hash = await walletClient.deployContract({
        account: account[0],
        abi: ERC20_ABI,
        bytecode: ERC20_BYTECODE,
        args: [
          params.name,
          params.symbol,
          params.decimals,
          parseUnits(params.totalSupply, params.decimals),
          params.owner,
        ],
        chain: viemChainConfig,
      });

      const receipt = await this.client.waitForTransactionReceipt({ hash });
      if (!receipt.contractAddress)
        throw new Error("Contract deployment failed");

      return receipt.contractAddress;
    } catch (error) {
      if (error instanceof ContractFunctionExecutionError) {
        throw new Error(`Failed to create token: ${error.shortMessage}`);
      }
      throw error;
    }
  }

  async addLiquidity(params: {
    tokenAddress: Address;
    amount: bigint;
    deadline?: number;
  }): Promise<boolean> {
    if (!this.client) await this.initProvider();
    const walletClient = await this.getWalletClient();
    const account = await walletClient.getAddresses();

    const UNISWAP_ROUTER_ADDRESS =
      "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D" as const;
    const UNISWAP_ROUTER_ABI = [
      {
        name: "addLiquidityETH",
        type: "function",
        stateMutability: "payable",
        inputs: [
          { name: "token", type: "address" },
          { name: "amountTokenDesired", type: "uint256" },
          { name: "amountTokenMin", type: "uint256" },
          { name: "amountETHMin", type: "uint256" },
          { name: "to", type: "address" },
          { name: "deadline", type: "uint256" },
        ],
        outputs: [
          { name: "amountToken", type: "uint256" },
          { name: "amountETH", type: "uint256" },
          { name: "liquidity", type: "uint256" },
        ],
      },
    ] as const;

    try {
      const deadline =
        params.deadline || Math.floor(Date.now() / 1000) + 60 * 20;

      const hash = await walletClient.writeContract({
        address: UNISWAP_ROUTER_ADDRESS,
        abi: UNISWAP_ROUTER_ABI,
        functionName: "addLiquidityETH",
        args: [
          params.tokenAddress,
          params.amount,
          0n,
          0n,
          account[0],
          BigInt(deadline),
        ],
        value: params.amount,
        chain: viemChainConfig,
        account: account[0],
      });

      await this.client.waitForTransactionReceipt({ hash });
      return true;
    } catch (error) {
      if (error instanceof ContractFunctionExecutionError) {
        throw new Error(`Failed to add liquidity: ${error.shortMessage}`);
      }
      throw error;
    }
  }

  async removeLiquidity(params: {
    tokenAddress: Address;
    amount: bigint;
    deadline?: number;
  }): Promise<boolean> {
    if (!this.client) await this.initProvider();
    const walletClient = await this.getWalletClient();
    const account = await walletClient.getAddresses();

    const UNISWAP_ROUTER_ADDRESS =
      "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D" as const;
    const UNISWAP_ROUTER_ABI = [
      {
        name: "removeLiquidityETH",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
          { name: "token", type: "address" },
          { name: "liquidity", type: "uint256" },
          { name: "amountTokenMin", type: "uint256" },
          { name: "amountETHMin", type: "uint256" },
          { name: "to", type: "address" },
          { name: "deadline", type: "uint256" },
        ],
        outputs: [
          { name: "amountToken", type: "uint256" },
          { name: "amountETH", type: "uint256" },
        ],
      },
    ] as const;

    try {
      const deadline =
        params.deadline || Math.floor(Date.now() / 1000) + 60 * 20;

      const hash = await walletClient.writeContract({
        address: UNISWAP_ROUTER_ADDRESS,
        abi: UNISWAP_ROUTER_ABI,
        functionName: "removeLiquidityETH",
        args: [
          params.tokenAddress,
          params.amount,
          0n,
          0n,
          account[0],
          BigInt(deadline),
        ],
        chain: viemChainConfig,
        account: account[0],
      });

      await this.client.waitForTransactionReceipt({ hash });
      return true;
    } catch (error) {
      if (error instanceof ContractFunctionExecutionError) {
        throw new Error(`Failed to remove liquidity: ${error.shortMessage}`);
      }
      throw error;
    }
  }

  async stake(_params: {
    tokenAddress: Address;
    amount: bigint;
    duration?: number;
  }): Promise<boolean> {
    // TODO: Implement Ethereum staking with the following features:
    // - Support for ETH 2.0 staking
    // - Integration with popular staking protocols (Lido, Rocket Pool)
    // - Custom staking contracts for ERC20 tokens
    // - Configurable staking periods and rewards
    throw new Error("Staking not implemented for Ethereum yet");
  }

  async unstake(_params: {
    tokenAddress: Address;
    amount: bigint;
  }): Promise<boolean> {
    // TODO: Implement Ethereum unstaking with the following features:
    // - Support for ETH 2.0 withdrawal
    // - Integration with staking protocols' withdrawal mechanisms
    // - Handling of unstaking penalties and cooldown periods
    // - Support for partial unstaking
    throw new Error("Unstaking not implemented for Ethereum yet");
  }
}
