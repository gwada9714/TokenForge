import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import type {
  TokenForgeTaxSystem,
  TokenForgeToken,
  TaxDistributor,
} from "../../../typechain-types";
import { ZeroAddress } from "ethers";
import {
  INITIAL_SUPPLY,
  BASE_TAX_RATE,
  MAX_ADDITIONAL_TAX_RATE,
  TEST_TOKEN_PARAMS,
} from "./constants";

describe("Système de Taxe TokenForge", () => {
  let taxSystem: TokenForgeTaxSystem;
  let token: TokenForgeToken;
  let taxDistributor: TaxDistributor;
  let owner: SignerWithAddress;
  let treasury: SignerWithAddress;
  let creator: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  beforeEach(async () => {
    [owner, treasury, creator, user1, user2] = await ethers.getSigners();

    // Déploiement du système de taxe
    const TaxSystem = await ethers.getContractFactory("TokenForgeTaxSystem");
    taxSystem = (await TaxSystem.deploy(
      treasury.address
    )) as unknown as TokenForgeTaxSystem;
    await taxSystem.waitForDeployment();

    // Déploiement du token
    const Token = await ethers.getContractFactory("TokenForgeToken");
    token = (await Token.deploy(
      TEST_TOKEN_PARAMS.name,
      TEST_TOKEN_PARAMS.symbol,
      TEST_TOKEN_PARAMS.decimals,
      TEST_TOKEN_PARAMS.totalSupply,
      TEST_TOKEN_PARAMS.maxTxAmount,
      TEST_TOKEN_PARAMS.maxWalletSize,
      await taxSystem.getAddress()
    )) as unknown as TokenForgeToken;
    await token.waitForDeployment();

    // Configuration de la taxe pour le token
    await taxSystem.configureTax(
      await token.getAddress(),
      100n,
      creator.address
    ); // 1% de taxe additionnelle

    // Transfert de tokens aux utilisateurs pour les tests
    await token.transfer(user1.address, INITIAL_SUPPLY / 10n);
    await token.transfer(user2.address, INITIAL_SUPPLY / 10n);
  });

  describe("Configuration de la Taxe", () => {
    it("devrait avoir le bon taux de taxe de base", async () => {
      expect(await taxSystem.BASE_TAX_RATE()).to.equal(BASE_TAX_RATE);
    });

    it("devrait avoir le bon taux de taxe additionnel maximum", async () => {
      expect(await taxSystem.MAX_ADDITIONAL_TAX_RATE()).to.equal(
        MAX_ADDITIONAL_TAX_RATE
      );
    });

    it("ne devrait pas permettre un taux de taxe additionnel supérieur au maximum", async () => {
      await expect(
        taxSystem.configureTax(
          await token.getAddress(),
          MAX_ADDITIONAL_TAX_RATE + 1n,
          creator.address
        )
      ).to.be.rejectedWith("Taux de taxe trop élevé");
    });
  });

  describe("Calcul de la Taxe", () => {
    it("devrait calculer correctement les montants de taxe", async () => {
      const amount = INITIAL_SUPPLY / 100n; // 1% du supply total
      const [baseTax, additionalTax] = await taxSystem.calculateTaxAmounts(
        await token.getAddress(),
        amount
      );

      // La taxe de base devrait être de 0.5%
      expect(baseTax).to.equal((amount * BASE_TAX_RATE) / 10000n);

      // La taxe additionnelle devrait être de 1%
      expect(additionalTax).to.equal((amount * 100n) / 10000n);
    });
  });

  describe("Collection des Taxes", () => {
    it("devrait collecter et distribuer correctement les taxes", async () => {
      const transferAmount = INITIAL_SUPPLY / 100n; // 1% du supply total
      const expectedBaseTax = (transferAmount * BASE_TAX_RATE) / 10000n;
      const expectedAdditionalTax = (transferAmount * 100n) / 10000n;
      const expectedTransferAmount =
        transferAmount - expectedBaseTax - expectedAdditionalTax;

      // Obtention des soldes initiaux
      const initialTreasuryBalance = await token.balanceOf(treasury.address);
      const initialCreatorBalance = await token.balanceOf(creator.address);
      const initialUser2Balance = await token.balanceOf(user2.address);

      // Exécution du transfert
      await token.connect(user1).transfer(user2.address, transferAmount);

      // Vérification des soldes finaux
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

    it("devrait gérer correctement l'absence de taxe additionnelle", async () => {
      // Déploiement d'un nouveau token sans taxe additionnelle
      const Token = await ethers.getContractFactory("TokenForgeToken");
      const noTaxToken = await Token.deploy(
        "Token Sans Taxe Additionnelle",
        "TST",
        18,
        INITIAL_SUPPLY,
        INITIAL_SUPPLY,
        INITIAL_SUPPLY,
        await taxSystem.getAddress()
      );
      await noTaxToken.waitForDeployment();

      // Transfert de tokens à user1
      await noTaxToken.transfer(user1.address, INITIAL_SUPPLY / 10n);

      const transferAmount = INITIAL_SUPPLY / 100n;
      const expectedBaseTax = (transferAmount * BASE_TAX_RATE) / 10000n;
      const expectedTransferAmount = transferAmount - expectedBaseTax;

      // Obtention des soldes initiaux
      const initialTreasuryBalance = await noTaxToken.balanceOf(
        treasury.address
      );
      const initialUser2Balance = await noTaxToken.balanceOf(user2.address);

      // Exécution du transfert
      await noTaxToken.connect(user1).transfer(user2.address, transferAmount);

      // Vérification des soldes finaux
      expect(await noTaxToken.balanceOf(treasury.address)).to.equal(
        initialTreasuryBalance + expectedBaseTax
      );
      expect(await noTaxToken.balanceOf(user2.address)).to.equal(
        initialUser2Balance + expectedTransferAmount
      );
    });
  });

  describe("Cas Limites", () => {
    it("devrait gérer le montant de transfert minimum", async () => {
      const minAmount = 1000n;
      await token.connect(user1).transfer(user2.address, minAmount);
      // Si pas de revert, le test passe
    });

    it("devrait gérer le montant de transfert maximum", async () => {
      const maxAmount = INITIAL_SUPPLY / 10n;
      await token.connect(user1).transfer(user2.address, maxAmount);
      // Si pas de revert, le test passe
    });

    it("devrait échouer pour un destinataire à l'adresse zéro", async () => {
      await expect(
        token.connect(user1).transfer(ethers.ZeroAddress, INITIAL_SUPPLY / 100n)
      ).to.be.rejectedWith("Transfert vers l'adresse zéro");
    });
  });
});
