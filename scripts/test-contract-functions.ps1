# Script PowerShell pour tester les fonctionnalités de chaque contrat
# Usage: .\test-contract-functions.ps1

# Fonction pour afficher les étapes
function Step {
    param (
        [string]$message
    )
    Write-Host "==> $message" -ForegroundColor Yellow
}

# Vérifier si le fichier deployment-results.env existe
if (-not (Test-Path "deployment-results.env")) {
    Write-Host "Fichier deployment-results.env non trouvé. Veuillez d'abord déployer les contrats avec .\test-deploy-contracts.ps1" -ForegroundColor Red
    exit 1
}

# Charger les adresses des contrats déployés
Step "Chargement des adresses des contrats déployés..."
$envContent = Get-Content "deployment-results.env" -Raw
$envLines = $envContent -split "`n"
foreach ($line in $envLines) {
    if ($line -match '^\s*([^#][^=]+)=(.*)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        Set-Item -Path "env:$name" -Value $value
    }
}

# Fonction pour créer et exécuter un script de test
function Test-Contract {
    param (
        [string]$contractName,
        [string]$contractAddress,
        [string]$testCode
    )
    
    Step "Test des fonctionnalités du contrat $contractName..."
    
    # Créer un script de test temporaire
    $tempScript = "scripts/temp-test-$contractName.js"
    
    @"
const { ethers } = require("hardhat");

async function main() {
  console.log("Test des fonctionnalités du contrat $contractName à l'adresse $contractAddress...");
  
  const [owner, addr1, addr2] = await ethers.getSigners();
  
  // Récupérer l'instance du contrat
  const Contract = await ethers.getContractFactory("$contractName");
  const contract = Contract.attach("$contractAddress");
  
  // Exécuter les tests
  $testCode
  
  console.log("Tests terminés avec succès pour $contractName");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Erreur lors des tests:", error);
    process.exit(1);
  });
"@ | Out-File -FilePath $tempScript -Encoding utf8
    
    # Exécuter le script de test
    Write-Host "Exécution des tests pour $contractName..."
    npx hardhat run $tempScript --network sepolia
    
    # Supprimer le script temporaire
    Remove-Item $tempScript
    
    Write-Host "Tests terminés pour $contractName" -ForegroundColor Green
}

# 1. Tester TokenForgeTKN
Step "1. Test de TokenForgeTKN..."
Test-Contract -contractName "TokenForgeTKN" -contractAddress $env:TKN_TOKEN_ADDRESS -testCode @"
  console.log("Test des fonctionnalités de base du token...");
  
  // Récupérer les informations du token
  const name = await contract.name();
  const symbol = await contract.symbol();
  const decimals = await contract.decimals();
  const totalSupply = await contract.totalSupply();
  
  console.log(`Nom: ${name}`);
  console.log(`Symbole: ${symbol}`);
  console.log(`Décimales: ${decimals}`);
  console.log(`Offre totale: ${totalSupply.toString()}`);
  
  // Vérifier le solde du propriétaire
  const ownerBalance = await contract.balanceOf(owner.address);
  console.log(`Solde du propriétaire: ${ownerBalance.toString()}`);
  
  // Tester un transfert
  const transferAmount = ethers.utils.parseUnits("1000", decimals);
  console.log(`Transfert de ${ethers.utils.formatUnits(transferAmount, decimals)} tokens à ${addr1.address}...`);
  
  const tx = await contract.transfer(addr1.address, transferAmount);
  await tx.wait();
  
  const addr1Balance = await contract.balanceOf(addr1.address);
  console.log(`Solde de addr1 après transfert: ${ethers.utils.formatUnits(addr1Balance, decimals)}`);
  
  // Tester une approbation et un transferFrom
  console.log(`Approbation de ${addr2.address} pour dépenser les tokens de ${addr1.address}...`);
  
  const approvalTx = await contract.connect(addr1).approve(addr2.address, transferAmount);
  await approvalTx.wait();
  
  const allowance = await contract.allowance(addr1.address, addr2.address);
  console.log(`Allocation: ${ethers.utils.formatUnits(allowance, decimals)}`);
  
  console.log(`TransferFrom de ${addr1.address} à ${owner.address}...`);
  
  const transferFromTx = await contract.connect(addr2).transferFrom(addr1.address, owner.address, transferAmount.div(2));
  await transferFromTx.wait();
  
  const addr1BalanceAfter = await contract.balanceOf(addr1.address);
  const ownerBalanceAfter = await contract.balanceOf(owner.address);
  
  console.log(`Solde de addr1 après transferFrom: ${ethers.utils.formatUnits(addr1BalanceAfter, decimals)}`);
  console.log(`Solde du propriétaire après transferFrom: ${ethers.utils.formatUnits(ownerBalanceAfter, decimals)}`);
