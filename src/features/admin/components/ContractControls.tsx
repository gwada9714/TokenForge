import React from "react";
import { Box, Button } from "@mui/material";
import { useTokenForgeContract } from "../../../hooks/useTokenForgeContract";

interface ContractControlsProps {
  onError: (message: string) => void;
}

const ContractControls: React.FC<ContractControlsProps> = ({ onError }) => {
  const { isPaused, pause, unpause } = useTokenForgeContract();

  const handlePauseToggle = async () => {
    try {
      if (isPaused) {
        await unpause();
      } else {
        await pause();
      }
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Failed to toggle contract state"
      );
    }
  };

  return (
    <Box>
      <Button
        variant="contained"
        color={isPaused ? "success" : "warning"}
        onClick={handlePauseToggle}
      >
        {isPaused ? "Unpause Contract" : "Pause Contract"}
      </Button>
    </Box>
  );
};

export default ContractControls;
