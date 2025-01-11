const { expect } = require("chai");
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { BaseERC20, TokenFactory } from "../typechain-types";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ContractTransactionReceipt, Interface, Log } from "ethers";
import "@nomicfoundation/hardhat-toolbox";
import hre from "hardhat";

const { ethers } = require("hardhat");

describe("BaseERC20", function () {
  let tokenFactory: TokenFactory;
  let owner: HardhatEthersSigner;
  let addr1: HardhatEthersSigner;
  let addr2: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const TokenFactoryFactory = await ethers.getContractFactory("TokenFactory");
    tokenFactory = await TokenFactoryFactory.deploy(owner.address) as unknown as TokenFactory;
    await tokenFactory.waitForDeployment();
  });

  describe("Token Creation", function () {
    it("Should create a token with correct parameters", async function () {
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

      const receipt = await tx.wait() as ContractTransactionReceipt;
      if (!receipt) throw new Error("No receipt");

      const iface = new Interface([
        "event ERC20Created(address indexed tokenAddress)"
      ]);

      const log = receipt.logs[0] as Log;
      const parsedLog = iface.parseLog(log);
      if (!parsedLog) throw new Error("Failed to parse log");

      const tokenAddress = parsedLog.args[0];
      const BaseERC20Factory = await ethers.getContractFactory("BaseERC20");
      const token = await BaseERC20Factory.attach(tokenAddress) as unknown as BaseERC20;

      expect(await token.name()).to.equal(name);
      expect(await token.symbol()).to.equal(symbol);
      expect(await token.decimals()).to.equal(decimals);
      expect(await token.totalSupply()).to.equal(initialSupply);
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

      const receipt = await tx.wait() as ContractTransactionReceipt;
      if (!receipt) throw new Error("No receipt");

      const iface = new Interface([
        "event ERC20Created(address indexed tokenAddress)"
      ]);

      const log = receipt.logs[0] as Log;
      const parsedLog = iface.parseLog(log);
      if (!parsedLog) throw new Error("Failed to parse log");
      
      const tokenAddress = parsedLog.args[0];
      const BaseERC20Factory = await ethers.getContractFactory("BaseERC20");
      const token = await BaseERC20Factory.attach(tokenAddress) as unknown as BaseERC20;

      await expect(
        token.mint(addr1.address, ethers.parseEther("1"))
      ).to.be.rejectedWith("MintingDisabled");
    });

    it("Should not allow minting beyond max supply", async function () {
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

      const receipt = await tx.wait() as ContractTransactionReceipt;
      if (!receipt) throw new Error("No receipt");

      const iface = new Interface([
        "event ERC20Created(address indexed tokenAddress)"
      ]);

      const log = receipt.logs[0] as Log;
      const parsedLog = iface.parseLog(log);
      if (!parsedLog) throw new Error("Failed to parse log");
      
      const tokenAddress = parsedLog.args[0];
      const BaseERC20Factory = await ethers.getContractFactory("BaseERC20");
      const token = await BaseERC20Factory.attach(tokenAddress) as unknown as BaseERC20;

      // Try to mint beyond max supply
      await expect(
        token.mint(addr1.address, ethers.parseEther("1001"))
      ).to.be.rejectedWith("MaxSupplyExceeded");
    });

    it("Should allow unlimited minting when max supply is 0", async function () {
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

      const receipt = await tx.wait() as ContractTransactionReceipt;
      if (!receipt) throw new Error("No receipt");

      const iface = new Interface([
        "event ERC20Created(address indexed tokenAddress)"
      ]);

      const log = receipt.logs[0] as Log;
      const parsedLog = iface.parseLog(log);
      if (!parsedLog) throw new Error("Failed to parse log");
      
      const tokenAddress = parsedLog.args[0];
      const BaseERC20Factory = await ethers.getContractFactory("BaseERC20");
      const token = await BaseERC20Factory.attach(tokenAddress) as unknown as BaseERC20;

      // Should be able to mint any amount
      await token.mint(addr1.address, ethers.parseEther("1000000"));
      expect(await token.balanceOf(addr1.address)).to.equal(ethers.parseEther("1000000"));
    });
  });
});
