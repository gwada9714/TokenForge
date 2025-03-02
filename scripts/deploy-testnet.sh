#!/bin/bash
# Script de déploiement pour le testnet Sepolia
# Usage: ./deploy-testnet.sh

set -e

# Définir les couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour afficher les étapes
function step() {
    echo -e "${YELLOW}==>${NC} $1"
}

# Vérifier les prérequis
step "Vérification des prérequis..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js n'est pas installé.${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm n'est pas installé.${NC}"
    exit 1
fi

# Vérifier si le fichier .env.testnet existe
if [ ! -f ".env.testnet" ]; then
    echo -e "${RED}Fichier .env.testnet non trouvé. Veuillez créer ce fichier à partir de .env.example.${NC}"
    exit 1
fi

# Charger les variables d'environnement
step "Chargement des variables d'environnement pour le testnet..."
source .env.testnet

# Installer les dépendances
step "Installation des dépendances..."
npm ci

# Compiler les smart contracts
step "Compilation des smart contracts..."
npm run compile

# Exécuter les tests
step "Exécution des tests..."
npm test

# Déployer les smart contracts sur le testnet
step "Déploiement des smart contracts sur Sepolia..."
source .env.testnet && npx ts-node scripts/deploy.ts

# Vérifier si le déploiement a réussi
if [ -f "deployment-info.json" ]; then
    echo -e "${GREEN}Déploiement des smart contracts réussi!${NC}"
    echo -e "Informations de déploiement:"
    cat deployment-info.json
else
    echo -e "${RED}Déploiement des smart contracts échoué.${NC}"
    exit 1
fi

# Construire l'application frontend
step "Construction de l'application frontend..."
VITE_ENV=testnet npm run build

# Déployer sur S3 si configuré
if [ -n "$S3_BUCKET" ]; then
    step "Déploiement sur S3..."
    aws s3 sync dist/ s3://$S3_BUCKET --delete
    
    # Invalider le cache CloudFront si configuré
    if [ -n "$CLOUDFRONT_ID" ]; then
        step "Invalidation du cache CloudFront..."
        aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"
    fi
else
    echo -e "${YELLOW}Aucun bucket S3 configuré. Déploiement local uniquement.${NC}"
fi

# Mettre à jour la base de données si nécessaire
if [ "$UPDATE_DATABASE" = "true" ]; then
    step "Mise à jour de la base de données..."
    # Commande pour mettre à jour la base de données
    # Par exemple: npm run db:migrate
    echo -e "${YELLOW}Mise à jour de la base de données non implémentée.${NC}"
fi

# Vérifier les contrats sur Etherscan
if [ -n "$ETHERSCAN_API_KEY" ] && [ -f "deployment-info.json" ]; then
    step "Vérification des contrats sur Etherscan..."
    
    # Extraire l'adresse du contrat du fichier deployment-info.json
    CONTRACT_ADDRESS=$(cat deployment-info.json | grep -o '"tokenForgeFactory": *"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$CONTRACT_ADDRESS" ]; then
        echo -e "Vérification du contrat à l'adresse: $CONTRACT_ADDRESS"
        npx hardhat verify --network sepolia $CONTRACT_ADDRESS $TKN_TOKEN_ADDRESS $TREASURY_ADDRESS $TAX_SYSTEM_ADDRESS
    else
        echo -e "${YELLOW}Adresse du contrat non trouvée dans deployment-info.json${NC}"
    fi
fi

echo -e "${GREEN}Déploiement sur le testnet Sepolia terminé avec succès!${NC}"
echo -e "Vous pouvez maintenant accéder à l'application à l'adresse: https://sepolia.etherscan.io/address/$CONTRACT_ADDRESS"
