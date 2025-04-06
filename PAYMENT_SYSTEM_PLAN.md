Plan du Système de Paiement pour TokenForge

1. Vue d'ensemble du système de paiement

flowchart TB
subgraph "Interface Utilisateur"
UI[Interface de Paiement] --> WC[Connexion Wallet]
UI --> PS[Sélection Plan/Service]
UI --> BC[Sélection Blockchain]
UI --> TS[Sélection Crypto/Stablecoin]
end

    subgraph "Services de Paiement"
        PMS[PaymentManagerService] --> EPS[EthereumPaymentService]
        PMS --> BPS[BSCPaymentService]
        PMS --> PPS[PolygonPaymentService]
        PMS --> APS[AvalanchePaymentService]
        PMS --> SPS[SolanaPaymentService]
        PMS --> ARPS[ArbitrumPaymentService]
    end

    subgraph "Smart Contracts"
        EPP[PaymentProcessor ETH]
        BPP[PaymentProcessor BSC]
        PPP[PaymentProcessor Polygon]
        APP[PaymentProcessor Avalanche]
        SPP[Program Solana]
        ARPP[PaymentProcessor Arbitrum]
    end

    subgraph "Backend"
        PSS[PaymentSessionService] --> TX[Transaction Monitoring]
        PSS --> EP[Event Processing]
        PSS --> PC[Price Calculation & Conversion]
        PSS --> SR[Storage & Reporting]
    end

    UI --> PMS
    PMS --> PSS
    EPS --> EPP
    BPS --> BPP
    PPS --> PPP
    APS --> APP
    SPS --> SPP
    ARPS --> ARPP

    EPP --> WALLET[Wallet MetaMask\n92e92b2705edc3d4c7204f961cc659c0]
    BPP --> WALLET
    PPP --> WALLET
    APP --> WALLET
    SPP --> WALLET
    ARPP --> WALLET

2. Options de paiement par blockchain
   TokenForge supportera les modes de paiement suivants pour chaque blockchain:
   2.1 Cryptomonnaies supportées
   BlockchainCrypto NativeStablecoinsEthereumETHUSDT, USDC, DAIBSCBNBBUSD, USDT, USDCPolygonMATICUSDT, USDC, DAIAvalancheAVAXUSDT, USDC, DAI.eSolanaSOLUSDT, USDCArbitrumETHUSDT, USDC, DAI
   2.2 Conversion de prix
   Pour assurer une tarification cohérente, le système:

Maintient tous les prix en EUR dans le backend
Convertit en temps réel les prix en crypto selon le taux de change actuel
Ajoute une petite marge de sécurité (2-5%) pour tenir compte de la volatilité

3. Composants clés du système

export interface IPaymentService {
// Méthode pour initialiser une session de paiement
initPaymentSession(params: PaymentInitParams): Promise<PaymentSession>;

// Méthode pour vérifier l'état d'un paiement
checkPaymentStatus(sessionId: string): Promise<PaymentStatus>;

// Méthode pour confirmer la réception d'un paiement
confirmPayment(sessionId: string, txHash: string): Promise<boolean>;

// Méthode pour obtenir les cryptomonnaies supportées
getSupportedCryptocurrencies(): Promise<CryptocurrencyInfo[]>;

// Méthode pour obtenir les frais de transaction estimés
estimateTransactionFees(amount: number, currencyAddress: string): Promise<FeeEstimate>;

// Méthode pour convertir EUR en crypto
convertEURtoCrypto(amountEUR: number, currencySymbol: string): Promise<CryptoAmount>;
}

// Types partagés
export interface PaymentInitParams {
userId: string;
productId: string;
productType: 'token_creation' | 'subscription' | 'premium_service' | 'marketplace';
amount: number; // Montant en équivalent EUR
discountCode?: string;
subscriptionPeriod?: 'monthly' | 'annual';
currency: string; // Symbol or address of the cryptocurrency/token to use
payerAddress: string; // Address of the user's wallet
}

export interface PaymentSession {
sessionId: string;
receivingAddress: string; // Adresse du wallet MetaMask (92e92b2705edc3d4c7204f961cc659c0)
amountDue: CryptoAmount;
currency: CryptocurrencyInfo;
exchangeRate: number;
expiresAt: number; // Timestamp d'expiration
chainId: number; // ID de la blockchain
status: PaymentStatus;
minConfirmations: number; // Nombre de confirmations requis
}

export enum PaymentStatus {
PENDING = 'pending',
CONFIRMING = 'confirming',
COMPLETED = 'completed',
EXPIRED = 'expired',
FAILED = 'failed'
}

export interface CryptocurrencyInfo {
symbol: string; // Ex: 'ETH', 'USDT'
address: string | null; // Null for native cryptos like ETH, BNB
name: string; // Ex: 'Ethereum', 'Tether USD'
decimals: number; // Nombre de décimales
isNative: boolean; // true for ETH, BNB, MATIC, etc.
isStablecoin: boolean; // true for USDT, USDC, etc.
logoUrl: string; // URL du logo
minAmount: number; // Montant minimum accepté en valeur EUR
}

export interface CryptoAmount {
amount: string; // Amount in smallest unit (wei, satoshi, etc.)
formatted: string; // Human-readable formatted amount with symbol
valueEUR: number; // Equivalent value in EUR
}

export interface FeeEstimate {
baseFee: CryptoAmount;
maxFee: CryptoAmount;
estimatedTimeSeconds: number;
}

import { ethers } from 'ethers';
import {
IPaymentService,
PaymentInitParams,
PaymentSession,
PaymentStatus,
CryptocurrencyInfo,
FeeEstimate,
CryptoAmount
} from './interfaces';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../firebase/config';
import { PriceOracleService } from './PriceOracleService';

// ABI minimal pour interagir avec un token ERC20
const ERC20_ABI = [
'function balanceOf(address owner) view returns (uint256)',
'function transfer(address to, uint256 amount) returns (bool)',
'function decimals() view returns (uint8)',
'event Transfer(address indexed from, address indexed to, uint256 amount)'
];

