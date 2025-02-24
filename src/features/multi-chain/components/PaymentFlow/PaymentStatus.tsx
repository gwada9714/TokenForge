import React from 'react';
import { PaymentStatus as PaymentStatusType } from '../../services/payment/types/PaymentSession';

interface PaymentStatusProps {
  status: PaymentStatusType;
  txHash?: string;
  error?: string;
  onRetry?: () => void;
}

const STATUS_DETAILS = {
  PENDING: {
    icon: '⏳',
    title: 'En attente',
    description: 'Veuillez confirmer la transaction dans votre wallet',
  },
  PROCESSING: {
    icon: '🔄',
    title: 'En cours',
    description: 'Transaction en cours de traitement',
  },
  COMPLETED: {
    icon: '✅',
    title: 'Complété',
    description: 'Paiement effectué avec succès',
  },
  FAILED: {
    icon: '❌',
    title: 'Échoué',
    description: 'Le paiement a échoué',
  },
};

export const PaymentStatus: React.FC<PaymentStatusProps> = ({
  status,
  txHash,
  error,
  onRetry,
}) => {
  const details = STATUS_DETAILS[status];

  return (
    <div className="flex flex-col items-center p-6 text-center">
      <span className="text-4xl mb-4">{details.icon}</span>
      <h3 className="text-xl font-semibold mb-2">{details.title}</h3>
      <p className="text-gray-600 mb-4">{details.description}</p>

      {txHash && (
        <div className="w-full max-w-md bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-500 mb-1">Transaction Hash:</p>
          <p className="font-mono text-sm break-all">{txHash}</p>
        </div>
      )}

      {error && (
        <div className="w-full max-w-md bg-red-50 text-red-700 rounded-lg p-3 mb-4">
          <p className="text-sm mb-1">Erreur:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {status === 'FAILED' && onRetry && (
        <button
          onClick={onRetry}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Réessayer
        </button>
      )}
    </div>
  );
}; 