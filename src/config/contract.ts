import { Address } from 'viem';

export const CONTRACT_ADDRESS = (process.env.REACT_APP_CONTRACT_ADDRESS || '0x0') as Address;

export const CONTRACT_ABI = [
  // Pausable
  'function pause() external',
  'function unpause() external',
  'function paused() external view returns (bool)',
  
  // Ownable
  'function owner() external view returns (address)',
  'function transferOwnership(address newOwner) external',
  
  // Events
  'event Paused(address account)',
  'event Unpaused(address account)',
  'event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)',
] as const;
