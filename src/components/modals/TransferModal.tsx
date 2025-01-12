import React, { useState } from 'react';

interface TransferModalProps {
  token: {
    symbol: string;
    address: string;
  };
  onClose: () => void;
  onTransfer: (to: string, amount: string) => void;
}

export const TransferModal = ({ token, onClose, onTransfer }: TransferModalProps) => {
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTransfer(to, amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Transférer {token.symbol}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Destinataire</label>
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="input"
              placeholder="0x..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Montant</label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input"
              placeholder="0.0"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn btn-outline">
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              Transférer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 