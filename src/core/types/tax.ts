export interface TaxConfig {
  // Taxe de base fixe (0.5%)
  baseTax: number;

  // Taxe additionnelle configurable (max 1.5%)
  additionalTax: number;

  // Distribution de la taxe de base
  distribution: {
    tokenForge: number; // 60%
    development: number; // 20%
    burnAndBuyback: number; // 15%
    stakers: number; // 5%
  };

  // Configuration de la taxe additionnelle
  additionalTaxConfig: {
    enabled: boolean;
    recipient: string; // Adresse du créateur du token
  };
}

export interface TaxCalculation {
  totalTaxAmount: number;
  baseTaxAmount: number;
  additionalTaxAmount: number;
  distribution: {
    tokenForge: number;
    development: number;
    burnAndBuyback: number;
    stakers: number;
    creator: number;
  };
}
