# Script PowerShell pour tester le déploiement des contrats un par un
# Usage: .\test-deploy-contracts.ps1

# Fonction pour afficher les étapes
function Step {
    param (
        [string]$message
    )
    Write-Host "==> $message" -ForegroundColor Yellow
}

# Vérifier les prérequis
Step "Vérification des prérequis..."
if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
    Write-Host "npx n'est pas installé." -ForegroundColor Red
    exit 1
}

# Vérifier si le fichier .env.testnet existe
if (-not (Test-Path ".env.testnet")) {
    Write-Host "Fichier .env.testnet non trouvé. Veuillez créer ce fichier à partir de .env.example." -ForegroundColor Red
    exit 1
}

# Charger les variables d'environnement
Step "Chargement des variables d'environnement pour le testnet..."
$envContent = Get-Content ".env.testnet" -Raw
$envLines = $envContent -split "`n"
foreach ($line in $envLines) {
    if ($line -match '^\s*([^#][^=]+)=(.*)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        Set-Item -Path "env:$name" -Value $value
    }
}

# Compiler les smart contracts
Step "Compilation des smart contracts..."
npx hardhat compile

# Fonction pour déployer un contrat
function Deploy-Contract {
    param (
        [string]$contractName,
        [string]$constructorArgs
    )
    
    Step "Déploiement du contrat $contractName..."
    
    # Créer un script de déploiement temporaire
    $tempScript = "scripts/temp-deploy-$contractName.js"
    
    @"
const { ethers } = require("hardhat");

async function main() {
  console.log("Déploiement du contrat $contractName...");
  
  const Contract = await ethers.getContractFactory("$contractName");
  const contract = await Contract.deploy($constructorArgs);
  
  await contract.deployed();
  
  console.log("$contractName déployé à l'adresse:", contract.address);
  return contract.address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Erreur lors du déploiement:", error);
    process.exit(1);
  });
"@ | Out-File -FilePath $tempScript -Encoding utf8
    
    # Exécuter le script de déploiement
    Write-Host "Exécution du script de déploiement pour $contractName..."
    $output = npx hardhat run $tempScript --network sepolia
    
    # Extraire l'adresse du contrat
    $contractAddress = $output | Select-String -Pattern '0x[a-fA-F0-9]{40}' | ForEach-Object { $_.Matches[0].Value }
    
    # Supprimer le script temporaire
    Remove-Item $tempScript
    
    Write-Host "$contractName déployé avec succès à l'adresse: $contractAddress" -ForegroundColor Green
    
    # Retourner l'adresse du contrat
    return $contractAddress
}

# Déployer les contrats un par un
Step "Déploiement des contrats un par un..."

# 1. Déployer TokenForgeTKN
Step "1. Déploiement de TokenForgeTKN..."
$tknAddress = Deploy-Contract -contractName "TokenForgeTKN" -constructorArgs "`"TokenForge Token`", `"TKN`", 18, `"1000000000000000000000000`""
"TKN_TOKEN_ADDRESS=$tknAddress" | Out-File -FilePath "deployment-results.env" -Append

# 2. Déployer TokenForgeTaxSystem
Step "2. Déploiement de TokenForgeTaxSystem..."
$taxSystemAddress = Deploy-Contract -contractName "TokenForgeTaxSystem" -constructorArgs ""
"TAX_SYSTEM_ADDRESS=$taxSystemAddress" | Out-File -FilePath "deployment-results.env" -Append

# 3. Déployer TokenForgeFactory
Step "3. Déploiement de TokenForgeFactory..."
$factoryAddress = Deploy-Contract -contractName "TokenForgeFactory" -constructorArgs "`"$tknAddress`", `"$env:TREASURY_ADDRESS`", `"$taxSystemAddress`""
"TOKEN_FACTORY_ADDRESS=$factoryAddress" | Out-File -FilePath "deployment-results.env" -Append

# 4. Déployer TokenForgePlans
Step "4. Déploiement de TokenForgePlans..."
$plansAddress = Deploy-Contract -contractName "TokenForgePlans" -constructorArgs "`"$tknAddress`", `"$env:TREASURY_ADDRESS`""
"TOKEN_FORGE_PLANS_ADDRESS=$plansAddress" | Out-File -FilePath "deployment-results.env" -Append

# 5. Déployer TokenForgePaymentProcessor
Step "5. Déploiement de TokenForgePaymentProcessor..."
$paymentProcessorAddress = Deploy-Contract -contractName "TokenForgePaymentProcessor" -constructorArgs "`"$tknAddress`", `"$env:TREASURY_ADDRESS`""
"PAYMENT_PROCESSOR_ADDRESS=$paymentProcessorAddress" | Out-File -FilePath "deployment-results.env" -Append

# 6. Déployer TokenForgeStaking
Step "6. Déploiement de TokenForgeStaking..."
$stakingAddress = Deploy-Contract -contractName "TokenForgeStaking" -constructorArgs "`"$tknAddress`", `"$env:TREASURY_ADDRESS`""
"STAKING_ADDRESS=$stakingAddress" | Out-File -FilePath "deployment-results.env" -Append

# 7. Déployer TokenForgeLaunchpad
Step "7. Déploiement de TokenForgeLaunchpad..."
$launchpadAddress = Deploy-Contract -contractName "TokenForgeLaunchpad" -constructorArgs "`"$tknAddress`", `"$env:TREASURY_ADDRESS`""
"LAUNCHPAD_ADDRESS=$launchpadAddress" | Out-File -FilePath "deployment-results.env" -Append

# 8. Déployer TokenForgeGovernance
Step "8. Déploiement de TokenForgeGovernance..."
$governanceAddress = Deploy-Contract -contractName "TokenForgeGovernance" -constructorArgs "`"$tknAddress`""
"GOVERNANCE_ADDRESS=$governanceAddress" | Out-File -FilePath "deployment-results.env" -Append

# 9. Déployer TokenForgeBridge
Step "9. Déploiement de TokenForgeBridge..."
$bridgeAddress = Deploy-Contract -contractName "TokenForgeBridge" -constructorArgs "`"$tknAddress`", `"$env:TREASURY_ADDRESS`""
"BRIDGE_ADDRESS=$bridgeAddress" | Out-File -FilePath "deployment-results.env" -Append

# 10. Déployer TokenForgePremiumServices
Step "10. Déploiement de TokenForgePremiumServices..."
$premiumServicesAddress = Deploy-Contract -contractName "TokenForgePremiumServices" -constructorArgs "`"$tknAddress`", `"$env:TREASURY_ADDRESS`""
"PREMIUM_SERVICES_ADDRESS=$premiumServicesAddress" | Out-File -FilePath "deployment-results.env" -Append

Write-Host "Tous les contrats ont été déployés avec succès !" -ForegroundColor Green
Write-Host "Les adresses des contrats ont été sauvegardées dans le fichier deployment-results.env"

# Afficher les résultats
Step "Résumé des déploiements:"
Get-Content "deployment-results.env"
