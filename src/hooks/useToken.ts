import { useState, useEffect } from "react";
import { useContractRead } from "wagmi";
import { isAddress } from "viem";
import { CUSTOM_ERC20_ABI } from "../contracts/CustomERC20";

interface Token {
  address: string;
  name: string;
  symbol: string;
  totalSupply: string;
  decimals: number;
  isMintable: boolean;
  isBurnable: boolean;
}

export function useToken(tokenAddress: string) {
  const [token, setToken] = useState<Token | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Validate address
  if (!isAddress(tokenAddress)) {
    return {
      token: null,
      isLoading: false,
      error: "L'adresse du token n'est pas valide",
    };
  }

  const { data: name, error: nameError } = useContractRead({
    address: tokenAddress as `0x${string}`,
    abi: CUSTOM_ERC20_ABI,
    functionName: "name",
  });

  const { data: symbol, error: symbolError } = useContractRead({
    address: tokenAddress as `0x${string}`,
    abi: CUSTOM_ERC20_ABI,
    functionName: "symbol",
  });

  const { data: totalSupply, error: totalSupplyError } = useContractRead({
    address: tokenAddress as `0x${string}`,
    abi: CUSTOM_ERC20_ABI,
    functionName: "totalSupply",
  });

  const { data: decimals, error: decimalsError } = useContractRead({
    address: tokenAddress as `0x${string}`,
    abi: CUSTOM_ERC20_ABI,
    functionName: "decimals",
  });

  const { data: isMintable, error: isMintableError } = useContractRead({
    address: tokenAddress as `0x${string}`,
    abi: CUSTOM_ERC20_ABI,
    functionName: "isMintable",
  });

  const { data: isBurnable, error: isBurnableError } = useContractRead({
    address: tokenAddress as `0x${string}`,
    abi: CUSTOM_ERC20_ABI,
    functionName: "isBurnable",
  });

  useEffect(() => {
    if (
      name &&
      symbol &&
      totalSupply !== undefined &&
      decimals !== undefined &&
      isMintable !== undefined &&
      isBurnable !== undefined
    ) {
      setToken({
        address: tokenAddress,
        name: name as string,
        symbol: symbol as string,
        totalSupply: totalSupply.toString(),
        decimals: Number(decimals),
        isMintable: Boolean(isMintable),
        isBurnable: Boolean(isBurnable),
      });
      setError(null);
      setIsLoading(false);
    } else if (
      nameError ||
      symbolError ||
      totalSupplyError ||
      decimalsError ||
      isMintableError ||
      isBurnableError
    ) {
      setError("Erreur lors du chargement des informations du token");
      setIsLoading(false);
    }
  }, [
    tokenAddress,
    name,
    symbol,
    totalSupply,
    decimals,
    isMintable,
    isBurnable,
    nameError,
    symbolError,
    totalSupplyError,
    decimalsError,
    isMintableError,
    isBurnableError,
  ]);

  return {
    token,
    isLoading,
    error,
  };
}
