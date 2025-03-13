# Documentation des Hooks Firestore Optimisés

Cette documentation explique comment utiliser les hooks React optimisés pour Firestore dans l'application TokenForge.

## Table des matières

1. [Introduction](#introduction)
2. [Installation et configuration](#installation-et-configuration)
3. [Hooks disponibles](#hooks-disponibles)
   - [useDocument](#usedocument)
   - [useQuery](#usequery)
   - [useCollection](#usecollection)
4. [Options de configuration](#options-de-configuration)
5. [Gestion du cache](#gestion-du-cache)
6. [Exemples d'utilisation](#exemples-dutilisation)
7. [Bonnes pratiques](#bonnes-pratiques)

## Introduction

Les hooks Firestore optimisés permettent d'interagir avec la base de données Firestore de manière efficace et performante. Ils offrent des fonctionnalités avancées comme :

- Mise en cache automatique des données
- Abonnements en temps réel
- Gestion des erreurs améliorée
- Mécanismes de tentatives de récupération
- Invalidation sélective du cache

Ces hooks sont conçus pour être faciles à utiliser tout en offrant des performances optimales.

## Installation et configuration

Les hooks sont déjà intégrés dans l'application TokenForge. Pour les utiliser, il suffit de les importer depuis le module `@/hooks/useFirestore`.

```typescript
import { useDocument, useQuery, useCollection } from '@/hooks/useFirestore';
```

## Hooks disponibles

### useDocument

Le hook `useDocument` permet de récupérer un document Firestore par son ID.

```typescript
const { 
  data,         // Données du document (null si non trouvé)
  loading,      // État de chargement ('idle', 'loading', 'success', 'error')
  error,        // Erreur éventuelle
  reload,       // Fonction pour recharger les données
  invalidateCache // Fonction pour invalider le cache du document
} = useDocument(
  'collection',  // Nom de la collection
  'documentId',  // ID du document (null pour désactiver la requête)
  {              // Options (facultatives)
    realtime: true,      // Abonnement en temps réel
    cacheEnabled: true,  // Activation du cache
    cacheTTL: 60000,     // Durée de vie du cache en ms (1 minute)
    retry: {             // Configuration des tentatives
      count: 3,          // Nombre de tentatives
      delay: 1000        // Délai entre les tentatives en ms
    }
  }
);
```

### useQuery

Le hook `useQuery` permet d'exécuter une requête Firestore avec des contraintes.

```typescript
import { where, orderBy, limit } from 'firebase/firestore';

const { 
  data,         // Tableau des résultats
  loading,      // État de chargement ('idle', 'loading', 'success', 'error')
  error,        // Erreur éventuelle
  reload,       // Fonction pour recharger les données
  invalidateCache // Fonction pour invalider le cache de la requête
} = useQuery(
  'collection',  // Nom de la collection
  [              // Contraintes de la requête
    where('field', '==', 'value'),
    orderBy('createdAt', 'desc'),
    limit(10)
  ],
  {              // Options (facultatives)
    realtime: true,      // Abonnement en temps réel
    cacheEnabled: true,  // Activation du cache
    cacheTTL: 30000,     // Durée de vie du cache en ms (30 secondes)
    retry: {             // Configuration des tentatives
      count: 3,          // Nombre de tentatives
      delay: 1000        // Délai entre les tentatives en ms
    }
  }
);
```

### useCollection

Le hook `useCollection` fournit des méthodes pour effectuer des opérations CRUD sur une collection.

```typescript
const { 
  addDocument,    // Fonction pour ajouter un document
  updateDocument, // Fonction pour mettre à jour un document
  deleteDocument  // Fonction pour supprimer un document
} = useCollection('collection');

// Exemples d'utilisation
const addNewDoc = async () => {
  const docId = await addDocument({ name: 'Nouveau document', createdAt: new Date() });
  console.log(`Document ajouté avec l'ID: ${docId}`);
};

const updateDoc = async () => {
  await updateDocument('docId', { name: 'Document mis à jour', updatedAt: new Date() });
};

const deleteDoc = async () => {
  await deleteDocument('docId');
};
```

## Options de configuration

Tous les hooks acceptent des options de configuration pour personnaliser leur comportement :

| Option | Description | Valeur par défaut |
|--------|-------------|-------------------|
| `realtime` | Active les mises à jour en temps réel | `true` |
| `cacheEnabled` | Active la mise en cache des données | `true` |
| `cacheTTL` | Durée de vie du cache en millisecondes | `60000` (1 minute) pour les documents, `30000` (30 secondes) pour les requêtes |
| `retry.count` | Nombre de tentatives en cas d'échec | `3` |
| `retry.delay` | Délai entre les tentatives en millisecondes | `1000` (1 seconde) |

## Gestion du cache

Les hooks gèrent automatiquement le cache, mais vous pouvez également le contrôler manuellement :

```typescript
// Invalider le cache d'un document spécifique
invalidateDocumentCache();

// Invalider le cache d'une collection entière
invalidateQueryCache();
```

Les opérations d'écriture (ajout, mise à jour, suppression) invalident automatiquement le cache concerné.

## Exemples d'utilisation

### Afficher un document avec mise à jour en temps réel

```tsx
function TokenDetails({ tokenId }) {
  const { data: token, loading, error } = useDocument('tokens', tokenId);

  if (loading === 'loading') return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!token) return <p>Token non trouvé</p>;

  return (
    <div>
      <h2>{token.name}</h2>
      <p>Type: {token.type}</p>
      <p>Créé le: {token.createdAt.toDate().toLocaleDateString()}</p>
    </div>
  );
}
```

### Liste filtrée avec pagination

```tsx
function TokenList({ type, limit = 10 }) {
  const [page, setPage] = useState(0);
  
  const { data: tokens, loading, error } = useQuery('tokens', [
    where('type', '==', type),
    orderBy('createdAt', 'desc'),
    limit(limit)
  ]);

  const nextPage = () => setPage(p => p + 1);
  const prevPage = () => setPage(p => Math.max(0, p - 1));

  return (
    <div>
      {loading === 'loading' && <LoadingSpinner />}
      {error && <ErrorMessage message={error.message} />}
      
      <div className="grid grid-cols-3 gap-4">
        {tokens.map(token => (
          <TokenCard key={token.id} token={token} />
        ))}
      </div>
      
      <div className="flex justify-between mt-4">
        <button onClick={prevPage} disabled={page === 0}>Précédent</button>
        <button onClick={nextPage} disabled={tokens.length < limit}>Suivant</button>
      </div>
    </div>
  );
}
```

### Formulaire d'ajout avec validation

```tsx
function AddTokenForm() {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const { addDocument } = useCollection('tokens');
  const [status, setStatus] = useState({ loading: false, error: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null });
    
    try {
      await addDocument({
        name,
        type,
        createdAt: new Date(),
        createdBy: 'user123'
      });
      
      // Réinitialiser le formulaire
      setName('');
      setType('');
      setStatus({ loading: false, error: null });
      
    } catch (error) {
      setStatus({ loading: false, error: error.message });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Champs du formulaire */}
      <button type="submit" disabled={status.loading}>
        {status.loading ? 'Ajout en cours...' : 'Ajouter'}
      </button>
      {status.error && <p className="text-red-500">{status.error}</p>}
    </form>
  );
}
```

## Bonnes pratiques

1. **Désactivez le temps réel** lorsqu'il n'est pas nécessaire pour économiser les ressources.
2. **Ajustez la durée de vie du cache** en fonction de la fréquence de mise à jour des données.
3. **Utilisez des ID de document null** pour désactiver temporairement une requête.
4. **Invalidez le cache** après des opérations qui modifient les données en dehors des hooks.
5. **Gérez correctement les états de chargement** pour offrir une bonne expérience utilisateur.
6. **Utilisez la déstructuration partielle** pour n'extraire que ce dont vous avez besoin.
7. **Limitez le nombre de documents** récupérés pour optimiser les performances.
