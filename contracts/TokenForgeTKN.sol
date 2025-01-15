// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenForgeTKN is ERC20, Ownable, ReentrancyGuard {
    // Constantes pour la distribution des tokens
    uint256 public constant TOTAL_SUPPLY = 100_000_000 * 10**18; // 100M tokens
    uint256 public constant TEAM_ALLOCATION = 15_000_000 * 10**18; // 15%
    uint256 public constant MARKETING_ALLOCATION = 10_000_000 * 10**18; // 10%
    uint256 public constant ECOSYSTEM_ALLOCATION = 25_000_000 * 10**18; // 25%
    uint256 public constant IDO_ALLOCATION = 50_000_000 * 10**18; // 50%

    // Adresses des wallets de distribution
    address public teamWallet;
    address public marketingWallet;
    address public ecosystemWallet;
    address public stakingContract;

    // Variables pour le mécanisme de burn
    uint256 public totalBurned;
    
    // Variables pour la taxe de la forge
    struct ForgeConfig {
        uint256 platformShare; // 50% - pour TokenForge
        uint256 governanceShare; // 25% - pour le fonds de développement
        uint256 burnShare; // 15% - pour le burn
        uint256 stakingShare; // 10% - pour les stakers
    }
    
    ForgeConfig public forgeConfig;
    
    event TokensBurned(uint256 amount);
    event ForgeFeesDistributed(
        uint256 platformAmount,
        uint256 governanceAmount,
        uint256 burnAmount,
        uint256 stakingAmount
    );

    constructor(
        address _teamWallet,
        address _marketingWallet,
        address _ecosystemWallet
    ) ERC20("TokenForge", "TKN") {
        require(_teamWallet != address(0), "Invalid team wallet");
        require(_marketingWallet != address(0), "Invalid marketing wallet");
        require(_ecosystemWallet != address(0), "Invalid ecosystem wallet");

        teamWallet = _teamWallet;
        marketingWallet = _marketingWallet;
        ecosystemWallet = _ecosystemWallet;

        // Configuration initiale de la distribution des taxes
        forgeConfig = ForgeConfig({
            platformShare: 5000, // 50%
            governanceShare: 2500, // 25%
            burnShare: 1500, // 15%
            stakingShare: 1000 // 10%
        });

        // Distribution initiale des tokens
        _mint(teamWallet, TEAM_ALLOCATION);
        _mint(marketingWallet, MARKETING_ALLOCATION);
        _mint(ecosystemWallet, ECOSYSTEM_ALLOCATION);
        _mint(address(this), IDO_ALLOCATION); // Réservé pour l'IDO
    }

    function setStakingContract(address _stakingContract) external onlyOwner {
        require(_stakingContract != address(0), "Invalid staking contract");
        stakingContract = _stakingContract;
    }

    function distributeForgeFeesFrom(address from, uint256 amount) external {
        require(msg.sender == address(this) || msg.sender == owner(), "Unauthorized");
        
        uint256 platformAmount = (amount * forgeConfig.platformShare) / 10000;
        uint256 governanceAmount = (amount * forgeConfig.governanceShare) / 10000;
        uint256 burnAmount = (amount * forgeConfig.burnShare) / 10000;
        uint256 stakingAmount = (amount * forgeConfig.stakingShare) / 10000;

        // Transfert des parts
        _transfer(from, owner(), platformAmount);
        _transfer(from, ecosystemWallet, governanceAmount);
        _burn(from, burnAmount);
        if (stakingContract != address(0)) {
            _transfer(from, stakingContract, stakingAmount);
        } else {
            _burn(from, stakingAmount); // Si pas de contrat de staking, on brûle
        }

        totalBurned += burnAmount;

        emit ForgeFeesDistributed(
            platformAmount,
            governanceAmount,
            burnAmount,
            stakingAmount
        );
    }

    // Fonction pour permettre l'IDO
    function startIDO(address idoContract) external onlyOwner {
        require(idoContract != address(0), "Invalid IDO contract");
        uint256 idoBalance = balanceOf(address(this));
        _transfer(address(this), idoContract, idoBalance);
    }
}
