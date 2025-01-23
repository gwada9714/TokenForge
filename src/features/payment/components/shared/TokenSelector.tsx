import React from 'react';
import { PaymentNetwork } from '../../../multi-chain/services/payment/types/PaymentSession';
import { SUPPORTED_NETWORKS } from '../../../multi-chain/services/payment/config/SupportedTokens';

interface TokenSelectorProps {
  network: PaymentNetwork;
  selectedToken?: string;
  onTokenSelect: (tokenAddress: string) => void;
}

export const TokenSelector: React.FC<TokenSelectorProps> = ({
  network,
  selectedToken,
  onTokenSelect,
}) => {
  const networkConfig = SUPPORTED_NETWORKS.find(n => n.network === network);
  
  if (!networkConfig) {
    return null;
  }

  return (
    <div className="token-selector">
      <label htmlFor="token">Token</label>
      <select
        id="token"
        value={selectedToken}
        onChange={(e) => onTokenSelect(e.target.value)}
      >
        <option value="">Sélectionnez un token</option>
        {networkConfig.tokens.map((token) => (
          <option key={token.address.toString()} value={token.address.toString()}>
            {token.symbol} ({token.name})
          </option>
        ))}
      </select>

      {selectedToken && (
        <div className="token-info">
          <small>
            {networkConfig.tokens.find(t => t.address.toString() === selectedToken)?.decimals} decimals
          </small>
        </div>
      )}
    </div>
  );
};
