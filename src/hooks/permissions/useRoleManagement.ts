import { useCallback } from "react";
import { Address } from "viem";
import { useWalletClient } from "wagmi";
import { tokenPermissionsAbi } from "@/contracts/abis/tokenPermissions";
import { useTransactionHandler } from "../transactions";
import { Role } from "./useRoleCheck";

export const useRoleManagement = (tokenAddress?: Address) => {
  const { data: walletClient } = useWalletClient();
  const { handleTransaction } = useTransactionHandler();

  const grantRole = useCallback(
    async (account: Address, role: Role) => {
      if (!tokenAddress || !walletClient) {
        throw new Error("Token address and wallet are required");
      }

      const functionName =
        role === "admin"
          ? "grantAdmin"
          : role === "minter"
          ? "grantMinter"
          : "grantPauser";

      return handleTransaction(async () => {
        const hash = await walletClient.writeContract({
          address: tokenAddress,
          abi: tokenPermissionsAbi,
          functionName,
          args: [account],
        });

        return hash;
      });
    },
    [tokenAddress, walletClient, handleTransaction]
  );

  const revokeRole = useCallback(
    async (account: Address, role: Role) => {
      if (!tokenAddress || !walletClient) {
        throw new Error("Token address and wallet are required");
      }

      const functionName =
        role === "admin"
          ? "revokeAdmin"
          : role === "minter"
          ? "revokeMinter"
          : "revokePauser";

      return handleTransaction(async () => {
        const hash = await walletClient.writeContract({
          address: tokenAddress,
          abi: tokenPermissionsAbi,
          functionName,
          args: [account],
        });

        return hash;
      });
    },
    [tokenAddress, walletClient, handleTransaction]
  );

  return {
    grantRole,
    revokeRole,
  };
};

export default useRoleManagement;
