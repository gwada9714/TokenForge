import React from 'react';
import { Typography } from '@mui/material';
import { useWeb3 } from '../providers';

const TokenList: React.FC = () => {
  const { isConnected, connect, error } = useWeb3();

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Mes Tokens
      </Typography>
      {error && (
        <Typography color="error">
          {error}
        </Typography>
      )}
      {!isConnected && (
        <button onClick={connect}>
          Connecter le wallet
        </button>
      )}
    </div>
  );
};

export default TokenList;