import React from "react";
import { CircularProgress } from "@mui/material";
import styled from "styled-components";

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  width: 100%;
`;

const LoadingFallback: React.FC = () => (
  <LoadingContainer>
    <CircularProgress />
  </LoadingContainer>
);

export default LoadingFallback;
