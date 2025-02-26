import { expect } from "chai";
import { ethers } from "hardhat";
import { setupTestEnvironment } from "./setup";
import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import type { EventLog } from "ethers";
import type {
  TokenForgeFactory,
  TokenForgeTaxSystem
} from "../../../typechain-types";
import { TEST_TOKEN_PARAMS } from "./constants";

describe("TokenForge", () => {
  let factory: TokenForgeFactory;
  let taxSystem: TokenForgeTaxSystem;
  let owner: SignerWithAddress;
  let treasury: SignerWithAddress;
  let development: SignerWithAddress;
  let buyback: SignerWithAddress;
  let staking: SignerWithAddress;
  let user: SignerWithAddress;

  beforeEach(async () => {
    console.log("\n=== Setting up test environment ===");
    const env = await setupTestEnvironment();
    factory = env.factory;
    taxSystem = env.taxSystem;
    owner = env.owner;
    treasury = env.treasury;
    development = env.development;
    buyback = env.buyback;
    staking = env.staking;
    user = env.user;

    // Log initial state
    console.log("\n=== Initial Contract State ===");
    const factoryAddress = await factory.getAddress();
    const taxSystemAddress = await taxSystem.getAddress();

    console.log("\nContract Addresses:");
    console.log("- Factory:", factoryAddress);
    console.log("- TaxSystem:", taxSystemAddress);

    console.log("\nAccount Addresses:");
    console.log("- Owner:", owner.address);
    console.log("- Treasury:", treasury.address);
    console.log("- User:", user.address);
  });

  describe("Création de Token", () => {
    it("devrait créer un nouveau token avec les bons paramètres", async () => {
      console.log("\n=== Starting Token Creation Test ===");

      // Log test parameters
      console.log("\nToken Parameters:");
      console.log("- Name:", TEST_TOKEN_PARAMS.name);
      console.log("- Symbol:", TEST_TOKEN_PARAMS.symbol);
      console.log("- Total Supply:", ethers.formatEther(TEST_TOKEN_PARAMS.totalSupply), "tokens");
      console.log("- Max Tx Amount:", ethers.formatEther(TEST_TOKEN_PARAMS.maxTxAmount), "tokens");
      console.log("- Max Wallet Size:", ethers.formatEther(TEST_TOKEN_PARAMS.maxWalletSize), "tokens");
      console.log("- Additional Tax Rate:", TEST_TOKEN_PARAMS.additionalTaxRate/100, "%");

      console.log("\nCreating Token...");
      try {
        const tx = await factory.connect(user).createToken(
          TEST_TOKEN_PARAMS.name,
          TEST_TOKEN_PARAMS.symbol,
          TEST_TOKEN_PARAMS.totalSupply,
          TEST_TOKEN_PARAMS.maxTxAmount,
          TEST_TOKEN_PARAMS.maxWalletSize,
          TEST_TOKEN_PARAMS.additionalTaxRate
        );
        console.log("- Create token tx hash:", tx.hash);

        console.log("Waiting for confirmation...");
        const receipt = await tx.wait();
        if (!receipt) throw new Error("Transaction receipt not found");
        console.log("- Confirmed in block:", receipt.blockNumber);

        // Check for TokenCreated event
        const event = receipt.logs.find(log => 
          log instanceof ethers.EventLog && 
          log.eventName === "TokenCreated" &&
          log.args?.length > 0
        );
        
        if (!event || !(event instanceof ethers.EventLog)) {
          console.warn("\n⚠️ Warning: TokenCreated event not found or invalid");
          console.log("Available events:", receipt.logs.map(log => {
            if (log instanceof ethers.EventLog) {
              return `${log.eventName} (${log.args.length} args)`;
            }
            return "Unknown event";
          }));
          throw new Error("TokenCreated event not found or invalid");
        }

        console.log("\nToken Created Successfully!");
        const tokenAddress = event.args[0] as string;
        console.log("- New token address:", tokenAddress);

        const token = await ethers.getContractAt("TokenForgeToken", tokenAddress);

        // Verify token parameters
        console.log("\nVerifying Token Parameters:");
        const actualName = await token.name();
        const actualSymbol = await token.symbol();
        const actualDecimals = await token.decimals();
        const actualTotalSupply = await token.totalSupply();
        const actualMaxTxAmount = await token.maxTxAmount();
        const actualMaxWalletSize = await token.maxWalletSize();
        const actualOwner = await token.owner();

        console.log("- Name:", actualName);
        console.log("- Symbol:", actualSymbol);
        console.log("- Decimals:", actualDecimals);
        console.log("- Total Supply:", ethers.formatEther(actualTotalSupply), "tokens");
        console.log("- Max Tx Amount:", ethers.formatEther(actualMaxTxAmount), "tokens");
        console.log("- Max Wallet Size:", ethers.formatEther(actualMaxWalletSize), "tokens");
        console.log("- Owner:", actualOwner);

        // Assertions
        expect(actualName).to.equal(TEST_TOKEN_PARAMS.name);
        expect(actualSymbol).to.equal(TEST_TOKEN_PARAMS.symbol);
        expect(actualDecimals).to.equal(TEST_TOKEN_PARAMS.decimals);
        expect(actualTotalSupply).to.equal(TEST_TOKEN_PARAMS.totalSupply);
        expect(actualMaxTxAmount).to.equal(TEST_TOKEN_PARAMS.maxTxAmount);
        expect(actualMaxWalletSize).to.equal(TEST_TOKEN_PARAMS.maxWalletSize);
        expect(actualOwner).to.equal(user.address);

        console.log("\n✅ All token parameters verified successfully!");
      } catch (error) {
        console.error("\n❌ Error during token creation:", error);
        throw error;
      }
    });

    it("devrait stocker correctement les informations du token", async () => {
      const tx = await factory.connect(user).createToken(
        "Test Token",
        "TEST",
        ethers.parseEther("1000000"),
        ethers.parseEther("10000"),
        ethers.parseEther("20000"),
        100
      );
      await tx.wait();

      const tokens = await factory.getCreatorTokens(user.address);
      expect(tokens.length).to.equal(1);
      expect(tokens[0].name).to.equal("Test Token");
      expect(tokens[0].symbol).to.equal("TEST");
      expect(tokens[0].owner).to.equal(user.address);
      expect(tokens[0].additionalTaxRate).to.equal(100);
    });

    it("devrait permettre de récupérer tous les tokens", async () => {
      // Création de plusieurs tokens
      await factory.connect(user).createToken(
        "Token 1",
        "TK1",
        ethers.parseEther("1000000"),
        ethers.parseEther("10000"),
        ethers.parseEther("20000"),
        100
      );

      await factory.connect(user).createToken(
        "Token 2",
        "TK2",
        ethers.parseEther("2000000"),
        ethers.parseEther("20000"),
        ethers.parseEther("40000"),
        150
      );

      const allTokens = await factory.getAllTokens();
      expect(allTokens.length).to.equal(2);
      expect(allTokens[0].name).to.equal("Token 1");
      expect(allTokens[1].name).to.equal("Token 2");
    });
  });
});