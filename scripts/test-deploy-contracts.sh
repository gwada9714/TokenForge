#!/bin/bash
# Script pour tester le déploiement des contrats un par un
# Usage: ./test-deploy-contracts.sh

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
if ! command -v npx &> /dev/null; then
    echo -e "${RED}npx n'est pas installé.${NC}"
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

# Compiler les smart contracts
step "Compilation des smart contracts..."
npx hardhat compile

# Fonction pour déployer un contrat
function deploy_contract() {
    CONTRACT_NAME=$1
    CONSTRUCTOR_ARGS=$2
    
    step "Déploiement du contrat ${CONTRACT_NAME}..."
    
    # Créer un script de déploiement temporaire
    TEMP_SCRIPT="scripts/temp-deploy-${CONTRACT_NAME}.js"
    
    cat > ${TEMP_SCRIPT} << EOF
const { ethers } = require("hardhat");

async function main() {
  console.log("Déploiement du contrat ${CONTRACT_NAME}...");
  
  const Contract = await ethers.getContractFactory("${CONTRACT_NAME}");
  const contract = await Contract.deploy(${CONSTRUCTOR_ARGS});
  
  await contract.deployed();
  
  console.log("${CONTRACT_NAME} déployé à l'adresse:", contract.address);
  return contract.address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Erreur lors du déploiement:", error);
    process.exit(1);
  });
EOF
    
    # Exécuter le script de déploiement
    echo -e "Exécution du script de déploiement pour ${CONTRACT_NAME}..."
    CONTRACT_ADDRESS=$(npx hardhat run ${TEMP_SCRIPT} --network sepolia)
    
    # Extraire l'adresse du contrat
    CONTRACT_ADDRESS=$(echo "$CONTRACT_ADDRESS" | grep -oE '0x[a-fA-F0-9]{40}')
    
    # Supprimer le script temporaire
    rm ${TEMP_SCRIPT}
    
    echo -e "${GREEN}${CONTRACT_NAME} déployé avec succès à l'adresse: ${CONTRACT_ADDRESS}${NC}"
    
    # Retourner l'adresse du contrat
    echo ${CONTRACT_ADDRESS}
}

# Déployer les contrats un par un
step "Déploiement des contrats un par un..."

# 1. Déployer TokenForgeTKN
step "1. Déploiement de TokenForgeTKN..."
TKN_ADDRESS=$(deploy_contract "TokenForgeTKN" "\"TokenForge Token\", \"TKN\", 18, \"1000000000000000000000000\"")
echo "TKN_TOKEN_ADDRESS=${TKN_ADDRESS}" >> deployment-results.env

# 2. Déployer TokenForgeTaxSystem
step "2. Déploiement de TokenForgeTaxSystem..."
TAX_SYSTEM_ADDRESS=$(deploy_contract "TokenForgeTaxSystem" "")
echo "TAX_SYSTEM_ADDRESS=${TAX_SYSTEM_ADDRESS}" >> deployment-results.env

# 3. Déployer TokenForgeFactory
step "3. Déploiement de TokenForgeFactory..."
FACTORY_ADDRESS=$(deploy_contract "TokenForgeFactory" "\"${TKN_ADDRESS}\", \"${TREASURY_ADDRESS}\", \"${TAX_SYSTEM_ADDRESS}\"")
echo "TOKEN_FACTORY_ADDRESS=${FACTORY_ADDRESS}" >> deployment-results.env

# 4. Déployer TokenForgePlans
step "4. Déploiement de TokenForgePlans..."
PLANS_ADDRESS=$(deploy_contract "TokenForgePlans" "\"${TKN_ADDRESS}\", \"${TREASURY_ADDRESS}\"")
echo "TOKEN_FORGE_PLANS_ADDRESS=${PLANS_ADDRESS}" >> deployment-results.env

# 5. Déployer TokenForgePaymentProcessor
step "5. Déploiement de TokenForgePaymentProcessor..."
PAYMENT_PROCESSOR_ADDRESS=$(deploy_contract "TokenForgePaymentProcessor" "\"${TKN_ADDRESS}\", \"${TREASURY_ADDRESS}\"")
echo "PAYMENT_PROCESSOR_ADDRESS=${PAYMENT_PROCESSOR_ADDRESS}" >> deployment-results.env

# 6. Déployer TokenForgeStaking
step "6. Déploiement de TokenForgeStaking..."
STAKING_ADDRESS=$(deploy_contract "TokenForgeStaking" "\"${TKN_ADDRESS}\", \"${TREASURY_ADDRESS}\"")
echo "STAKING_ADDRESS=${STAKING_ADDRESS}" >> deployment-results.env

# 7. Déployer TokenForgeLaunchpad
step "7. Déploiement de TokenForgeLaunchpad..."
LAUNCHPAD_ADDRESS=$(deploy_contract "TokenForgeLaunchpad" "\"${TKN_ADDRESS}\", \"${TREASURY_ADDRESS}\"")
echo "LAUNCHPAD_ADDRESS=${LAUNCHPAD_ADDRESS}" >> deployment-results.env

# 8. Déployer TokenForgeGovernance
step "8. Déploiement de TokenForgeGovernance..."
GOVERNANCE_ADDRESS=$(deploy_contract "TokenForgeGovernance" "\"${TKN_ADDRESS}\"")
echo "GOVERNANCE_ADDRESS=${GOVERNANCE_ADDRESS}" >> deployment-results.env

# 9. Déployer TokenForgeBridge
step "9. Déploiement de TokenForgeBridge..."
BRIDGE_ADDRESS=$(deploy_contract "TokenForgeBridge" "\"${TKN_ADDRESS}\", \"${TREASURY_ADDRESS}\"")
echo "BRIDGE_ADDRESS=${BRIDGE_ADDRESS}" >> deployment-results.env

# 10. Déployer TokenForgePremiumServices
step "10. Déploiement de TokenForgePremiumServices..."
PREMIUM_SERVICES_ADDRESS=$(deploy_contract "TokenForgePremiumServices" "\"${TKN_ADDRESS}\", \"${TREASURY_ADDRESS}\"")
echo "PREMIUM_SERVICES_ADDRESS=${PREMIUM_SERVICES_ADDRESS}" >> deployment-results.env

echo -e "${GREEN}Tous les contrats ont été déployés avec succès !${NC}"
echo -e "Les adresses des contrats ont été sauvegardées dans le fichier deployment-results.env"

# Afficher les résultats
step "Résumé des déploiements:"
cat deployment-results.env
