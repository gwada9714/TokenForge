# Guide de Démarrage - TokenForge

## Prérequis

- Node.js v16 ou supérieur
- Un wallet compatible Web3 (MetaMask recommandé)
- Un compte avec des tokens pour les frais de transaction

## Installation

1. **Cloner le dépôt**

```bash
git clone https://github.com/your-username/tokenforge-app.git
cd tokenforge-app
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configuration de l'environnement**

```bash
cp .env.example .env
```

Éditez le fichier `.env` avec vos paramètres :

```env
REACT_APP_NETWORK_ID=1
REACT_APP_RPC_URL=https://your-rpc-url
REACT_APP_IPFS_GATEWAY=https://your-ipfs-gateway
```

## Utilisation

### Création d'un Token

1. Connectez votre wallet en cliquant sur "Connect Wallet"
2. Naviguez vers "Create Token"
3. Remplissez les informations du token :
   - Nom
   - Symbole
   - Offre totale
   - Décimales
4. Configurez les options avancées si nécessaire
5. Cliquez sur "Create Token"
6. Confirmez la transaction dans votre wallet

### Utilisation du Marketplace

1. Naviguez vers "Marketplace"
2. Parcourez les tokens disponibles
3. Utilisez les filtres pour affiner votre recherche
4. Cliquez sur un token pour voir les détails
5. Utilisez "Buy" pour acheter un token

### Staking

1. Allez dans la section "Staking"
2. Choisissez un pool de staking
3. Entrez le montant à staker
4. Approuvez l'utilisation de vos tokens
5. Confirmez la transaction de staking

## Dépannage

### Problèmes Courants

1. **Transaction échouée**

   - Vérifiez que vous avez assez de tokens pour les frais
   - Assurez-vous d'être sur le bon réseau

2. **Wallet non connecté**

   - Rafraîchissez la page
   - Déconnectez et reconnectez votre wallet

3. **Token non visible**
   - Attendez quelques minutes pour la synchronisation
   - Vérifiez l'adresse du contrat

## Support

Pour obtenir de l'aide supplémentaire :

- Consultez notre FAQ
- Rejoignez notre Discord
- Ouvrez un ticket sur GitHub
