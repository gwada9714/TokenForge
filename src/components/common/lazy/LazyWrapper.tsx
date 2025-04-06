import { Suspense } from "react";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";

interface LazyWrapperProps {
  children: React.ReactNode;
}

const LazyWrapper = ({ children }: LazyWrapperProps) => {
  return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>;
};

export default LazyWrapper;