export class EthereumPaymentService implements IPaymentService {
private provider: ethers.providers.Provider;
private receivingAddress: string = '0x92e92b2705edc3d4c7204f961cc659c0';
private priceOracle: PriceOracleService;

// Liste des cryptomonnaies supportées sur Ethereum
private supportedCrypto: Record<string, CryptocurrencyInfo> = {
// ETH (natif)
'ETH': {
symbol: 'ETH',
address: null, // Natif - pas d'adresse de contrat
name: 'Ethereum',
decimals: 18,
isNative: true,
isStablecoin: false,
logoUrl: '/assets/crypto/eth.png',
minAmount: 5 // Minimum 5 EUR équivalent
},
// USDT
'USDT': {
symbol: 'USDT',
address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
name: 'Tether USD',
decimals: 6,
isNative: false,
isStablecoin: true,
logoUrl: '/assets/crypto/usdt.png',
minAmount: 5
},
// USDC
'USDC': {
symbol: 'USDC',
address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
name: 'USD Coin',
decimals: 6,
isNative: false,
isStablecoin: true,
logoUrl: '/assets/crypto/usdc.png',
minAmount: 5
},
// DAI
'DAI': {
symbol: 'DAI',
address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
name: 'Dai Stablecoin',
decimals: 18,
isNative: false,
isStablecoin: true,
logoUrl: '/assets/crypto/dai.png',
minAmount: 5
}
};

constructor() {
// Utilisation d'Infura ou Alchemy comme provider
this.provider = new ethers.providers.JsonRpcProvider(
process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY'
);
this.priceOracle = new PriceOracleService();
}

async initPaymentSession(params: PaymentInitParams): Promise<PaymentSession> {
// Vérifier que la crypto est supportée
const currency = this.supportedCrypto[params.currency];
if (!currency) {
throw new Error(`Cryptocurrency ${params.currency} not supported on Ethereum`);
}

    // Convertir le montant EUR en crypto
    const cryptoAmount = await this.convertEURtoCrypto(params.amount, params.currency);

    // Générer un ID de session unique
    const sessionId = uuidv4();

    // Créer la session de paiement
    const session: PaymentSession = {
      sessionId,
      receivingAddress: this.receivingAddress,
      amountDue: cryptoAmount,
      currency,
      exchangeRate: cryptoAmount.valueEUR / params.amount,
      expiresAt: Math.floor(Date.now() / 1000) + 3600, // Expire dans 1 heure
      chainId: 1, // Mainnet Ethereum
      status: PaymentStatus.PENDING,
      minConfirmations: 3
    };

    // Enregistrer la session dans Firebase
    await db.collection('paymentSessions').doc(sessionId).set({
      ...session,
      userId: params.userId,
      productId: params.productId,
      productType: params.productType,
      createdAt: Date.now(),
      network: 'ethereum'
    });

    return session;

}

async checkPaymentStatus(sessionId: string): Promise<PaymentStatus> {
// Récupérer la session depuis Firebase
const sessionDoc = await db.collection('paymentSessions').doc(sessionId).get();

    if (!sessionDoc.exists) {
      throw new Error('Payment session not found');
    }

    const session = sessionDoc.data() as PaymentSession & { txHash?: string };

    // Si déjà complété ou expiré, retourner le statut actuel
    if (session.status === PaymentStatus.COMPLETED ||
        session.status === PaymentStatus.EXPIRED ||
        session.status === PaymentStatus.FAILED) {
      return session.status;
    }

    // Vérifier si la session a expiré
    if (session.expiresAt < Math.floor(Date.now() / 1000)) {
      await db.collection('paymentSessions').doc(sessionId).update({
        status: PaymentStatus.EXPIRED
      });
      return PaymentStatus.EXPIRED;
    }

    // Si un hash de transaction existe, vérifier les confirmations
    if (session.txHash) {
      try {
        const tx = await this.provider.getTransaction(session.txHash);

        if (!tx) {
          return PaymentStatus.CONFIRMING;
        }

        const currentBlock = await this.provider.getBlockNumber();
        const confirmations = tx.blockNumber ? currentBlock - tx.blockNumber + 1 : 0;

        if (confirmations >= session.minConfirmations) {
          await db.collection('paymentSessions').doc(sessionId).update({
            status: PaymentStatus.COMPLETED,
            confirmedAt: Date.now()
          });
          return PaymentStatus.COMPLETED;
        } else {
          return PaymentStatus.CONFIRMING;
        }
      } catch (error) {
        console.error('Error checking transaction status:', error);
        return session.status;
      }
    }

    return session.status;

}

async confirmPayment(sessionId: string, txHash: string): Promise<boolean> {
// Récupérer la session
const sessionDoc = await db.collection('paymentSessions').doc(sessionId).get();

    if (!sessionDoc.exists) {
      throw new Error('Payment session not found');
    }

    const session = sessionDoc.data() as PaymentSession;

    try {
      // Récupérer les détails de la transaction
      const tx = await this.provider.getTransaction(txHash);

      if (!tx) {
        throw new Error('Transaction not found');
      }

      const isNativeCrypto = session.currency.isNative;

      if (isNativeCrypto) {
        // Vérification pour ETH natif
        if (tx.to?.toLowerCase() !== this.receivingAddress.toLowerCase()) {
          throw new Error('Invalid recipient for ETH payment');
        }

        const amountWei = tx.value;
        const amountEth = parseFloat(ethers.utils.formatEther(amountWei));

        // Vérifier que le montant est suffisant (avec une marge de 1% pour les arrondis)
        const requiredAmount = parseFloat(ethers.utils.formatUnits(
          session.amountDue.amount,
          session.currency.decimals
        ));

        if (amountEth < requiredAmount * 0.99) {
          throw new Error('Insufficient ETH payment amount');
        }
      } else {
        // Vérification pour tokens ERC20
        if (tx.to?.toLowerCase() !== session.currency.address?.toLowerCase()) {
          throw new Error('Invalid token address');
        }

        // Analyser l'input data pour vérifier le destinataire et le montant
        const tokenInterface = new ethers.utils.Interface(ERC20_ABI);
        const decodedData = tokenInterface.parseTransaction({ data: tx.data, value: tx.value });

        if (decodedData.name !== 'transfer') {
          throw new Error('Not a transfer transaction');
        }

        const [recipient, amount] = decodedData.args;

        if (recipient.toLowerCase() !== this.receivingAddress.toLowerCase()) {
          throw new Error('Invalid recipient address');
        }

        // Obtenir les décimales du token
        const decimals = session.currency.decimals;

        // Convertir le montant avec les bonnes décimales
        const sentAmount = parseFloat(ethers.utils.formatUnits(amount, decimals));
        const requiredAmount = parseFloat(ethers.utils.formatUnits(
          session.amountDue.amount,
          decimals
        ));

        // Vérifier que le montant est suffisant (avec une marge de 1% pour les arrondis)
        if (sentAmount < requiredAmount * 0.99) {
          throw new Error('Insufficient token payment amount');
        }
      }

      // Mettre à jour la session
      await db.collection('paymentSessions').doc(sessionId).update({
        status: PaymentStatus.CONFIRMING,
        txHash,
        updatedAt: Date.now()
      });

      return true;
    } catch (error) {
      console.error('Error confirming payment:', error);

      // Mettre à jour la session avec l'erreur
      await db.collection('paymentSessions').doc(sessionId).update({
        status: PaymentStatus.FAILED,
        error: (error as Error).message,
        updatedAt: Date.now()
      });

      return false;
    }

}

async getSupportedCryptocurrencies(): Promise<CryptocurrencyInfo[]> {
return Object.values(this.supportedCrypto);
}

async estimateTransactionFees(amount: number, currencyAddress: string | null): Promise<FeeEstimate> {
try {
// Obtenir le prix actuel du gas
const gasPrice = await this.provider.getGasPrice();

      // Estimation du gas nécessaire (différent pour ETH ou tokens)
      const estimatedGas = currencyAddress === null
        ? ethers.BigNumber.from(21000)       // Transaction ETH standard
        : ethers.BigNumber.from(65000);      // Transaction ERC20

      // Calculer les frais en ETH
      const baseFeeWei = gasPrice.mul(estimatedGas);
      const maxFeeWei = baseFeeWei.mul(120).div(100); // +20%

      // Convertir en valeur EUR pour l'affichage
      const ethPriceEUR = await this.priceOracle.getCryptoPrice('ETH', 'EUR');
      const baseFeeETH = parseFloat(ethers.utils.formatEther(baseFeeWei));
      const maxFeeETH = parseFloat(ethers.utils.formatEther(maxFeeWei));

      return {
        baseFee: {
          amount: baseFeeWei.toString(),
          formatted: `${baseFeeETH.toFixed(6)} ETH`,
          valueEUR: baseFeeETH * ethPriceEUR
        },
        maxFee: {
          amount: maxFeeWei.toString(),
          formatted: `${maxFeeETH.toFixed(6)} ETH`,
          valueEUR: maxFeeETH * ethPriceEUR
        },
        estimatedTimeSeconds: 30
      };
    } catch (error) {
      console.error('Error estimating fees:', error);

      // Valeurs par défaut en cas d'erreur
      return {
        baseFee: {
          amount: '0',
          formatted: '0.005 ETH',
          valueEUR: 0.5
        },
        maxFee: {
          amount: '0',
          formatted: '0.008 ETH',
          valueEUR: 0.8
        },
        estimatedTimeSeconds: 60
      };
    }

}

async convertEURtoCrypto(amountEUR: number, currencySymbol: string): Promise<CryptoAmount> {
try {
const currency = this.supportedCrypto[currencySymbol];

      if (!currency) {
        throw new Error(`Currency ${currencySymbol} not supported`);
      }

      if (currency.isStablecoin) {
        // Pour les stablecoins, on considère 1 USD ≈ 1 stablecoin
        // avec un taux de conversion EUR/USD
        const eurUsdRate = await this.priceOracle.getEURUSDRate();
        const stablecoinAmount = amountEUR * eurUsdRate;

        // Ajouter une marge de sécurité de 2%
        const adjustedAmount = stablecoinAmount * 1.02;

        // Convertir en unités avec les décimales appropriées
        const rawAmount = ethers.utils.parseUnits(
          adjustedAmount.toFixed(currency.decimals),
          currency.decimals
        );

        return {
          amount: rawAmount.toString(),
          formatted: `${adjustedAmount.toFixed(2)} ${currency.symbol}`,
          valueEUR: amountEUR
        };
      } else {
        // Pour ETH, obtenir le prix actuel
        const cryptoPriceEUR = await this.priceOracle.getCryptoPrice(currencySymbol, 'EUR');

        // Calculer le montant en crypto
        const cryptoAmount = amountEUR / cryptoPriceEUR;

        // Ajouter une marge de sécurité de 5% pour la volatilité
        const adjustedAmount = cryptoAmount * 1.05;

        // Convertir en unités avec les décimales appropriées
        const rawAmount = ethers.utils.parseUnits(
          adjustedAmount.toFixed(18),
          currency.decimals
        );

        return {
          amount: rawAmount.toString(),
          formatted: `${adjustedAmount.toFixed(6)} ${currency.symbol}`,
          valueEUR: amountEUR
        };
      }
    } catch (error) {
      console.error('Error converting EUR to crypto:', error);
      throw new Error(`Failed to convert EUR to ${currencySymbol}`);
    }

}
}

import axios from 'axios';
import { db } from '../firebase/config';

/\*\*

