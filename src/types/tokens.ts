export interface TokenType {
  id: string;
  name: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface TokenFormData {
  name: string;
  symbol: string;
  decimals?: number;
  initialSupply?: string;
  maxSupply?: string;
  baseURI?: string;
  burnable?: boolean;
  mintable?: boolean;
  pausable?: boolean;
  upgradeable?: boolean;
  accessControl?: 'ownable' | 'roles' | 'none';
  // Advanced options
  permitEnabled?: boolean;
  flashMintEnabled?: boolean;
  snapshots?: boolean;
  votes?: boolean;
  // ERC721/1155 specific
  baseURI?: string;
  batchMint?: boolean;
  // ERC4626 specific
  asset?: string;
  strategy?: string;
}
