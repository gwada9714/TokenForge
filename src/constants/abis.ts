// ERC20 Token ABI
export const TOKEN_ABI = [
  // ERC20 standard
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  
  // Custom functions
  'function mint(address to, uint256 amount)',
  'function burn(uint256 amount)',
  'function pause()',
  'function unpause()',
  
  // Events
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
  'event TokenMinted(address indexed to, uint256 amount)',
  'event TokenBurned(address indexed from, uint256 amount)'
] as const;

// Factory ABI
export const FACTORY_ABI = [
  'function createToken(string name, string symbol, uint8 decimals, uint256 totalSupply, bool burnable, bool mintable, bool pausable) returns (address)',
  'function getTokensByCreator(address creator) view returns (address[])',
  'function getAllTokens() view returns (address[])',
  'function tokenDetails(address token) view returns (tuple(string name, string symbol, uint8 decimals, uint256 totalSupply, address owner, bool burnable, bool mintable, bool pausable, uint256 creationTime))',
  'event TokenCreated(address indexed tokenAddress, address indexed owner, string name, string symbol, uint256 totalSupply)'
] as const;

// Staking ABI
export const STAKING_ABI = [
  // View functions
  'function stakedAmount(address account) view returns (uint256)',
  'function pendingRewards(address account) view returns (uint256)',
  'function totalStaked() view returns (uint256)',
  'function rewardRate() view returns (uint256)',
  'function lockPeriod() view returns (uint256)',
  'function minStakeAmount() view returns (uint256)',
  
  // State-changing functions
  'function stake(uint256 amount) returns (bool)',
  'function unstake(uint256 amount) returns (bool)',
  'function claimRewards() returns (bool)',
  
  // Events
  'event StakingAction(address indexed user, string action, uint256 amount, uint256 timestamp)',
  'event RewardsClaimed(address indexed user, uint256 amount, uint256 timestamp)'
] as const;