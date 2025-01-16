// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./TokenForgePlans.sol";

/**
 * @title TokenForgeTaxManager
 * @dev Gère la collecte et la distribution des taxes de la forge
 */
contract TokenForgeTaxManager is Ownable, ReentrancyGuard {
    // Constantes pour la distribution des taxes
    uint256 private constant FORGE_TAX_PERCENTAGE = 1; // 1%
    uint256 private constant TOKENFORGE_SHARE = 70;    // 70%
    uint256 private constant DEVELOPMENT_SHARE = 15;   // 15%
    uint256 private constant BUYBACK_SHARE = 10;       // 10%
    uint256 private constant STAKERS_SHARE = 5;        // 5%
    uint256 private constant TOTAL_SHARES = 100;

    // Adresses pour la distribution
    address public tokenForgeWallet;
    address public developmentWallet;
    address public buybackWallet;
    address public stakingContract;
    
    TokenForgePlans public plansContract;
    
    event TaxCollected(address indexed token, uint256 amount);
    event TaxDistributed(
        uint256 tokenForgeAmount,
        uint256 developmentAmount,
        uint256 buybackAmount,
        uint256 stakersAmount
    );

    constructor(
        address _tokenForgeWallet,
        address _developmentWallet,
        address _buybackWallet,
        address _stakingContract,
        address _plansContract
    ) {
        require(_tokenForgeWallet != address(0), "Invalid TokenForge wallet");
        require(_developmentWallet != address(0), "Invalid development wallet");
        require(_buybackWallet != address(0), "Invalid buyback wallet");
        require(_stakingContract != address(0), "Invalid staking contract");
        require(_plansContract != address(0), "Invalid plans contract");

        tokenForgeWallet = _tokenForgeWallet;
        developmentWallet = _developmentWallet;
        buybackWallet = _buybackWallet;
        stakingContract = _stakingContract;
        plansContract = TokenForgePlans(_plansContract);
    }

    /**
     * @dev Calcule le montant de la taxe pour une transaction donnée
     */
    function calculateTax(uint256 amount) public pure returns (uint256) {
        return (amount * FORGE_TAX_PERCENTAGE) / 100;
    }

    /**
     * @dev Collecte et distribue la taxe pour un token
     */
    function collectAndDistributeTax(address token, uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        IERC20 tokenContract = IERC20(token);
        
        // Transfert de la taxe au contrat
        require(tokenContract.transferFrom(msg.sender, address(this), amount), "Tax transfer failed");
        
        emit TaxCollected(token, amount);

        // Calcul des parts
        uint256 tokenForgeAmount = (amount * TOKENFORGE_SHARE) / TOTAL_SHARES;
        uint256 developmentAmount = (amount * DEVELOPMENT_SHARE) / TOTAL_SHARES;
        uint256 buybackAmount = (amount * BUYBACK_SHARE) / TOTAL_SHARES;
        uint256 stakersAmount = (amount * STAKERS_SHARE) / TOTAL_SHARES;

        // Distribution des parts
        require(tokenContract.transfer(tokenForgeWallet, tokenForgeAmount), "TokenForge transfer failed");
        require(tokenContract.transfer(developmentWallet, developmentAmount), "Development transfer failed");
        require(tokenContract.transfer(buybackWallet, buybackAmount), "Buyback transfer failed");
        require(tokenContract.transfer(stakingContract, stakersAmount), "Stakers transfer failed");

        emit TaxDistributed(
            tokenForgeAmount,
            developmentAmount,
            buybackAmount,
            stakersAmount
        );
    }

    /**
     * @dev Vérifie si un utilisateur est exempté de taxe
     */
    function isTaxExempt(address user) public view returns (bool) {
        TokenForgePlans.PlanType userPlan = plansContract.getUserPlan(user);
        return userPlan == TokenForgePlans.PlanType.MaitreForgeron;
    }

    // Fonctions administratives
    function updateTokenForgeWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Invalid address");
        tokenForgeWallet = newWallet;
    }

    function updateDevelopmentWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Invalid address");
        developmentWallet = newWallet;
    }

    function updateBuybackWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Invalid address");
        buybackWallet = newWallet;
    }

    function updateStakingContract(address newContract) external onlyOwner {
        require(newContract != address(0), "Invalid address");
        stakingContract = newContract;
    }
}
