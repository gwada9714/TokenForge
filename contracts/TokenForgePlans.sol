// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract TokenForgePlans is Ownable, ReentrancyGuard {
    enum PlanType { Apprenti, Forgeron, MaitreForgeron }
    
    struct Plan {
        string name;
        uint256 price;
        bool isActive;
    }
    
    mapping(PlanType => Plan) public plans;
    mapping(address => PlanType) public userPlans;
    
    event PlanPurchased(address indexed user, PlanType planType, uint256 price);
    event PlanPriceUpdated(PlanType planType, uint256 newPrice);
    
    constructor() {
        // Initialisation des plans
        plans[PlanType.Apprenti] = Plan("Apprenti Forgeron", 0, true);
        plans[PlanType.Forgeron] = Plan("Forgeron", 0.3 ether, true);
        plans[PlanType.MaitreForgeron] = Plan("Maitre Forgeron", 1 ether, true);
    }
    
    function purchasePlan(PlanType planType) external payable nonReentrant {
        require(plans[planType].isActive, "Plan not available");
        require(msg.value >= plans[planType].price, "Insufficient payment");
        
        userPlans[msg.sender] = planType;
        
        emit PlanPurchased(msg.sender, planType, msg.value);
        
        // Remboursement du surplus si nécessaire
        if (msg.value > plans[planType].price) {
            payable(msg.sender).transfer(msg.value - plans[planType].price);
        }
    }
    
    function updatePlanPrice(PlanType planType, uint256 newPrice) external onlyOwner {
        plans[planType].price = newPrice;
        emit PlanPriceUpdated(planType, newPrice);
    }
    
    function getUserPlan(address user) external view returns (PlanType) {
        return userPlans[user];
    }
    
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
