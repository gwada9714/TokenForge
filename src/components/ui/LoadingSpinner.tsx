import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: rgba(249, 250, 251, 0.8);
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #6366f1;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

export function LoadingSpinner() {
  return (
    <SpinnerWrapper>
      <Spinner />
    </SpinnerWrapper>
  );
} 