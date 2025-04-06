# Documentation du Hook d'Authentification Firebase

## Introduction

Le hook `useAuth` est un hook React personnalisé qui encapsule toutes les fonctionnalités d'authentification Firebase pour l'application TokenForge. Il fournit une interface simple et cohérente pour gérer l'authentification des utilisateurs, tout en prenant en charge plusieurs méthodes d'authentification.

## Installation et Configuration

Le hook est déjà intégré dans l'application TokenForge. Pour l'utiliser dans vos composants, importez-le simplement :

```tsx
import { useAuth } from "../hooks/useAuth";
```

## Fonctionnalités Principales

Le hook `useAuth` expose les fonctionnalités suivantes :

### État d'Authentification

- `user` : L'objet utilisateur Firebase actuel, ou `null` si aucun utilisateur n'est connecté
- `isAuthenticated` : Un booléen indiquant si l'utilisateur est authentifié
- `isLoading` : Un booléen indiquant si l'authentification est en cours de chargement
- `isAdmin` : Un booléen indiquant si l'utilisateur a des privilèges d'administrateur

### Méthodes d'Authentification

- `signIn(email, password)` : Connecte un utilisateur avec son email et son mot de passe
- `signUp(email, password, displayName)` : Inscrit un nouvel utilisateur
- `signOut()` : Déconnecte l'utilisateur actuel
- `signInAnonymously()` : Connecte un utilisateur de manière anonyme
- `resetPassword(email)` : Envoie un email de réinitialisation de mot de passe
- `updateProfile(data)` : Met à jour le profil de l'utilisateur

## Exemple d'Utilisation

Voici un exemple simple d'utilisation du hook `useAuth` dans un composant :

```tsx
import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mot de passe"
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Connexion en cours..." : "Se connecter"}
      </button>
      {error && <p className="error">{error.message}</p>}
    </form>
  );
};
```

## Utilisation avec le Contexte d'Authentification

Pour une utilisation plus pratique dans toute l'application, le hook `useAuth` est encapsulé dans un contexte React (`AuthContext`). Vous pouvez utiliser le hook `useAuthContext` pour accéder à toutes les fonctionnalités d'authentification :

```tsx
import React from "react";
import { useAuthContext } from "../contexts/AuthContext";

const UserProfile: React.FC = () => {
  const { user, isAuthenticated, signOut } = useAuthContext();

  if (!isAuthenticated) {
    return <p>Veuillez vous connecter pour voir votre profil.</p>;
  }

  return (
    <div>
      <h2>Profil Utilisateur</h2>
      <p>Email: {user?.email}</p>
      <p>Nom: {user?.displayName || "Non défini"}</p>
      <button onClick={signOut}>Se déconnecter</button>
    </div>
  );
};
```

## Protection des Routes

Le composant `AuthGuard` utilise le hook `useAuth` pour protéger les routes qui nécessitent une authentification :

```tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAdmin = false,
  redirectTo = "/auth",
}) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (!isAuthenticated || (requireAdmin && !isAdmin)) {
    return <Navigate to={redirectTo} />;
  }

  return <>{children}</>;
};
```

## Gestion des Erreurs

Le hook `useAuth` gère les erreurs d'authentification Firebase et les expose via la propriété `error`. Vous pouvez utiliser cette propriété pour afficher des messages d'erreur appropriés à l'utilisateur.

## Conclusion

Le hook `useAuth` simplifie considérablement l'intégration de l'authentification Firebase dans l'application TokenForge. En utilisant ce hook, vous pouvez facilement ajouter des fonctionnalités d'authentification à vos composants sans avoir à vous soucier des détails d'implémentation de Firebase.
