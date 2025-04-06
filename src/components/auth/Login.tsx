import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export const Login = () => {
  const { login, authError, isLoading } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email: formData.email, password: formData.password });
  };

  return (
    <form onSubmit={handleSubmit}>
      {authError && <div className="error">{authError.message}</div>}
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="Mot de passe"
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
};
