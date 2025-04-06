import { TokenConfig } from "./token";

export interface FeatureProps {
  title: string;
  text: string;
  icon: React.ReactElement;
}

export interface PlanSelectionProps {
  setTokenConfig: React.Dispatch<React.SetStateAction<TokenConfig>>;
}

export interface TokenConfigurationProps {
  tokenConfig: TokenConfig;
  setTokenConfig: React.Dispatch<React.SetStateAction<TokenConfig>>;
}

export interface TokenVerificationProps {
  tokenConfig: TokenConfig;
}

export interface TokenDeploymentProps {
  tokenConfig: TokenConfig;
}