- Service pour obtenir les taux de change entre crypto et monnaies fiat
  \*/
  export class PriceOracleService {
  // Cache pour les prix avec timestamp
  private priceCache: Record<string, { price: number, timestamp: number }> = {};

// Durée de validité du cache en millisecondes (5 minutes)
private cacheDuration = 5 _ 60 _ 1000;

/\*\*

- Obtient le prix actuel d'une cryptomonnaie dans la devise spécifiée
- @param cryptoSymbol Symbole de la crypto (ETH, BTC, etc.)
- @param fiatCurrency Devise cible (EUR, USD, etc.)
- @returns Le prix de la crypto dans la devise spécifiée
  \*/
  async getCryptoPrice(cryptoSymbol: string, fiatCurrency: string): Promise<number> {
  const cacheKey = `${cryptoSymbol}-${fiatCurrency}`;


    // Vérifier si le prix est en cache et encore valide
    const cachedData = this.priceCache[cacheKey];
    if (cachedData && Date.now() - cachedData.timestamp < this.cacheDuration) {
      return cachedData.price;
    }

    try {
      // Vérifier d'abord dans Firebase (pour avoir une valeur de secours)
      const dbPriceData = await this.getPriceFromFirebase(cryptoSymbol, fiatCurrency);

      // Essayer d'obtenir le prix en temps réel
      const livePrice = await this.fetchLivePrice(cryptoSymbol, fiatCurrency);

      // Mettre en cache
      this.priceCache[cacheKey] = {
        price: livePrice,
        timestamp: Date.now()
      };

      // Mettre à jour Firebase en arrière-plan
      this.updatePriceInFirebase(cryptoSymbol, fiatCurrency, livePrice)
        .catch(err => console.error('Error updating price in Firebase:', err));

      return livePrice;
    } catch (error) {
      console.error('Error fetching crypto price:', error);

      // Utiliser le prix de secours de Firebase s'il existe
      const dbPriceData = await this.getPriceFromFirebase(cryptoSymbol, fiatCurrency);
      if (dbPriceData) {
        return dbPriceData.price;
      }

      // Sinon erreur
      throw new Error(`Failed to get price for ${cryptoSymbol}/${fiatCurrency}`);
    }

}

/\*\*

- Obtient le taux de change EUR/USD
- @returns Le taux EUR/USD actuel
  \*/
  async getEURUSDRate(): Promise<number> {
  return this.getCryptoPrice('EUR', 'USD');
  }

/\*\*

- Récupère le prix depuis l'API CoinGecko
  \*/
  private async fetchLivePrice(cryptoSymbol: string, fiatCurrency: string): Promise<number> {
  // Gérer des cas spéciaux
  if (cryptoSymbol === 'EUR' && fiatCurrency === 'USD') {
  // Pour le taux EUR/USD, utiliser une API de forex
  const response = await axios.get('https://api.exchangerate-api.com/v4/latest/EUR');
  return response.data.rates.USD;
  }


    // Pour les cryptos, utiliser CoinGecko
    const coingeckoId = this.getCoingeckoId(cryptoSymbol);
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=${fiatCurrency.toLowerCase()}`
    );

    return response.data[coingeckoId][fiatCurrency.toLowerCase()];

}

/\*\*

- Récupère le prix depuis Firebase (cache de secours)
  \*/
  private async getPriceFromFirebase(cryptoSymbol: string, fiatCurrency: string):
  Promise<{ price: number, timestamp: number } | null> {
  try {
  const priceDoc = await db.collection('cryptoPrices')
  .doc(`${cryptoSymbol}-${fiatCurrency}`)
  .get();
      if (priceDoc.exists) {
        return priceDoc.data() as { price: number, timestamp: number };
      }

      return null;
  } catch (error) {
  console.error('Error getting price from Firebase:', error);
  return null;
  }
  }

/\*\*

- Met à jour le prix dans Firebase
  \*/
  private async updatePriceInFirebase(cryptoSymbol: string, fiatCurrency: string, price: number): Promise<void> {
  await db.collection('cryptoPrices')
  .doc(`${cryptoSymbol}-${fiatCurrency}`)
  .set({
  price,
  timestamp: Date.now(),
  symbol: cryptoSymbol,
  currency: fiatCurrency
  });
  }

/\*\*

- Convertit le symbole en ID CoinGecko
  \*/
  private getCoingeckoId(symbol: string): string {
  // Mapping des symboles vers les IDs CoinGecko
  const symbolToId: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'BNB': 'binancecoin',
  'MATIC': 'matic-network',
  'AVAX': 'avalanche-2',
  'SOL': 'solana',
  'USDT': 'tether',
  'USDC': 'usd-coin',
  'DAI': 'dai',
  'BUSD': 'binance-usd'
  };


    return symbolToId[symbol] || symbol.toLowerCase();

}

/\*\*

- Convertit un montant de EUR vers une crypto spécifiée
  \*/
  async convertEURToCrypto(amountEUR: number, cryptoSymbol: string): Promise<number> {
  // Obtenir le taux de change
  const cryptoPrice = await this.getCryptoPrice(cryptoSymbol, 'EUR');


    // Calculer le montant en crypto
    return amountEUR / cryptoPrice;

}

/\*\*

- Convertit un montant de crypto vers EUR
  \*/
  async convertCryptoToEUR(amountCrypto: number, cryptoSymbol: string): Promise<number> {
  // Obtenir le taux de change
  const cryptoPrice = await this.getCryptoPrice(cryptoSymbol, 'EUR');


    // Calculer le montant en EUR
    return amountCrypto * cryptoPrice;

}
}

4. UI de paiement avec sélection de cryptomonnaie

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import {
Box,
Button,
Card,
CircularProgress,
Dialog,
DialogContent,
DialogTitle,
Divider,
FormControl,
Grid,
MenuItem,
Select,
Step,
StepLabel,
Stepper,
Typography,
IconButton,
InputAdornment,
Tooltip,
Chip
} from '@mui/material';
import { CryptocurrencyInfo, PaymentSession, PaymentStatus } from '../../services/interfaces';
import InfoIcon from '@mui/icons-material/Info';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

// ABI minimal pour ERC20
const ERC20_ABI = [
'function balanceOf(address owner) view returns (uint256)',
'function decimals() view returns (uint8)',
'function symbol() view returns (string)',
'function transfer(address to, uint256 amount) returns (bool)',
'function allowance(address owner, address spender) view returns (uint256)',
'function approve(address spender, uint256 amount) returns (bool)'
];

interface PaymentFlowProps {
productId: string;
productType: 'token_creation' | 'subscription' | 'premium_service' | 'marketplace';
amount: number; // Montant en EUR
onSuccess: (txHash: string) => void;
onCancel: () => void;
}

const PaymentFlow: React.FC<PaymentFlowProps> = ({
productId,
productType,
amount,
onSuccess,
onCancel
}) => {
const { account, chainId, library, activate } = useWeb3React();

const [activeStep, setActiveStep] = useState(0);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const [selectedNetwork, setSelectedNetwork] = useState<string>('ethereum');
const [supportedNetworks, setSupportedNetworks] = useState<Array<{id: string, name: string, chainId: number}>>([]);

const [selectedCrypto, setSelectedCrypto] = useState<string>('');
const [supportedCryptos, setSupportedCryptos] = useState<CryptocurrencyInfo[]>([]);

const [paymentSession, setPaymentSession] = useState<PaymentSession | null>(null);
const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);

const [txHash, setTxHash] = useState<string>('');
const [isWrongNetwork, setIsWrongNetwork] = useState<boolean>(false);

// Récupérer les réseaux supportés
useEffect(() => {
const fetchSupportedNetworks = async () => {
try {
const response = await fetch('/api/payments/networks');
const data = await response.json();
setSupportedNetworks(data.networks);

        // Sélectionner le réseau correspondant au chainId actuel si disponible
        if (chainId) {
          const matchingNetwork = data.networks.find((n: any) => n.chainId === chainId);
          if (matchingNetwork) {
            setSelectedNetwork(matchingNetwork.id);
          } else {
            setIsWrongNetwork(true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch supported networks:', error);
        setError('Impossible de récupérer les réseaux supportés.');
      }
    };

    fetchSupportedNetworks();

}, [chainId]);

// Vérifier si le réseau est correct
useEffect(() => {
if (chainId && supportedNetworks.length > 0) {
const network = supportedNetworks.find(n => n.id === selectedNetwork);
setIsWrongNetwork(network?.chainId !== chainId);
}
}, [chainId, selectedNetwork, supportedNetworks]);

// Récupérer les cryptos supportées pour le réseau sélectionné
useEffect(() => {
const fetchSupportedCryptos = async () => {
if (!selectedNetwork) return;

      setLoading(true);
      try {
        const response = await fetch(`/api/payments/cryptocurrencies?network=${selectedNetwork}`);
        const data = await response.json();

        setSupportedCryptos(data.cryptocurrencies);

        // Sélectionner par défaut la crypto native (ETH, BNB, etc.)
        const nativeCrypto = data.cryptocurrencies.find((c: CryptocurrencyInfo) => c.isNative);
        if (nativeCrypto && !selectedCrypto) {
          setSelectedCrypto(nativeCrypto.symbol);
        }
      } catch (error) {
        console.error('Failed to fetch supported cryptocurrencies:', error);
        setError('Impossible de récupérer les cryptomonnaies supportées.');
      } finally {
        setLoading(false);
      }
    };

    fetchSupportedCryptos();

}, [selectedNetwork]);

// Initialiser une session de paiement
const initPaymentSession = async () => {
if (!account) {
setError('Veuillez connecter votre wallet.');
return;
}

    setLoading(true);
    setError(null);

    try {
      // Appel à l'API pour créer une session de paiement
      const response = await fetch('/api/payments/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          productType,
          amount,
          network: selectedNetwork,
          currency: selectedCrypto,
          payerAddress: account
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la création de la session de paiement');
      }

      setPaymentSession(data.session);
      setActiveStep(1); // Passer à l'étape suivante
    } catch (error) {
      console.error('Error creating payment session:', error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }

};

// Fonction pour changer de réseau
const switchNetwork = async (networkId: string) => {
try {
const network = supportedNetworks.find(n => n.id === networkId);
if (!network) {
throw new Error('Réseau non supporté');
}

      if (!window.ethereum) {
        throw new Error('MetaMask non détecté');
      }

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${network.chainId.toString(16)}` }],
      });
    } catch (error) {
      console.error('Error switching network:', error);
      setError('Impossible de changer de réseau. Veuillez le faire manuellement dans votre wallet.');
    }

};

// Envoyer le paiement
const sendPayment = async () => {
if (!account || !library || !paymentSession) {
setError('Portefeuille non connecté ou session de paiement invalide');
return;
}

    setLoading(true);
    setError(null);

    try {
      // Vérifier que l'utilisateur est sur le bon réseau
      const network = supportedNetworks.find(n => n.id === selectedNetwork);
      if (chainId !== network?.chainId) {
        setError(`Veuillez changer de réseau pour ${network?.name}`);
        setIsWrongNetwork(true);
        return;
      }

      const signer = library.getSigner(account);
      const currency = paymentSession.currency;

      if (currency.isNative) {
        // Paiement en crypto native (ETH, BNB, etc.)
        const tx = await signer.sendTransaction({
          to: paymentSession.receivingAddress,
          value: ethers.BigNumber.from(paymentSession.amountDue.amount)
        });

        setTxHash(tx.hash);
        setActiveStep(2); // Passer à l'étape de confirmation

        // Attendre la confirmation
        await tx.wait(1);

        // Notifier le backend
        await confirmPaymentOnBackend(tx.hash);
      } else {
        // Paiement en token (USDT, etc.)
        const tokenContract = new ethers.Contract(
          currency.address as string,
          ERC20_ABI,
          signer
        );

        // Envoyer la transaction
        const tx = await tokenContract.transfer(
          paymentSession.receivingAddress,
          paymentSession.amountDue.amount
        );

        setTxHash(tx.hash);
        setActiveStep(2); // Passer à l'étape de confirmation

        // Attendre la confirmation
        await tx.wait(1);

        // Notifier le backend
        await confirmPaymentOnBackend(tx.hash);
      }
    } catch (error) {
      console.error('Error sending payment:', error);
      setError((error as any).message || 'Erreur lors de l\'envoi du paiement');
    } finally {
      setLoading(false);
    }

};

// Confirmer le paiement sur le backend
const confirmPaymentOnBackend = async (hash: string) => {
if (!paymentSession) return;

    try {
      const response = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: paymentSession.sessionId,
          txHash: hash
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la confirmation du paiement');
      }

      // Vérifier périodiquement le statut du paiement
      checkPaymentStatus();
    } catch (error) {
      console.error('Error confirming payment:', error);
      setError((error as Error).message);
    }

};

