// src/components/features/token/components/MyTokens.tsx
import React from "react";
import { useAccount } from "wagmi";
import { useTokenData } from "../hooks/useTokenData";
import { useTransaction } from "../../../../hooks/useTransaction";
import { useErrorHandler } from "../../../../hooks/useErrorHandler";
import { TokenCard } from "../../token/TokenCard/TokenCard";
import LoadingSpinner from "../../../common/LoadingSpinner";
import ErrorMessage from "../../../common/ErrorMessage";
import type { TokenInfo } from "../hooks/useTokenData";

const MyTokens = () => {
  const { address } = useAccount();
  const {
    data: tokens,
    isLoading,
    error: queryError,
  } = useTokenData(address ?? "");
  const { isPending, executeTransaction } = useTransaction();
  const { error, handleError } = useErrorHandler();

  React.useEffect(() => {
    if (queryError) {
      handleError(queryError);
    }
  }, [queryError, handleError]);

  const handleTokenAction = async (tokenAddress: string) => {
    await executeTransaction(async () => {
      console.log("Token action:", tokenAddress);
    });
  };

  if (isLoading) return <LoadingSpinner />;
  if (error.isVisible) return <ErrorMessage message={error.message} />;

  return (
    <div className="my-tokens">
      {tokens?.map((token: TokenInfo) => (
        <TokenCard
          key={token.address}
          token={token}
          onAction={handleTokenAction}
        />
      ))}
      {isPending && <LoadingSpinner overlay />}
    </div>
  );
};

export default MyTokens;
