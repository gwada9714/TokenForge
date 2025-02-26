import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import type {
  TokenForgeToken,
  TokenForgeFactory,
  TokenForgeTaxSystem
} from "../../../typechain-types";
import { ZeroAddress } from "ethers";
import {
  INITIAL_SUPPLY,
  MAX_TX_AMOUNT,
  MAX_WALLET_SIZE,
  TEST_TOKEN_PARAMS
} from "./constants";

describe("Fonctionnalités Anti-Whale de TokenForge", () => {
  let token: TokenForgeToken;
  let factory: TokenForgeFactory;
  let taxSystem: TokenForgeTaxSystem;
  let owner: SignerWithAddress;
  let treasury: SignerWithAddress;
  let creator: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let whale: SignerWithAddress;

  beforeEach(async () => {
    // Récupération des signers
    [owner, treasury, creator, user1, user2, whale] = await ethers.getSigners();

    // Déploiement du système de taxe
    const TaxSystem = await ethers.getContractFactory("TokenForgeTaxSystem");
    taxSystem = (await TaxSystem.deploy(treasury.address)) as unknown as TokenForgeTaxSystem;
    await taxSystem.waitForDeployment();

    // Déploiement de la Factory
    const Factory = await ethers.getContractFactory("TokenForgeFactory");
    factory = (await Factory.deploy(
      ZeroAddress,
      treasury.address,
      await taxSystem.getAddress()
    )) as unknown as TokenForgeFactory;
    await factory.waitForDeployment();

    // Création d'un token de test avec les fonctionnalités anti-whale
    const createTx = await factory.connect(creator).createToken(
      TEST_TOKEN_PARAMS.name,
      TEST_TOKEN_PARAMS.symbol,
      TEST_TOKEN_PARAMS.totalSupply,
      TEST_TOKEN_PARAMS.maxTxAmount,
      TEST_TOKEN_PARAMS.maxWalletSize,
      TEST_TOKEN_PARAMS.additionalTaxRate
    );
    const receipt = await createTx.wait();
    if (!receipt) throw new Error("Transaction receipt not found");

    const event = receipt.logs.find(
      log => log instanceof ethers.EventLog && log.eventName === "TokenCreated"
    );
    if (!event || !(event instanceof ethers.EventLog)) {
      throw new Error("TokenCreated event not found");
    }

    const tokenAddress = event.args[0] as string;
    if (!tokenAddress) throw new Error("Token address not found in event");

    token = (await ethers.getContractAt("TokenForgeToken", tokenAddress)) as unknown as TokenForgeToken;

    // Transfert de tokens aux utilisateurs pour les tests
    await token.connect(creator).transfer(user1.address, MAX_TX_AMOUNT / 2n);
    await token.connect(creator).transfer(user2.address, MAX_TX_AMOUNT / 2n);
    await token.connect(creator).transfer(whale.address, MAX_WALLET_SIZE / 2n);
  });

  describe("Montant Maximum de Transaction", () => {
    it("devrait imposer le montant maximum de transaction", async () => {
      // Tentative de transfert supérieur au montant maximum
      await expect(
        token.connect(creator).transfer(user1.address, MAX_TX_AMOUNT + 1n)
      ).to.be.revertedWith("Le montant du transfert dépasse maxTxAmount");
    });

    it("devrait autoriser un transfert au montant maximum", async () => {
      await expect(
        token.connect(creator).transfer(user1.address, MAX_TX_AMOUNT)
      ).to.not.be.reverted;
    });

    it("devrait autoriser plusieurs transferts sous le montant maximum", async () => {
      const amount = MAX_TX_AMOUNT / 2n;
      await token.connect(creator).transfer(user1.address, amount);
      await token.connect(creator).transfer(user1.address, amount);
    });
  });

  describe("Taille Maximum du Portefeuille", () => {
    it("devrait imposer la taille maximum du portefeuille", async () => {
      const currentBalance = await token.balanceOf(user1.address);
      const amountToExceed = MAX_WALLET_SIZE - currentBalance + 1n;

      await expect(
        token.connect(creator).transfer(user1.address, amountToExceed)
      ).to.be.revertedWith("Le transfert dépasserait maxWalletSize");
    });

    it("devrait autoriser un transfert jusqu'à la taille maximum", async () => {
      const currentBalance = await token.balanceOf(user1.address);
      const amountToMax = MAX_WALLET_SIZE - currentBalance;

      await expect(
        token.connect(creator).transfer(user1.address, amountToMax)
      ).to.not.be.reverted;
    });

    it("devrait suivre correctement la taille du portefeuille après plusieurs transferts", async () => {
      const amount = MAX_WALLET_SIZE / 20n; // 5% de la taille maximum
      
      // Plusieurs transferts vers le même portefeuille
      await token.connect(creator).transfer(user1.address, amount);
      await token.connect(creator).transfer(user1.address, amount);
      
      const finalBalance = await token.balanceOf(user1.address);
      expect(finalBalance).to.be.lte(MAX_WALLET_SIZE);
    });
  });

  describe("Configuration", () => {
    it("devrait permettre au propriétaire de mettre à jour le montant maximum de transaction", async () => {
      const newMaxTx = BigInt("15000000000000000000000"); // 15,000 tokens
      await token.connect(creator).setMaxTxAmount(newMaxTx);
      expect(await token.maxTxAmount()).to.equal(newMaxTx);
    });

    it("devrait permettre au propriétaire de mettre à jour la taille maximum du portefeuille", async () => {
      const newMaxWallet = BigInt("25000000000000000000000"); // 25,000 tokens
      await token.connect(creator).setMaxWalletSize(newMaxWallet);
      expect(await token.maxWalletSize()).to.equal(newMaxWallet);
    });

    it("ne devrait pas permettre à un non-propriétaire de mettre à jour les limites", async () => {
      const newAmount = ethers.utils.parseEther("15000");
      await expect(
        token.connect(user1).setMaxTxAmount(newAmount)
      ).to.be.revertedWith("Ownable: l'appelant n'est pas le propriétaire");
      
      await expect(
        token.connect(user1).setMaxWalletSize(newAmount)
      ).to.be.revertedWith("Ownable: l'appelant n'est pas le propriétaire");
    });
  });

  describe("Cas Limites", () => {
    it("devrait gérer les transferts qui correspondent exactement aux limites", async () => {
      // Vider le solde de user1
      const user1Balance = await token.balanceOf(user1.address);
      await token.connect(user1).transfer(creator.address, user1Balance);

      // Transfert exactement égal à la taille maximum du portefeuille
      await expect(
        token.connect(creator).transfer(user1.address, MAX_WALLET_SIZE)
      ).to.not.be.reverted;
    });

    it("devrait gérer plusieurs petits transferts approchant les limites", async () => {
      const smallAmount = BigInt("1000000000000000000000"); // 1,000 tokens
      const iterations = 19; // Devrait s'approcher de la taille maximum du portefeuille

      for (let i = 0; i < iterations; i++) {
        await token.connect(creator).transfer(user1.address, smallAmount);
      }

      // Le prochain transfert devrait échouer
      await expect(
        token.connect(creator).transfer(user1.address, smallAmount)
      ).to.be.revertedWith("Le transfert dépasserait maxWalletSize");
    });

    it("devrait maintenir les limites après les destructions de tokens", async () => {
      // Destruction de tokens
      const burnAmount = BigInt("100000000000000000000000"); // 100,000 tokens
      await token.connect(creator).burn(burnAmount);

      // Les limites devraient toujours être appliquées
      await expect(
        token.connect(creator).transfer(user1.address, MAX_TX_AMOUNT + 1n)
      ).to.be.revertedWith("Le montant du transfert dépasse maxTxAmount");
    });
  });
});