// Vérifier le statut du paiement
const checkPaymentStatus = async () => {
if (!paymentSession) return;

    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(`/api/payments/status?sessionId=${paymentSession.sessionId}`);
        const data = await response.json();

        setPaymentStatus(data.status);

        if (data.status === PaymentStatus.COMPLETED) {
          clearInterval(intervalId);
          onSuccess(txHash);
        } else if (data.status === PaymentStatus.FAILED || data.status === PaymentStatus.EXPIRED) {
          clearInterval(intervalId);
          setError('Le paiement a échoué ou a expiré. Veuillez réessayer.');
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        clearInterval(intervalId);
      }
    }, 5000); // Vérifier toutes les 5 secondes

    // Nettoyer l'intervalle lors du démontage du composant
    return () => clearInterval(intervalId);

};

// Copier dans le presse-papier
const copyToClipboard = (text: string) => {
navigator.clipboard.writeText(text);
};

// Rendu de l'étape de sélection du réseau et de la crypto
const renderNetworkSelection = () => (
<Box sx={{ p: 2 }}>
<Typography variant="h6" gutterBottom>
Sélectionnez votre méthode de paiement
</Typography>

      {!account && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
          <Typography variant="body2">
            Veuillez connecter votre wallet pour continuer.
          </Typography>
        </Box>
      )}

      <FormControl fullWidth sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Réseau Blockchain
        </Typography>
        <Select
          value={selectedNetwork}
          onChange={(e) => {
            setSelectedNetwork(e.target.value);
            setSelectedCrypto(''); // Réinitialiser la sélection de crypto
          }}
          disabled={loading}
        >
          {supportedNetworks.map((network) => (
            <MenuItem key={network.id} value={network.id}>
              {network.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Cryptomonnaie
        </Typography>
        <Select
          value={selectedCrypto}
          onChange={(e) => setSelectedCrypto(e.target.value)}
          disabled={loading || supportedCryptos.length === 0}
        >
          {supportedCryptos.map((crypto) => (
            <MenuItem key={crypto.symbol} value={crypto.symbol}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <img
                  src={crypto.logoUrl}
                  alt={crypto.symbol}
                  style={{ width: 24, height: 24, marginRight: 8 }}
                />
                {crypto.name} ({crypto.symbol})
                {crypto.isStablecoin && (
                  <Chip
                    label="Stablecoin"
                    size="small"
                    color="primary"
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography variant="subtitle1" gutterBottom>
        Montant à payer: <strong>{amount.toFixed(2)} EUR</strong>
      </Typography>

      <Button
        variant="contained"
        fullWidth
        onClick={initPaymentSession}
        disabled={loading || !selectedNetwork || !selectedCrypto || !account}
      >
        {loading ? <CircularProgress size={24} /> : 'Continuer'}
      </Button>
    </Box>

);

// Rendu de l'étape de paiement
const renderPaymentDetails = () => (
<Box sx={{ p: 2 }}>
<Typography variant="h6" gutterBottom>
Détails du paiement
</Typography>

      {isWrongNetwork && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Vous êtes sur le mauvais réseau. Veuillez changer pour {
              supportedNetworks.find(n => n.id === selectedNetwork)?.name
            }.
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={() => switchNetwork(selectedNetwork)}
          >
            Changer de réseau
          </Button>
        </Box>
      )}

      {paymentSession && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Montant
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {paymentSession.amountDue.formatted}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ≈ {paymentSession.amountDue.valueEUR.toFixed(2)} EUR
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Blockchain
              </Typography>
              <Typography variant="body1">
                {supportedNetworks.find(n => n.id === selectedNetwork)?.name}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Adresse de réception
                <Tooltip title="Copier l'adresse">
                  <IconButton
                    size="small"
                    onClick={() => copyToClipboard(paymentSession.receivingAddress)}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Typography>
              <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                {paymentSession.receivingAddress}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Expire le
              </Typography>
              <Typography variant="body1">
                {new Date(paymentSession.expiresAt * 1000).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="info.main" sx={{ mb: 1 }}>
              <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
              Le montant inclut une petite marge pour couvrir la volatilité des prix.
            </Typography>
          </Box>

          <Button
            variant="contained"
            fullWidth
            onClick={sendPayment}
            disabled={loading || isWrongNetwork}
          >
            {loading ?
              <CircularProgress size={24} /> :
              `Payer avec ${paymentSession.currency.symbol}`
            }
          </Button>
        </>
      )}
    </Box>

);

// Rendu de l'étape de confirmation
const renderConfirmation = () => (
<Box sx={{ p: 2 }}>
<Typography variant="h6" gutterBottom>
Confirmation du paiement
</Typography>

      {txHash && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Hash de transaction
            <Tooltip title="Copier le hash">
              <IconButton
                size="small"
                onClick={() => copyToClipboard(txHash)}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>
          <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
            {txHash}
          </Typography>

          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {paymentStatus === PaymentStatus.CONFIRMING && (
              <>
                <CircularProgress size={40} sx={{ mb: 2 }} />
                <Typography>
                  Confirmation de la transaction en cours...
                </Typography>
              </>
            )}

            {paymentStatus === PaymentStatus.COMPLETED && (
              <>
                <Box sx={{ color: 'success.main', fontSize: 48, mb: 2 }}>
                  ✓
                </Box>
                <Typography variant="h6" color="success.main">
                  Paiement confirmé !
                </Typography>
              </>
            )}
          </Box>
        </Box>
      )}

      <Button
        variant="contained"
        fullWidth
        onClick={() => paymentStatus === PaymentStatus.COMPLETED ? onSuccess(txHash) : null}
        disabled={paymentStatus !== PaymentStatus.COMPLETED}
      >
        Continuer
      </Button>
    </Box>

);

return (
<Dialog open maxWidth="sm" fullWidth>
<DialogTitle>
Paiement {productType === 'token_creation' ? 'Création de token' :
productType === 'subscription' ? 'Abonnement' :
productType === 'premium_service' ? 'Service Premium' :
'Marketplace'}
</DialogTitle>
<DialogContent>
<Box sx={{ width: '100%' }}>
<Stepper activeStep={activeStep} sx={{ mb: 3 }}>
<Step>
<StepLabel>Méthode</StepLabel>
</Step>
<Step>
<StepLabel>Paiement</StepLabel>
</Step>
<Step>
<StepLabel>Confirmation</StepLabel>
</Step>
</Stepper>

          <Card>
            {error && (
              <Box sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText', mb: 2 }}>
                <Typography>{error}</Typography>
              </Box>
            )}

            {activeStep === 0 && renderNetworkSelection()}
            {activeStep === 1 && renderPaymentDetails()}
            {activeStep === 2 && renderConfirmation()}
          </Card>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={onCancel} color="inherit">
              Annuler
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>

);
};

export default PaymentFlow;

5. Smart Contract Multi-Chain de paiement

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/\*\*

- @title TokenForgePaymentProcessor
- @dev Contrat pour gérer les paiements de TokenForge en cryptomonnaies natives et stablecoins
  \*/
  contract TokenForgePaymentProcessor is Ownable, ReentrancyGuard {
  // Adresse du wallet destinataire des paiements
  address public paymentWallet;
      // Liste des tokens acceptés
      mapping(address => bool) public acceptedTokens;

      // Structure pour stocker les informations de session de paiement
      struct PaymentSession {
          string sessionId;
          address payerAddress;
          address tokenAddress; // null (address(0)) pour les paiements en crypto native
          uint256 amountDue;
          uint256 createdAt;
          uint256 expiresAt;
          bool completed;
      }

      // Mapping des sessions de paiement par ID
      mapping(string => PaymentSession) public paymentSessions;

      // Événements
      event PaymentSessionCreated(
          string sessionId,
          address payerAddress,
          address tokenAddress,
          uint256 amountDue,
          uint256 expiresAt
      );

      event NativePaymentReceived(
          string sessionId,
          address payer,
          uint256 amount
      );

      event TokenPaymentReceived(
          string sessionId,
          address payer,
          address token,
          uint256 amount
      );

      event TokenAdded(address tokenAddress);
      event TokenRemoved(address tokenAddress);

      /**
       * @dev Constructeur
       * @param _paymentWallet Adresse du wallet qui recevra les paiements
       * @param _initialTokens Tableau des adresses de tokens acceptés initialement
       */
      constructor(address _paymentWallet, address[] memory _initialTokens) {
          require(_paymentWallet != address(0), "Invalid payment wallet");
          paymentWallet = _paymentWallet;

          for (uint i = 0; i < _initialTokens.length; i++) {
              _addAcceptedToken(_initialTokens[i]);
          }
      }

      /**
       * @dev Fonction pour recevoir des paiements en crypto native
       */
      receive() external payable {
          // Cette fonction permet de recevoir des paiements directs en ETH, BNB, etc.
          emit NativePaymentReceived("direct", msg.sender, msg.value);
      }

      /**
       * @dev Fonction de secours
       */
      fallback() external payable {
          // Redirection vers la fonction receive
          emit NativePaymentReceived("fallback", msg.sender, msg.value);
      }

      /**
       * @dev Ajouter un token à la liste des tokens acceptés
       * @param tokenAddress Adresse du contrat de token
       */
      function addAcceptedToken(address tokenAddress) external onlyOwner {
          _addAcceptedToken(tokenAddress);
      }

      /**
       * @dev Implémentation interne pour ajouter un token
       */
      function _addAcceptedToken(address tokenAddress) internal {
          require(tokenAddress != address(0), "Invalid token address");
          require(!acceptedTokens[tokenAddress], "Token already accepted");

          acceptedTokens[tokenAddress] = true;
          emit TokenAdded(tokenAddress);
      }

      /**
       * @dev Retirer un token de la liste des tokens acceptés
       * @param tokenAddress Adresse du contrat de token
       */
      function removeAcceptedToken(address tokenAddress) external onlyOwner {
          require(acceptedTokens[tokenAddress], "Token not in accepted list");

          acceptedTokens[tokenAddress] = false;
          emit TokenRemoved(tokenAddress);
      }

      /**
       * @dev Mettre à jour l'adresse du wallet de paiement
       * @param newWallet Nouvelle adresse du wallet
       */
      function updatePaymentWallet(address newWallet) external onlyOwner {
          require(newWallet != address(0), "Invalid wallet address");
          paymentWallet = newWallet;
      }

      /**
       * @dev Créer une nouvelle session de paiement pour crypto native
       * @param sessionId Identifiant unique de la session
       * @param payerAddress Adresse qui effectuera le paiement
       * @param amountDue Montant dû (avec les décimales appropriées)
       * @param validityPeriod Durée de validité en secondes
       */
      function createNativePaymentSession(
          string calldata sessionId,
          address payerAddress,
          uint256 amountDue,
          uint256 validityPeriod
      ) external onlyOwner {
          _createPaymentSession(
              sessionId,
              payerAddress,
              address(0), // Adresse nulle pour les paiements en crypto native
              amountDue,
              validityPeriod
          );
      }

      /**
       * @dev Créer une nouvelle session de paiement pour token
       * @param sessionId Identifiant unique de la session
       * @param payerAddress Adresse qui effectuera le paiement
       * @param tokenAddress Adresse du token à utiliser
       * @param amountDue Montant dû (avec les décimales appropriées)
       * @param validityPeriod Durée de validité en secondes
       */
      function createTokenPaymentSession(
          string calldata sessionId,
          address payerAddress,
          address tokenAddress,
          uint256 amountDue,
          uint256 validityPeriod
      ) external onlyOwner {
          require(acceptedTokens[tokenAddress], "Token not accepted");
          _createPaymentSession(
              sessionId,
              payerAddress,
              tokenAddress,
              amountDue,
              validityPeriod
          );
      }

      /**
       * @dev Implémentation interne pour créer une session de paiement
       */
      function _createPaymentSession(
          string calldata sessionId,
          address payerAddress,
          address tokenAddress,
          uint256 amountDue,
          uint256 validityPeriod
      ) internal {
          require(bytes(sessionId).length > 0, "Empty session ID");
          require(payerAddress != address(0), "Invalid payer address");
          require(amountDue > 0, "Amount must be greater than 0");
          require(validityPeriod > 0, "Validity period must be greater than 0");
          require(paymentSessions[sessionId].createdAt == 0, "Session ID already exists");

          uint256 expiresAt = block.timestamp + validityPeriod;

          PaymentSession memory session = PaymentSession({
              sessionId: sessionId,
              payerAddress: payerAddress,
              tokenAddress: tokenAddress,
              amountDue: amountDue,
              createdAt: block.timestamp,
              expiresAt: expiresAt,
              completed: false
          });

          paymentSessions[sessionId] = session;

          emit PaymentSessionCreated(
              sessionId,
              payerAddress,
              tokenAddress,
              amountDue,
              expiresAt
          );
      }

      /**
       * @dev Effectuer un paiement en crypto native pour une session donnée
       * @param sessionId Identifiant de la session de paiement
       */
      function makeNativePayment(string calldata sessionId) external payable nonReentrant {
          PaymentSession storage session = paymentSessions[sessionId];

          require(bytes(session.sessionId).length > 0, "Session not found");
          require(!session.completed, "Payment already completed");
          require(block.timestamp <= session.expiresAt, "Session expired");
          require(msg.sender == session.payerAddress, "Not authorized payer");
          require(session.tokenAddress == address(0), "Not a native crypto payment session");
          require(msg.value >= session.amountDue, "Insufficient payment amount");

          // Marquer la session comme complétée avant le transfert
          session.completed = true;

          // Transférer les fonds au wallet de paiement
          (bool success, ) = paymentWallet.call{value: msg.value}("");
          require(success, "Transfer failed");

          emit NativePaymentReceived(
              sessionId,
              msg.sender,
              msg.value
          );
      }

      /**
       * @dev Effectuer un paiement en token pour une session donnée
       * @param sessionId Identifiant de la session de paiement
       */
      function makeTokenPayment(string calldata sessionId) external nonReentrant {
          PaymentSession storage session = paymentSessions[sessionId];

          require(bytes(session.sessionId).length > 0, "Session not found");
          require(!session.completed, "Payment already completed");
          require(block.timestamp <= session.expiresAt, "Session expired");
          require(msg.sender == session.payerAddress, "Not authorized payer");
          require(session.tokenAddress != address(0), "Not a token payment session");

          IERC20 token = IERC20(session.tokenAddress);
          uint256 amountDue = session.amountDue;

          // Vérifier l'allowance
          require(
              token.allowance(msg.sender, address(this)) >= amountDue,
              "Insufficient allowance"
          );

          // Marquer la session comme complétée avant le transfert
          session.completed = true;

          // Effectuer le transfert
          bool success = token.transferFrom(msg.sender, paymentWallet, amountDue);
          require(success, "Token transfer failed");

          emit TokenPaymentReceived(
              sessionId,
              msg.sender,
              session.tokenAddress,
              amountDue
          );
      }

      /**
       * @dev Paiement direct en token (sans session)
       * @param tokenAddress Adresse du token
       * @param amount Montant à payer
       */
      function directTokenPayment(address tokenAddress, uint256 amount) external nonReentrant {
          require(acceptedTokens[tokenAddress], "Token not accepted");
          require(amount > 0, "Amount must be greater than 0");

          IERC20 token = IERC20(tokenAddress);

          // Vérifier l'allowance
          require(
              token.allowance(msg.sender, address(this)) >= amount,
              "Insufficient allowance"
          );

          // Effectuer le transfert
          bool success = token.transferFrom(msg.sender, paymentWallet, amount);
          require(success, "Token transfer failed");

          emit TokenPaymentReceived(
              "direct",
              msg.sender,
              tokenAddress,
              amount
          );
      }

      /**
       * @dev Annuler une session de paiement expirée
       * @param sessionId Identifiant de la session
       */
      function cancelExpiredSession(string calldata sessionId) external onlyOwner {
          PaymentSession storage session = paymentSessions[sessionId];

          require(bytes(session.sessionId).length > 0, "Session not found");
          require(!session.completed, "Payment already completed");
          require(block.timestamp > session.expiresAt, "Session not expired yet");

          // Supprimer la session
          delete paymentSessions[sessionId];
      }

      /**
       * @dev Vérifier si une session de paiement est complétée
       * @param sessionId Identifiant de la session
       * @return true si le paiement est complété, false sinon
       */
      function isPaymentCompleted(string calldata sessionId) external view returns (bool) {
          return paymentSessions[sessionId].completed;
      }

      /**
       * @dev Récupérer des tokens envoyés par erreur
       * @param tokenAddress Adresse du token à récupérer
       */
      function rescueTokens(address tokenAddress) external onlyOwner {
          IERC20 token = IERC20(tokenAddress);
          uint256 balance = token.balanceOf(address(this));
          require(balance > 0, "No tokens to rescue");

          bool success = token.transfer(paymentWallet, balance);
          require(success, "Token rescue failed");
      }

      /**
       * @dev Récupérer des cryptos natives envoyées par erreur
       */
      function rescueNative() external onlyOwner {
          uint256 balance = address(this).balance;
          require(balance > 0, "No native crypto to rescue");

          (bool success, ) = paymentWallet.call{value: balance}("");
          require(success, "Native crypto rescue failed");
      }

      /**
       * @dev Vérifier si un token est accepté
       * @param tokenAddress Adresse du token
       * @return true si le token est accepté, false sinon
       */
      function isTokenAccepted(address tokenAddress) external view returns (bool) {
          return acceptedTokens[tokenAddress];
      }
  }

6. Routes API Backend pour le système de paiement multi-crypto

import { Router } from 'express';
import { PaymentSessionService } from '../services/PaymentSessionService';
import { PriceOracleService } from '../services/PriceOracleService';
import { auth } from '../middleware/auth';
import { PricingService } from '../services/PricingService';
import { ProductService } from '../services/ProductService';

const router = Router();
const paymentSessionService = new PaymentSessionService();
const priceOracleService = new PriceOracleService();
const pricingService = new PricingService();
const productService = new ProductService();

/\*\*

- @route GET /api/payments/networks
- @desc Récupérer les réseaux blockchain supportés
- @access Public
  \*/
  router.get('/networks', async (req, res) => {
  try {
  const networks = [
  { id: 'ethereum', name: 'Ethereum', chainId: 1 },
  { id: 'bsc', name: 'Binance Smart Chain', chainId: 56 },
  { id: 'polygon', name: 'Polygon', chainId: 137 },
  { id: 'avalanche', name: 'Avalanche', chainId: 43114 },
  { id: 'solana', name: 'Solana', chainId: 0 }, // Pas un EVM
  { id: 'arbitrum', name: 'Arbitrum', chainId: 42161 }
  ];
      res.json({ networks });
  } catch (error) {
  console.error('Error fetching networks:', error);
  res.status(500).json({ message: 'Erreur lors de la récupération des réseaux' });
  }
  });

/\*\*

- @route GET /api/payments/cryptocurrencies
- @desc Récupérer les cryptomonnaies supportées pour un réseau donné
- @access Public
  \*/
  router.get('/cryptocurrencies', async (req, res) => {
  try {
  const { network } = req.query;
      if (!network) {
        return res.status(400).json({ message: 'Paramètre "network" requis' });
      }

      const cryptocurrencies = await paymentSessionService.getSupportedCryptocurrencies(network as string);

      res.json({ cryptocurrencies });
  } catch (error) {
  console.error('Error fetching cryptocurrencies:', error);
  res.status(500).json({ message: 'Erreur lors de la récupération des cryptomonnaies' });
  }
  });

/\*\*

- @route GET /api/payments/convert
- @desc Convertir un montant EUR en cryptomonnaie
- @access Public
  \*/
  router.get('/convert', async (req, res) => {
  try {
  const { amount, currency, network } = req.query;
      if (!amount || !currency || !network) {
        return res.status(400).json({
          message: 'Paramètres "amount", "currency" et "network" requis'
        });
      }

      const paymentService = paymentSessionService.getPaymentService(network as string);

      const cryptoAmount = await paymentService.convertEURtoCrypto(
        parseFloat(amount as string),
        currency as string
      );

      res.json({ conversion: cryptoAmount });
  } catch (error) {
  console.error('Error converting EUR to crypto:', error);
  res.status(500).json({ message: 'Erreur lors de la conversion' });
  }
  });

/\*\*

- @route GET /api/payments/fees
- @desc Estimer les frais de transaction
- @access Public
  \*/
  router.get('/fees', async (req, res) => {
  try {
  const { network, amount, currency } = req.query;
      if (!network || !amount || !currency) {
        return res.status(400).json({
          message: 'Paramètres "network", "amount" et "currency" requis'
        });
      }

      const paymentService = paymentSessionService.getPaymentService(network as string);

      // Obtenir les informations sur la crypto
      const cryptos = await paymentService.getSupportedCryptocurrencies();
      const selectedCrypto = cryptos.find(c => c.symbol === currency);

      if (!selectedCrypto) {
        return res.status(400).json({ message: 'Cryptomonnaie non supportée' });
      }

      const fees = await paymentService.estimateTransactionFees(
        parseFloat(amount as string),
        selectedCrypto.address
      );

      res.json({ fees });
  } catch (error) {
  console.error('Error estimating fees:', error);
  res.status(500).json({ message: 'Erreur lors de l\'estimation des frais' });
  }
  });

/\*\*

- @route POST /api/payments/create-session
- @desc Créer une session de paiement
- @access Private
  \*/
  router.post('/create-session', auth, async (req, res) => {
  try {
  const {
  productId,
  productType,
  network,
  currency,
  payerAddress
  } = req.body;
      // Vérifier les paramètres requis
      if (!productId || !productType || !network || !currency || !payerAddress) {
        return res.status(400).json({
          message: 'Tous les paramètres sont requis'
        });
      }

      // Récupérer le prix du produit
      let amount = 0;

      switch (productType) {
        case 'token_creation':
          // Récupérer le prix de création de token pour le réseau spécifié
          amount = await pricingService.getTokenCreationPrice(network);
          break;

        case 'subscription':
          // Récupérer le prix de l'abonnement
          const plan = await productService.getSubscriptionPlan(productId);
          amount = req.body.subscriptionPeriod === 'annual'
            ? plan.annual
            : plan.monthly;
          break;

        case 'premium_service':
          // Récupérer le prix du service premium
          const service = await productService.getPremiumService(productId);
          amount = service.price;
          break;

        case 'marketplace':
          // Récupérer le prix de l'article sur la marketplace
          const item = await productService.getMarketplaceItem(productId);
          amount = item.price;
          break;

        default:
          return res.status(400).json({ message: 'Type de produit non supporté' });
      }

      // Vérifier que le montant est valide
      if (amount <= 0) {
        return res.status(400).json({ message: 'Prix du produit invalide' });
      }

      // Appliquer les réductions en fonction du type d'abonnement
      if (productType === 'token_creation') {
        amount = await pricingService.calculateTokenCreationPrice(network, req.user.id);
      }

      // Appliquer les codes promo si présents
      if (req.body.discountCode) {
        const discountRate = await pricingService.getPromoCodeDiscount(req.body.discountCode);
        if (discountRate > 0) {
          amount = amount * (1 - discountRate);
        }
      }

      // Créer la session de paiement
      const paymentParams = {
        userId: req.user.id,
        productId,
        productType,
        amount,
        subscriptionPeriod: req.body.subscriptionPeriod || 'monthly',
        currency,
        payerAddress
      };

      const session = await paymentSessionService.createPaymentSession(
        network,
        paymentParams
      );

      res.json({ session });
  } catch (error) {
  console.error('Error creating payment session:', error);
  res.status(500).json({
  message: 'Erreur lors de la création de la session de paiement',
  error: (error as Error).message
  });
  }
  });

/\*\*

- @route GET /api/payments/status
- @desc Vérifier le statut d'une session de paiement
- @access Public
  \*/
  router.get('/status', async (req, res) => {
  try {
  const { sessionId } = req.query;
      if (!sessionId) {
        return res.status(400).json({ message: 'Paramètre "sessionId" requis' });
      }

      const status = await paymentSessionService.checkPaymentStatus(sessionId as string);

      res.json({ status });
  } catch (error) {
  console.error('Error checking payment status:', error);
  res.status(500).json({
  message: 'Erreur lors de la vérification du statut de paiement',
  error: (error as Error).message
  });
  }
  });

/\*\*

- @route POST /api/payments/confirm
- @desc Confirmer un paiement avec le hash de transaction
- @access Public
  \*/
  router.post('/confirm', async (req, res) => {
  try {
  const { sessionId, txHash } = req.body;
      if (!sessionId || !txHash) {
        return res.status(400).json({
          message: 'Paramètres "sessionId" et "txHash" requis'
        });
      }

      const confirmed = await paymentSessionService.confirmPayment(sessionId, txHash);

      if (confirmed) {
        res.json({ success: true, message: 'Paiement confirmé avec succès' });
      } else {
        res.status(400).json({
          success: false,
          message: 'Échec de la confirmation du paiement'
        });
      }
  } catch (error) {
  console.error('Error confirming payment:', error);
  res.status(500).json({
  message: 'Erreur lors de la confirmation du paiement',
  error: (error as Error).message
  });
  }
  });

/\*\*

- @route GET /api/payments/history
- @desc Récupérer l'historique des paiements d'un utilisateur
- @access Private
  \*/
  router.get('/history', auth, async (req, res) => {
  try {
  const transactions = await paymentSessionService.getUserTransactions(req.user.id);
  res.json({ transactions });
  } catch (error) {
  console.error('Error fetching payment history:', error);
  res.status(500).json({
  message: 'Erreur lors de la récupération de l\'historique des paiements',
  error: (error as Error).message
  });
  }
  });

/\*\*

- @route GET /api/payments/prices
- @desc Récupérer les prix actuels des cryptomonnaies en EUR
- @access Public
  \*/
  router.get('/prices', async (req, res) => {
  try {
  const { currencies } = req.query;
      if (!currencies) {
        return res.status(400).json({ message: 'Paramètre "currencies" requis' });
      }

      const currencyList = (currencies as string).split(',');
      const prices: Record<string, number> = {};

      for (const currency of currencyList) {
        prices[currency] = await priceOracleService.getCryptoPrice(currency, 'EUR');
      }

      res.json({ prices });
  } catch (error) {
  console.error('Error fetching crypto prices:', error);
  res.status(500).json({
  message: 'Erreur lors de la récupération des prix des cryptomonnaies',
  error: (error as Error).message
  });
  }
  });

/\*\*

- @route GET /api/payments/pricing
- @desc Récupérer la grille tarifaire
- @access Public
  \*/
  router.get('/pricing', async (req, res) => {
  try {
  // Récupérer la grille tarifaire complète
  const pricing = await pricingService.getFullPricing();
  res.json({ pricing });
  } catch (error) {
  console.error('Error fetching pricing:', error);
  res.status(500).json({
  message: 'Erreur lors de la récupération de la grille tarifaire',
  error: (error as Error).message
  });
  }
  });

export default router;

7. Flux de paiement et monitoring des transactions

sequenceDiagram
participant U as Utilisateur
participant UI as Interface TokenForge
participant API as Backend TokenForge
participant PS as PaymentSessionService
participant PO as PriceOracleService
participant BS as BlockchainService
participant SC as Smart Contract
participant W as Wallet MetaMask<br/>92e92b2705edc3d4c7204f961cc659c0

    U->>UI: Sélectionne un service/produit
    UI->>UI: Affiche options de paiement
    U->>UI: Choisit blockchain
    UI->>API: GET /cryptocurrencies?network={blockchain}
    API->>PS: getSupportedCryptocurrencies(blockchain)
    PS->>API: Liste des cryptos supportées
    API->>UI: Cryptos disponibles

    U->>UI: Choisit cryptomonnaie (native ou stablecoin)
    UI->>API: GET /convert?amount={montant}&currency={crypto}
    API->>PO: convertEURtoCrypto(montant, crypto)
    PO->>API: Montant converti + taux
    API->>UI: Affiche montant à payer en crypto

    U->>UI: Confirme et initie le paiement
    UI->>API: POST /create-session
    API->>PS: createPaymentSession(blockchain, crypto, ...)
    PS->>BS: Crée session de paiement
    BS->>API: Détails session (montant, adresse, deadline)
    API->>UI: Session créée et détails

    U->>UI: Signe transaction via wallet
    alt Paiement en crypto native (ETH, BNB, etc.)
        UI->>SC: Envoie montant en crypto native
    else Paiement en stablecoin (USDT, USDC, etc.)
        UI->>SC: Transfère tokens ERC20/BEP20
    end

    SC->>W: Transfère la crypto/tokens
    UI->>API: POST /confirm {sessionId, txHash}
    API->>PS: confirmPayment(sessionId, txHash)
    PS->>BS: Vérifie transaction sur blockchain
    BS->>API: Confirmation de paiement

    par Monitoring Continu
        BS->>BS: Surveille les transactions entrantes
        BS->>PS: Détecte paiement et met à jour statut
    end

    alt Paiement confirmé
        API->>PS: processSuccessfulPayment(...)
        PS->>API: Activation service/produit
        API->>UI: Confirmation de succès
        UI->>U: Affiche confirmation et active service
    else Paiement échoué
        API->>UI: Notification d'échec
        UI->>U: Affiche message d'erreur
    end

8. Service de monitoring des transactions mis à jour

import { ethers } from 'ethers';
import { db } from '../firebase/config';
import { PaymentSessionService } from './PaymentSessionService';
import { CryptocurrencyInfo } from './interfaces';

// Adresse du wallet MetaMask
const WALLET_ADDRESS = '0x92e92b2705edc3d4c7204f961cc659c0';

// ABI minimal pour les événements ERC20
const ERC20_EVENT_ABI = [
'event Transfer(address indexed from, address indexed to, uint256 amount)'
];

// Configuration des providers par blockchain
interface NetworkConfig {
provider: ethers.providers.Provider;
nativeCurrency: CryptocurrencyInfo;
supportedTokens: CryptocurrencyInfo[];
}

/\*\*

- Service pour le monitoring des transactions sur différentes blockchains
  \*/
  export class BlockchainMonitoringService {
  private networks: Record<string, NetworkConfig> = {};
  private paymentSessionService: PaymentSessionService;
  private isMonitoring: boolean = false;

constructor(paymentSessionService: PaymentSessionService) {
this.paymentSessionService = paymentSessionService;
this.initNetworks();
}

/\*\*

- Initialise les configurations des réseaux
  \*/
  private async initNetworks() {
  try {
  // Récupérer les configurations depuis la base de données
  const networksSnapshot = await db.collection('blockchainConfig').get();
      for (const doc of networksSnapshot.docs) {
        const networkData = doc.data();
        const networkId = doc.id;

        // Configurer le provider
        let provider;
        try {
          provider = new ethers.providers.JsonRpcProvider(networkData.rpcUrl);
        } catch (error) {
          console.error(`Error initializing provider for ${networkId}:`, error);
          continue;
        }

        // Récupérer les infos de crypto native
        const nativeCurrency: CryptocurrencyInfo = {
          symbol: networkData.nativeCurrency.symbol,
          address: null, // Crypto native n'a pas d'adresse de contrat
          name: networkData.nativeCurrency.name,
          decimals: networkData.nativeCurrency.decimals,
          isNative: true,
          isStablecoin: false,
          logoUrl: networkData.nativeCurrency.logoUrl,
          minAmount: networkData.nativeCurrency.minAmount || 5
        };

        // Récupérer les tokens supportés
        const supportedTokens = networkData.supportedTokens.map((token: any) => ({
          symbol: token.symbol,
          address: token.address,
          name: token.name,
          decimals: token.decimals,
          isNative: false,
          isStablecoin: token.isStablecoin || false,
          logoUrl: token.logoUrl,
          minAmount: token.minAmount || 5
        }));

        // Ajouter à la configuration des réseaux
        this.networks[networkId] = {
          provider,
          nativeCurrency,
          supportedTokens
        };
      }

      console.log(`Initialized ${Object.keys(this.networks).length} blockchain networks`);
  } catch (error) {
  console.error('Error initializing networks:', error);
      // Configurations par défaut en cas d'erreur
      this.initDefaultNetworks();
  }
  }

/\*\*

- Initialise les configurations par défaut
  \*/
  private initDefaultNetworks() {
  // Ethereum
  this.networks['ethereum'] = {
  provider: new ethers.providers.JsonRpcProvider(
  process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY'
  ),
  nativeCurrency: {
  symbol: 'ETH',
  address: null,
  name: 'Ethereum',
  decimals: 18,
  isNative: true,
  isStablecoin: false,
  logoUrl: '/assets/crypto/eth.png',
  minAmount: 5
  },
  supportedTokens: [
  {
  symbol: 'USDT',
  address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  name: 'Tether USD',
  decimals: 6,
  isNative: false,
  isStablecoin: true,
  logoUrl: '/assets/crypto/usdt.png',
  minAmount: 5
  },
  {
  symbol: 'USDC',
  address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  name: 'USD Coin',
  decimals: 6,
  isNative: false,
  isStablecoin: true,
  logoUrl: '/assets/crypto/usdc.png',
  minAmount: 5
  }
  ]
  };


    // Binance Smart Chain
    this.networks['bsc'] = {
      provider: new ethers.providers.JsonRpcProvider(
        process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org/'
      ),
      nativeCurrency: {
        symbol: 'BNB',
        address: null,
        name: 'Binance Coin',
        decimals: 18,
        isNative: true,
        isStablecoin: false,
        logoUrl: '/assets/crypto/bnb.png',
        minAmount: 5
      },
      supportedTokens: [
        {
          symbol: 'USDT',
          address: '0x55d398326f99059fF775485246999027B3197955',
          name: 'Tether USD (BSC)',
          decimals: 18,
          isNative: false,
          isStablecoin: true,
          logoUrl: '/assets/crypto/usdt.png',
          minAmount: 5
        },
        {
          symbol: 'BUSD',
          address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
          name: 'Binance USD',
          decimals: 18,
          isNative: false,
          isStablecoin: true,
          logoUrl: '/assets/crypto/busd.png',
          minAmount: 5
        }
      ]
    };

}

/\*\*

- Démarre le monitoring des transactions sur toutes les blockchains
  \*/
  async startMonitoring() {
  if (this.isMonitoring) return;


    this.isMonitoring = true;
    console.log('Starting blockchain transaction monitoring service');

    // Pour chaque réseau supporté
    Object.entries(this.networks).forEach(([networkName, config]) => {
      // Monitoring des paiements en crypto native (ETH, BNB, etc.)
      this.monitorNativeTransfers(networkName, config.provider);

      // Pour chaque token supporté sur ce réseau
      config.supportedTokens.forEach(token => {
        this.monitorTokenTransfers(networkName, token.address as string, config.provider);
      });
    });

}

/\*\*

- Surveille les transferts de crypto native vers notre wallet
  \*/
  private monitorNativeTransfers(network: string, provider: ethers.providers.Provider) {
  try {
  // Créer un filtre pour les transactions vers notre wallet
  const filter = {
  toAddress: WALLET_ADDRESS,
  minEthers: 0
  };
      // S'abonner aux événements de transfert
      provider.on(filter, async (tx) => {
        try {
          console.log(`[${network}] Native crypto transfer detected:`, {
            from: tx.from,
            to: tx.to,
            value: ethers.utils.formatEther(tx.value),
            hash: tx.hash
          });

          // Vérifier que la transaction est destinée à notre wallet
          if (tx.to?.toLowerCase() !== WALLET_ADDRESS.toLowerCase()) {
            return;
          }

          // Traiter la transaction native
          await this.processIncomingNativeTransaction(
            network,
            tx.from,
            tx.value,
            tx.hash
          );
        } catch (error) {
          console.error(`Error processing ${network} native transfer:`, error);
        }
      });

      console.log(`Monitoring ${network} native transfers`);
  } catch (error) {
  console.error(`Error setting up ${network} native monitoring:`, error);
  }
  }

/\*\*

- Surveille les transferts d'un token spécifique vers notre wallet
  \*/
  private monitorTokenTransfers(network: string, tokenAddress: string, provider: ethers.providers.Provider) {
  try {
  // Créer une interface pour le token
  const tokenInterface = new ethers.utils.Interface(ERC20_EVENT_ABI);
      // Créer un filtre pour les événements Transfer vers notre wallet
      const filter = {
        address: tokenAddress,
        topics: [
          ethers.utils.id('Transfer(address,address,uint256)'),
          null,
          ethers.utils.hexZeroPad(WALLET_ADDRESS, 32)
        ]
      };

      // S'abonner aux événements
      provider.on(filter, async (log) => {
        try {
          // Décoder l'événement
          const parsedLog = tokenInterface.parseLog(log);
          const from = parsedLog.args.from;
          const to = parsedLog.args.to;
          const amount = parsedLog.args.amount;

          // Vérifier que le destinataire est bien notre wallet
          if (to.toLowerCase() !== WALLET_ADDRESS.toLowerCase()) {
            return;
          }

          console.log(`[${network}] Token transfer detected:`, {
            token: tokenAddress,
            from,
            to,
            amount: amount.toString(),
            transactionHash: log.transactionHash
          });

          // Traiter la transaction de token
          await this.processIncomingTokenTransaction(
            network,
            tokenAddress,
            from,
            amount,
            log.transactionHash
          );
        } catch (error) {
          console.error(`Error processing ${network} token transfer event:`, error);
        }
      });

      console.log(`Monitoring ${network} token transfers for ${tokenAddress}`);
  } catch (error) {
  console.error(`Error setting up ${network} token monitoring for ${tokenAddress}:`, error);
  }
  }

/\*\*

- Traite une transaction entrante en crypto native
  \*/
  private async processIncomingNativeTransaction(
  network: string,
  from: string,
  amount: ethers.BigNumber,
  txHash: string
  ) {
  try {
  // Rechercher les sessions de paiement en attente pour ce réseau avec crypto native
  const sessionSnapshot = await db.collection('paymentSessions')
  .where('network', '==', network)
  .where('status', '==', 'pending')
  .where('payerAddress', '==', from.toLowerCase())
  .where('currency.isNative', '==', true)
  .get();
      if (sessionSnapshot.empty) {
        console.log(`No pending native payment session found for ${from} on ${network}`);
        return;
      }

      // Vérifier chaque session
      for (const doc of sessionSnapshot.docs) {
        const session = doc.data();

        // Convertir le montant reçu avec les bonnes décimales
        const nativeCurrency = this.networks[network].nativeCurrency;
        const receivedAmount = parseFloat(
          ethers.utils.formatUnits(amount, nativeCurrency.decimals)
        );

        // Obtenir le montant attendu en unités décimales
        const expectedAmount = parseFloat(
          ethers.utils.formatUnits(
            session.amountDue.amount,
            nativeCurrency.decimals
          )
        );

        // Vérifier si le montant correspond (avec une petite marge d'erreur de 1%)
        if (receivedAmount >= expectedAmount * 0.99) {
          console.log(`Native payment matched for session ${session.sessionId}`);

          // Confirmer le paiement via le service de paiement
          await this.paymentSessionService.confirmPayment(session.sessionId, txHash);
        }
      }
  } catch (error) {
  console.error('Error processing incoming native transaction:', error);
  }
  }

/\*\*

- Traite une transaction entrante de token
  \*/
  private async processIncomingTokenTransaction(
  network: string,
  tokenAddress: string,
  from: string,
  amount: ethers.BigNumber,
  txHash: string
  ) {
  try {
  // Rechercher les sessions de paiement en attente pour cet utilisateur avec ce token
  const sessionSnapshot = await db.collection('paymentSessions')
  .where('network', '==', network)
  .where('status', '==', 'pending')
  .where('payerAddress', '==', from.toLowerCase())
  .where('currency.address', '==', tokenAddress.toLowerCase())
  .get();
      if (sessionSnapshot.empty) {
        console.log(`No pending token payment session found for ${from} on ${network} with token ${tokenAddress}`);
        return;
      }

      // Vérifier chaque session
      for (const doc of sessionSnapshot.docs) {
        const session = doc.data();

        // Obtenir les infos du token
        const tokenInfo = this.networks[network].supportedTokens.find(
          t => t.address?.toLowerCase() === tokenAddress.toLowerCase()
        );

        if (!tokenInfo) {
          console.error(`Token info not found for ${tokenAddress} on ${network}`);
          continue;
        }

        // Convertir le montant reçu avec les bonnes décimales
        const receivedAmount = parseFloat(
          ethers.utils.formatUnits(amount, tokenInfo.decimals)
        );

        // Obtenir le montant attendu en unités décimales
        const expectedAmount = parseFloat(
          ethers.utils.formatUnits(
            session.amountDue.amount,
            tokenInfo.decimals
          )
        );

        // Vérifier si le montant correspond (avec une petite marge d'erreur de 1%)
        if (receivedAmount >= expectedAmount * 0.99) {
          console.log(`Token payment matched for session ${session.sessionId}`);

          // Confirmer le paiement via le service de paiement
          await this.paymentSessionService.confirmPayment(session.sessionId, txHash);
        }
      }
  } catch (error) {
  console.error('Error processing incoming token transaction:', error);
  }
  }

/\*\*

- Arrête le monitoring des transactions
  \*/
  stopMonitoring() {
  if (!this.isMonitoring) return;


    console.log('Stopping blockchain transaction monitoring service');

    // Retirer tous les listeners
    Object.values(this.networks).forEach(config => {
      config.provider.removeAllListeners();
    });

    this.isMonitoring = false;

}

/\*\*

- Récupère la configuration d'un réseau
  \*/
  getNetworkConfig(network: string): NetworkConfig | null {
  return this.networks[network] || null;
  }

/\*\*

- Récupère les cryptos supportées pour un réseau
  \*/
  getSupportedCryptocurrencies(network: string): CryptocurrencyInfo[] {
  const config = this.networks[network];
  if (!config) return [];


    return [config.nativeCurrency, ...config.supportedTokens];

}

/\*\*

- Récupère le provider pour un réseau
  \*/
  getProvider(network: string): ethers.providers.Provider | null {
  return this.networks[network]?.provider || null;
  }

/\*\*

- Met à jour la configuration des réseaux
  \*/
  async updateNetworksConfig() {
  await this.initNetworks();


    // Redémarrer le monitoring si nécessaire
    if (this.isMonitoring) {
      this.stopMonitoring();
      this.startMonitoring();
    }

}
}

// Créer et exporter une instance singleton
export const createBlockchainMonitor = (paymentSessionService: PaymentSessionService) => {
return new BlockchainMonitoringService(paymentSessionService);
};

9. Résumé du plan de paiement révisé

# Résumé du Système de Paiement TokenForge

## Vue d'ensemble

Le système de paiement TokenForge est conçu pour offrir une flexibilité maximale aux utilisateurs en leur permettant de payer avec les cryptomonnaies natives de chaque blockchain supportée (ETH, BNB, MATIC, AVAX, SOL, etc.) ainsi qu'avec des stablecoins (USDT, USDC, DAI, BUSD, etc.). Tous les paiements sont dirigés vers un unique wallet MetaMask (92e92b2705edc3d4c7204f961cc659c0) qui centralise la gestion des fonds.

## Caractéristiques principales

1. **Support multi-blockchain**

   - Ethereum, BSC, Polygon, Avalanche, Solana, Arbitrum
   - Extensible à d'autres blockchains à l'avenir

2. **Options de paiement flexibles**

   - Cryptomonnaies natives (ETH, BNB, MATIC, AVAX, SOL)
   - Stablecoins (USDT, USDC, DAI, BUSD)
   - Conversion automatique EUR → Crypto avec pricing en temps réel

3. **Architecture modulaire**

   - Services de paiement spécifiques à chaque blockchain
   - Smart contracts dédiés sur chaque réseau
   - Monitoring continu des transactions entrantes

4. **Expérience utilisateur simplifiée**

   - Interface intuitive en 3 étapes (blockchain → crypto → paiement)
   - Conversion transparente des prix avec taux visibles
   - Suivi en temps réel des transactions

5. **Sécurité et robustesse**
   - Validation complète des transactions sur la blockchain
   - Monitoring automatique des paiements
   - Confirmation multi-niveaux des transactions

## Composants techniques

1. **Backend**

   - `PaymentSessionService`: Gestion centralisée des sessions de paiement
   - `PriceOracleService`: Conversion EUR-Crypto en temps réel
   - `BlockchainMonitoringService`: Surveillance des transactions sur toutes les blockchains
   - Services blockchain spécifiques (Ethereum, BSC, Polygon, etc.)

2. **Smart Contracts**

   - `TokenForgePaymentProcessor`: Traitement des paiements en crypto native et tokens
   - Interface standardisée sur toutes les blockchains
   - Fonctions de secours et récupération de fonds

3. **Frontend**

   - Interface utilisateur React pour la sélection et le paiement
   - Intégration avec MetaMask et WalletConnect
   - Affichage des taux et des conversions en temps réel

4. **Infrastructure**
   - Connexion aux nœuds blockchain via providers (Infura, Alchemy, etc.)
   - Base de données Firebase pour le stockage des sessions et transactions
   - Webhooks pour les notifications et le suivi des paiements

## Flux de paiement

1. **Initialisation**

   - L'utilisateur sélectionne le service/produit à acheter
   - L'interface affiche les options de paiement disponibles
   - L'utilisateur choisit la blockchain et la cryptomonnaie

2. **Création de session**

   - Le backend calcule le montant en crypto (incluant les réductions applicables)
   - Une session de paiement est créée avec un délai d'expiration
   - Les détails sont transmis à l'interface utilisateur

3. **Paiement**

   - L'utilisateur connecte son wallet et signe la transaction
   - Les fonds sont transférés directement vers le wallet TokenForge
   - Le hash de transaction est transmis au backend

4. **Confirmation**

   - Le système vérifie la transaction sur la blockchain
   - Une fois confirmée, le service/produit est activé
   - L'utilisateur reçoit une confirmation

5. **Monitoring parallèle**
   - Un système de monitoring vérifie en continu les transactions entrantes
   - Les paiements détectés sont automatiquement associés aux sessions
   - Protection contre les problèmes de connexion côté utilisateur

## Avantages du système

1. **Flexibilité pour les utilisateurs**

   - Choix entre cryptos natives et stablecoins
   - Adaptation aux préférences et aux disponibilités des utilisateurs
   - Réduction des frais de conversion crypto-à-crypto

2. **Simplicité opérationnelle**

   - Un seul wallet pour toutes les blockchains
   - Système unifié de traitement des paiements
   - Monitoring centralisé des transactions

3. **Compétitivité tarifaire**

   - Maintien de l'avantage de 20-40% par rapport à la concurrence
   - Affichage transparent des prix et des taux de conversion
   - Application automatique des réductions selon le niveau d'abonnement

4. **Robustesse et fiabilité**
   - Double système de confirmation des transactions
   - Monitoring actif et passif des paiements
   - Mécanismes de récupération en cas d'erreur

## Mise en œuvre et calendrier

Le système de paiement sera déployé progressivement, en commençant par les réseaux les plus utilisés (Ethereum et BSC), puis en ajoutant les autres blockchains au fur et à mesure. Cette approche permettra de tester et d'optimiser le système avec un volume contrôlé avant l'expansion complète.

Le développement et le déploiement complet sont prévus sur 12 semaines, avec un lancement bêta à la semaine 8 et une activation progressive de toutes les fonctionnalités jusqu'à la semaine 12.

## Évolution future

Le système est conçu pour être extensible et pourra facilement intégrer :

- De nouvelles blockchains (Layer 2, nouveaux écosystèmes)
- De nouvelles cryptomonnaies et tokens
- Des fonctionnalités avancées comme le paiement récurrent
- Des intégrations avec d'autres services DeFi

Conclusion
Le système de paiement TokenForge que j'ai conçu répond parfaitement aux besoins spécifiés dans le projet, en permettant aux utilisateurs de payer avec les cryptomonnaies natives des différentes blockchains supportées (ETH, BNB, MATIC, AVAX, SOL) ainsi qu'avec des stablecoins comme USDT. Tous les paiements sont dirigés vers le wallet MetaMask spécifié (92e92b2705edc3d4c7204f961cc659c0).
Ce système s'intègre harmonieusement dans la vision globale de TokenForge, qui vise à offrir une plateforme de création et de gestion de tokens accessible, puissante et économiquement compétitive (20-40% moins cher que la concurrence).
Points clés du système développé:

Support complet multi-blockchain et multi-crypto: Le système permet d'utiliser aussi bien les cryptomonnaies natives que les stablecoins sur 6 blockchains différentes.
Architecture modulaire et extensible: Chaque composant est conçu pour être facilement adapté ou étendu, permettant l'ajout de nouvelles blockchains et cryptomonnaies.
Expérience utilisateur optimisée: Interface intuitive en 3 étapes (blockchain → crypto → paiement) avec affichage transparent des taux et des montants.
Sécurité robuste: Double vérification des transactions, monitoring continu des paiements entrants, et mécanismes de récupération.
Intégration avec le modèle économique: Application automatique des réductions en fonction des abonnements, conformément au plan de monétisation.

Pour mettre en œuvre ce système, je recommande de suivre le plan de déploiement progressif en commençant par Ethereum et BSC, puis en ajoutant les autres blockchains. Cela permettra de tester et d'optimiser le système avec un volume contrôlé avant l'expansion complète.
Le système est entièrement aligné avec les objectifs de TokenForge de devenir une plateforme de référence pour la création et la gestion de tokens, avec une accessibilité maximale et un modèle économique durable.
