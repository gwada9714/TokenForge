import { writeContract } from '@wagmi/core';
import { parseEther } from 'viem';
import TokenFactoryABI from '../abi/TokenFactory.json';
import { tokenFactoryConfig } from '../config/web3Config';
import { config } from '../config/web3Config';

interface CreateTokenParams {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: string;
  maxSupply: string;
  burnable: boolean;
  mintable: boolean;
}

export const useTokenFactory = () => {
  const createToken = async (params: CreateTokenParams) => {
    return writeContract(config, {
      abi: TokenFactoryABI.abi,
      address: tokenFactoryConfig.address as `0x${string}`,
      functionName: 'createToken',
      args: [
        params.name,
        params.symbol,
        params.decimals,
        parseEther(params.initialSupply),
        parseEther(params.maxSupply),
        params.burnable,
        params.mintable,
      ],
    });
  };

  return { createToken };
}; 