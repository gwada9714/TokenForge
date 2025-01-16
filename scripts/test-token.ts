import * as ethers from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { TokenForgeToken__factory } from "../typechain-types";

async function main() {
  const signers = await ethers.getSigners();
  const [owner, addr1, addr2] = signers;

  // Get the TokenForgeToken contract
  const TokenForgeToken = TokenForgeToken__factory.connect("0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9", owner);

  // Test basic token functionality
  console.log("Testing token functionality...");
  
  // Get token info
  const name = await TokenForgeToken.name();
  const symbol = await TokenForgeToken.symbol();
  const decimals = await TokenForgeToken.decimals();
  const totalSupply = await TokenForgeToken.totalSupply();
  
  console.log(`
    Token Info:
    - Name: ${name}
    - Symbol: ${symbol}
    - Decimals: ${decimals}
    - Total Supply: ${totalSupply}
  `);

  // Test transfers
  console.log("\nTesting transfers...");
  const amount = BigInt(100) * BigInt(10 ** Number(decimals));
  
  await TokenForgeToken.transfer(addr1.address, amount);
  console.log(`Transferred ${amount} tokens to ${addr1.address}`);
  
  const addr1Balance = await TokenForgeToken.balanceOf(addr1.address);
  console.log(`Address 1 balance: ${addr1Balance}`);

  // Test allowances
  console.log("\nTesting allowances...");
  await TokenForgeToken.connect(addr1).approve(addr2.address, amount);
  console.log(`Address 1 approved Address 2 to spend ${amount} tokens`);
  
  const allowance = await TokenForgeToken.allowance(addr1.address, addr2.address);
  console.log(`Allowance: ${allowance}`);

  // Test transferFrom
  await TokenForgeToken.connect(addr2).transferFrom(addr1.address, addr2.address, amount / BigInt(2));
  console.log(`Address 2 transferred ${amount / BigInt(2)} tokens from Address 1`);
  
  const addr2Balance = await TokenForgeToken.balanceOf(addr2.address);
  console.log(`Address 2 balance: ${addr2Balance}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
