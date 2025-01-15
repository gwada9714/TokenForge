// src/components/TokenCard/TokenCard.tsx
import React, { memo } from 'react';
import { truncateAddress } from '../utils';

interface TokenCardProps {
  token: {
    address: string;
    symbol: string;
    balance: string;
  };
  onAction: (address: string) => void;
}

const TokenCard = memo(({ token, onAction }: TokenCardProps) => {
  return (
    <div className="token-card">
      <h3>{token.symbol}</h3>
      <p>Address: {truncateAddress(token.address)}</p>
      <p>Balance: {token.balance}</p>
      <button onClick={() => onAction(token.address)}>
        Manage Token
      </button>
    </div>
  );
});

TokenCard.displayName = 'TokenCard';

export default TokenCard;