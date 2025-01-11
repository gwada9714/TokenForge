import { Address, Chain, encodeDeployData, PublicClient, WalletClient, Account } from 'viem';
import { TokenBaseConfig, TokenAdvancedConfig, TokenDeploymentStatus } from '../types/tokens';
import { erc20ABI } from 'wagmi';
import { parseUnits } from 'viem';
import { mainnet } from 'viem/chains';

// Bytecode du contrat compilé (à remplacer par le vrai bytecode)
const CONTRACT_BYTECODE = '0x608060405234801561001057600080fd5b50604051610a1f380380610a1f833981810160405281019061003291906100f0565b82600390805190602001906100489291906100b6565b5081600490805190602001906100609291906100b6565b5080600560006101000a81548160ff021916908360ff160217905550505050610190565b82805461008e90610154565b90600052602060002090601f0160209004810192826100b057600051610100915360020a8083211691505b5050505050565b8280546100c290610154565b90600052602060002090601f0160209004810192826100e457600051610100915360020a8083211691505b5050505050565b60008060006060848603121561010557600080fd5b600084013567ffffffffffffffff81111561011f57600080fd5b61012b86828701610089565b935050602084013567ffffffffffffffff81111561014857600080fd5b61015486828701610089565b9250506040840135915092915050565b6000819050919050565b61088e806101a06000396000f3fe608060405234801561001057600080fd5b50600436106100935760003560e01c8063313ce56711610066578063313ce567146101165780635c658165146101345780635c975abb1461016457806370a082311461018257806395d89b41146101b257610093565b806306fdde0314610098578063095ea7b3146100b657806318160ddd146100e657806323b872dd14610104575b600080fd5b6100a06101d0565b6040516100ad9190610677565b60405180910390f35b6100d060048036038101906100cb91906105d9565b610262565b6040516100dd9190610657565b60405180910390f35b6100ee610384565b6040516100fb9190610677565b60405180910390f35b61011e60048036038101906101199190610586565b61038e565b005b61011e61056f565b60405161012b9190610677565b60405180910390f35b61014e60048036038101906101499190610586565b610583565b60405161015b9190610677565b60405180910390f35b61016c6105a1565b6040516101799190610657565b60405180910390f35b61019c60048036038101906101979190610543565b6105b8565b6040516101a99190610677565b60405180910390f35b6101ba610601565b6040516101c79190610677565b60405180910390f35b6060600380546101df90610754565b80601f016020809104026020016040519081016040528092919081815260200182805461020b90610754565b80156102585780601f1061022d57610100808354040283529160200191610258565b820191906000526020600020905b81548152906001019060200180831161023b57829003601f168201915b5050505050905090565b60008073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1614156102cd576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016102c4906106d7565b60405180910390fd5b60008214156102e057600080fd5b81600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925846040516103779190610677565b60405180910390a36001905092915050565b6000600254905090565b80600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054101561041957600080fd5b80600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254039250508190555080600060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254039250508190555080600060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040516105629190610677565b60405180910390a3505050565b6000600560009054906101000a900460ff16905090565b6001602052816000526040600020602052806000526040600020600091509150505481565b600560009054906101000a900460ff1681565b6000600060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b6060600480546106109061075456565b80601f016020809104026020016040519081016040528092919081815260200182805461063c9061075456565b80156106895780601f1061065e57610100808354040283529160200191610689565b820191906000526020600020905b81548152906001019060200180831161066c57829003601f168201915b5050505050905090565b6000819050919050565b6106878161067356565b82525050565b60006020820190506106a2600083018461067e565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006106d3826106a856565b9050919050565b60006020820190508181036000830152610693816106c856565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b6000600282049050600182168061076c57607f821691505b60208210810361077f5761077e61072556565b5b5091905056fea2646970667358221220f3c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c164736f6c63430008000033' as const;

// ABI pour notre contrat ERC20 personnalisé
const customERC20ABI = [
  ...erc20ABI,
  {
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'symbol', type: 'string' },
      { name: 'decimals', type: 'uint8' },
      { name: 'initialSupply', type: 'uint256' },
      { name: 'mintable', type: 'bool' },
      { name: 'burnable', type: 'bool' },
      { name: 'pausable', type: 'bool' },
      { name: 'permit', type: 'bool' },
      { name: 'votes', type: 'bool' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
] as const;

export const deployToken = async (
  baseConfig: TokenBaseConfig,
  advancedConfig: TokenAdvancedConfig,
  walletClient: WalletClient,
  publicClient: PublicClient
): Promise<TokenDeploymentStatus> => {
  try {
    if (!walletClient.account) {
      throw new Error('No account connected');
    }

    // Préparer les arguments du constructeur
    const constructorArgs = [
      baseConfig.name,
      baseConfig.symbol,
      baseConfig.decimals,
      parseUnits(String(baseConfig.initialSupply), baseConfig.decimals),
      advancedConfig.mintable,
      advancedConfig.burnable,
      advancedConfig.pausable,
      advancedConfig.permit,
      advancedConfig.votes,
    ] as const;

    // Déployer le contrat
    const hash = await walletClient.deployContract({
      abi: customERC20ABI,
      bytecode: CONTRACT_BYTECODE,
      args: constructorArgs,
      account: walletClient.account,
      chain: walletClient.chain ?? mainnet,
    });

    // Attendre la confirmation de la transaction
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (!receipt.contractAddress) {
      throw new Error('Contract address not found in receipt');
    }

    return {
      status: 'success',
      contractAddress: receipt.contractAddress,
      transactionHash: hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    console.error('Token deployment failed:', error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

export const estimateGas = async (
  baseConfig: TokenBaseConfig,
  advancedConfig: TokenAdvancedConfig,
  walletClient: WalletClient,
  account: Address
): Promise<bigint> => {
  try {
    // Préparer les arguments du constructeur
    const constructorArgs = [
      baseConfig.name,
      baseConfig.symbol,
      baseConfig.decimals,
      parseUnits(String(baseConfig.initialSupply), baseConfig.decimals),
      advancedConfig.mintable,
      advancedConfig.burnable,
      advancedConfig.pausable,
      advancedConfig.permit,
      advancedConfig.votes,
    ] as const;

    // Estimer le gas en utilisant deployContract
    const estimate = await walletClient.deployContract.estimateGas({
      account,
      abi: customERC20ABI,
      bytecode: CONTRACT_BYTECODE,
      args: constructorArgs,
      chain: walletClient.chain ?? mainnet,
    });

    return estimate;
  } catch (error) {
    console.error('Gas estimation failed:', error);
    throw error;
  }
};
