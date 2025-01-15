// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title TaxDistributor
 * @dev Manages the automatic distribution of collected taxes according to the 70/15/10/5 model
 */
contract TaxDistributor is Ownable, ReentrancyGuard {
    // Distribution percentages (in basis points, 100 = 1%)
    uint256 public constant TREASURY_SHARE = 7000; // 70%
    uint256 public constant DEVELOPMENT_SHARE = 1500; // 15%
    uint256 public constant BUYBACK_SHARE = 1000; // 10%
    uint256 public constant STAKING_SHARE = 500; // 5%
    
    // Destination addresses
    address public treasuryWallet;
    address public developmentWallet;
    address public buybackWallet;
    address public stakingContract;
    
    // Statistics
    uint256 public totalDistributed;
    uint256 public lastDistributionTime;
    
    // Events
    event TaxDistributed(
        uint256 treasuryAmount,
        uint256 developmentAmount,
        uint256 buybackAmount,
        uint256 stakingAmount
    );
    
    event WalletUpdated(string walletType, address oldWallet, address newWallet);
    
    /**
     * @dev Constructor to set initial wallet addresses
     */
    constructor(
        address _treasuryWallet,
        address _developmentWallet,
        address _buybackWallet,
        address _stakingContract
    ) {
        require(_treasuryWallet != address(0), "Treasury wallet cannot be zero");
        require(_developmentWallet != address(0), "Development wallet cannot be zero");
        require(_buybackWallet != address(0), "Buyback wallet cannot be zero");
        require(_stakingContract != address(0), "Staking contract cannot be zero");
        
        treasuryWallet = _treasuryWallet;
        developmentWallet = _developmentWallet;
        buybackWallet = _buybackWallet;
        stakingContract = _stakingContract;
    }
    
    /**
     * @dev Distributes collected taxes according to the defined percentages
     * @param token The token address to distribute
     */
    function distributeTaxes(address token) external nonReentrant {
        require(token != address(0), "Invalid token address");
        IERC20 tokenContract = IERC20(token);
        uint256 balance = tokenContract.balanceOf(address(this));
        require(balance > 0, "No taxes to distribute");
        
        // Calculate shares
        uint256 treasuryAmount = (balance * TREASURY_SHARE) / 10000;
        uint256 developmentAmount = (balance * DEVELOPMENT_SHARE) / 10000;
        uint256 buybackAmount = (balance * BUYBACK_SHARE) / 10000;
        uint256 stakingAmount = (balance * STAKING_SHARE) / 10000;
        
        // Transfer shares
        require(tokenContract.transfer(treasuryWallet, treasuryAmount), "Treasury transfer failed");
        require(tokenContract.transfer(developmentWallet, developmentAmount), "Development transfer failed");
        require(tokenContract.transfer(buybackWallet, buybackAmount), "Buyback transfer failed");
        require(tokenContract.transfer(stakingContract, stakingAmount), "Staking transfer failed");
        
        // Update statistics
        totalDistributed += balance;
        lastDistributionTime = block.timestamp;
        
        emit TaxDistributed(
            treasuryAmount,
            developmentAmount,
            buybackAmount,
            stakingAmount
        );
    }
    
    // Admin functions to update wallet addresses
    function setTreasuryWallet(address _newWallet) external onlyOwner {
        require(_newWallet != address(0), "New wallet cannot be zero");
        address oldWallet = treasuryWallet;
        treasuryWallet = _newWallet;
        emit WalletUpdated("Treasury", oldWallet, _newWallet);
    }
    
    function setDevelopmentWallet(address _newWallet) external onlyOwner {
        require(_newWallet != address(0), "New wallet cannot be zero");
        address oldWallet = developmentWallet;
        developmentWallet = _newWallet;
        emit WalletUpdated("Development", oldWallet, _newWallet);
    }
    
    function setBuybackWallet(address _newWallet) external onlyOwner {
        require(_newWallet != address(0), "New wallet cannot be zero");
        address oldWallet = buybackWallet;
        buybackWallet = _newWallet;
        emit WalletUpdated("Buyback", oldWallet, _newWallet);
    }
    
    function setStakingContract(address _newContract) external onlyOwner {
        require(_newContract != address(0), "New contract cannot be zero");
        address oldContract = stakingContract;
        stakingContract = _newContract;
        emit WalletUpdated("Staking", oldContract, _newContract);
    }
    
    // View functions for monitoring
    function getDistributionInfo() external view returns (
        uint256 _totalDistributed,
        uint256 _lastDistributionTime,
        address _treasuryWallet,
        address _developmentWallet,
        address _buybackWallet,
        address _stakingContract
    ) {
        return (
            totalDistributed,
            lastDistributionTime,
            treasuryWallet,
            developmentWallet,
            buybackWallet,
            stakingContract
        );
    }
}
