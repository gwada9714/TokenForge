import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  TokenForgeToken,
  TokenForgeFactory,
  TokenForgeTaxSystem
} from "../typechain-types";

describe("TokenForge Anti-Whale Features", () => {
  let token: TokenForgeToken;
  let factory: TokenForgeFactory;
  let taxSystem: TokenForgeTaxSystem;
  let owner: SignerWithAddress;
  let treasury: SignerWithAddress;
  let creator: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let whale: SignerWithAddress;

  const TOKEN_NAME = "Anti Whale Token";
  const TOKEN_SYMBOL = "AWT";
  const INITIAL_SUPPLY = ethers.utils.parseEther("1000000");
  const MAX_TX_AMOUNT = ethers.utils.parseEther("10000"); // 1% of total supply
  const MAX_WALLET_SIZE = ethers.utils.parseEther("20000"); // 2% of total supply

  beforeEach(async () => {
    // Get signers
    [owner, treasury, creator, user1, user2, whale] = await ethers.getSigners();

    // Deploy TaxSystem
    const TaxSystem = await ethers.getContractFactory("TokenForgeTaxSystem");
    taxSystem = await TaxSystem.deploy(treasury.address);
    await taxSystem.deployed();

    // Deploy Factory
    const Factory = await ethers.getContractFactory("TokenForgeFactory");
    factory = await Factory.deploy(
      ethers.constants.AddressZero, // TKN token not needed for tests
      treasury.address,
      taxSystem.address
    );
    await factory.deployed();

    // Create a test token with anti-whale features
    const createTx = await factory.connect(creator).createToken(
      TOKEN_NAME,
      TOKEN_SYMBOL,
      18,
      INITIAL_SUPPLY,
      MAX_TX_AMOUNT,
      MAX_WALLET_SIZE,
      0 // no additional tax
    );
    const receipt = await createTx.wait();
    const event = receipt.events?.find(e => e.event === "TokenCreated");
    const tokenAddress = event?.args?.tokenAddress;
    token = await ethers.getContractAt("TokenForgeToken", tokenAddress);

    // Transfer some tokens to users for testing
    await token.connect(creator).transfer(user1.address, ethers.utils.parseEther("5000"));
    await token.connect(creator).transfer(user2.address, ethers.utils.parseEther("5000"));
    await token.connect(creator).transfer(whale.address, ethers.utils.parseEther("15000"));
  });

  describe("Max Transaction Amount", () => {
    it("should enforce max transaction amount", async () => {
      // Try to transfer more than max tx amount
      await expect(
        token.connect(creator).transfer(user1.address, MAX_TX_AMOUNT.add(1))
      ).to.be.revertedWith("Transfer amount exceeds maxTxAmount");
    });

    it("should allow transfer at max transaction amount", async () => {
      await expect(
        token.connect(creator).transfer(user1.address, MAX_TX_AMOUNT)
      ).to.not.be.reverted;
    });

    it("should allow multiple transfers under max amount", async () => {
      const amount = ethers.utils.parseEther("5000");
      await token.connect(creator).transfer(user1.address, amount);
      await token.connect(creator).transfer(user1.address, amount);
      // If no revert, test passes
    });
  });

  describe("Max Wallet Size", () => {
    it("should enforce max wallet size", async () => {
      // Try to transfer amount that would exceed max wallet size
      const currentBalance = await token.balanceOf(user1.address);
      const amountToExceed = MAX_WALLET_SIZE.sub(currentBalance).add(1);

      await expect(
        token.connect(creator).transfer(user1.address, amountToExceed)
      ).to.be.revertedWith("Transfer would exceed maxWalletSize");
    });

    it("should allow transfer up to max wallet size", async () => {
      const currentBalance = await token.balanceOf(user1.address);
      const amountToMax = MAX_WALLET_SIZE.sub(currentBalance);

      await expect(
        token.connect(creator).transfer(user1.address, amountToMax)
      ).to.not.be.reverted;
    });

    it("should track wallet size correctly after multiple transfers", async () => {
      const amount = ethers.utils.parseEther("1000");
      
      // Multiple transfers to same wallet
      await token.connect(creator).transfer(user1.address, amount);
      await token.connect(creator).transfer(user1.address, amount);
      
      const finalBalance = await token.balanceOf(user1.address);
      expect(finalBalance).to.be.lte(MAX_WALLET_SIZE);
    });
  });

  describe("Configuration", () => {
    it("should allow owner to update max transaction amount", async () => {
      const newMaxTx = ethers.utils.parseEther("15000");
      await token.connect(creator).setMaxTxAmount(newMaxTx);
      expect(await token.maxTxAmount()).to.equal(newMaxTx);
    });

    it("should allow owner to update max wallet size", async () => {
      const newMaxWallet = ethers.utils.parseEther("25000");
      await token.connect(creator).setMaxWalletSize(newMaxWallet);
      expect(await token.maxWalletSize()).to.equal(newMaxWallet);
    });

    it("should not allow non-owner to update limits", async () => {
      const newAmount = ethers.utils.parseEther("15000");
      await expect(
        token.connect(user1).setMaxTxAmount(newAmount)
      ).to.be.revertedWith("Ownable: caller is not the owner");
      
      await expect(
        token.connect(user1).setMaxWalletSize(newAmount)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Edge Cases", () => {
    it("should handle transfers that exactly match limits", async () => {
      // Clear user1's balance
      const user1Balance = await token.balanceOf(user1.address);
      await token.connect(user1).transfer(creator.address, user1Balance);

      // Transfer exactly max wallet size
      await expect(
        token.connect(creator).transfer(user1.address, MAX_WALLET_SIZE)
      ).to.not.be.reverted;
    });

    it("should handle multiple small transfers approaching limits", async () => {
      const smallAmount = ethers.utils.parseEther("1000");
      const iterations = 19; // Should get close to max wallet size

      for (let i = 0; i < iterations; i++) {
        await token.connect(creator).transfer(user1.address, smallAmount);
      }

      // Next transfer should fail
      await expect(
        token.connect(creator).transfer(user1.address, smallAmount)
      ).to.be.revertedWith("Transfer would exceed maxWalletSize");
    });

    it("should maintain limits after token burns", async () => {
      // Burn some tokens
      const burnAmount = ethers.utils.parseEther("100000");
      await token.connect(creator).burn(burnAmount);

      // Limits should still be enforced
      await expect(
        token.connect(creator).transfer(user1.address, MAX_TX_AMOUNT.add(1))
      ).to.be.revertedWith("Transfer amount exceeds maxTxAmount");
    });
  });
});
