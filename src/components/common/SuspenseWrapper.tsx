import React, { Suspense } from "react";
import LoadingFallback from "./LoadingFallback";

interface SuspenseWrapperProps {
  children: React.ReactNode;
}

const SuspenseWrapper: React.FC<SuspenseWrapperProps> = ({ children }) => (
  <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
);

export default SuspenseWrapper;
