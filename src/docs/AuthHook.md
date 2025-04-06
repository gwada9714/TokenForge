# Documentation du Hook d'Authentification Firebase

Cette documentation explique comment utiliser le hook `useAuth` pour gérer l'authentification Firebase dans votre application TokenForge.

## Importation

```typescript
import { useAuth } from "@/hooks/useAuth";
```

## Utilisation de base

Le hook `useAuth` fournit toutes les fonctionnalités nécessaires pour gérer l'authentification dans votre application :

```typescript
const {
  user, // Utilisateur authentifié (null si non connecté)
  status, // État de l'authentification
  error, // Erreur éventuelle
  isAuthenticated, // Booléen indiquant si l'utilisateur est authentifié
  isAdmin, // Booléen indiquant si l'utilisateur est administrateur
  isLoading, // Booléen indiquant si une opération est en cours
  signIn, // Fonction pour se connecter avec email/mot de passe
  signUp, // Fonction pour s'inscrire avec email/mot de passe
  signInAnonymously, // Fonction pour se connecter anonymement
  signOut, // Fonction pour se déconnecter
  resetPassword, // Fonction pour réinitialiser le mot de passe
  updateUserProfile, // Fonction pour mettre à jour le profil
} = useAuth();
```

## Options du Hook

Le hook `useAuth` accepte un objet d'options facultatif :

```typescript
const { user, status, error } = useAuth({
  onAuthStateChanged: (user) => {
    // Callback appelé lorsque l'état d'authentification change
    console.log('État d'authentification changé:', user);
  },
  onError: (error) => {
    // Callback appelé en cas d'erreur
    console.error('Erreur d'authentification:', error);
  }
});
```

## États d'authentification

Le hook gère plusieurs états d'authentification :

- `idle` : État initial
- `loading` : Opération en cours
- `authenticated` : Utilisateur authentifié
- `unauthenticated` : Utilisateur non authentifié
- `error` : Erreur survenue

## Méthodes d'authentification

### Connexion avec email et mot de passe

```typescript
const handleSignIn = async () => {
  try {
    const user = await signIn("utilisateur@exemple.com", "motdepasse");
    console.log("Utilisateur connecté:", user);
  } catch (error) {
    console.error("Erreur de connexion:", error);
  }
};
```

### Inscription avec email et mot de passe

```typescript
const handleSignUp = async () => {
  try {
    const user = await signUp("utilisateur@exemple.com", "motdepasse");
    console.log("Utilisateur inscrit:", user);
  } catch (error) {
    console.error("Erreur d'inscription:", error);
  }
};
```

### Connexion anonyme

```typescript
const handleSignInAnonymously = async () => {
  try {
    const user = await signInAnonymously();
    console.log("Utilisateur anonyme connecté:", user);
  } catch (error) {
    console.error("Erreur de connexion anonyme:", error);
  }
};
```

### Déconnexion

```typescript
const handleSignOut = async () => {
  try {
    await signOut();
    console.log("Utilisateur déconnecté");
  } catch (error) {
    console.error("Erreur de déconnexion:", error);
  }
};
```

### Réinitialisation du mot de passe

```typescript
const handleResetPassword = async () => {
  try {
    await resetPassword("utilisateur@exemple.com");
    console.log("Email de réinitialisation envoyé");
  } catch (error) {
    console.error("Erreur de réinitialisation:", error);
  }
};
```

### Mise à jour du profil

```typescript
const handleUpdateProfile = async () => {
  try {
    await updateUserProfile({
      displayName: "Nouveau Nom",
      photoURL: "https://exemple.com/photo.jpg",
    });
    console.log("Profil mis à jour");
  } catch (error) {
    console.error("Erreur de mise à jour du profil:", error);
  }
};
```

## Type AuthUser

Le hook retourne un objet `user` de type `AuthUser` qui contient les informations suivantes :

```typescript
interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
  emailVerified: boolean;
  isAdmin?: boolean;
  address?: string;
  metadata?: Record<string, unknown>;
}
```

## Exemple complet

Voici un exemple complet d'utilisation du hook `useAuth` dans un composant :

```typescript
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const AuthExample: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { user, status, error, isAuthenticated, signIn, signOut } = useAuth();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      setEmail("");
      setPassword("");
    } catch (error) {
      // L'erreur est déjà gérée par le hook
      console.log("Erreur gérée par le hook");
    }
  };

  return (
    <div>
      <h2>Exemple d'authentification</h2>

      {/* Affichage de l'état d'authentification */}
      <div>
        <p>Statut: {status}</p>
        <p>Authentifié: {isAuthenticated ? "Oui" : "Non"}</p>
        {error && <p>Erreur: {error.message}</p>}
      </div>

      {/* Informations utilisateur */}
      {user && (
        <div>
          <h3>Utilisateur</h3>
          <p>UID: {user.uid}</p>
          <p>Email: {user.email}</p>
          <p>Nom: {user.displayName}</p>
        </div>
      )}

      {/* Formulaire de connexion */}
      {!isAuthenticated ? (
        <form onSubmit={handleSignIn}>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Se connecter</button>
        </form>
      ) : (
        <button onClick={signOut}>Se déconnecter</button>
      )}
    </div>
  );
};

export default AuthExample;
```

## Composant de démonstration

Pour voir un exemple complet d'utilisation du hook `useAuth`, consultez le composant `AuthDemo.tsx` qui montre toutes les fonctionnalités d'authentification disponibles.

## Intégration avec d'autres hooks

Le hook `useAuth` peut être utilisé en combinaison avec les hooks Firestore pour créer des applications complètes avec authentification et gestion de données :

```typescript
import { useAuth } from "@/hooks/useAuth";
import { useDocument } from "@/hooks/useDocument";

const UserProfile: React.FC = () => {
  const { user } = useAuth();

  // Charger les données du profil utilisateur depuis Firestore
  const {
    data: profile,
    loading,
    error,
  } = useDocument(user ? `users/${user.uid}` : null);

  // ...
};
```

## Bonnes pratiques

1. **Gestion des erreurs** : Le hook gère déjà les erreurs et les journalise, mais vous pouvez ajouter une gestion personnalisée dans vos composants.

2. **État de chargement** : Utilisez `isLoading` ou `status === 'loading'` pour afficher un indicateur de chargement pendant les opérations d'authentification.

3. **Accès conditionnel** : Utilisez `isAuthenticated` pour afficher conditionnellement des éléments d'interface en fonction de l'état d'authentification.

4. **Sécurité** : N'oubliez pas d'ajouter des règles de sécurité dans Firebase pour protéger vos données.
