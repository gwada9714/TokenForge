import { ethers } from "hardhat";

async function main() {
  // Get signers
  const [owner, addr1, addr2] = await ethers.getSigners();
  
  // Récupérer le contrat déployé
  const tokenAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  const TokenForge = await ethers.getContractFactory("TokenForgeToken");
  const token = TokenForge.attach(tokenAddress);

  console.log("Test du TokenForgeToken déployé à l'adresse:", tokenAddress);
  console.log("----------------------------------------------------");

  // Test 1: Vérifier le nom, le symbole et les décimales
  console.log("1. Informations de base du token:");
  const name = await token.name();
  const symbol = await token.symbol();
  const decimals = await token.decimals();
  console.log(`   Nom: ${name}`);
  console.log(`   Symbole: ${symbol}`);
  console.log(`   Décimales: ${decimals}`);
  console.log();

  // Test 2: Vérifier le supply total et le solde du propriétaire
  console.log("2. Supply et solde:");
  const totalSupply = await token.totalSupply();
  const ownerBalance = await token.balanceOf(owner.address);
  console.log(`   Supply total: ${ethers.utils.formatEther(totalSupply)} ${symbol}`);
  console.log(`   Solde du propriétaire: ${ethers.utils.formatEther(ownerBalance)} ${symbol}`);
  console.log();

  // Test 3: Tester le transfert
  console.log("3. Test du transfert:");
  const transferAmount = ethers.utils.parseEther("1000");
  console.log(`   Transfert de ${ethers.utils.formatEther(transferAmount)} ${symbol} à ${addr1.address}`);
  await token.transfer(addr1.address, transferAmount);
  
  const addr1Balance = await token.balanceOf(addr1.address);
  console.log(`   Nouveau solde de addr1: ${ethers.utils.formatEther(addr1Balance)} ${symbol}`);
  console.log();

  // Test 4: Tester le mint (si activé)
  console.log("4. Test du mint:");
  const mintAmount = ethers.utils.parseEther("500");
  try {
    await token.mint(addr1.address, mintAmount);
    const newAddr1Balance = await token.balanceOf(addr1.address);
    console.log(`   Mint de ${ethers.utils.formatEther(mintAmount)} ${symbol} à addr1`);
    console.log(`   Nouveau solde après mint: ${ethers.utils.formatEther(newAddr1Balance)} ${symbol}`);
  } catch (error) {
    console.log(`   Mint échoué: ${error.message}`);
  }
  console.log();

  // Test 5: Tester le burn
  console.log("5. Test du burn:");
  const burnAmount = ethers.utils.parseEther("100");
  try {
    await token.connect(addr1).burn(burnAmount);
    const finalAddr1Balance = await token.balanceOf(addr1.address);
    console.log(`   Burn de ${ethers.utils.formatEther(burnAmount)} ${symbol} par addr1`);
    console.log(`   Solde final de addr1: ${ethers.utils.formatEther(finalAddr1Balance)} ${symbol}`);
  } catch (error) {
    console.log(`   Burn échoué: ${error.message}`);
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
