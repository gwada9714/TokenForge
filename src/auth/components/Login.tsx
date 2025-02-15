import { useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoginCredentials } from '../types/auth.types';

export const Login = () => {
  const { login, error, loading } = useAuth();
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: ''
  });

  // ...existing code...
};
