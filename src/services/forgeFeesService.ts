import { formatEther, parseEther } from 'ethers';
import { TokenForgePlansContract } from '@/contracts/types';

export class ForgeFeesService {
  private static readonly FORGE_TAX_PERCENTAGE = 1n; // 1% fixe et non modifiable
  private static readonly DISTRIBUTION = {
    tokenForge: 70n,    // 70% pour TokenForge
    development: 15n,   // 15% pour le développement
    tokenBuyback: 10n,  // 10% pour le rachat et burn de $TKN
    stakers: 5n         // 5% pour les stakers
  };

  public static calculateForgeTax(transactionAmount: string): string {
    const amount = parseEther(transactionAmount);
    return ((amount * this.FORGE_TAX_PERCENTAGE) / 100n).toString();
  }

  public static async distributeFees(
    contract: TokenForgePlansContract,
    taxAmount: string
  ): Promise<void> {
    const tax = parseEther(taxAmount);
    
    // Distribution automatique des taxes selon les pourcentages définis
    await contract.distributeFees(
      (tax * this.DISTRIBUTION.tokenForge) / 100n,
      (tax * this.DISTRIBUTION.development) / 100n,
      (tax * this.DISTRIBUTION.tokenBuyback) / 100n,
      (tax * this.DISTRIBUTION.stakers) / 100n
    );
  }

  public static getForgeFeesInfo() {
    return {
      taxPercentage: Number(this.FORGE_TAX_PERCENTAGE),
      distribution: {
        tokenForge: Number(this.DISTRIBUTION.tokenForge),
        development: Number(this.DISTRIBUTION.development),
        tokenBuyback: Number(this.DISTRIBUTION.tokenBuyback),
        stakers: Number(this.DISTRIBUTION.stakers)
      },
      description: "La taxe de la forge est fixée à 1% sur toutes les transactions. Cette taxe est non-désactivable et non-modifiable.",
      benefits: [
        "70% des taxes sont utilisées pour le développement et les profits de TokenForge",
        "15% sont alloués au fonds de développement",
        "10% sont utilisés pour le rachat et le burn de $TKN",
        "5% sont redistribués aux stakers de $TKN"
      ]
    };
  }
}
