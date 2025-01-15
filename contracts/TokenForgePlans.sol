// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TokenForgePlans is Ownable, ReentrancyGuard {
    enum PlanType { Apprenti, Forgeron, MaitreForgeron }
    
    struct Plan {
        string name;
        uint256 bnbPrice;
        uint256 tknPrice;  // Prix en tokens TKN
        bool isActive;
        bool includesAudit;
        bool defaultForgeTax;
    }
    
    IERC20 public tknToken;
    mapping(PlanType => Plan) public plans;
    mapping(address => PlanType) public userPlans;
    
    event PlanPurchased(address indexed user, PlanType planType, uint256 price, bool paidInTKN);
    event PlanPriceUpdated(PlanType planType, uint256 newBnbPrice, uint256 newTknPrice);
    
    constructor(address _tknToken) {
        require(_tknToken != address(0), "Invalid TKN token address");
        tknToken = IERC20(_tknToken);
        
        // Initialisation des plans avec prix BNB et TKN
        plans[PlanType.Apprenti] = Plan("Apprenti Forgeron", 0, 0, true, false, false);
        plans[PlanType.Forgeron] = Plan("Forgeron", 0.3 ether, 1000 * 10**18, true, false, false);
        plans[PlanType.MaitreForgeron] = Plan("Maitre Forgeron", 1 ether, 3000 * 10**18, true, true, true);
    }
    
    function purchasePlanWithBNB(PlanType planType) external payable nonReentrant {
        require(plans[planType].isActive, "Plan not available");
        require(msg.value >= plans[planType].bnbPrice, "Insufficient BNB payment");
        
        _assignPlan(msg.sender, planType);
        
        emit PlanPurchased(msg.sender, planType, msg.value, false);
        
        // Remboursement du surplus si nécessaire
        if (msg.value > plans[planType].bnbPrice) {
            payable(msg.sender).transfer(msg.value - plans[planType].bnbPrice);
        }
    }

    function purchasePlanWithTKN(PlanType planType) external nonReentrant {
        require(plans[planType].isActive, "Plan not available");
        uint256 tknAmount = plans[planType].tknPrice;
        require(tknToken.balanceOf(msg.sender) >= tknAmount, "Insufficient TKN balance");
        
        require(tknToken.transferFrom(msg.sender, address(this), tknAmount), "TKN transfer failed");
        
        _assignPlan(msg.sender, planType);
        
        emit PlanPurchased(msg.sender, planType, tknAmount, true);
    }
    
    function _assignPlan(address user, PlanType planType) internal {
        userPlans[user] = planType;
    }
    
    function updatePlanPrices(
        PlanType planType, 
        uint256 newBnbPrice, 
        uint256 newTknPrice
    ) external onlyOwner {
        plans[planType].bnbPrice = newBnbPrice;
        plans[planType].tknPrice = newTknPrice;
        emit PlanPriceUpdated(planType, newBnbPrice, newTknPrice);
    }
    
    function getUserPlan(address user) external view returns (PlanType) {
        return userPlans[user];
    }

    function getPlanFeatures(PlanType planType) external view returns (
        bool includesAudit,
        bool defaultForgeTax
    ) {
        Plan memory plan = plans[planType];
        return (plan.includesAudit, plan.defaultForgeTax);
    }
    
    // Fonction pour retirer les tokens TKN collectés
    function withdrawTKN() external onlyOwner {
        uint256 balance = tknToken.balanceOf(address(this));
        require(balance > 0, "No TKN to withdraw");
        require(tknToken.transfer(owner(), balance), "Transfer failed");
    }
    
    // Fonction pour retirer les BNB collectés
    function withdrawBNB() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No BNB to withdraw");
        payable(owner()).transfer(balance);
    }
}
