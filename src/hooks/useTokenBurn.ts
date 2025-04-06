import { useContractWrite } from "wagmi";
import { CUSTOM_ERC20_ABI } from "../contracts/CustomERC20";
import { toast } from "react-hot-toast";

interface UseTokenBurnProps {
  tokenAddress: string;
}

export const useTokenBurn = ({ tokenAddress }: UseTokenBurnProps) => {
  const {
    write: writeContract,
    isLoading,
    isError,
    error,
  } = useContractWrite({
    address: tokenAddress as `0x${string}`,
    abi: CUSTOM_ERC20_ABI,
    functionName: "burn",
  });

  const burnTokens = async (amount: string) => {
    try {
      if (!writeContract) {
        throw new Error("Burn function not ready");
      }

      const parsedAmount = BigInt(amount);
      await writeContract({
        args: [parsedAmount],
      });
      toast.success("Tokens burned successfully");
    } catch (error) {
      console.error("Error burning tokens:", error);
      toast.error("Error burning tokens");
      throw error;
    }
  };

  return {
    burnTokens,
    isLoading,
    isError,
    error,
  };
};
