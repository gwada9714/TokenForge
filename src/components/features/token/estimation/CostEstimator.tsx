import React, { useEffect, useState } from "react";
import { Box, Paper, Typography, CircularProgress, Alert } from "@mui/material";
import { formatEther } from "viem";
import { useGasPrice } from "../../../../hooks/useGasPrice";

interface CostEstimatorProps {
  tokenParams: {
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    features: string[];
  };
}

interface GasEstimate {
  baseGas: bigint;
  featureGas: { [key: string]: bigint };
}

const BASE_GAS_ESTIMATE: GasEstimate = {
  baseGas: 2000000n,
  featureGas: {
    burnable: 500000n,
    mintable: 700000n,
    pausable: 400000n,
    permit: 800000n,
    votes: 1200000n,
  },
};

export const CostEstimator: React.FC<CostEstimatorProps> = ({
  tokenParams,
}) => {
  const { gasPrice, isLoading: isLoadingGas } = useGasPrice();
  const [totalGas, setTotalGas] = useState<bigint>(0n);
  const [estimatedCost, setEstimatedCost] = useState<string>("0");
  const [isCalculating, setIsCalculating] = useState(true);

  useEffect(() => {
    const calculateGas = () => {
      setIsCalculating(true);
      try {
        // Calcul du gas de base
        let gas = BASE_GAS_ESTIMATE.baseGas;

        // Ajout du gas pour chaque feature
        tokenParams.features.forEach((feature) => {
          if (feature in BASE_GAS_ESTIMATE.featureGas) {
            gas += BASE_GAS_ESTIMATE.featureGas[feature];
          }
        });

        // Ajustement en fonction de la taille du nom et du symbole
        gas += BigInt(tokenParams.name.length * 100);
        gas += BigInt(tokenParams.symbol.length * 100);

        setTotalGas(gas);

        // Calcul du coût estimé
        if (gasPrice) {
          const cost = gas * gasPrice;
          setEstimatedCost(formatEther(cost));
        }
      } catch (error) {
        console.error("Error calculating gas:", error);
      } finally {
        setIsCalculating(false);
      }
    };

    calculateGas();
  }, [tokenParams, gasPrice]);

  if (isLoadingGas || isCalculating) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Estimation des coûts
      </Typography>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Gas estimé : {totalGas.toString()} unités
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Prix du gas : {gasPrice ? formatEther(gasPrice) : "0"} ETH
        </Typography>

        <Typography variant="h6" sx={{ mt: 2 }}>
          Coût total estimé : {estimatedCost} ETH
        </Typography>

        <Alert severity="info" sx={{ mt: 2 }}>
          Cette estimation peut varier en fonction des conditions du réseau et
          des fonctionnalités choisies.
        </Alert>
      </Box>
    </Paper>
  );
};

export default CostEstimator;
