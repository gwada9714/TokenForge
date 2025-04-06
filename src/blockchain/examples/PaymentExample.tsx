import React, { useState, useEffect } from "react";
import { usePayment } from "../hooks/usePaymentUpdated";
import { PaymentStatus, CryptocurrencyInfo } from "../types/payment";

/**
 * Exemple de composant React pour démontrer l'utilisation du système de paiement
 * Ce composant permet de:
 * 1. Sélectionner une blockchain et une cryptomonnaie
 * 2. Convertir un montant en EUR vers la crypto sélectionnée
 * 3. Estimer les frais de transaction
 * 4. Initialiser une session de paiement
 * 5. Vérifier le statut du paiement
 */
const PaymentExample: React.FC = () => {
  // État pour la blockchain et le wallet
  const [chainName, setChainName] = useState<string>("ethereum");
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>("");

  // États pour le paiement
  const [amountEUR, setAmountEUR] = useState<number>(100);
  const [selectedCurrency, setSelectedCurrency] =
    useState<CryptocurrencyInfo | null>(null);

  // Utiliser le hook de paiement
  const {
    getSupportedCryptocurrencies,
    convertEURtoCrypto,
    estimateTransactionFees,
    initPaymentSession,
    checkPaymentStatus,
    confirmPayment,
    session,
    supportedCurrencies,
    cryptoAmount,
    paymentStatus,
    isProcessing,
    estimatedFees,
    error,
  } = usePayment(chainName, window.ethereum);

  // Charger les cryptomonnaies supportées au chargement du composant
  useEffect(() => {
    if (chainName) {
      getSupportedCryptocurrencies();
    }
  }, [chainName, getSupportedCryptocurrencies]);

  // Connecter le wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setWalletConnected(true);
        }
      } catch (error) {
        console.error("Erreur de connexion au wallet:", error);
      }
    } else {
      alert(
        "Veuillez installer MetaMask ou un autre wallet compatible EIP-1193"
      );
    }
  };

  // Changer de blockchain
  const handleChainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setChainName(e.target.value);
    setSelectedCurrency(null);
  };

  // Sélectionner une cryptomonnaie
  const handleCurrencySelect = (currency: CryptocurrencyInfo) => {
    setSelectedCurrency(currency);
    if (amountEUR > 0) {
      convertEURtoCrypto(amountEUR, currency.symbol);
      if (currency.address !== null) {
        estimateTransactionFees(amountEUR, currency.address);
      } else {
        estimateTransactionFees(amountEUR, null);
      }
    }
  };

  // Mettre à jour le montant en EUR
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = parseFloat(e.target.value);
    setAmountEUR(amount);
    if (amount > 0 && selectedCurrency) {
      convertEURtoCrypto(amount, selectedCurrency.symbol);
      if (selectedCurrency.address !== null) {
        estimateTransactionFees(amount, selectedCurrency.address);
      } else {
        estimateTransactionFees(amount, null);
      }
    }
  };

  // Initialiser une session de paiement
  const handleInitPayment = async () => {
    if (!selectedCurrency || !walletConnected) return;

    await initPaymentSession({
      userId: "user-123", // Dans une application réelle, ce serait l'ID de l'utilisateur connecté
      productId: "token-creation-standard",
      productType: "token_creation",
      amount: amountEUR,
      currency: selectedCurrency.symbol,
      payerAddress: walletAddress,
    });
  };

  // Vérifier le statut du paiement
  const handleCheckStatus = async () => {
    if (session) {
      await checkPaymentStatus(session.sessionId);
    }
  };

  // Confirmer un paiement avec un hash de transaction
  const handleConfirmPayment = async (txHash: string) => {
    if (session) {
      await confirmPayment(session.sessionId, txHash);
    }
  };

  // Formater le statut du paiement pour l'affichage
  const formatPaymentStatus = (status: PaymentStatus | null) => {
    if (!status) return "Non initialisé";

    switch (status) {
      case PaymentStatus.PENDING:
        return "En attente de paiement";
      case PaymentStatus.CONFIRMING:
        return "Confirmation en cours";
      case PaymentStatus.COMPLETED:
        return "Paiement complété";
      case PaymentStatus.EXPIRED:
        return "Session expirée";
      case PaymentStatus.FAILED:
        return "Paiement échoué";
      default:
        return "Statut inconnu";
    }
  };

  // Formater une date d'expiration pour l'affichage
  const formatExpiryDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="payment-example">
      <h2>Exemple de Paiement Blockchain</h2>

      {error && (
        <div className="error-message">
          <p>Erreur: {error}</p>
        </div>
      )}

      <div className="blockchain-selection">
        <h3>1. Sélectionner une blockchain</h3>
        <select value={chainName} onChange={handleChainChange}>
          <option value="ethereum">Ethereum</option>
          <option value="binance">Binance Smart Chain</option>
          <option value="polygon">Polygon</option>
          <option value="avalanche">Avalanche</option>
          <option value="arbitrum">Arbitrum</option>
          <option value="solana">Solana</option>
        </select>
      </div>

      <div className="wallet-connection">
        <h3>2. Connecter votre wallet</h3>
        {!walletConnected ? (
          <button onClick={connectWallet}>Connecter Wallet</button>
        ) : (
          <div>
            <p>
              Wallet connecté: {walletAddress.substring(0, 6)}...
              {walletAddress.substring(walletAddress.length - 4)}
            </p>
          </div>
        )}
      </div>

      <div className="currency-selection">
        <h3>3. Sélectionner une cryptomonnaie</h3>
        <div className="currency-list">
          {supportedCurrencies.map((currency) => (
            <div
              key={currency.symbol}
              className={`currency-item ${
                selectedCurrency?.symbol === currency.symbol ? "selected" : ""
              }`}
              onClick={() => handleCurrencySelect(currency)}
            >
              <img
                src={currency.logoUrl}
                alt={currency.name}
                width="24"
                height="24"
              />
              <span>
                {currency.name} ({currency.symbol})
              </span>
              {currency.isNative && (
                <span className="badge native">Native</span>
              )}
              {currency.isStablecoin && (
                <span className="badge stablecoin">Stablecoin</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="amount-selection">
        <h3>4. Montant à payer</h3>
        <div className="amount-input">
          <input
            type="number"
            value={amountEUR}
            onChange={handleAmountChange}
            min="1"
            step="1"
          />
          <span>EUR</span>
        </div>

        {cryptoAmount && selectedCurrency && (
          <div className="crypto-amount">
            <p>
              Montant en crypto: <strong>{cryptoAmount.formatted}</strong>
            </p>
            <p>
              Valeur: <strong>{cryptoAmount.valueEUR.toFixed(2)} EUR</strong>
            </p>
          </div>
        )}

        {estimatedFees && (
          <div className="fees">
            <h4>Frais estimés:</h4>
            <p>
              Base: <strong>{estimatedFees.baseFee.formatted}</strong> (
              {estimatedFees.baseFee.valueEUR.toFixed(2)} EUR)
            </p>
            <p>
              Max: <strong>{estimatedFees.maxFee.formatted}</strong> (
              {estimatedFees.maxFee.valueEUR.toFixed(2)} EUR)
            </p>
            <p>
              Temps estimé:{" "}
              <strong>{estimatedFees.estimatedTimeSeconds}</strong> secondes
            </p>
          </div>
        )}
      </div>

      <div className="payment-actions">
        <h3>5. Paiement</h3>
        <button
          onClick={handleInitPayment}
          disabled={!selectedCurrency || !walletConnected || isProcessing}
        >
          {isProcessing ? "Initialisation..." : "Initialiser le paiement"}
        </button>

        {session && (
          <div className="payment-session">
            <h4>Session de paiement</h4>
            <p>
              ID: <strong>{session.sessionId}</strong>
            </p>
            <p>
              Statut: <strong>{formatPaymentStatus(paymentStatus)}</strong>
            </p>
            <p>
              Adresse de réception: <strong>{session.receivingAddress}</strong>
            </p>
            <p>
              Montant dû: <strong>{session.amountDue.formatted}</strong>
            </p>
            <p>
              Expire le: <strong>{formatExpiryDate(session.expiresAt)}</strong>
            </p>

            <div className="payment-status-actions">
              <button onClick={handleCheckStatus}>Vérifier le statut</button>

              {/* Dans une application réelle, ce champ serait rempli automatiquement après la transaction */}
              <div className="tx-hash-input">
                <input
                  type="text"
                  placeholder="Hash de transaction"
                  id="txHash"
                />
                <button
                  onClick={() => {
                    const txHashInput = document.getElementById(
                      "txHash"
                    ) as HTMLInputElement;
                    handleConfirmPayment(txHashInput.value);
                  }}
                >
                  Confirmer le paiement
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentExample;
