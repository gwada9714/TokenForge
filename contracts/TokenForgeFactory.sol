// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./TokenForgeToken.sol";
import "./interfaces/ITokenForgeToken.sol";
import "./TokenForgePlans.sol";
import "./TokenForgeTKN.sol";

// Interface simplifiée pour les tokens ERC20
interface ITokenForgeERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract TokenForgeFactory {
    // Storage variables
    address public immutable factory_owner;
    TokenForgePlans public immutable plans;
    TokenForgeTKN public immutable tknToken;
    bool private initialized;

    // Struct pour les paramètres de création de token
    struct TokenParams {
        string name;
        string symbol;
        address treasury;
        address stakingPool;
        uint256 initialTaxRate;  // en points de base (1% = 100)
        bool enableForgeTax;     // Activer la taxe de la forge
    }

    // Events
    event TokenCreated(
        address indexed token,
        string name,
        string symbol,
        address treasury,
        address stakingPool,
        uint256 taxRate,
        bool forgeTaxEnabled
    );
    event TokenRescued(address indexed token, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == factory_owner, "Not owner");
        _;
    }

    constructor(
        address _plans,
        address _tknToken
    ) {
        require(_plans != address(0), "Invalid plans address");
        require(_tknToken != address(0), "Invalid TKN address");
        factory_owner = msg.sender;
        plans = TokenForgePlans(_plans);
        tknToken = TokenForgeTKN(_tknToken);
    }

    function initialize() external onlyOwner {
        require(!initialized, "Already initialized");
        initialized = true;
    }

    function createToken(TokenParams memory params) external returns (address) {
        require(initialized, "Not initialized");
        // Vérifier le plan de l'utilisateur
        TokenForgePlans.PlanType userPlan = plans.getUserPlan(msg.sender);
        
        // Vérifier les restrictions selon le plan
        if (userPlan == TokenForgePlans.PlanType.Apprenti) {
            require(params.initialTaxRate == 0, "Apprenti: No tax allowed");
            require(!params.enableForgeTax, "Apprenti: No forge tax allowed");
        }
        
        // Pour le plan Maître Forgeron, la taxe de la forge est activée par défaut
        (bool includesAudit, bool defaultForgeTax) = plans.getPlanFeatures(userPlan);
        if (defaultForgeTax) {
            params.enableForgeTax = true;
        }

        // Créer le token avec les paramètres spécifiés
        TokenForgeToken newToken = new TokenForgeToken(
            params.name,
            params.symbol,
            params.treasury,
            params.stakingPool,
            params.initialTaxRate,
            params.enableForgeTax ? address(tknToken) : address(0)
        );

        emit TokenCreated(
            address(newToken),
            params.name,
            params.symbol,
            params.treasury,
            params.stakingPool,
            params.initialTaxRate,
            params.enableForgeTax
        );

        return address(newToken);
    }

    function rescueTokens(address token) external onlyOwner {
        ITokenForgeERC20 tokenContract = ITokenForgeERC20(token);
        uint256 balance = tokenContract.balanceOf(address(this));
        require(balance > 0, "No tokens to rescue");
        require(tokenContract.transfer(factory_owner, balance), "Transfer failed");
        emit TokenRescued(token, balance);
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