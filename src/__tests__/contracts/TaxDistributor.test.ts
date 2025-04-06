import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("TaxDistributor", () => {
  let taxDistributor: Contract;
  let token: Contract;
  let owner: SignerWithAddress;
  let treasury: SignerWithAddress;
  let development: SignerWithAddress;
  let buyback: SignerWithAddress;
  let staking: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const INITIAL_SUPPLY = ethers.BigNumber.from("1000000000000000000000000");
  const TEST_TRANSFER = ethers.BigNumber.from("1000000000000000000000");

  beforeEach(async () => {
    [owner, treasury, development, buyback, staking, user1, user2] =
      await ethers.getSigners();

    // Deploy TaxDistributor
    const TaxDistributorFactory = await ethers.getContractFactory(
      "TaxDistributor"
    );
    taxDistributor = await TaxDistributorFactory.deploy(
      treasury.address,
      development.address,
      buyback.address,
      staking.address
    );
    await taxDistributor.deployed();

    // Deploy Token
    const TokenFactory = await ethers.getContractFactory("TokenForgeToken");
    token = await TokenFactory.deploy(
      "Test Token",
      "TEST",
      18,
      INITIAL_SUPPLY,
      true,
      true,
      treasury.address
    );
    await token.deployed();
  });

  describe("Distribution", () => {
    it("should correctly distribute taxes according to percentages", async () => {
      // Transfer tokens to generate tax
      await token.transfer(user1.address, TEST_TRANSFER);

      // Calculate expected tax
      const taxAmount = TEST_TRANSFER.mul(100).div(10000); // 1%

      // Calculate expected distributions
      const treasuryShare = taxAmount.mul(7000).div(10000);
      const developmentShare = taxAmount.mul(1500).div(10000);
      const buybackShare = taxAmount.mul(1000).div(10000);
      const stakingShare = taxAmount.mul(500).div(10000);

      // Get initial balances
      const initialTreasuryBalance = await token.balanceOf(treasury.address);
      const initialDevBalance = await token.balanceOf(development.address);
      const initialBuybackBalance = await token.balanceOf(buyback.address);
      const initialStakingBalance = await token.balanceOf(staking.address);

      // Distribute taxes
      await expect(taxDistributor.distributeTaxes(token.address))
        .to.emit(taxDistributor, "TaxDistributed")
        .withArgs(treasuryShare, developmentShare, buybackShare, stakingShare);

      // Check final balances
      expect(await token.balanceOf(treasury.address)).to.equal(
        initialTreasuryBalance.add(treasuryShare)
      );
      expect(await token.balanceOf(development.address)).to.equal(
        initialDevBalance.add(developmentShare)
      );
      expect(await token.balanceOf(buyback.address)).to.equal(
        initialBuybackBalance.add(buybackShare)
      );
      expect(await token.balanceOf(staking.address)).to.equal(
        initialStakingBalance.add(stakingShare)
      );
    });

    it("should prevent distribution when no taxes collected", async () => {
      await expect(
        taxDistributor.distributeTaxes(token.address)
      ).to.be.rejectedWith("No taxes to distribute");
    });

    it("should emit TaxDistributed event with correct amounts", async () => {
      await token.transfer(user1.address, TEST_TRANSFER);

      const taxAmount = TEST_TRANSFER.mul(100).div(10000);
      const treasuryShare = taxAmount.mul(7000).div(10000);
      const developmentShare = taxAmount.mul(1500).div(10000);
      const buybackShare = taxAmount.mul(1000).div(10000);
      const stakingShare = taxAmount.mul(500).div(10000);

      await expect(taxDistributor.distributeTaxes(token.address))
        .to.emit(taxDistributor, "TaxDistributed")
        .withArgs(treasuryShare, developmentShare, buybackShare, stakingShare);
    });
  });

  describe("Admin Functions", () => {
    it("should allow owner to update treasury wallet", async () => {
      const newTreasury = user1.address;
      await expect(taxDistributor.setTreasuryWallet(newTreasury))
        .to.emit(taxDistributor, "WalletUpdated")
        .withArgs("Treasury", treasury.address, newTreasury);

      expect(await taxDistributor.treasuryWallet()).to.equal(newTreasury);
    });

    it("should prevent non-owner from updating wallets", async () => {
      await expect(
        taxDistributor.connect(user1).setTreasuryWallet(user2.address)
      ).to.be.rejectedWith("Ownable: caller is not the owner");
    });

    it("should prevent setting zero address as wallet", async () => {
      await expect(
        taxDistributor.setTreasuryWallet(ethers.constants.AddressZero)
      ).to.be.rejectedWith("New wallet cannot be zero");
    });
  });
});
