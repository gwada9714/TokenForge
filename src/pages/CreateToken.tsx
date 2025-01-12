import React from 'react';
import { useAccount } from 'wagmi';
import { TokenForm } from '../components/TokenForm/TokenForm';

export const CreateToken = () => {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Connectez votre wallet</h2>
        <p className="text-gray-600">
          Vous devez connecter votre wallet pour créer un token
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">Créer un nouveau Token</h1>
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <TokenForm />
      </div>
    </div>
  );
};
