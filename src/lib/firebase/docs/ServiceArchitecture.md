# Architecture des Services Firebase

Ce document décrit l'architecture des services Firebase utilisés dans l'application TokenForge.

## Structure des modules

Les services Firebase sont organisés en trois modules principaux :

1. **services.ts** : Initialisation cœur et configuration
2. **auth.ts** : Gestion de l'authentification
3. **firestore.ts** : Interactions avec la base de données

```
src/lib/firebase/
├── services.ts      # Initialisation et configuration
├── auth.ts          # Services d'authentification
├── firestore.ts     # Services de base de données
├── test/            # Tests unitaires
│   └── auth-test.ts # Tests d'authentification
└── docs/            # Documentation
    ├── README.md
    └── ServiceArchitecture.md
```

## Principes d'architecture

L'architecture des services Firebase suit les principes suivants :

1. **Initialisation unique** : Firebase est initialisé une seule fois au démarrage de l'application
2. **Lazy loading** : Les services sont chargés à la demande
3. **Séparation des préoccupations** : Chaque module a une responsabilité unique
4. **Interface stable** : Les composants interagissent avec les services via des interfaces stables

## Services d'authentification (auth.ts)

Le module `auth.ts` gère toutes les fonctionnalités liées à l'authentification :

### Fonctionnalités

- Initialisation du service Auth
- Connexion/déconnexion des utilisateurs (email/mot de passe, anonyme)
- Gestion des tokens d'authentification
- Surveillance de l'état d'authentification
- Gestion des erreurs d'authentification

### Interface principale

```typescript
export interface FirebaseAuthService {
  // État actuel
  currentUser: User | null;
  isInitialized: boolean;
  
  // Méthodes d'authentification
  signInWithEmailAndPassword(email: string, password: string): Promise<UserCredential>;
  signInAnonymously(): Promise<UserCredential>;
  createUserWithEmailAndPassword(email: string, password: string): Promise<UserCredential>;
  signOut(): Promise<void>;
  
  // Surveillance
  onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe;
}
```

### Interaction avec le provider React

Le module d'authentification est utilisé par le `TokenForgeAuthProvider` qui expose les fonctionnalités d'authentification aux composants React via le hook `useTokenForgeAuth`.

## Services Firestore (firestore.ts)

Le module `firestore.ts` gère toutes les interactions avec la base de données Firestore :

### Fonctionnalités

- Initialisation du service Firestore
- Opérations CRUD (Create, Read, Update, Delete)
- Requêtes et filtrage
- Transactions et lots (batches)
- Gestion des erreurs de base de données

### Interface principale

```typescript
export interface FirestoreService {
  // Collections et documents
  collection(path: string): CollectionReference;
  doc(path: string): DocumentReference;
  
  // Opérations CRUD
  getDoc(docRef: DocumentReference): Promise<DocumentSnapshot>;
  getDocs(query: Query): Promise<QuerySnapshot>;
  setDoc(docRef: DocumentReference, data: any): Promise<void>;
  updateDoc(docRef: DocumentReference, data: any): Promise<void>;
  deleteDoc(docRef: DocumentReference): Promise<void>;
  
  // Transactions
  runTransaction(callback: (transaction: Transaction) => Promise<any>): Promise<any>;
  batch(): WriteBatch;
}
```

## Initialisation des services (services.ts)

Le module `services.ts` est responsable de l'initialisation et de la configuration de Firebase :

### Fonctionnalités

- Configuration de Firebase
- Initialisation des applications Firebase
- Gestion des environnements (développement, production)
- Exportation des instances des services

### Interface principale

```typescript
export interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  
  // Méthodes utilitaires
  isInitialized(): boolean;
  terminate(): Promise<void>;
}
```

## Cycle de vie des services

1. **Initialisation** : Les services sont initialisés au démarrage de l'application
2. **Utilisation** : Les composants et les hooks utilisent les services selon leurs besoins
3. **Nettoyage** : Les abonnements sont nettoyés lors du démontage des composants

## Tests des services

Chaque service dispose de tests unitaires pour vérifier son bon fonctionnement :

1. **Tests d'initialisation** : Vérifier que les services sont correctement initialisés
2. **Tests fonctionnels** : Vérifier que les fonctionnalités de base fonctionnent comme prévu
3. **Tests d'intégration** : Vérifier l'interaction entre les différents services

## Bonnes pratiques

1. Toujours utiliser les méthodes des services plutôt que d'accéder directement aux instances Firebase
2. Désabonner les listeners lors du démontage des composants
3. Gérer les erreurs de manière appropriée
4. Utiliser les types TypeScript pour garantir la sécurité du code

## Dépannage

En cas de problèmes avec les services Firebase :

1. Vérifier que Firebase est correctement initialisé
2. Vérifier les logs pour identifier les erreurs
3. Utiliser les outils de débogage Firebase
4. Exécuter les tests unitaires pour isoler les problèmes
