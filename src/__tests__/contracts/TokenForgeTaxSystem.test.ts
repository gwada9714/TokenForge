import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import {
  TokenForgeTaxSystem,
  TokenForgeToken
} from "../typechain-types";
import { parseEther } from "ethers";

describe("TokenForgeTaxSystem", () => {
  let taxSystem: TokenForgeTaxSystem;
  let token: TokenForgeToken;
  let owner: SignerWithAddress;
  let treasury: SignerWithAddress;
  let creator: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const TOKEN_NAME = "Test Token";
  const TOKEN_SYMBOL = "TEST";
  const INITIAL_SUPPLY = parseEther("1000000"); // 1M tokens
  const BASE_TAX_RATE = 50n; // 0.5%
  const MAX_ADDITIONAL_TAX_RATE = 150n; // 1.5%

  beforeEach(async () => {
    [owner, treasury, creator, user1, user2] = await ethers.getSigners();

    // Deploy TaxSystem
    const TaxSystem = await ethers.getContractFactory("TokenForgeTaxSystem");
    taxSystem = await TaxSystem.deploy(treasury.address);
    await taxSystem.waitForDeployment();

    // Deploy Token
    const Token = await ethers.getContractFactory("TokenForgeToken");
    token = await Token.deploy(
      TOKEN_NAME,
      TOKEN_SYMBOL,
      18,
      INITIAL_SUPPLY,
      INITIAL_SUPPLY, // maxTxAmount
      INITIAL_SUPPLY, // maxWalletSize
      await taxSystem.getAddress()
    );
    await token.waitForDeployment();

    // Configure tax for the token
    await taxSystem.configureTax(await token.getAddress(), 100n, creator.address); // 1% additional tax

    // Transfer some tokens to users for testing
    await token.transfer(user1.address, INITIAL_SUPPLY / 10n);
    await token.transfer(user2.address, INITIAL_SUPPLY / 10n);
  });

  describe("Tax Configuration", () => {
    it("should have correct base tax rate", async () => {
      expect(await taxSystem.BASE_TAX_RATE()).to.equal(BASE_TAX_RATE);
    });

    it("should have correct max additional tax rate", async () => {
      expect(await taxSystem.MAX_ADDITIONAL_TAX_RATE()).to.equal(MAX_ADDITIONAL_TAX_RATE);
    });

    it("should not allow additional tax rate above maximum", async () => {
      await expect(
        taxSystem.configureTax(await token.getAddress(), MAX_ADDITIONAL_TAX_RATE + 1n, creator.address)
      ).to.be.rejectedWith("Tax rate too high");
    });
  });

  describe("Tax Calculation", () => {
    it("should calculate correct tax amounts", async () => {
      const amount = INITIAL_SUPPLY / 100n; // 1% of total supply
      const [baseTax, additionalTax] = await taxSystem.calculateTaxAmounts(await token.getAddress(), amount);
      
      // Base tax should be 0.5%
      expect(baseTax).to.equal(amount * BASE_TAX_RATE / 10000n);
      
      // Additional tax should be 1%
      expect(additionalTax).to.equal(amount * 100n / 10000n);
    });
  });

  describe("Tax Collection", () => {
    it("should collect and distribute taxes correctly", async () => {
      const transferAmount = INITIAL_SUPPLY / 100n; // 1% of total supply
      const expectedBaseTax = (transferAmount * BASE_TAX_RATE) / 10000n;
      const expectedAdditionalTax = (transferAmount * 100n) / 10000n;
      const expectedTransferAmount = transferAmount - expectedBaseTax - expectedAdditionalTax;

      // Get initial balances
      const initialTreasuryBalance = await token.balanceOf(treasury.address);
      const initialCreatorBalance = await token.balanceOf(creator.address);
      const initialUser2Balance = await token.balanceOf(user2.address);

      // Perform transfer
      await token.connect(user1).transfer(user2.address, transferAmount);

      // Check final balances
      expect(await token.balanceOf(treasury.address)).to.equal(
        initialTreasuryBalance + expectedBaseTax
      );
      expect(await token.balanceOf(creator.address)).to.equal(
        initialCreatorBalance + expectedAdditionalTax
      );
      expect(await token.balanceOf(user2.address)).to.equal(
        initialUser2Balance + expectedTransferAmount
      );
    });

    it("should handle zero additional tax correctly", async () => {
      // Deploy new token with no additional tax
      const Token = await ethers.getContractFactory("TokenForgeToken");
      const noTaxToken = await Token.deploy(
        "No Additional Tax Token",
        "NAT",
        18,
        INITIAL_SUPPLY,
        INITIAL_SUPPLY,
        INITIAL_SUPPLY,
        await taxSystem.getAddress()
      );
      await noTaxToken.waitForDeployment();

      // Transfer tokens to user1
      await noTaxToken.transfer(user1.address, INITIAL_SUPPLY / 10n);

      const transferAmount = INITIAL_SUPPLY / 100n;
      const expectedBaseTax = (transferAmount * BASE_TAX_RATE) / 10000n;
      const expectedTransferAmount = transferAmount - expectedBaseTax;

      // Get initial balances
      const initialTreasuryBalance = await noTaxToken.balanceOf(treasury.address);
      const initialUser2Balance = await noTaxToken.balanceOf(user2.address);

      // Perform transfer
      await noTaxToken.connect(user1).transfer(user2.address, transferAmount);

      // Check final balances
      expect(await noTaxToken.balanceOf(treasury.address)).to.equal(
        initialTreasuryBalance + expectedBaseTax
      );
      expect(await noTaxToken.balanceOf(user2.address)).to.equal(
        initialUser2Balance + expectedTransferAmount
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle minimum transfer amount", async () => {
      const minAmount = 1000n;
      await token.connect(user1).transfer(user2.address, minAmount);
      // If no revert, test passes
    });

    it("should handle maximum transfer amount", async () => {
      const maxAmount = INITIAL_SUPPLY / 10n;
      await token.connect(user1).transfer(user2.address, maxAmount);
      // If no revert, test passes
    });

    it("should revert on zero address recipient", async () => {
      await expect(
        token.connect(user1).transfer(ethers.ZeroAddress, INITIAL_SUPPLY / 100n)
      ).to.be.rejectedWith("Transfer to zero address");
    });
  });
});
