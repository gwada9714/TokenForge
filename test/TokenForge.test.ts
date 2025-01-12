import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { 
    TokenForgeFactory,
    TokenForgeToken,
    MockStablecoin 
} from "../typechain";

describe("TokenForge", function () {
    let factory: TokenForgeFactory;
    let stablecoin: MockStablecoin;
    let owner: SignerWithAddress;
    let user: SignerWithAddress;
    const CREATION_FEE = ethers.utils.parseUnits("100", 6); // 100 USDT

    beforeEach(async function () {
        [owner, user] = await ethers.getSigners();
        
        // Déployer le mock stablecoin
        const MockStablecoin = await ethers.getContractFactory("MockStablecoin");
        stablecoin = await MockStablecoin.deploy();
        await stablecoin.deployed();
        
        // Déployer la factory
        const Factory = await ethers.getContractFactory("TokenForgeFactory");
        factory = await Factory.deploy(stablecoin.address, CREATION_FEE);
        await factory.deployed();
        
        // Donner des stablecoins au user
        await stablecoin.mint(user.address, CREATION_FEE.mul(2));
        await stablecoin.connect(user).approve(factory.address, CREATION_FEE.mul(2));
    });

    describe("Token Creation", function () {
        it("Should create a new token with correct parameters", async function () {
            const tx = await factory.connect(user).createToken(
                "Test Token",
                "TEST",
                18,
                ethers.utils.parseEther("1000000"),
                true,
                true,
                true
            );
            
            const receipt = await tx.wait();
            const event = receipt.events?.find(e => e.event === "TokenCreated");
            expect(event).to.not.be.undefined;
            
            const tokenAddress = event?.args?.tokenAddress;
            const token = await ethers.getContractAt("TokenForgeToken", tokenAddress);
            
            expect(await token.name()).to.equal("Test Token");
            expect(await token.symbol()).to.equal("TEST");
            expect(await token.decimals()).to.equal(18);
            expect(await token.totalSupply()).to.equal(
                ethers.utils.parseEther("1000000")
            );
            expect(await token.owner()).to.equal(user.address);
        });
        
        // Ajouter plus de tests...
    });
}); 