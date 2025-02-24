import React from 'react';
import { NetworkSelector } from '../shared/NetworkSelector';
import { TokenSelector } from '../shared/TokenSelector';
import { PaymentNetwork } from '../../services/payment/types/PaymentSession';
import { PaymentToken } from '../../services/payment/types/PaymentSession';

interface PaymentSelectorProps {
  onNetworkSelect: (network: PaymentNetwork) => void;
  onTokenSelect: (token: PaymentToken) => void;
  selectedNetwork?: PaymentNetwork;
  selectedToken?: PaymentToken;
  amount: bigint;
}

export const PaymentSelector: React.FC<PaymentSelectorProps> = ({
  onNetworkSelect,
  onTokenSelect,
  selectedNetwork,
  selectedToken,
  amount
}) => {
  return (
    <div className="flex flex-col gap-4 p-4 rounded-lg border border-gray-200">
      <h2 className="text-xl font-semibold">Sélectionner le mode de paiement</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Réseau
          </label>
          <NetworkSelector
            selectedNetwork={selectedNetwork}
            onSelect={onNetworkSelect}
          />
        </div>

        {selectedNetwork && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token
            </label>
            <TokenSelector
              network={selectedNetwork}
              selectedToken={selectedToken}
              onSelect={onTokenSelect}
              amount={amount}
            />
          </div>
        )}
      </div>
    </div>
  );
}; 