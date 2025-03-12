/**
 * Utilitaires pour la définition et la gestion des index Firestore
 * 
 * Ce module fournit des outils pour documenter les index nécessaires pour 
 * les requêtes complexes et générer le fichier firestore.indexes.json
 */

// Structure des index composés Firestore
interface FirestoreFieldConfig {
  fieldPath: string;
  order?: 'ASCENDING' | 'DESCENDING';
  arrayConfig?: 'CONTAINS';
}

interface FirestoreIndexConfig {
  collectionGroup: string;
  queryScope: 'COLLECTION' | 'COLLECTION_GROUP';
  fields: FirestoreFieldConfig[];
}

// Définition des index principaux de l'application
export const FIRESTORE_INDEXES: FirestoreIndexConfig[] = [
  // Index pour les requêtes sur les NFTs par propriétaire et date de création
  {
    collectionGroup: 'nfts',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'ownerId' },
      { fieldPath: 'createdAt', order: 'DESCENDING' }
    ]
  },
  
  // Index pour les transactions par utilisateur et date
  {
    collectionGroup: 'transactions',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'userId' },
      { fieldPath: 'status' },
      { fieldPath: 'timestamp', order: 'DESCENDING' }
    ]
  },
  
  // Index pour les collections NFT par propriétaire et statut
  {
    collectionGroup: 'nftCollections',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'ownerId' },
      { fieldPath: 'status' },
      { fieldPath: 'createdAt', order: 'DESCENDING' }
    ]
  },
  
  // Index pour les wallets par utilisateur et type
  {
    collectionGroup: 'wallets',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'userId' },
      { fieldPath: 'walletType' },
      { fieldPath: 'lastUpdated', order: 'DESCENDING' }
    ]
  },
  
  // Index pour les notifications non lues par utilisateur
  {
    collectionGroup: 'notifications',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'userId' },
      { fieldPath: 'read' },
      { fieldPath: 'createdAt', order: 'DESCENDING' }
    ]
  }
];

/**
 * Génère le contenu du fichier firestore.indexes.json au format attendu par Firebase
 */
export function generateFirestoreIndexesJson(): string {
  const indexesJson = {
    indexes: FIRESTORE_INDEXES,
    fieldOverrides: []
  };
  
  return JSON.stringify(indexesJson, null, 2);
}

/**
 * Liste les index recommandés pour les requêtes utilisées dans l'application
 * Cette fonction peut être utilisée comme documentation de développement
 */
export function getIndexRecommendations(): Record<string, string[]> {
  const recommendations: Record<string, string[]> = {};
  
  // Recommandations pour les requêtes sur les NFTs
  recommendations['nfts'] = [
    "Pour requêtes de type 'getUserNFTs': Créer un index composite sur (ownerId ASC, createdAt DESC)",
    "Pour requêtes de type 'getNFTsByCollection': Créer un index composite sur (collectionId ASC, tokenId ASC)"
  ];
  
  // Recommandations pour les transactions
  recommendations['transactions'] = [
    "Pour requêtes de type 'getUserTransactions': Créer un index composite sur (userId ASC, status ASC, timestamp DESC)",
    "Pour requêtes de type 'getRecentTransactions': Créer un index composite sur (status ASC, timestamp DESC)"
  ];
  
  // Recommandations pour les collections NFT
  recommendations['nftCollections'] = [
    "Pour requêtes de type 'getUserCollections': Créer un index composite sur (ownerId ASC, status ASC, createdAt DESC)"
  ];
  
  // Recommandations pour les wallets
  recommendations['wallets'] = [
    "Pour requêtes de type 'getUserWallets': Créer un index composite sur (userId ASC, walletType ASC, lastUpdated DESC)"
  ];
  
  // Recommandations pour les notifications
  recommendations['notifications'] = [
    "Pour requêtes de type 'getUnreadNotifications': Créer un index composite sur (userId ASC, read ASC, createdAt DESC)"
  ];
  
  return recommendations;
}

/**
 * Exporte les index vers un fichier
 * @param filePath Chemin du fichier où sauvegarder les index
 */
export async function exportIndexesToFile(filePath: string): Promise<boolean> {
  try {
    const fs = await import('fs/promises');
    await fs.writeFile(filePath, generateFirestoreIndexesJson());
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'export des index:', error);
    return false;
  }
}
