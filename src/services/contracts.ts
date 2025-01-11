import { getContract } from 'wagmi/actions';
import { erc20ABI } from 'wagmi';
import { customERC20ABI } from '../contracts/compiled';

export function getTokenContract(address: `0x${string}`) {
  return {
    address,
    abi: [...erc20ABI, ...customERC20ABI],
  };
}

export function getTokenFactoryContract(address: `0x${string}`) {
  return {
    address,
    abi: customERC20ABI,
  };
}
