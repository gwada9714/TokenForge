# Architecture Firebase de TokenForge

Ce document décrit l'architecture et le processus d'initialisation des services Firebase utilisés dans l'application TokenForge.

## Organisation des modules

L'architecture Firebase est organisée selon une structure modulaire où chaque fichier a une responsabilité spécifique :

- **`services.ts`** : Initialisation cœur de Firebase et gestion du cycle de vie
- **`auth.ts`** : Services d'authentification et gestion des utilisateurs
- **`firestore.ts`** : Interactions avec la base de données Firestore
- **`functions.ts`** : Appels aux Cloud Functions Firebase

## Processus d'initialisation

L'initialisation des services Firebase suit une séquence précise pour éviter les dépendances circulaires :

1. **Initialisation du FirebaseManager** (`services.ts`)
   - Configuration de l'application Firebase avec les variables d'environnement
   - Initialisation des services Firebase de base (Firestore, Functions)

2. **Initialisation d'Auth** (`auth.ts`)
   - Appel explicite à `firebaseManager.initAuth()` pour initialiser Auth
   - Configuration de l'écouteur d'état d'authentification

3. **Initialisation des services dépendants**
   - Services qui requièrent une authentification Firebase déjà établie

## Bonnes pratiques d'utilisation

### Obtention des services

Pour obtenir une instance des services Firebase, utilisez toujours les fonctions exportées :

```typescript
// Obtenir le FirebaseManager
import { getFirebaseManager } from './services';
const firebaseManager = await getFirebaseManager();

// Obtenir le service d'authentification
import { firebaseAuth } from './auth';
const auth = await firebaseAuth.getAuth();

// Obtenir Firestore
import { firestoreService } from './firestore';
const db = await firestoreService.getDb();
```

### Éviter les dépendances circulaires

Pour éviter les dépendances circulaires, suivez ces règles :

1. N'importez jamais `auth.ts` dans `services.ts`
2. Utilisez la méthode `initAuth()` du FirebaseManager plutôt que d'accéder directement à la propriété `auth`
3. Assurez-vous que l'initialisation est terminée avant d'utiliser les services

## Séquence d'initialisation dans main.tsx

```typescript
// 1. Initialiser Firebase Manager
const firebaseManager = await getFirebaseManager();

// 2. Initialiser Auth explicitement
await firebaseManager.initAuth();

// 3. Initialiser le service d'authentification
await firebaseAuth.getAuth();

// 4. Initialiser les autres services
serviceManager.registerService(firebaseInitializer);
await serviceManager.initialize();
```

## APIs dépréciées

Les APIs suivantes sont dépréciées et seront supprimées dans une future version :

- `FirebaseInitializer` : Utilisez `getFirebaseManager()` de services.ts à la place
- `initialize()` dans FirebaseInitializer : Remplacé par `getFirebaseManager().initAuth()`

## Gestion des erreurs

Toutes les méthodes d'initialisation effectuent une gestion d'erreur appropriée :

- Les exceptions sont capturées et enregistrées via le système de logging centralisé
- Des messages d'erreur explicites sont générés pour faciliter le débogage
- Les erreurs sont propagées pour permettre une gestion au niveau supérieur

## Tests

Utilisez les mocks pour tester les composants qui dépendent des services Firebase :

```typescript
jest.mock('./services', () => ({
  getFirebaseManager: jest.fn().mockResolvedValue({
    initAuth: jest.fn().mockResolvedValue(/* mock Auth object */),
    // Autres méthodes mockées...
  })
}));
```
