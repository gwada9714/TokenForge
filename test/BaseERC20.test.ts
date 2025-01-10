import { expect } from "chai";
import { ethers } from "hardhat";
import { BaseERC20, TokenFactory } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("BaseERC20", function () {
  let tokenFactory: TokenFactory;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const TokenFactory = await ethers.getContractFactory("TokenFactory");
    tokenFactory = await TokenFactory.deploy(owner.address);
    await tokenFactory.waitForDeployment();
  });

  describe("Token Creation", function () {
    it("Should create a new ERC20 token with correct parameters", async function () {
      const name = "Test Token";
      const symbol = "TEST";
      const decimals = 18;
      const initialSupply = ethers.parseEther("1000");
      const maxSupply = ethers.parseEther("10000");
      const mintable = true;
      const salt = ethers.randomBytes(32);

      const tx = await tokenFactory.createERC20(
        name,
        symbol,
        decimals,
        initialSupply,
        maxSupply,
        mintable,
        salt
      );

      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log) => log.fragment?.name === "TokenCreated"
      );
      expect(event).to.not.be.undefined;

      const tokenAddress = event?.args?.[0];
      const token = await ethers.getContractAt("BaseERC20", tokenAddress);

      expect(await token.name()).to.equal(name);
      expect(await token.symbol()).to.equal(symbol);
      expect(await token.decimals()).to.equal(decimals);
      expect(await token.totalSupply()).to.equal(initialSupply);
      expect(await token.balanceOf(owner.address)).to.equal(initialSupply);
      expect(await token.maxSupply()).to.equal(maxSupply);
    });

    it("Should not allow minting when disabled", async function () {
      const initialSupply = ethers.parseEther("1000");
      const maxSupply = ethers.parseEther("2000");
      const mintable = false;
      const salt = ethers.randomBytes(32);

      const tx = await tokenFactory.createERC20(
        "Test",
        "TEST",
        18,
        initialSupply,
        maxSupply,
        mintable,
        salt
      );

      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log) => log.fragment?.name === "TokenCreated"
      );
      const tokenAddress = event?.args?.[0];
      const token = await ethers.getContractAt("BaseERC20", tokenAddress);

      await expect(
        token.mint(addr1.address, ethers.parseEther("1"))
      ).to.be.revertedWithCustomError(token, "MintingDisabled");
    });

    it("Should not allow exceeding max supply", async function () {
      const initialSupply = ethers.parseEther("1000");
      const maxSupply = ethers.parseEther("2000");
      const mintable = true;
      const salt = ethers.randomBytes(32);

      const tx = await tokenFactory.createERC20(
        "Test",
        "TEST",
        18,
        initialSupply,
        maxSupply,
        mintable,
        salt
      );

      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log) => log.fragment?.name === "TokenCreated"
      );
      const tokenAddress = event?.args?.[0];
      const token = await ethers.getContractAt("BaseERC20", tokenAddress);

      // Try to mint beyond max supply
      await expect(
        token.mint(addr1.address, ethers.parseEther("1001"))
      ).to.be.revertedWithCustomError(token, "MaxSupplyExceeded");
    });

    it("Should allow minting with no max supply", async function () {
      const initialSupply = ethers.parseEther("1000");
      const maxSupply = 0; // No max supply
      const mintable = true;
      const salt = ethers.randomBytes(32);

      const tx = await tokenFactory.createERC20(
        "Test",
        "TEST",
        18,
        initialSupply,
        maxSupply,
        mintable,
        salt
      );

      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log) => log.fragment?.name === "TokenCreated"
      );
      const tokenAddress = event?.args?.[0];
      const token = await ethers.getContractAt("BaseERC20", tokenAddress);

      // Should be able to mint any amount
      await token.mint(addr1.address, ethers.parseEther("1000000"));
      expect(await token.balanceOf(addr1.address)).to.equal(ethers.parseEther("1000000"));
    });
  });
});
