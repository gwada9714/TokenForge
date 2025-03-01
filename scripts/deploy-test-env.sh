#!/bin/bash
# Script de déploiement pour l'environnement de test
# Usage: ./deploy-test-env.sh [dev|staging|prod]

set -e

# Définir les couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier les arguments
if [ "$#" -ne 1 ]; then
    echo -e "${RED}Usage: $0 [dev|staging|prod]${NC}"
    exit 1
fi

ENV=$1

# Vérifier l'environnement
if [ "$ENV" != "dev" ] && [ "$ENV" != "staging" ] && [ "$ENV" != "prod" ]; then
    echo -e "${RED}Environnement invalide. Utilisez dev, staging ou prod.${NC}"
    exit 1
fi

# Charger les variables d'environnement
if [ -f ".env.$ENV" ]; then
    echo -e "${GREEN}Chargement des variables d'environnement pour $ENV...${NC}"
    source .env.$ENV
else
    echo -e "${RED}Fichier .env.$ENV non trouvé.${NC}"
    exit 1
fi

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

if ! command -v aws &> /dev/null; then
    echo -e "${RED}AWS CLI n'est pas installé.${NC}"
    exit 1
fi

# Installer les dépendances
step "Installation des dépendances..."
npm ci

# Exécuter les tests
if [ "$ENV" != "dev" ]; then
    step "Exécution des tests..."
    npm test
fi

# Construire l'application
step "Construction de l'application pour l'environnement $ENV..."
npm run build:$ENV

# Déployer sur S3
if [ "$ENV" != "dev" ]; then
    step "Déploiement sur S3..."
    aws s3 sync dist/ s3://$S3_BUCKET --delete
    
    # Invalider le cache CloudFront
    if [ -n "$CLOUDFRONT_ID" ]; then
        step "Invalidation du cache CloudFront..."
        aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"
    fi
else
    step "Démarrage du serveur de développement..."
    npm run dev
fi

# Déployer les smart contracts si nécessaire
if [ "$DEPLOY_CONTRACTS" = "true" ]; then
    step "Déploiement des smart contracts sur $BLOCKCHAIN_NETWORK..."
    npx hardhat run scripts/deploy.js --network $BLOCKCHAIN_NETWORK
fi

# Mise à jour de la base de données
if [ "$UPDATE_DATABASE" = "true" ]; then
    step "Mise à jour de la base de données..."
    npm run db:migrate
fi

echo -e "${GREEN}Déploiement terminé avec succès pour l'environnement $ENV!${NC}"
