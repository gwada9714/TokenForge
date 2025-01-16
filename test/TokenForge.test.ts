import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  TokenForgeFactory,
  TokenForgeToken,
  TokenForgeTaxSystem
} from "../typechain-types";

describe("TokenForge", () => {
  let factory: TokenForgeFactory;
  let taxSystem: TokenForgeTaxSystem;
  let owner: SignerWithAddress;
  let treasury: SignerWithAddress;
  let user: SignerWithAddress;
  let tknToken: SignerWithAddress; // Mock TKN token address

  beforeEach(async () => {
    [owner, treasury, user, tknToken] = await ethers.getSigners();

    // Deploy TaxSystem
    const TaxSystem = await ethers.getContractFactory("TokenForgeTaxSystem");
    taxSystem = await TaxSystem.deploy(treasury.address);
    await taxSystem.deployed();

    // Deploy Factory
    const Factory = await ethers.getContractFactory("TokenForgeFactory");
    factory = await Factory.deploy(tknToken.address, treasury.address, taxSystem.address);
    await factory.deployed();
  });

  describe("Token Creation", () => {
    it("should create a new token with correct parameters", async () => {
      const tokenName = "Test Token";
      const tokenSymbol = "TEST";
      const decimals = 18;
      const initialSupply = ethers.utils.parseEther("1000000");
      const maxTxAmount = ethers.utils.parseEther("10000");
      const maxWalletSize = ethers.utils.parseEther("20000");
      const additionalTaxRate = 100; // 1%

      const tx = await factory.connect(user).createToken(
        tokenName,
        tokenSymbol,
        decimals,
        initialSupply,
        maxTxAmount,
        maxWalletSize,
        additionalTaxRate
      );

      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === "TokenCreated");
      expect(event).to.not.be.undefined;

      const tokenAddress = event?.args?.tokenAddress;
      const token = await ethers.getContractAt("TokenForgeToken", tokenAddress);

      expect(await token.name()).to.equal(tokenName);
      expect(await token.symbol()).to.equal(tokenSymbol);
      expect(await token.decimals()).to.equal(decimals);
      expect(await token.totalSupply()).to.equal(initialSupply);
      expect(await token.maxTxAmount()).to.equal(maxTxAmount);
      expect(await token.maxWalletSize()).to.equal(maxWalletSize);
      expect(await token.owner()).to.equal(user.address);
    });

    it("should store token info correctly", async () => {
      const tx = await factory.connect(user).createToken(
        "Test Token",
        "TEST",
        18,
        ethers.utils.parseEther("1000000"),
        ethers.utils.parseEther("10000"),
        ethers.utils.parseEther("20000"),
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

    it("should allow retrieving all tokens", async () => {
      // Create multiple tokens
      await factory.connect(user).createToken(
        "Token 1",
        "TK1",
        18,
        ethers.utils.parseEther("1000000"),
        ethers.utils.parseEther("10000"),
        ethers.utils.parseEther("20000"),
        100
      );

      await factory.connect(user).createToken(
        "Token 2",
        "TK2",
        18,
        ethers.utils.parseEther("2000000"),
        ethers.utils.parseEther("20000"),
        ethers.utils.parseEther("40000"),
        150
      );

      const allTokens = await factory.getAllTokens();
      expect(allTokens.length).to.equal(2);
      expect(allTokens[0].name).to.equal("Token 1");
      expect(allTokens[1].name).to.equal("Token 2");
    });
  });

  describe("Fee Management", () => {
    it("should collect the correct fee for token creation", async () => {
      const initialBalance = await tknToken.getBalance(treasury.address);
      
      await factory.connect(user).createToken(
        "Test Token",
        "TEST",
        18,
        ethers.utils.parseEther("1000000"),
        ethers.utils.parseEther("10000"),
        ethers.utils.parseEther("20000"),
        100
      );

      const finalBalance = await tknToken.getBalance(treasury.address);
      expect(finalBalance.sub(initialBalance)).to.equal(
        ethers.utils.parseEther("100") // BASIC_TIER_PRICE
      );
    });

    it("should allow owner to withdraw fees", async () => {
      // First create a token to generate fees
      await factory.connect(user).createToken(
        "Test Token",
        "TEST",
        18,
        ethers.utils.parseEther("1000000"),
        ethers.utils.parseEther("10000"),
        ethers.utils.parseEther("20000"),
        100
      );

      const initialBalance = await tknToken.getBalance(treasury.address);
      await factory.connect(owner).withdrawFees();
      const finalBalance = await tknToken.getBalance(treasury.address);

      expect(finalBalance.sub(initialBalance)).to.be.gt(0);
    });

    it("should not allow non-owner to withdraw fees", async () => {
      await expect(
        factory.connect(user).withdrawFees()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});