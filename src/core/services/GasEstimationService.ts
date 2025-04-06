import { ethers } from "ethers";
import { NetworkConfig } from "@/config/networks";

export interface GasEstimate {
  low: {
    price: string;
    time: string;
  };
  medium: {
    price: string;
    time: string;
  };
  high: {
    price: string;
    time: string;
  };
  estimatedBaseFee: string;
  networkCongestion: "Low" | "Medium" | "High";
  updatedAt: Date;
}

export interface TokenDeploymentEstimate {
  gasLimit: string;
  gasCost: {
    low: string;
    medium: string;
    high: string;
  };
  nativeCurrency: string;
  totalCost: {
    low: string;
    medium: string;
    high: string;
  };
}

export class GasEstimationService {
  private static readonly GAS_LIMIT_TOKEN_DEPLOYMENT = 3000000; // Estimation de base
  private static readonly GAS_APIS = {
    1: "https://api.etherscan.io/api", // Ethereum
    56: "https://api.bscscan.com/api", // BSC
    137: "https://api.polygonscan.com/api", // Polygon
    43114: "https://api.snowtrace.io/api", // Avalanche
  };

  public static async getGasEstimate(
    network: NetworkConfig
  ): Promise<GasEstimate> {
    try {
      const provider = new ethers.JsonRpcProvider(
        network.chain.rpcUrls.default.http[0]
      );

      // Récupérer les informations de base sur le gas
      const [feeData, blockNumber] = await Promise.all([
        provider.getFeeData(),
        provider.getBlockNumber(),
      ]);

      // Récupérer l'historique récent des blocks pour estimer la congestion
      const recentBlocks = await Promise.all(
        Array.from({ length: 5 }, (_, i) => provider.getBlock(blockNumber - i))
      );

      // Calculer la congestion du réseau
      const avgGasUsed =
        recentBlocks.reduce((acc, block) => acc + (block?.gasUsed || 0n), 0n) /
        5n;
      const avgGasLimit =
        recentBlocks.reduce((acc, block) => acc + (block?.gasLimit || 0n), 0n) /
        5n;
      const congestionRatio = Number((avgGasUsed * 100n) / avgGasLimit);

      const networkCongestion =
        congestionRatio > 80 ? "High" : congestionRatio > 50 ? "Medium" : "Low";

      // Calculer les estimations de prix
      const baseFee = feeData.gasPrice || 0n;
      const lowPrice = baseFee;
      const mediumPrice = (baseFee * 120n) / 100n; // +20%
      const highPrice = (baseFee * 150n) / 100n; // +50%

      // Estimer les temps d'attente
      const getTimeEstimate = (priority: "low" | "medium" | "high") => {
        switch (priority) {
          case "high":
            return networkCongestion === "High" ? "< 30 sec" : "< 15 sec";
          case "medium":
            return networkCongestion === "High" ? "< 1 min" : "< 30 sec";
          case "low":
            return networkCongestion === "High" ? "1-2 min" : "< 1 min";
        }
      };

      return {
        low: {
          price: lowPrice.toString(),
          time: getTimeEstimate("low"),
        },
        medium: {
          price: mediumPrice.toString(),
          time: getTimeEstimate("medium"),
        },
        high: {
          price: highPrice.toString(),
          time: getTimeEstimate("high"),
        },
        estimatedBaseFee: baseFee.toString(),
        networkCongestion,
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error("Error estimating gas:", error);
      throw new Error("Failed to estimate gas prices");
    }
  }

  public static async estimateTokenDeployment(
    network: NetworkConfig,
    gasEstimate: GasEstimate
  ): Promise<TokenDeploymentEstimate> {
    const gasLimit = BigInt(this.GAS_LIMIT_TOKEN_DEPLOYMENT);
    const { low, medium, high } = gasEstimate;

    const calculateCost = (gasPrice: string) => {
      const gasCost = BigInt(gasPrice) * gasLimit;
      return gasCost.toString();
    };

    const gasCosts = {
      low: calculateCost(low.price),
      medium: calculateCost(medium.price),
      high: calculateCost(high.price),
    };

    // Convertir les coûts en valeurs lisibles
    const formatCost = (cost: string) => {
      return ethers.formatEther(cost);
    };

    return {
      gasLimit: gasLimit.toString(),
      gasCost: gasCosts,
      nativeCurrency: network.chain.nativeCurrency.symbol,
      totalCost: {
        low: formatCost(gasCosts.low),
        medium: formatCost(gasCosts.medium),
        high: formatCost(gasCosts.high),
      },
    };
  }
}
