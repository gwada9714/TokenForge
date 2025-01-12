// src/components/common/ErrorMessage.tsx
import React from 'react';

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="alert alert-error" role="alert">
    {message}
  </div>
);

export default ErrorMessage;