import { useState, useCallback, useEffect } from "react";
import { TaxConfig, TaxCalculation } from "../types/tax";
import { TaxService } from "../services/TaxService";

interface UseTaxCalculationProps {
  initialAmount?: number;
  initialConfig?: TaxConfig;
}

export const useTaxCalculation = ({
  initialAmount = 0,
  initialConfig = TaxService.getDefaultTaxConfig(),
}: UseTaxCalculationProps = {}) => {
  const [amount, setAmount] = useState<number>(initialAmount);
  const [taxConfig, setTaxConfig] = useState<TaxConfig>(initialConfig);
  const [taxCalculation, setTaxCalculation] = useState<TaxCalculation | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const calculateTax = useCallback(() => {
    try {
      // Valider la configuration
      TaxService.validateTaxConfig(taxConfig);

      // Calculer la taxe
      const calculation = TaxService.calculateTax(amount, taxConfig);
      setTaxCalculation(calculation);
      setError(null);

      return calculation;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors du calcul de la taxe"
      );
      setTaxCalculation(null);
      return null;
    }
  }, [amount, taxConfig]);

  const updateAmount = useCallback((newAmount: number) => {
    setAmount(newAmount);
  }, []);

  const updateTaxConfig = useCallback((newConfig: Partial<TaxConfig>) => {
    setTaxConfig((prev) => ({
      ...prev,
      ...newConfig,
    }));
  }, []);

  // Recalculer la taxe quand les dépendances changent
  useEffect(() => {
    calculateTax();
  }, [amount, taxConfig, calculateTax]);

  return {
    amount,
    taxConfig,
    taxCalculation,
    error,
    updateAmount,
    updateTaxConfig,
    calculateTax,
  };
};
