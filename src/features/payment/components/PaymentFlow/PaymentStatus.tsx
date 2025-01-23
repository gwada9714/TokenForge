import React from 'react';
import { PaymentNetwork } from '../../../multi-chain/services/payment/types/PaymentSession';

interface PaymentStatusProps {
  status: 'idle' | 'validating' | 'processing' | 'success' | 'error';
  error?: Error;
  network?: PaymentNetwork;
  transactionHash?: string;
  onClose?: () => void;
  onRetry?: () => void;
}

export const PaymentStatus: React.FC<PaymentStatusProps> = ({
  status,
  error,
  network,
  transactionHash,
  onClose,
  onRetry,
}) => {
  const getExplorerUrl = () => {
    if (!transactionHash || !network) return '';
    
    switch (network) {
      case PaymentNetwork.ETHEREUM:
        return `https://etherscan.io/tx/${transactionHash}`;
      case PaymentNetwork.POLYGON:
        return `https://polygonscan.com/tx/${transactionHash}`;
      case PaymentNetwork.BINANCE:
        return `https://bscscan.com/tx/${transactionHash}`;
      case PaymentNetwork.SOLANA:
        return `https://solscan.io/tx/${transactionHash}`;
      default:
        return '';
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'validating':
        return (
          <div className="status-validating">
            <div className="spinner" />
            <p>Validation de la transaction...</p>
          </div>
        );

      case 'processing':
        return (
          <div className="status-processing">
            <div className="spinner" />
            <p>Transaction en cours...</p>
            <p className="subtitle">Veuillez patienter et ne pas fermer cette fenêtre</p>
          </div>
        );

      case 'success':
        return (
          <div className="status-success">
            <div className="success-icon">✓</div>
            <h3>Transaction réussie !</h3>
            {transactionHash && (
              <a 
                href={getExplorerUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="transaction-link"
              >
                Voir la transaction
              </a>
            )}
            {onClose && (
              <button onClick={onClose} className="close-button">
                Fermer
              </button>
            )}
          </div>
        );

      case 'error':
        return (
          <div className="status-error">
            <div className="error-icon">✗</div>
            <h3>Erreur lors de la transaction</h3>
            {error && <p className="error-message">{error.message}</p>}
            {onRetry && (
              <button onClick={onRetry} className="retry-button">
                Réessayer
              </button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="payment-status">
      {renderContent()}
    </div>
  );
};
