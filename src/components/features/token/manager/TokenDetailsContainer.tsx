import React from 'react';
import { useParams } from 'react-router-dom';
import { useTokenData } from '../hooks/useTokenData';
import TokenDetails from './TokenDetails';
import LoadingSpinner from '../../../common/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '../../../common/ErrorMessage';

const TokenDetailsContainer: React.FC = () => {
  const { tokenId } = useParams<{ tokenId: string }>();
  const { token, isLoading, error } = useTokenData(tokenId);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  if (!token) {
    return <ErrorMessage message="Token not found" />;
  }

  return <TokenDetails token={token} />;
};

export default TokenDetailsContainer;
