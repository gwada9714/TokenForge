import { useCallback, useEffect, useState } from "react";
import { Address } from "viem";
import { usePublicClient } from "wagmi";
import { tokenPermissionsAbi } from "@/contracts/abis/tokenPermissions";

export type Role = "admin" | "minter" | "pauser";

interface RoleState {
  hasRole: boolean;
  loading: boolean;
  error: Error | null;
}

export const useRoleCheck = (
  tokenAddress?: Address,
  account?: Address,
  role?: Role
) => {
  const publicClient = usePublicClient();
  const [state, setState] = useState<RoleState>({
    hasRole: false,
    loading: false,
    error: null,
  });

  const checkRole = useCallback(async () => {
    if (!tokenAddress || !account || !role || !publicClient) {
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const functionName =
        role === "admin"
          ? "isAdmin"
          : role === "minter"
          ? "isMinter"
          : "isPauser";

      const hasRole = await publicClient.readContract({
        address: tokenAddress,
        abi: tokenPermissionsAbi,
        functionName,
        args: [account],
      });

      setState({
        hasRole,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error ? error : new Error("Failed to check role"),
      }));
    }
  }, [tokenAddress, account, role, publicClient]);

  useEffect(() => {
    checkRole();
  }, [checkRole]);

  return {
    ...state,
    refetch: checkRole,
  };
};

export default useRoleCheck;
