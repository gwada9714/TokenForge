import { HardhatRuntimeEnvironment } from "hardhat/types";
import "@nomicfoundation/hardhat-ethers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { TokenForgeToken__factory } from "../typechain-types";
import { task } from "hardhat/config";
import * as hre from "hardhat";

task("test-token", "Test TokenForge token functionality")
  .addParam("tokenAddress", "The address of the deployed token")
  .setAction(async (taskArgs, hre) => {
    const [owner, addr1, addr2] = await hre.ethers.getSigners();

    // Get the TokenForgeToken contract
    const TokenForgeToken = TokenForgeToken__factory.connect(
      taskArgs.tokenAddress,
      owner
    );

    // Test basic token functionality
    console.log("Testing token functionality...");

    try {
      // Get token info
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        TokenForgeToken.name(),
        TokenForgeToken.symbol(),
        TokenForgeToken.decimals(),
        TokenForgeToken.totalSupply(),
      ]);

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

      const transferTx = await TokenForgeToken.transfer(
        await addr1.getAddress(),
        amount
      );
      await transferTx.wait();
      console.log(
        `Transferred ${amount} tokens to ${await addr1.getAddress()}`
      );

      const addr1Balance = await TokenForgeToken.balanceOf(
        await addr1.getAddress()
      );
      console.log(`Address 1 balance: ${addr1Balance}`);

      // Test allowances
      console.log("\nTesting allowances...");
      const approveTx = await TokenForgeToken.connect(addr1).approve(
        await addr2.getAddress(),
        amount
      );
      await approveTx.wait();
      console.log(`Address 1 approved Address 2 to spend ${amount} tokens`);

      const allowance = await TokenForgeToken.allowance(
        await addr1.getAddress(),
        await addr2.getAddress()
      );
      console.log(`Allowance: ${allowance}`);

      // Test transferFrom
      const transferFromTx = await TokenForgeToken.connect(addr2).transferFrom(
        await addr1.getAddress(),
        await addr2.getAddress(),
        amount / BigInt(2)
      );
      await transferFromTx.wait();
      console.log(
        `Address 2 transferred ${amount / BigInt(2)} tokens from Address 1`
      );

      const addr2Balance = await TokenForgeToken.balanceOf(
        await addr2.getAddress()
      );
      console.log(`Address 2 balance: ${addr2Balance}`);

      console.log("\nAll tests completed successfully!");
    } catch (error) {
      console.error("Error during token testing:", error);
      throw error;
    }
  });

// Script principal
async function main() {
  const tokenAddress = process.env.TOKEN_ADDRESS;
  if (!tokenAddress) {
    throw new Error("Please set TOKEN_ADDRESS environment variable");
  }

  await hre.run("test-token", { tokenAddress });
}

// Exécution du script
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
