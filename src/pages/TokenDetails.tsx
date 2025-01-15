import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useToken } from '../hooks/useToken';
import { useTokenTransfer } from '../hooks/useTokenTransfer';
import { useTokenMint } from '../hooks/useTokenMint';
import { useTokenBurn } from '../hooks/useTokenBurn';
import { useBalance } from 'wagmi';
import { toast } from 'react-hot-toast';
import { isAddress } from 'viem';

const TokenDetails = () => {
  const { tokenId = '' } = useParams();
  const { token, isLoading, error: tokenError } = useToken(tokenId);
  const { sendTokens, isLoading: isTransferLoading, isError: isTransferError } = useTokenTransfer({ 
    tokenAddress: tokenId 
  });
  const { mintTokens, isLoading: isMintLoading } = useTokenMint({ tokenAddress: tokenId });
  const { burnTokens, isLoading: isBurnLoading } = useTokenBurn({ tokenAddress: tokenId });
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [mintTo, setMintTo] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [burnAmount, setBurnAmount] = useState('');

  // Vérifier si l'adresse est valide
  if (!isAddress(tokenId)) {
    return (
      <div className="text-center space-y-4">
        <div className="text-red-600">
          L'adresse du token n'est pas valide
        </div>
        <Link to="/tokens" className="btn btn-primary">
          Retour à la liste des tokens
        </Link>
      </div>
    );
  }

  const { data: balance } = useBalance({
    address: token?.address as `0x${string}`,
    token: token?.address as `0x${string}`,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (tokenError || !token) {
    return (
      <div className="text-center space-y-4">
        <div className="text-red-600">
          {tokenError || "Impossible de charger les détails du token"}
        </div>
        <Link to="/tokens" className="btn btn-primary">
          Retour à la liste des tokens
        </Link>
      </div>
    );
  }

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddress(recipient)) {
      toast.error('Adresse de destinataire invalide');
      return;
    }
    if (parseFloat(amount) <= 0) {
      toast.error('Le montant doit être supérieur à 0');
      return;
    }
    try {
      await sendTokens(recipient, amount);
      if (!isTransferError) {
        setRecipient('');
        setAmount('');
      }
    } catch (error) {
      console.error('Erreur de transfert:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-4">
            <Link to="/tokens" className="text-gray-500 hover:text-gray-700">
              ← Retour
            </Link>
            <h1 className="text-3xl font-bold">{token.name} ({token.symbol})</h1>
          </div>
          <p className="text-gray-600 mt-2">
            Balance: {balance?.formatted || '0'} {token.symbol}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Informations</h2>
          <div className="space-y-3">
            <p>
              <span className="text-gray-600">Adresse du contrat:</span>
              <br />
              <code className="text-sm bg-gray-100 p-1 rounded">{token.address}</code>
            </p>
            <p>
              <span className="text-gray-600">Decimals:</span>
              <br />
              {token.decimals}
            </p>
            <p>
              <span className="text-gray-600">Total Supply:</span>
              <br />
              {token.totalSupply} {token.symbol}
            </p>
            <p>
              <span className="text-gray-600">Mintable:</span>
              <br />
              {token.isMintable ? 'Oui' : 'Non'}
            </p>
            <p>
              <span className="text-gray-600">Burnable:</span>
              <br />
              {token.isBurnable ? 'Oui' : 'Non'}
            </p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Transfert de tokens</h2>
          <form onSubmit={handleTransfer} className="space-y-4">
            <div>
              <label htmlFor="recipient" className="block text-sm font-medium text-gray-700">
                Destinataire
              </label>
              <input
                type="text"
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="0x..."
              />
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Montant
              </label>
              <input
                type="text"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="0.0"
              />
            </div>
            <button
              type="submit"
              disabled={isTransferLoading}
              className="btn btn-primary w-full"
            >
              {isTransferLoading ? 'Transfert en cours...' : 'Transférer'}
            </button>
          </form>
        </div>

        {token.isMintable && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Créer des tokens</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!isAddress(mintTo)) {
                toast.error('Adresse de destinataire invalide');
                return;
              }
              if (parseFloat(mintAmount) <= 0) {
                toast.error('Le montant doit être supérieur à 0');
                return;
              }
              try {
                await mintTokens(mintTo, mintAmount);
                setMintTo('');
                setMintAmount('');
              } catch (error) {
                console.error('Erreur de mint:', error);
              }
            }} className="space-y-4">
              <div>
                <label htmlFor="mintTo" className="block text-sm font-medium text-gray-700">
                  Destinataire
                </label>
                <input
                  type="text"
                  id="mintTo"
                  value={mintTo}
                  onChange={(e) => setMintTo(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  placeholder="0x..."
                />
              </div>
              <div>
                <label htmlFor="mintAmount" className="block text-sm font-medium text-gray-700">
                  Montant
                </label>
                <input
                  type="text"
                  id="mintAmount"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  placeholder="0.0"
                />
              </div>
              <button
                type="submit"
                disabled={isMintLoading}
                className="btn btn-primary w-full"
              >
                {isMintLoading ? 'Création en cours...' : 'Créer des tokens'}
              </button>
            </form>
          </div>
        )}

        {token.isBurnable && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Détruire des tokens</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (parseFloat(burnAmount) <= 0) {
                toast.error('Le montant doit être supérieur à 0');
                return;
              }
              try {
                await burnTokens(burnAmount);
                setBurnAmount('');
              } catch (error) {
                console.error('Erreur de burn:', error);
              }
            }} className="space-y-4">
              <div>
                <label htmlFor="burnAmount" className="block text-sm font-medium text-gray-700">
                  Montant
                </label>
                <input
                  type="text"
                  id="burnAmount"
                  value={burnAmount}
                  onChange={(e) => setBurnAmount(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  placeholder="0.0"
                />
              </div>
              <button
                type="submit"
                disabled={isBurnLoading}
                className="btn btn-primary w-full"
              >
                {isBurnLoading ? 'Destruction en cours...' : 'Détruire des tokens'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenDetails;