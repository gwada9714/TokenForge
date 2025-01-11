// src/components/common/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
  overlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ overlay }) => {
  return (
    <div className={`loading-spinner ${overlay ? 'overlay' : ''}`}>
      <div className="spinner"></div>
    </div>
  );
};

export default LoadingSpinner;