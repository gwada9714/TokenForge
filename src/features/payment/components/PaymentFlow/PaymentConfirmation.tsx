import React from 'react';
import { PaymentNetwork } from '../../../multi-chain/services/payment/types/PaymentSession';
import { SUPPORTED_NETWORKS } from '../../../multi-chain/services/payment/config/SupportedTokens';
import { DEFAULT_RECEIVER_ADDRESS } from '../../../multi-chain/services/payment/config/PaymentAddresses';

interface PaymentConfirmationProps {
  network: PaymentNetwork;
  tokenAddress: string;
  amount: string;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export const PaymentConfirmation: React.FC<PaymentConfirmationProps> = ({
  network,
  tokenAddress,
  amount,
  onConfirm,
  onCancel,
  isProcessing = false,
}) => {
  const networkConfig = SUPPORTED_NETWORKS.find(n => n.network === network);
  const token = networkConfig?.tokens.find(t => t.address.toString() === tokenAddress);

  if (!networkConfig || !token) {
    return null;
  }

  return (
    <div className="payment-confirmation">
      <h3>Confirmer le paiement</h3>
      
      <div className="confirmation-details">
        <div className="detail-row">
          <span>Réseau:</span>
          <span>{networkConfig.network}</span>
        </div>
        
        <div className="detail-row">
          <span>Token:</span>
          <span>{token.symbol} ({token.name})</span>
        </div>
        
        <div className="detail-row">
          <span>Montant:</span>
          <span>{amount} {token.symbol}</span>
        </div>
        
        <div className="detail-row">
          <span>Destinataire:</span>
          <span className="address">{DEFAULT_RECEIVER_ADDRESS}</span>
        </div>
      </div>

      <div className="confirmation-warning">
        <p>⚠️ Vérifiez bien les détails avant de confirmer la transaction</p>
      </div>

      <div className="confirmation-actions">
        <button 
          className="cancel-button"
          onClick={onCancel}
          disabled={isProcessing}
        >
          Annuler
        </button>
        
        <button 
          className="confirm-button"
          onClick={onConfirm}
          disabled={isProcessing}
        >
          {isProcessing ? 'Transaction en cours...' : 'Confirmer le paiement'}
        </button>
      </div>
    </div>
  );
};