"@

# 2. Tester TokenForgeTaxSystem
Step "2. Test de TokenForgeTaxSystem..."
Test-Contract -contractName "TokenForgeTaxSystem" -contractAddress $env:TAX_SYSTEM_ADDRESS -testCode @"
  console.log("Test des fonctionnalités du système de taxes...");
  
  // Vérifier le propriétaire du contrat
  const contractOwner = await contract.owner();
  console.log(`Propriétaire du contrat: ${contractOwner}`);
  
  // Tester la configuration des taxes
  console.log("Configuration des taxes...");
  
  // Définir un taux de taxe pour les transferts
  const setTaxTx = await contract.setTransferTaxRate(500); // 5%
  await setTaxTx.wait();
  
  // Vérifier le taux de taxe
  const transferTaxRate = await contract.transferTaxRate();
  console.log(`Taux de taxe pour les transferts: ${transferTaxRate.toString() / 100}%`);
  
  // Ajouter un destinataire de taxe
  console.log(`Ajout de ${addr1.address} comme destinataire de taxe...`);
  
  const addRecipientTx = await contract.addTaxRecipient(addr1.address, 5000); // 50% des taxes
  await addRecipientTx.wait();
  
  // Vérifier le destinataire de taxe
  const recipient = await contract.taxRecipients(0);
  console.log(`Destinataire de taxe: ${recipient}`);
  
  const recipientShare = await contract.taxShares(recipient);
  console.log(`Part du destinataire: ${recipientShare.toString() / 100}%`);
"@

# 3. Tester TokenForgeFactory
Step "3. Test de TokenForgeFactory..."
Test-Contract -contractName "TokenForgeFactory" -contractAddress $env:TOKEN_FACTORY_ADDRESS -testCode @"
  console.log("Test des fonctionnalités de la factory de tokens...");
  
  // Vérifier le propriétaire du contrat
  const contractOwner = await contract.owner();
  console.log(`Propriétaire du contrat: ${contractOwner}`);
  
  // Vérifier si le contrat est en pause
  const isPaused = await contract.paused();
  console.log(`Contrat en pause: ${isPaused}`);
  
  // Tester la création d'un token
  console.log("Création d'un nouveau token...");
  
  // Définir les paramètres du token
  const tokenName = "Test Token";
  const tokenSymbol = "TEST";
  const tokenDecimals = 18;
  const tokenInitialSupply = ethers.utils.parseUnits("1000000", 18);
  const tokenOwner = owner.address;
  
  // Créer le token
  const createTokenTx = await contract.createToken(
    tokenName,
    tokenSymbol,
    tokenDecimals,
    tokenInitialSupply,
    tokenOwner
  );
  
  const receipt = await createTokenTx.wait();
  
  // Récupérer l'adresse du token créé à partir des événements
  const tokenCreatedEvent = receipt.events.find(event => event.event === 'TokenCreated');
  const tokenAddress = tokenCreatedEvent.args.tokenAddress;
  
  console.log(`Nouveau token créé à l'adresse: ${tokenAddress}`);
  
  // Vérifier les règles d'alerte
  console.log("Récupération des règles d'alerte...");
  
  const alertRules = await contract.getAlertRules();
  console.log(`Nombre de règles d'alerte: ${alertRules.length}`);
  
  // Ajouter une règle d'alerte
  console.log("Ajout d'une règle d'alerte...");
  
  const addRuleTx = await contract.addAlertRule("High Gas", "gas > 100 gwei");
  await addRuleTx.wait();
  
  const alertRulesAfter = await contract.getAlertRules();
  console.log(`Nombre de règles d'alerte après ajout: ${alertRulesAfter.length}`);
  
  // Récupérer les logs d'audit
  console.log("Récupération des logs d'audit...");
  
  const auditLogs = await contract.getAuditLogs();
  console.log(`Nombre de logs d'audit: ${auditLogs.length}`);
