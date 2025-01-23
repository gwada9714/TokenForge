import React from 'react';
import { PaymentNetwork } from '../../../multi-chain/services/payment/types/PaymentSession';
import { NetworkTokensConfig } from '../../../multi-chain/services/payment/types/TokenConfig';

interface NetworkSelectorProps {
  networks: NetworkTokensConfig[];
  selectedNetwork?: PaymentNetwork;
  onNetworkChange: (network: PaymentNetwork) => void;
}

export const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  networks,
  selectedNetwork,
  onNetworkChange,
}) => {
  return (
    <div className="network-selector">
      <label htmlFor="network">Réseau</label>
      <select
        id="network"
        value={selectedNetwork}
        onChange={(e) => onNetworkChange(e.target.value as PaymentNetwork)}
      >
        <option value="">Sélectionnez un réseau</option>
        {networks.map((network) => (
          <option key={network.network} value={network.network}>
            {network.network}
          </option>
        ))}
      </select>
      
      {selectedNetwork && (
        <div className="network-info">
          <small>
            Chain ID: {networks.find(n => n.network === selectedNetwork)?.chainId}
          </small>
        </div>
      )}
    </div>
  );
};
