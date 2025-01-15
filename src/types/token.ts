export interface TokenConfig {
  plan: string;
  name: string;
  symbol: string;
  supply: string;
  decimals: number;
  features: string[];
}

export interface TokenPlan {
  name: string;
  price: string;
  icon: any;
  features: string[];
  buttonText: string;
  value: string;
  isPopular?: boolean;
}
