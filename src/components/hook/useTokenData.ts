// src/components/hook/useTokenData.ts
import { useQuery } from "@tanstack/react-query";
import { fetchTokens } from "../../services/tokenService";
import type { TokenInfo } from "../../services/tokenService";

export const useTokenData = (address: string) => {
  return useQuery({
    queryKey: ["tokens", address],
    queryFn: () => fetchTokens(address),
    enabled: Boolean(address),
    staleTime: 30_000,
    gcTime: 60_000,
  });
};
