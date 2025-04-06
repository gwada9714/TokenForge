# Guide de Déploiement sur Testnet

Ce document explique comment déployer l'application TokenForge sur un réseau de test (testnet) pour les tests d'intégration et la validation avant le déploiement en production.

## Prérequis

- Node.js v18 ou supérieur
- npm v9 ou supérieur
- Accès à un nœud RPC pour le testnet cible (Sepolia, Goerli, BSC Testnet, etc.)
- Clé privée avec des fonds sur le testnet cible
- Clé API Etherscan (ou équivalent) pour la vérification des contrats

## Configuration

1. Créez un fichier `.env.testnet` basé sur le modèle `.env.example` :

```bash
cp .env.example .env.testnet
```

2. Modifiez le fichier `.env.testnet` avec vos informations spécifiques :
   - Adresses des contrats déjà déployés (TKN_TOKEN_ADDRESS, TREASURY_ADDRESS, TAX_SYSTEM_ADDRESS)
   - Clé privée du déployeur (DEPLOYER_PRIVATE_KEY)
   - URL RPC du testnet (RPC_URL)
   - ID de la chaîne (CHAIN_ID)
   - Réseau pour la vérification (NETWORK)
   - Clé API Etherscan (ETHERSCAN_API_KEY)

## Compilation des Smart Contracts

Avant le déploiement, compilez les smart contracts :

```bash
npm run compile
```

Cette commande générera les artefacts de compilation dans le dossier `artifacts/`.

## Déploiement sur le Testnet

### 1. Déploiement des Smart Contracts

Pour déployer uniquement les smart contracts :

```bash
source .env.testnet && npx ts-node scripts/deploy.ts
```

Le script affichera les adresses des contrats déployés et les sauvegardera dans un fichier `deployment-info.json`.

### 2. Déploiement Complet (Frontend + Backend + Smart Contracts)

Pour un déploiement complet de l'application sur le testnet Sepolia :

```bash
./scripts/deploy-testnet.sh
```

Ce script spécialement conçu pour le testnet Sepolia :

1. Charge les variables d'environnement depuis `.env.testnet`
2. Installe les dépendances
3. Compile les smart contracts
4. Exécute les tests
5. Déploie les smart contracts sur Sepolia
6. Construit l'application frontend
7. Déploie le frontend sur S3 (si configuré)
8. Invalide le cache CloudFront (si configuré)
9. Met à jour la base de données (si UPDATE_DATABASE=true)
10. Vérifie les contrats sur Etherscan

Pour un déploiement sur d'autres environnements :

```bash
./scripts/deploy-test-env.sh staging
```

## Vérification des Contrats

Après le déploiement, vous pouvez vérifier les contrats sur Etherscan (ou équivalent) :

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARG1> <CONSTRUCTOR_ARG2> <CONSTRUCTOR_ARG3>
```

Par exemple :

```bash
npx hardhat verify --network sepolia 0x1234567890123456789012345678901234567890 0xTKN_TOKEN_ADDRESS 0xTREASURY_ADDRESS 0xTAX_SYSTEM_ADDRESS
```

## Tests d'Intégration sur le Testnet

Une fois les contrats déployés, exécutez les tests d'intégration sur le testnet :

```bash
TESTNET=true npm run test:integration
```

## Surveillance et Monitoring

Après le déploiement, vous pouvez surveiller l'application sur le testnet :

1. Vérifiez les transactions sur l'explorateur de blocs du testnet
2. Surveillez les logs de l'application
3. Testez les fonctionnalités principales via l'interface utilisateur

## Résolution des Problèmes

### Problèmes Courants

1. **Erreur de nonce** : Si vous recevez une erreur de nonce, réinitialisez le nonce de votre compte sur le testnet.
2. **Gaz insuffisant** : Augmentez la limite de gaz ou le prix du gaz dans le script de déploiement.
3. **Échec de vérification** : Assurez-vous que les arguments du constructeur sont corrects et que le contrat est compilé avec les mêmes paramètres.

### Logs et Debugging

Les logs de déploiement sont disponibles dans la console. Pour un debugging plus détaillé, ajoutez la variable d'environnement `DEBUG=true` avant d'exécuter les scripts.

## Nettoyage

Si vous devez redéployer ou nettoyer l'environnement de test :

```bash
./scripts/cleanup.ps1 testnet
```

Ce script supprimera les artefacts de déploiement précédents et préparera l'environnement pour un nouveau déploiement.

## Chaînes Supportées

TokenForge prend en charge les testnets suivants :

- Ethereum : Sepolia (CHAIN_ID=11155111), Goerli (CHAIN_ID=5)
- Binance Smart Chain : Testnet (CHAIN_ID=97)
- Polygon : Mumbai (CHAIN_ID=80001)
- Avalanche : Fuji (CHAIN_ID=43113)
- Arbitrum : Goerli (CHAIN_ID=421613)
- Solana : Devnet (spécifier via RPC_URL)

## Prochaines Étapes

Après un déploiement réussi sur le testnet et la validation des fonctionnalités, vous pouvez procéder au déploiement en production en suivant un processus similaire avec les variables d'environnement de production.
