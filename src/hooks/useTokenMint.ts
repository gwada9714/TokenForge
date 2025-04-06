import { useContractWrite } from "wagmi";
import { CUSTOM_ERC20_ABI } from "../contracts/CustomERC20";
import { toast } from "react-hot-toast";

interface UseTokenMintProps {
  tokenAddress: string;
}

export const useTokenMint = ({ tokenAddress }: UseTokenMintProps) => {
  const {
    write: writeContract,
    isLoading,
    isError,
    error,
  } = useContractWrite({
    address: tokenAddress as `0x${string}`,
    abi: CUSTOM_ERC20_ABI,
    functionName: "mint",
  });

  const mintTokens = async (to: string, amount: string) => {
    try {
      const parsedAmount = BigInt(amount);
      await writeContract({
        args: [to as `0x${string}`, parsedAmount],
      });
      toast.success("Tokens créés avec succès");
    } catch (error) {
      console.error("Erreur lors de la création des tokens:", error);
      toast.error("Erreur lors de la création des tokens");
      throw error;
    }
  };

  return {
    mintTokens,
    isLoading,
    isError,
    error,
  };
};