"@

# 4. Tester TokenForgePlans
Step "4. Test de TokenForgePlans..."
Test-Contract -contractName "TokenForgePlans" -contractAddress $env:TOKEN_FORGE_PLANS_ADDRESS -testCode @"
  console.log("Test des fonctionnalités des plans d'abonnement...");
  
  // Vérifier le propriétaire du contrat
  const contractOwner = await contract.owner();
  console.log(`Propriétaire du contrat: ${contractOwner}`);
  
  // Créer un nouveau plan
  console.log("Création d'un nouveau plan...");
  
  const planName = "Premium";
  const planPrice = ethers.utils.parseEther("0.1");
  const planDuration = 30 * 24 * 60 * 60; // 30 jours en secondes
  const planFeatures = ["Custom Token", "No Fees", "Priority Support"];
  
  const createPlanTx = await contract.createPlan(planName, planPrice, planDuration, planFeatures);
  await createPlanTx.wait();
  
  // Récupérer les informations du plan
  const planId = 0; // Premier plan
  const plan = await contract.getPlan(planId);
  
  console.log(`Plan ID: ${planId}`);
  console.log(`Nom du plan: ${plan.name}`);
  console.log(`Prix du plan: ${ethers.utils.formatEther(plan.price)} ETH`);
  console.log(`Durée du plan: ${plan.duration / (24 * 60 * 60)} jours`);
  
  // Souscrire à un plan
  console.log(`Souscription au plan pour ${addr1.address}...`);
  
  const subscribeTx = await contract.subscribe(planId, addr1.address, { value: plan.price });
  await subscribeTx.wait();
  
  // Vérifier l'abonnement
  const subscription = await contract.getSubscription(addr1.address);
  
  console.log(`Plan ID de l'abonnement: ${subscription.planId}`);
  console.log(`Date d'expiration: ${new Date(subscription.expiryDate * 1000).toLocaleString()}`);
  console.log(`Actif: ${subscription.active}`);
"@

# 5. Tester TokenForgePaymentProcessor
Step "5. Test de TokenForgePaymentProcessor..."
Test-Contract -contractName "TokenForgePaymentProcessor" -contractAddress $env:PAYMENT_PROCESSOR_ADDRESS -testCode @"
  console.log("Test des fonctionnalités du processeur de paiement...");
  
  // Vérifier le propriétaire du contrat
  const contractOwner = await contract.owner();
  console.log(`Propriétaire du contrat: ${contractOwner}`);
  
  // Créer un nouveau produit
  console.log("Création d'un nouveau produit...");
  
  const productId = "token-creation";
  const productPrice = ethers.utils.parseEther("0.05");
  const productName = "Token Creation Service";
  
  const createProductTx = await contract.createProduct(productId, productPrice, productName);
  await createProductTx.wait();
  
  // Récupérer les informations du produit
  const product = await contract.getProduct(productId);
  
  console.log(`ID du produit: ${productId}`);
  console.log(`Nom du produit: ${product.name}`);
  console.log(`Prix du produit: ${ethers.utils.formatEther(product.price)} ETH`);
  
  // Effectuer un paiement
  console.log(`Paiement pour le produit ${productId} par ${addr1.address}...`);
  
  const paymentTx = await contract.connect(addr1).processPayment(productId, { value: product.price });
  const receipt = await paymentTx.wait();
  
  // Récupérer l'ID du paiement à partir des événements
  const paymentEvent = receipt.events.find(event => event.event === 'PaymentProcessed');
  const paymentId = paymentEvent.args.paymentId;
  
  console.log(`Paiement effectué avec l'ID: ${paymentId}`);
  
  // Vérifier le paiement
  const payment = await contract.getPayment(paymentId);
  
  console.log(`Produit: ${payment.productId}`);
  console.log(`Client: ${payment.customer}`);
  console.log(`Montant: ${ethers.utils.formatEther(payment.amount)} ETH`);
  console.log(`Statut: ${payment.status}`);
"@

Write-Host "Tous les tests de contrats ont été exécutés avec succès !" -ForegroundColor Green
