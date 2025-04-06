import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { formatEther } from "viem";
import { usePublicClient } from "wagmi";

interface DeploymentCostProps {
  bytecode: string;
}

export const DeploymentCost = ({ bytecode }: DeploymentCostProps) => {
  const [estimatedCost, setEstimatedCost] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const publicClient = usePublicClient();

  useEffect(() => {
    const estimateDeploymentCost = async () => {
      try {
        setIsLoading(true);
        if (!publicClient) {
          throw new Error("No public client available");
        }
        const gasPrice = await publicClient.getGasPrice();
        const gasEstimate = await publicClient.estimateGas({
          data: bytecode as `0x${string}`,
        });
        const cost = gasPrice * gasEstimate;
        setEstimatedCost(formatEther(cost));
      } catch (error) {
        console.error("Error estimating deployment cost:", error);
        setEstimatedCost(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (bytecode) {
      estimateDeploymentCost();
    }
  }, [bytecode, publicClient]);

  if (isLoading) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <Typography>Estimating deployment cost...</Typography>
        <CircularProgress size={20} />
      </Box>
    );
  }

  if (!estimatedCost) {
    return (
      <Typography color="error">Could not estimate deployment cost</Typography>
    );
  }

  return (
    <Typography>Estimated deployment cost: {estimatedCost} ETH</Typography>
  );
};
