import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoginCredentials, AuthError } from '../types/auth.types';
import { logger } from '@/core/logger';

export const Login = () => {
  const { login, isLoading, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [loginAttempts, setLoginAttempts] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Réinitialiser l'erreur lorsque l'utilisateur modifie les champs
    setError(null);
  }, []);
  
  // Réinitialiser le formulaire si l'utilisateur est déjà authentifié
  useEffect(() => {
    if (isAuthenticated) {
      setFormData({ email: '', password: '' });
      setError(null);
    }
  }, [isAuthenticated]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation basique côté client
    if (!formData.email.trim()) {
      setError('Veuillez saisir votre adresse email.');
      return;
    }
    
    if (!formData.password) {
      setError('Veuillez saisir votre mot de passe.');
      return;
    }
    
    // Limiter les tentatives de connexion
    if (loginAttempts >= 5) {
      setError('Trop de tentatives de connexion. Veuillez réessayer plus tard.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await login(formData);
      
      if (!response.success) {
        // Incrémenter le compteur de tentatives
        setLoginAttempts(prev => prev + 1);
        
        // Utiliser le message d'erreur spécifique de Firebase si disponible
        const authError = response.error as AuthError;
        if (authError && authError.message) {
          setError(authError.message);
        } else {
          setError('Échec de connexion. Vérifiez vos identifiants.');
        }
        
        // Effacer le mot de passe après une tentative échouée
        setFormData(prev => ({
          ...prev,
          password: ''
        }));
      }
    } catch (err) {
      logger.error('Auth', 'Erreur lors de la tentative de connexion', err);
      setError('Une erreur est survenue lors de la connexion. Veuillez réessayer.');
      
      // Incrémenter le compteur de tentatives
      setLoginAttempts(prev => prev + 1);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, login, loginAttempts]);
  
  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h2>Connexion</h2>
      
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading || isSubmitting}
          autoComplete="email"
          aria-required="true"
          aria-invalid={!!error && !formData.email}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="password">Mot de passe</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading || isSubmitting}
          autoComplete="current-password"
          aria-required="true"
          aria-invalid={!!error && !formData.password}
        />
      </div>
      
      <button 
        type="submit" 
        disabled={isLoading || isSubmitting || loginAttempts >= 5}
        aria-busy={isLoading || isSubmitting}
      >
        {isLoading || isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
      </button>
      
      {loginAttempts >= 5 && (
        <div className="lockout-message">
          Trop de tentatives de connexion. Veuillez réessayer plus tard ou réinitialiser votre mot de passe.
        </div>
      )}
    </form>
  );
};
