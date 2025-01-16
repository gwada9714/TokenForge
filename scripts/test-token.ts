import { ethers } from "hardhat/ethers";

async function main() {
  const [owner, addr1, addr2] = await ethers.getSigners();

  // Get the TokenForgeToken contract
  const TokenForgeToken = await ethers.getContractFactory("TokenForgeToken");
  const token = await TokenForgeToken.attach("0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9");

  // Test basic token functionality
  console.log("Testing token functionality...");
  
  // Get token info
  const name = await token.name();
  const symbol = await token.symbol();
  const decimals = await token.decimals();
  const totalSupply = await token.totalSupply();
  
  console.log(`
    Token Info:
    - Name: ${name}
    - Symbol: ${symbol}
    - Decimals: ${decimals}
    - Total Supply: ${totalSupply}
  `);

  // Test transfers
  console.log("\nTesting transfers...");
  const amount = ethers.parseUnits("100", decimals);
  
  await token.transfer(addr1.address, amount);
  console.log(`Transferred ${amount} tokens to ${addr1.address}`);
  
  const addr1Balance = await token.balanceOf(addr1.address);
  console.log(`Address 1 balance: ${addr1Balance}`);

  // Test allowances
  console.log("\nTesting allowances...");
  await token.connect(addr1).approve(addr2.address, amount);
  console.log(`Address 1 approved Address 2 to spend ${amount} tokens`);
  
  const allowance = await token.allowance(addr1.address, addr2.address);
  console.log(`Allowance: ${allowance}`);

  // Test transferFrom
  await token.connect(addr2).transferFrom(addr1.address, addr2.address, amount.div(2));
  console.log(`Address 2 transferred ${amount.div(2)} tokens from Address 1`);
  
  const addr2Balance = await token.balanceOf(addr2.address);
  console.log(`Address 2 balance: ${addr2Balance}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
