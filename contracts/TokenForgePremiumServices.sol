// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./TokenForgePlans.sol";
import "./TokenForgeLaunchpad.sol";
import "./TokenForgeStaking.sol";

/**
 * @title TokenForgePremiumServices
 * @dev Gère l'accès et la tarification des services premium
 */
contract TokenForgePremiumServices is Ownable, ReentrancyGuard {
    struct ServicePricing {
        uint256 basePrice;    // Prix de base en ETH
        uint256 setupFee;     // Frais de configuration uniques
        uint256 monthlyFee;   // Frais mensuels
        bool isActive;        // Si le service est actuellement disponible
    }

    struct UserSubscription {
        uint256 startTime;
        uint256 endTime;
        bool isActive;
    }

    TokenForgePlans public plansContract;
    TokenForgeLaunchpad public launchpadContract;
    TokenForgeStaking public stakingContract;
    IERC20 public tknToken;

    // Mapping des prix pour chaque service
    mapping(bytes32 => ServicePricing) public servicePricing;
    // Mapping des abonnements utilisateur pour chaque service
    mapping(address => mapping(bytes32 => UserSubscription)) public userSubscriptions;

    bytes32 public constant LAUNCHPAD_SERVICE = keccak256("LAUNCHPAD");
    bytes32 public constant STAKING_SERVICE = keccak256("STAKING");

    event ServiceSubscribed(address indexed user, bytes32 indexed serviceId, uint256 duration);
    event ServicePriceUpdated(bytes32 indexed serviceId, uint256 basePrice, uint256 setupFee, uint256 monthlyFee);
    event ServiceActivated(bytes32 indexed serviceId);
    event ServiceDeactivated(bytes32 indexed serviceId);

    constructor(
        address _plansContract,
        address _launchpadContract,
        address _stakingContract,
        address _tknToken
    ) {
        plansContract = TokenForgePlans(_plansContract);
        launchpadContract = TokenForgeLaunchpad(_launchpadContract);
        stakingContract = TokenForgeStaking(_stakingContract);
        tknToken = IERC20(_tknToken);

        // Initialisation des prix des services
        servicePricing[LAUNCHPAD_SERVICE] = ServicePricing({
            basePrice: 3 ether,
            setupFee: 0.5 ether,
            monthlyFee: 0.1 ether,
            isActive: true
        });

        servicePricing[STAKING_SERVICE] = ServicePricing({
            basePrice: 2 ether,
            setupFee: 0.3 ether,
            monthlyFee: 0.05 ether,
            isActive: true
        });
    }

    /**
     * @dev Souscrit à un service premium
     * @param serviceId Identifiant du service
     * @param months Durée de l'abonnement en mois
     */
    function subscribeToService(bytes32 serviceId, uint256 months) external payable nonReentrant {
        require(months > 0, "Invalid duration");
        require(servicePricing[serviceId].isActive, "Service not available");
        require(plansContract.getUserPlan(msg.sender) == TokenForgePlans.PlanType.MaitreForgeron, 
                "Must be Maitre Forgeron");

        ServicePricing memory pricing = servicePricing[serviceId];
        uint256 totalCost = pricing.basePrice + pricing.setupFee + (pricing.monthlyFee * months);
        require(msg.value >= totalCost, "Insufficient payment");

        // Mise à jour de l'abonnement
        UserSubscription storage sub = userSubscriptions[msg.sender][serviceId];
        if (sub.isActive) {
            sub.endTime += months * 30 days;
        } else {
            sub.startTime = block.timestamp;
            sub.endTime = block.timestamp + (months * 30 days);
            sub.isActive = true;
        }

        emit ServiceSubscribed(msg.sender, serviceId, months);

        // Remboursement du surplus
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
    }

    /**
     * @dev Vérifie si un utilisateur a accès à un service
     */
    function hasServiceAccess(address user, bytes32 serviceId) public view returns (bool) {
        UserSubscription memory sub = userSubscriptions[user][serviceId];
        return sub.isActive && block.timestamp <= sub.endTime;
    }

    /**
     * @dev Calcule le coût total pour un service
     */
    function calculateServiceCost(bytes32 serviceId, uint256 months) public view returns (uint256) {
        ServicePricing memory pricing = servicePricing[serviceId];
        return pricing.basePrice + pricing.setupFee + (pricing.monthlyFee * months);
    }

    // Fonctions administratives
    function updateServicePricing(
        bytes32 serviceId,
        uint256 basePrice,
        uint256 setupFee,
        uint256 monthlyFee
    ) external onlyOwner {
        servicePricing[serviceId].basePrice = basePrice;
        servicePricing[serviceId].setupFee = setupFee;
        servicePricing[serviceId].monthlyFee = monthlyFee;

        emit ServicePriceUpdated(serviceId, basePrice, setupFee, monthlyFee);
    }

    function toggleService(bytes32 serviceId) external onlyOwner {
        servicePricing[serviceId].isActive = !servicePricing[serviceId].isActive;
        
        if (servicePricing[serviceId].isActive) {
            emit ServiceActivated(serviceId);
        } else {
            emit ServiceDeactivated(serviceId);
        }
    }

    // Fonction de retrait des fonds
    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }
}
