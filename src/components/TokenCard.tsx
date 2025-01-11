// src/components/TokenCard/TokenCard.tsx
import React, { memo } from 'react';

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
      <p>Balance: {token.balance}</p>
      <button onClick={() => onAction(token.address)}>
        Manage Token
      </button>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.token.balance === nextProps.token.balance;
});

export default TokenCard;