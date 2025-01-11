import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import hre from "hardhat";
import "@nomicfoundation/hardhat-ethers";
import { parseEther, Interface, randomBytes, Contract, Log } from "ethers";

use(chaiAsPromised);

describe("BaseERC20", function () {
  // Fixture that deploys TokenFactory
  async function deployTokenFactoryFixture(): Promise<{
    tokenFactory: Contract;
    owner: HardhatEthersSigner;
    addr1: HardhatEthersSigner;
    addr2: HardhatEthersSigner;
  }> {
    const [owner, addr1, addr2] = await hre.ethers.getSigners();
    const TokenFactoryFactory = await hre.ethers.getContractFactory("TokenFactory");
    const tokenFactory = await TokenFactoryFactory.deploy(owner.address);
    await tokenFactory.waitForDeployment();
    const deployedAddress = await tokenFactory.getAddress();
    const deployedFactory = TokenFactoryFactory.attach(deployedAddress);

    return { tokenFactory: deployedFactory, owner, addr1, addr2 };
  }

  describe("Token Creation", function () {
    it("Should create a token with correct parameters", async function () {
      const { tokenFactory, owner } = await loadFixture(deployTokenFactoryFixture);
      
      const name = "Test Token";
      const symbol = "TEST";
      const decimals = 18;
      const initialSupply = parseEther("1000");
      const maxSupply = parseEther("10000");
      const mintable = true;
      const salt = randomBytes(32);

      // Create token
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
      if (!receipt || !receipt.logs) throw new Error("No receipt or logs found");

      const tokenCreatedLog = receipt.logs[2];
      if (!tokenCreatedLog) throw new Error("TokenCreated event not found");

      const tokenAddress = `0x${tokenCreatedLog.topics[1].slice(26)}`;
      if (!tokenAddress) throw new Error("Token address not found in event");

      const BaseERC20Factory = await hre.ethers.getContractFactory("BaseERC20");
      const token = await BaseERC20Factory.attach(tokenAddress);

      expect(await token.name()).to.equal(name);
      expect(await token.symbol()).to.equal(symbol);
      expect(await token.decimals()).to.equal(decimals);
      expect(await token.totalSupply()).to.equal(initialSupply);
      expect(await token.maxSupply()).to.equal(maxSupply);
      expect(await token.mintable()).to.equal(mintable);
    });

    it("Should not allow minting when disabled", async function () {
      const { tokenFactory } = await loadFixture(deployTokenFactoryFixture);
      
      const initialSupply = parseEther("1000");
      const maxSupply = parseEther("2000");
      const mintable = false;
      const salt = randomBytes(32);

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
      if (!receipt || !receipt.logs) throw new Error("No receipt or logs found");

      const tokenCreatedLog = receipt.logs[2];
      if (!tokenCreatedLog) throw new Error("TokenCreated event not found");

      const tokenAddress = `0x${tokenCreatedLog.topics[1].slice(26)}`;
      if (!tokenAddress) throw new Error("Token address not found in event");

      const BaseERC20Factory = await hre.ethers.getContractFactory("BaseERC20");
      const token = await BaseERC20Factory.attach(tokenAddress);

      await expect(
        token.mint((await hre.ethers.getSigners())[1].address, parseEther("1"))
      ).to.be.rejectedWith("MintingDisabled");
    });

    it("Should enforce max supply limit", async function () {
      const { tokenFactory } = await loadFixture(deployTokenFactoryFixture);
      
      const initialSupply = parseEther("1000");
      const maxSupply = parseEther("2000");
      const mintable = true;
      const salt = randomBytes(32);

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
      if (!receipt || !receipt.logs) throw new Error("No receipt or logs found");

      const tokenCreatedLog = receipt.logs[2];
      if (!tokenCreatedLog) throw new Error("TokenCreated event not found");

      const tokenAddress = `0x${tokenCreatedLog.topics[1].slice(26)}`;
      if (!tokenAddress) throw new Error("Token address not found in event");

      const BaseERC20Factory = await hre.ethers.getContractFactory("BaseERC20");
      const token = await BaseERC20Factory.attach(tokenAddress);

      // Try to mint beyond max supply
      await expect(
        token.mint((await hre.ethers.getSigners())[1].address, parseEther("1001"))
      ).to.be.rejectedWith("MaxSupplyExceeded");
    });

    it("Should allow unlimited minting when max supply is 0", async function () {
      const { tokenFactory } = await loadFixture(deployTokenFactoryFixture);
      
      const initialSupply = parseEther("1000");
      const maxSupply = 0; // No max supply
      const mintable = true;
      const salt = randomBytes(32);

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
      if (!receipt || !receipt.logs) throw new Error("No receipt or logs found");

      const tokenCreatedLog = receipt.logs[2];
      if (!tokenCreatedLog) throw new Error("TokenCreated event not found");

      const tokenAddress = `0x${tokenCreatedLog.topics[1].slice(26)}`;
      if (!tokenAddress) throw new Error("Token address not found in event");

      const BaseERC20Factory = await hre.ethers.getContractFactory("BaseERC20");
      const token = await BaseERC20Factory.attach(tokenAddress);

      // Should be able to mint any amount
      await token.mint((await hre.ethers.getSigners())[1].address, parseEther("1000000"));
      expect(await token.balanceOf((await hre.ethers.getSigners())[1].address)).to.equal(parseEther("1000000"));
    });
  });
});
