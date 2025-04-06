import React, { useState, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Stack,
  Chip,
  Snackbar,
  Alert,
  AlertColor,
  Divider,
} from "@mui/material";
import { useContract } from "../../../hooks/useContract";

const ContractControls: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [paused, setPaused] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const { contract } = useContract("token");

  const handlePauseToggle = useCallback(async () => {
    if (!contract) return;

    setLoading(true);
    try {
      const tx = await (paused ? contract.unpause() : contract.pause());
      await tx.wait();

      setPaused(!paused);
      setSnackbar({
        open: true,
        message: `Contract successfully ${paused ? "unpaused" : "paused"}`,
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Failed to ${paused ? "unpause" : "pause"} contract`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [contract, paused]);

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Contract Controls
      </Typography>

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Contract Status
              </Typography>
              <Chip
                label={paused ? "Paused" : "Active"}
                color={paused ? "error" : "success"}
              />
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Emergency Controls
              </Typography>
              <Button
                variant="contained"
                color={paused ? "success" : "error"}
                onClick={handlePauseToggle}
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {paused ? "Unpause Contract" : "Pause Contract"}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContractControls;
