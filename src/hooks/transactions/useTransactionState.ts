import { useState, useCallback } from "react";
import { Hash } from "viem";

export type TransactionStatus =
  | "idle"
  | "pending"
  | "mining"
  | "success"
  | "error";

export interface TransactionState {
  status: TransactionStatus;
  hash: Hash | null;
  error: Error | null;
  blockNumber?: number;
}

export const useTransactionState = () => {
  const [state, setState] = useState<TransactionState>({
    status: "idle",
    hash: null,
    error: null,
  });

  const reset = useCallback(() => {
    setState({
      status: "idle",
      hash: null,
      error: null,
    });
  }, []);

  const setMining = useCallback((hash: Hash) => {
    setState({
      status: "mining",
      hash,
      error: null,
    });
  }, []);

  const setPending = useCallback(() => {
    setState({
      status: "pending",
      hash: null,
      error: null,
    });
  }, []);

  const setSuccess = useCallback((hash: Hash, blockNumber?: number) => {
    setState({
      status: "success",
      hash,
      error: null,
      blockNumber,
    });
  }, []);

  const setError = useCallback((error: Error) => {
    setState({
      status: "error",
      hash: null,
      error,
    });
  }, []);

  return {
    state,
    reset,
    setMining,
    setPending,
    setSuccess,
    setError,
  };
};

export default useTransactionState;
