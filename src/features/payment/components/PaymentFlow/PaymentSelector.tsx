import React from 'react';
import { PaymentNetwork } from '../../../multi-chain/services/payment/types/PaymentSession';
import { NetworkSelector } from '../shared/NetworkSelector';
import { TokenSelector } from '../shared/TokenSelector';
import { SUPPORTED_NETWORKS } from '../../../multi-chain/services/payment/config/SupportedTokens';
import { DEFAULT_RECEIVER_ADDRESS } from '../../../multi-chain/services/payment/config/PaymentAddresses';

interface PaymentSelectorProps {
  onNetworkChange: (network: PaymentNetwork) => void;
  onTokenSelect: (tokenAddress: string) => void;
  selectedNetwork?: PaymentNetwork;
  selectedToken?: string;
  amount: string;
  onAmountChange: (amount: string) => void;
}

export const PaymentSelector: React.FC<PaymentSelectorProps> = ({
  onNetworkChange,
  onTokenSelect,
  selectedNetwork,
  selectedToken,
  amount,
  onAmountChange,
}) => {
  return (
    <div className="payment-selector">
      <div className="payment-info">
        <p>Paiement vers : {DEFAULT_RECEIVER_ADDRESS}</p>
      </div>
      
      <div className="network-selection">
        <NetworkSelector
          networks={SUPPORTED_NETWORKS}
          selectedNetwork={selectedNetwork}
          onNetworkChange={onNetworkChange}
        />
      </div>

      {selectedNetwork && (
        <div className="token-selection">
          <TokenSelector
            network={selectedNetwork}
            selectedToken={selectedToken}
            onTokenSelect={onTokenSelect}
          />
        </div>
      )}

      <div className="amount-input">
        <label htmlFor="amount">Montant</label>
        <input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          min="0"
          step="0.000001"
          placeholder="0.00"
        />
      </div>
    </div>
  );
};
