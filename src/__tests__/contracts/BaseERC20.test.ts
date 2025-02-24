import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import hre from "hardhat";
import "@nomicfoundation/hardhat-ethers";
import { parseEther, Interface, randomBytes, Contract, Log } from "ethers";

describe("BaseERC20", function () {
  // Fixture that deploys TokenFactory
  async function deployTokenFactoryFixture(): Promise<{
    tokenFactory: Contract;
    owner: HardhatEthersSigner;
    addr1: HardhatEthersSigner;
    addr2: HardhatEthersSigner;
  }> {
    const [owner, addr1, addr2] = await hre.ethers.getSigners();
    const TokenFactoryFactory =
      await hre.ethers.getContractFactory("TokenFactory");
    const tokenFactory = await TokenFactoryFactory.deploy(owner.address);
    await tokenFactory.waitForDeployment();
    const deployedAddress = await tokenFactory.getAddress();
    const deployedFactory = TokenFactoryFactory.attach(deployedAddress);

    return { tokenFactory: deployedFactory, owner, addr1, addr2 };
  }

  describe("Token Creation", function () {
    it("Should create a token with correct parameters", async function () {
      const { tokenFactory, owner } = await loadFixture(
        deployTokenFactoryFixture,
      );

      const name = "Test Token";
      const symbol = "TEST";
      const decimals = 18;
      const initialSupply = parseEther("1000");
      const maxSupply = parseEther("10000");
      const initialMintable = true;
      const salt = randomBytes(32);

      // Create token
      const tx = await tokenFactory.createERC20(
        name,
        symbol,
        decimals,
        initialSupply,
        maxSupply,
        initialMintable,
        salt,
      );

      const receipt = await tx.wait();
      if (!receipt || !receipt.logs)
        throw new Error("No receipt or logs found");

      const tokenCreatedLog = receipt.logs[2];
      if (!tokenCreatedLog) throw new Error("TokenCreated event not found");

      const tokenAddress = `0x${tokenCreatedLog.topics[1].slice(26)}`;
      if (!tokenAddress) throw new Error("Token address not found in event");

      const BaseERC20Factory = await hre.ethers.getContractFactory("BaseERC20");
      const token = BaseERC20Factory.attach(tokenAddress);

      // Log the values for debugging
      console.log("Token name:", await token.name());
      console.log("Token symbol:", await token.symbol());
      console.log("Token decimals:", await token.decimals());
      console.log("Token totalSupply:", await token.totalSupply());
      console.log("Token maxSupply:", await token.maxSupply());
      console.log("Token mintable:", await token.mintable());

      // Use callStatic to get the values
      const [
        actualName,
        actualSymbol,
        actualDecimals,
        actualTotalSupply,
        actualMaxSupply,
        actualMintable,
      ] = await Promise.all([
        token.name(),
        token.symbol(),
        token.decimals(),
        token.totalSupply(),
        token.maxSupply(),
        token.mintable(),
      ]);

      expect(actualName).to.equal(name);
      expect(actualSymbol).to.equal(symbol);
      expect(Number(actualDecimals)).to.equal(decimals);
      expect(actualTotalSupply).to.equal(initialSupply);
      expect(actualMaxSupply).to.equal(maxSupply);
      expect(actualMintable).to.equal(initialMintable);
    });

    it("Should not allow minting when disabled", async function () {
      const { tokenFactory } = await loadFixture(deployTokenFactoryFixture);

      const initialSupply = parseEther("1000");
      const maxSupply = parseEther("2000");
      const initialMintable = false;
      const salt = randomBytes(32);

      const tx = await tokenFactory.createERC20(
        "Test",
        "TEST",
        18,
        initialSupply,
        maxSupply,
        initialMintable,
        salt,
      );

      const receipt = await tx.wait();
      if (!receipt || !receipt.logs)
        throw new Error("No receipt or logs found");

      const tokenCreatedLog = receipt.logs[2];
      if (!tokenCreatedLog) throw new Error("TokenCreated event not found");

      const tokenAddress = `0x${tokenCreatedLog.topics[1].slice(26)}`;
      if (!tokenAddress) throw new Error("Token address not found in event");

      const BaseERC20Factory = await hre.ethers.getContractFactory("BaseERC20");
      const token = await BaseERC20Factory.attach(tokenAddress);

      try {
        await token.mint(
          (await hre.ethers.getSigners())[1].address,
          parseEther("1"),
        );
        expect.fail("Should have thrown MintingDisabled error");
      } catch (error: any) {
        expect(error.message).to.include("MintingDisabled");
      }
    });

    it("Should enforce max supply limit", async function () {
      const { tokenFactory } = await loadFixture(deployTokenFactoryFixture);

      const initialSupply = parseEther("1000");
      const maxSupply = parseEther("2000");
      const initialMintable = true;
      const salt = randomBytes(32);

      const tx = await tokenFactory.createERC20(
        "Test",
        "TEST",
        18,
        initialSupply,
        maxSupply,
        initialMintable,
        salt,
      );

      const receipt = await tx.wait();
      if (!receipt || !receipt.logs)
        throw new Error("No receipt or logs found");

      const tokenCreatedLog = receipt.logs[2];
      if (!tokenCreatedLog) throw new Error("TokenCreated event not found");

      const tokenAddress = `0x${tokenCreatedLog.topics[1].slice(26)}`;
      if (!tokenAddress) throw new Error("Token address not found in event");

      const BaseERC20Factory = await hre.ethers.getContractFactory("BaseERC20");
      const token = await BaseERC20Factory.attach(tokenAddress);

      // Try to mint beyond max supply
      try {
        await token.mint(
          (await hre.ethers.getSigners())[1].address,
          parseEther("1001"),
        );
        expect.fail("Should have thrown MaxSupplyExceeded error");
      } catch (error: any) {
        expect(error.message).to.include("MaxSupplyExceeded");
      }
    });

    it("Should allow unlimited minting when max supply is 0", async function () {
      const { tokenFactory } = await loadFixture(deployTokenFactoryFixture);

      const initialSupply = parseEther("1000");
      const maxSupply = 0; // No max supply
      const initialMintable = true;
      const salt = randomBytes(32);

      const tx = await tokenFactory.createERC20(
        "Test",
        "TEST",
        18,
        initialSupply,
        maxSupply,
        initialMintable,
        salt,
      );

      const receipt = await tx.wait();
      if (!receipt || !receipt.logs)
        throw new Error("No receipt or logs found");

      const tokenCreatedLog = receipt.logs[2];
      if (!tokenCreatedLog) throw new Error("TokenCreated event not found");

      const tokenAddress = `0x${tokenCreatedLog.topics[1].slice(26)}`;
      if (!tokenAddress) throw new Error("Token address not found in event");

      const BaseERC20Factory = await hre.ethers.getContractFactory("BaseERC20");
      const token = await BaseERC20Factory.attach(tokenAddress);

      // Should be able to mint any amount
      await token.mint(
        (await hre.ethers.getSigners())[1].address,
        parseEther("1000000"),
      );
      expect(
        Number(
          await token.balanceOf((await hre.ethers.getSigners())[1].address),
        ),
      ).to.equal(Number(parseEther("1000000")));
    });
  });
});
