import React, { useEffect, useState } from 'react';
import { PaymentNetwork, PaymentToken } from '../../services/payment/types/PaymentSession';
import { formatUnits } from 'viem';
import { TokenPriceService } from '../../services/price/TokenPriceService';

interface TokenSelectorProps {
  network: PaymentNetwork;
  selectedToken?: PaymentToken;
  onSelect: (token: PaymentToken) => void;
  amount: bigint;
}

interface TokenInfo {
  symbol: string;
  name: string;
  icon: string;
  decimals: number;
}

const NETWORK_TOKENS: Record<PaymentNetwork, Record<string, TokenInfo>> = {
  [PaymentNetwork.ETHEREUM]: {
    ETH: { symbol: 'ETH', name: 'Ethereum', icon: '⟠', decimals: 18 },
    USDT: { symbol: 'USDT', name: 'Tether USD', icon: '💵', decimals: 6 },
    USDC: { symbol: 'USDC', name: 'USD Coin', icon: '💵', decimals: 6 },
    DAI: { symbol: 'DAI', name: 'Dai', icon: '🟡', decimals: 18 },
  },
  [PaymentNetwork.BINANCE]: {
    BNB: { symbol: 'BNB', name: 'BNB', icon: '🟡', decimals: 18 },
    BUSD: { symbol: 'BUSD', name: 'Binance USD', icon: '💵', decimals: 18 },
    USDT: { symbol: 'USDT', name: 'Tether USD', icon: '💵', decimals: 18 },
    USDC: { symbol: 'USDC', name: 'USD Coin', icon: '💵', decimals: 18 },
  },
  [PaymentNetwork.POLYGON]: {
    MATIC: { symbol: 'MATIC', name: 'Polygon', icon: '🟣', decimals: 18 },
    USDT: { symbol: 'USDT', name: 'Tether USD', icon: '💵', decimals: 6 },
    USDC: { symbol: 'USDC', name: 'USD Coin', icon: '💵', decimals: 6 },
    DAI: { symbol: 'DAI', name: 'Dai', icon: '🟡', decimals: 18 },
  },
  [PaymentNetwork.SOLANA]: {
    SOL: { symbol: 'SOL', name: 'Solana', icon: '🟢', decimals: 9 },
    USDC: { symbol: 'USDC', name: 'USD Coin', icon: '💵', decimals: 6 },
    USDT: { symbol: 'USDT', name: 'Tether USD', icon: '💵', decimals: 6 },
  },
};

const TOKEN_ADDRESSES: Record<PaymentNetwork, Record<string, string>> = {
  [PaymentNetwork.ETHEREUM]: {
    ETH: '0x0000000000000000000000000000000000000000',
    USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    DAI: '0x6b175474e89094c44da98b954eedeac495271d0f',
  },
  [PaymentNetwork.BINANCE]: {
    BNB: '0x0000000000000000000000000000000000000000',
    BUSD: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
    USDT: '0x55d398326f99059ff775485246999027b3197955',
    USDC: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
  },
  [PaymentNetwork.POLYGON]: {
    MATIC: '0x0000000000000000000000000000000000000000',
    USDT: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
    USDC: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
    DAI: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
  },
  [PaymentNetwork.SOLANA]: {
    SOL: '11111111111111111111111111111111',
    USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  },
};

export const TokenSelector: React.FC<TokenSelectorProps> = ({
  network,
  selectedToken,
  onSelect,
  amount,
}) => {
  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({});
  const tokens = NETWORK_TOKENS[network];
  const priceService = TokenPriceService.getInstance();

  useEffect(() => {
    setTokenPrices(priceService.getPrices(network));
    
    const unsubscribe = priceService.onPriceUpdate((prices) => {
      setTokenPrices(prices.get(network) || {});
    });

    return () => unsubscribe();
  }, [network]);

  return (
    <div className="grid grid-cols-2 gap-3">
      {Object.entries(tokens).map(([symbol, token]) => {
        const formattedAmount = formatUnits(amount, token.decimals);
        const price = tokenPrices[symbol];
        
        return (
          <button
            key={symbol}
            onClick={() => onSelect({
              symbol,
              address: TOKEN_ADDRESSES[network][symbol],
              decimals: token.decimals,
            })}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all
              ${
                selectedToken?.symbol === symbol
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-200'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{token.icon}</span>
              <div className="text-left">
                <div className="font-medium">{token.symbol}</div>
                <div className="text-sm text-gray-500">{token.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">{formattedAmount}</div>
              {price && (
                <div className="text-sm text-gray-500">
                  ≈ ${(Number(formattedAmount) * price).toFixed(2)}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}; 