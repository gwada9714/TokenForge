import React from 'react';
import { shortenAddress } from '../utils/address';

interface TokenInfo {
  name: string;
  symbol: string;
  address: string;
  totalSupply: string;
  balance?: string;
  features?: {
    mintable: boolean;
    burnable: boolean;
  };
}

interface TokenDisplayProps {
  token: TokenInfo;
  variant: 'card' | 'preview';
  onAction?: (action: 'transfer' | 'mint' | 'burn') => void;
}

export const TokenDisplay: React.FC<TokenDisplayProps> = ({
  token,
  variant,
  onAction
}) => {
  if (variant === 'preview') {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{token.name}</h3>
            <p className="text-sm text-gray-600">{token.symbol}</p>
          </div>
          <p className="text-sm text-gray-500">{shortenAddress(token.address)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold">{token.name}</h2>
          <div className="flex items-center gap-2 text-gray-600">
            <span>{token.symbol}</span>
            <span>•</span>
            <span className="text-sm">{shortenAddress(token.address)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onAction?.('transfer')}
            className="btn btn-outline"
          >
            Transférer
          </button>
          {token.features?.mintable && (
            <button
              onClick={() => onAction?.('mint')}
              className="btn btn-primary"
            >
              Mint
            </button>
          )}
          {token.features?.burnable && (
            <button
              onClick={() => onAction?.('burn')}
              className="btn btn-secondary"
            >
              Burn
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Supply Total</p>
          <p className="text-xl font-semibold">{token.totalSupply}</p>
        </div>
        {token.balance && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Balance</p>
            <p className="text-xl font-semibold">{token.balance}</p>
          </div>
        )}
      </div>
    </div>
  );
};
