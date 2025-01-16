import { ethers } from 'ethers';
import { NetworkConfig } from '@/config/networks';
import { TokenAnalytics, TokenMetrics, TokenEvent } from '@/types/analytics';
import { ERC20_ABI } from '@/abi/ERC20ABI';

export class TokenAnalyticsService {
  private provider: ethers.JsonRpcProvider;
  private dexPairs: Record<string, string[]> = {
    'uniswap': [],
    'pancakeswap': [],
    'quickswap': []
  };

  constructor(network: NetworkConfig) {
    this.provider = new ethers.JsonRpcProvider(network.chain.rpcUrls.default.toString());
  }

  async getTokenAnalytics(tokenAddress: string): Promise<TokenAnalytics> {
    const token = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
    const [name, symbol, decimals] = await Promise.all([
      token.name(),
      token.symbol(),
      token.decimals()
    ]);

    const metrics = await this.getTokenMetrics(tokenAddress, token);
    const events = await this.getTokenEvents(tokenAddress, token);
    const history = await this.getTokenHistory(tokenAddress);

    return {
      token: {
        address: tokenAddress,
        network: (await this.provider.getNetwork()).name,
        name,
        symbol,
        decimals
      },
      metrics,
      history,
      events
    };
  }

  private async getTokenMetrics(
    tokenAddress: string,
    token: ethers.Contract
  ): Promise<TokenMetrics> {
    const [totalSupply, holders] = await Promise.all([
      token.totalSupply(),
      this.getHoldersCount(tokenAddress)
    ]);

    const networkName = (await this.provider.getNetwork()).name;

    const metrics: TokenMetrics = {
      address: tokenAddress,
      network: networkName,
      holders,
      totalSupply: ethers.formatUnits(totalSupply, await token.decimals()),
      circulatingSupply: ethers.formatUnits(totalSupply, await token.decimals()),
      marketCap: '0',
      price: '0',
      volume24h: '0',
      transactions: {
        total: 0,
        buy: 0,
        sell: 0,
        transfer: 0
      },
      liquidity: {
        total: '0',
        pairs: []
      },
      timestamp: new Date()
    };

    // Récupération des données de liquidité et de prix pour chaque DEX
    for (const [dex, pairs] of Object.entries(this.dexPairs)) {
      for (const pair of pairs) {
        const pairData = await this.getPairData(pair);
        if (pairData) {
          metrics.liquidity.pairs.push({
            dex,
            pair,
            liquidity: pairData.liquidity,
            price: pairData.price,
            volume24h: pairData.volume24h
          });
        }
      }
    }

    // Calcul des totaux
    metrics.liquidity.total = metrics.liquidity.pairs
      .reduce((acc, pair) => acc + Number(pair.liquidity), 0)
      .toString();

    if (metrics.liquidity.pairs.length > 0) {
      metrics.price = metrics.liquidity.pairs[0].price;
      metrics.marketCap = (
        Number(metrics.price) * Number(metrics.circulatingSupply)
      ).toString();
    }

    return metrics;
  }

  private async getTokenEvents(
    tokenAddress: string,
    token: ethers.Contract
  ): Promise<TokenEvent[]> {
    const events: TokenEvent[] = [];
    const latestBlock = await this.provider.getBlockNumber();
    const fromBlock = latestBlock - 10000; // environ 24h

    const filter = token.filters.Transfer();
    const logs = await token.queryFilter(filter, fromBlock);

    for (const log of logs) {
      if (!log.args) continue;

      const block = await this.provider.getBlock(log.blockNumber);
      if (!block) continue;

      const [from, to, value] = log.args;
      
      events.push({
        type: await this.determineTransferType(log),
        hash: log.hash || '',
        from,
        to,
        amount: ethers.formatUnits(value, await token.decimals()),
        timestamp: new Date(Number(block.timestamp) * 1000),
        blockNumber: log.blockNumber
      });
    }

    return events;
  }

  private async getTokenHistory(tokenAddress: string) {
    return {
      prices: [],
      volumes: [],
      holders: []
    };
  }

  private async getHoldersCount(tokenAddress: string): Promise<number> {
    // Implémentation à faire avec l'API du scanner de blockchain
    return 0;
  }

  private async getPairData(pairAddress: string): Promise<{
    liquidity: string;
    price: string;
    volume24h: string;
  } | null> {
    // Implémentation à faire avec l'API du DEX
    return null;
  }

  private async determineTransferType(
    log: ethers.Log
  ): Promise<TokenEvent['type']> {
    // Logique pour déterminer si c'est un achat, une vente ou un transfert
    return 'transfer';
  }

  async subscribeToEvents(
    tokenAddress: string,
    callback: (event: TokenEvent) => void
  ): Promise<() => void> {
    const token = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
    const filter = token.filters.Transfer();
    
    const listener = async (from: string, to: string, value: bigint, event: ethers.Log) => {
      const block = await this.provider.getBlock(event.blockNumber);
      if (!block) return;

      const tokenEvent: TokenEvent = {
        type: await this.determineTransferType(event),
        hash: event.hash || '',
        from,
        to,
        amount: ethers.formatUnits(value, await token.decimals()),
        timestamp: new Date(Number(block.timestamp) * 1000),
        blockNumber: event.blockNumber
      };
      callback(tokenEvent);
    };

    token.on(filter, listener);
    return () => {
      token.off(filter, listener);
    };
  }
}
