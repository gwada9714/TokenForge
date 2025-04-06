import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import hre from "hardhat";
import "@nomicfoundation/hardhat-ethers";
import { parseEther, Interface, randomBytes, Contract, Log } from "ethers";
import { ethers } from "ethers";

describe("BaseERC20", function () {
  // Fixture that deploys TokenFactory
  async function deployTokenFactoryFixture(): Promise<{
    tokenFactory: Contract;
    owner: HardhatEthersSigner;
    addr1: HardhatEthersSigner;
    addr2: HardhatEthersSigner;
    otherAccount: HardhatEthersSigner;
  }> {
    const [owner, addr1, addr2, otherAccount] = await hre.ethers.getSigners();
    const TokenFactoryFactory = await hre.ethers.getContractFactory(
      "TokenFactory"
    );
    const tokenFactory = await TokenFactoryFactory.deploy(owner.address);
    await tokenFactory.waitForDeployment();
    const deployedAddress = await tokenFactory.getAddress();
    const deployedFactory = TokenFactoryFactory.attach(deployedAddress);

    return { tokenFactory: deployedFactory, owner, addr1, addr2, otherAccount };
  }

  describe("Token Creation", function () {
    it("Should create a token with correct parameters", async function () {
      const { tokenFactory, owner } = await loadFixture(
        deployTokenFactoryFixture
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
        salt
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
        salt
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
          (
            await hre.ethers.getSigners()
          )[1].address,
          parseEther("1")
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
        salt
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
          (
            await hre.ethers.getSigners()
          )[1].address,
          parseEther("1001")
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
        salt
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
        (
          await hre.ethers.getSigners()
        )[1].address,
        parseEther("1000000")
      );
      expect(
        Number(
          await token.balanceOf((await hre.ethers.getSigners())[1].address)
        )
      ).to.equal(Number(parseEther("1000000")));
    });
  });

  describe("Edge Cases and Security", function () {
    it("Should handle maximum supply edge cases", async function () {
      const { tokenFactory } = await loadFixture(deployTokenFactoryFixture);
      const maxPossibleSupply = ethers.MaxUint256;

      // Test avec le supply maximum possible
      const tx1 = await tokenFactory.createERC20(
        "Max Supply Token",
        "MAX",
        18,
        maxPossibleSupply,
        maxPossibleSupply,
        true,
        randomBytes(32)
      );
      const receipt1 = await tx1.wait();
      expect(receipt1.status).to.equal(1);

      // Test avec tentative de dépassement du supply maximum
      await expect(
        tokenFactory.createERC20(
          "Overflow Token",
          "OVER",
          18,
          maxPossibleSupply + BigInt(1),
          maxPossibleSupply + BigInt(1),
          true,
          randomBytes(32)
        )
      ).to.be.revertedWith("Supply overflow");
    });

    it("Should prevent unauthorized minting", async function () {
      const { tokenFactory, owner, otherAccount } = await loadFixture(
        deployTokenFactoryFixture
      );

      const initialSupply = parseEther("1000");
      const maxSupply = parseEther("10000");
      const tx = await tokenFactory.createERC20(
        "Secure Token",
        "SEC",
        18,
        initialSupply,
        maxSupply,
        true,
        randomBytes(32)
      );

      const receipt = await tx.wait();
      const tokenCreatedLog = receipt.logs[2];
      const tokenAddress = `0x${tokenCreatedLog.topics[1].slice(26)}`;
      const BaseERC20Factory = await hre.ethers.getContractFactory("BaseERC20");
      const token = BaseERC20Factory.attach(tokenAddress);

      // Tentative de mint par un compte non autorisé
      await expect(
        token
          .connect(otherAccount)
          .mint(otherAccount.address, parseEther("100"))
      ).to.be.revertedWith("Ownable: caller is not the owner");

      // Vérification que seul le owner peut mint
      await expect(token.connect(owner).mint(owner.address, parseEther("100")))
        .to.not.be.reverted;
    });

    it("Should enforce transfer limits correctly", async function () {
      const { tokenFactory, owner, otherAccount } = await loadFixture(
        deployTokenFactoryFixture
      );

      const initialSupply = parseEther("1000");
      const maxSupply = parseEther("10000");
      const tx = await tokenFactory.createERC20(
        "Limited Token",
        "LIM",
        18,
        initialSupply,
        maxSupply,
        true,
        randomBytes(32)
      );

      const receipt = await tx.wait();
      const tokenCreatedLog = receipt.logs[2];
      const tokenAddress = `0x${tokenCreatedLog.topics[1].slice(26)}`;
      const BaseERC20Factory = await hre.ethers.getContractFactory("BaseERC20");
      const token = BaseERC20Factory.attach(tokenAddress);

      // Test des limites de transfer
      const transferAmount = parseEther("1001"); // Plus que le supply initial
      await expect(
        token.transfer(otherAccount.address, transferAmount)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });
  });
});
