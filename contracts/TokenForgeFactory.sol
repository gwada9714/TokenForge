// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./TokenForgeToken.sol";
import "./interfaces/ITokenForgeToken.sol";

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract TokenForgeFactory {
    // Storage variables
    address public immutable factory_owner;
    address public immutable stablecoinAddress;
    bool private initialized;

    // Struct pour les paramètres de création de token
    struct TokenParams {
        string name;
        string symbol;
        address treasury;
        address stakingPool;
        uint256 initialTaxRate;  // en points de base (1% = 100)
    }

    // Events
    event TokenCreated(
        address indexed token,
        string name,
        string symbol,
        address treasury,
        address stakingPool,
        uint256 taxRate
    );
    event TokenRescued(address indexed token, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == factory_owner, "Not owner");
        _;
    }

    constructor(address _stablecoinAddress) {
        require(_stablecoinAddress != address(0), "Invalid address");
        factory_owner = msg.sender;
        stablecoinAddress = _stablecoinAddress;
    }

    function initialize() external onlyOwner {
        require(!initialized, "Already initialized");
        initialized = true;
    }

    function createToken(TokenParams calldata params) external returns (address) {
        require(initialized, "Not initialized");
        require(params.treasury != address(0), "Invalid treasury");
        require(params.stakingPool != address(0), "Invalid staking pool");
        require(params.initialTaxRate <= 100, "Tax rate too high"); // Max 1%
        require(bytes(params.name).length > 0, "Empty name");
        require(bytes(params.symbol).length > 0, "Empty symbol");
        
        // Deploy new token
        TokenForgeToken token = new TokenForgeToken(
            params.treasury,
            params.stakingPool
        );

        // Configure le taux de taxe initial
        token.setTaxRate(params.initialTaxRate);
        
        emit TokenCreated(
            address(token),
            params.name,
            params.symbol,
            params.treasury,
            params.stakingPool,
            params.initialTaxRate
        );
        
        return address(token);
    }
    
    // Fonction d'urgence pour récupérer les tokens bloqués
    function rescueTokens(address token) external onlyOwner {
        uint256 tokenBalance = IERC20(token).balanceOf(address(this));
        require(tokenBalance > 0, "No tokens to rescue");
        require(IERC20(token).transfer(factory_owner, tokenBalance), "Transfer failed");
        emit TokenRescued(token, tokenBalance);
    }

    // Getters utiles
    function isInitialized() external view returns (bool) {
        return initialized;
    }

    function getTokenInfo(address tokenAddress) external view returns (
        string memory name,
        string memory symbol,
        address treasury,
        address stakingPool,
        uint256 taxRate
    ) {
        ITokenForgeToken token = ITokenForgeToken(tokenAddress);
        return (
            token.name(),
            token.symbol(),
            token.treasury(),
            token.stakingPool(),
            token.taxRate()
        );
    }
}