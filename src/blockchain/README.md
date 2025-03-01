# Module d'Intégration Blockchain

Ce module implémente l'architecture d'intégration multi-chain pour le projet TokenForge, en utilisant viem pour l'interaction avec les blockchains et vitest pour les tests.

## Structure du Module

```
src/blockchain/
  ├── adapters/            # Adaptateurs spécifiques à chaque blockchain
  │   ├── ethereum.ts      # Implémentation pour Ethereum
  │   ├── binance.ts       # Implémentation pour Binance Smart Chain
  │   ├── polygon.ts       # Implémentation pour Polygon
  │   ├── avalanche.ts     # Implémentation pour Avalanche
  │   ├── arbitrum.ts      # Implémentation pour Arbitrum
  │   └── solana.ts        # Ébauche d'implémentation pour Solana
  ├── interfaces/          # Interfaces communes
  │   ├── IBlockchainService.ts
  │   ├── IPaymentService.ts
  │   └── ITokenService.ts
  ├── providers/           # Configuration des providers
  │   ├── index.ts         # Factory pour les providers
  │   └── config.ts        # Configuration des chaînes
  ├── services/            # Services blockchain indépendants de la chaîne
  │   └── BlockchainService.ts
  ├── utils/               # Utilitaires communs (à implémenter)
  ├── hooks/               # Hooks React pour l'UI
  │   ├── useBlockchain.ts
  │   ├── useTokenCreation.ts
  │   ├── useTokenDeployment.ts
  │   └── usePayment.ts
  ├── constants/           # Constantes partagées
  │   └── chains.ts
  ├── types.ts             # Types partagés
  ├── factory.ts           # Factory pour les services
  └── index.ts             # Point d'entrée du module
```

## Architecture

Ce module utilise le pattern adapter pour gérer les différences entre blockchains:

1. **Interfaces communes**: Définissent un contrat commun pour tous les services blockchain
2. **Service de base**: Implémente les fonctionnalités communes à toutes les blockchains EVM
3. **Adaptateurs spécifiques**: Implémentent les fonctionnalités spécifiques à chaque blockchain
4. **Factory**: Crée les services appropriés en fonction de la blockchain demandée

## Utilisation

### Création d'un service blockchain

```typescript
import { createBlockchainService } from '@/blockchain';

// Créer un service pour Ethereum
const ethereumService = createBlockchainService('ethereum', window.ethereum);

// Utiliser le service
const balance = await ethereumService.getBalance('0x...');
```

### Utilisation des hooks React

#### Hook de base pour la connexion blockchain

```typescript
import { useBlockchain } from '@/blockchain/hooks/useBlockchain';

function MyComponent() {
  const { service, isConnected, networkId, error } = useBlockchain('ethereum', window.ethereum);

  // Utiliser le service dans un composant React
  useEffect(() => {
    if (service && isConnected) {
      service.getBalance('0x...').then(balance => {
        console.log('Balance:', balance);
      });
    }
  }, [service, isConnected]);

  return (
    <div>
      {isConnected ? (
        <p>Connected to network {networkId}</p>
      ) : (
        <p>Not connected</p>
      )}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

#### Hook pour la création de tokens

```typescript
import { useTokenCreation } from '@/blockchain/hooks/useTokenCreation';

function TokenCreationForm() {
  const { 
    validateToken, 
    estimateDeploymentCost, 
    deployToken, 
    isDeploying, 
    validationResult, 
    error 
  } = useTokenCreation('ethereum', window.ethereum);

  const handleSubmit = async (tokenConfig) => {
    // Valider la configuration
    const validation = await validateToken(tokenConfig);
    if (!validation.valid) {
      console.error('Invalid token configuration:', validation.errors);
      return;
    }

    // Estimer le coût
    const cost = await estimateDeploymentCost(tokenConfig);
    console.log('Estimated deployment cost:', cost);

    // Déployer le token
    const result = await deployToken(tokenConfig);
    if (result) {
      console.log('Token deployed:', result);
    }
  };

  return (
    <div>
      {/* Formulaire de création de token */}
      {isDeploying && <p>Déploiement en cours...</p>}
      {error && <p>Erreur: {error}</p>}
    </div>
  );
}
```

#### Hook pour les paiements

```typescript
import { usePayment } from '@/blockchain/hooks/usePayment';

function PaymentComponent() {
  const { 
    createPaymentSession, 
    verifyPayment, 
    calculateFees, 
    isProcessing, 
    sessionId, 
    error 
  } = usePayment('ethereum', window.ethereum);

  const handlePayment = async (amount) => {
    // Calculer les frais
    const fees = await calculateFees(amount);
    console.log('Estimated fees:', fees);

    // Créer une session de paiement
    const session = await createPaymentSession(amount, 'ETH');
    if (session) {
      console.log('Payment session created:', session);
    }
  };

  const handleVerification = async (txHash) => {
    const isValid = await verifyPayment(txHash);
    console.log('Payment verification:', isValid ? 'Valid' : 'Invalid');
  };

  return (
    <div>
      {/* Interface de paiement */}
      {isProcessing && <p>Traitement en cours...</p>}
      {sessionId && <p>Session de paiement: {sessionId}</p>}
      {error && <p>Erreur: {error}</p>}
    </div>
  );
}
```

## État d'implémentation

- **Phase 1**: Ethereum (✅ implémenté)
- **Phase 2**: 
  - Binance Smart Chain (✅ implémenté)
  - Polygon (✅ implémenté)
- **Phase 3**: 
  - Avalanche (✅ implémenté)
  - Arbitrum (✅ implémenté)
- **Phase 4**: Solana (🔄 ébauche implémentée avec dépendances installées)

## Prochaines étapes

1. **Finalisation des adaptateurs**:
   - Solana (créer des tests unitaires et tester l'intégration avec un wallet Solana)

2. **Amélioration des tests**:
   - Tests d'intégration
   - Tests E2E

3. **Utilitaires communs**:
   - Implémentation des utilitaires dans `src/blockchain/utils/`
   - Gestion des ABIs
   - Formatters pour les données blockchain

4. **Documentation**:
   - Documentation complète des APIs
   - Exemples d'utilisation

## Tests

Les tests sont implémentés avec vitest. Pour exécuter les tests:

```bash
npm run test
