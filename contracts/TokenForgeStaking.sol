// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenForgeStaking is ReentrancyGuard, Ownable {
    IERC20 public immutable stakingToken; // immutable pour économiser du gas
    
    struct StakeInfo {
        uint128 amount;         // Réduit de uint256 à uint128
        uint128 since;         // Réduit de uint256 à uint128
        uint128 claimedRewards; // Réduit de uint256 à uint128
        bool isStaking;        // Pour vérifier rapidement si l'utilisateur stake
    }
    
    struct Pool {
        uint128 rewardRate;    // Réduit à uint128
        uint128 totalStaked;   // Réduit à uint128
        uint128 lastUpdateTime;
        mapping(address => StakeInfo) stakes;
    }
    
    Pool public stakingPool;
    uint128 public constant MINIMUM_STAKE_TIME = 1 days;
    uint128 private constant SCALE = 1e6; // Facteur d'échelle pour éviter les pertes de précision
    
    // Events optimisés
    event Staked(address indexed user, uint128 amount);
    event Withdrawn(address indexed user, uint128 amount);
    event RewardsClaimed(address indexed user, uint128 amount);
    event RewardRateUpdated(uint128 newRate);
    
    error InvalidAmount();
    error StakingPeriodNotMet();
    error TransferFailed();
    error NoStakeFound();
    
    constructor(address _stakingToken) {
        stakingToken = IERC20(_stakingToken);
        stakingPool.rewardRate = 1e3; // Ajusté pour le nouveau facteur d'échelle
        stakingPool.lastUpdateTime = uint128(block.timestamp);
    }
    
    modifier updateRewards() {
        _updatePool();
        _;
    }
    
    function stake(uint128 _amount) external nonReentrant updateRewards {
        _stake(_amount);
    }

    function _stake(uint128 _amount) internal {
        if (_amount == 0) revert InvalidAmount();
        
        StakeInfo storage userStake = stakingPool.stakes[msg.sender];
        
        // Mise à jour du stake
        stakingPool.totalStaked += _amount;
        userStake.amount += _amount;
        
        if (!userStake.isStaking) {
            userStake.since = uint128(block.timestamp);
            userStake.isStaking = true;
        }
        
        if (!stakingToken.transferFrom(msg.sender, address(this), _amount)) revert TransferFailed();
        emit Staked(msg.sender, _amount);
    }
    
    function withdraw(uint128 _amount) external nonReentrant updateRewards {
        StakeInfo storage userStake = stakingPool.stakes[msg.sender];
        if (_amount == 0 || _amount > userStake.amount) revert InvalidAmount();
        if (block.timestamp < userStake.since + MINIMUM_STAKE_TIME) revert StakingPeriodNotMet();
        
        // Réclamer les récompenses avant le retrait
        _claimRewards();
        
        // Mise à jour du stake
        stakingPool.totalStaked -= _amount;
        userStake.amount -= _amount;
        
        if (userStake.amount == 0) {
            userStake.isStaking = false;
            userStake.since = 0;
        }
        
        if (!stakingToken.transfer(msg.sender, _amount)) revert TransferFailed();
        emit Withdrawn(msg.sender, _amount);
    }
    
    function claimRewards() external nonReentrant updateRewards {
        _claimRewards();
    }
    
    function _claimRewards() internal {
        uint128 rewards = uint128(_calculateRewards(msg.sender));
        if (rewards == 0) return;
        
        stakingPool.stakes[msg.sender].claimedRewards += rewards;
        if (!stakingToken.transfer(msg.sender, rewards)) revert TransferFailed();
        emit RewardsClaimed(msg.sender, rewards);
    }
    
    function _calculateRewards(address _user) internal view returns (uint128) {
        StakeInfo storage userStake = stakingPool.stakes[_user];
        if (!userStake.isStaking || userStake.amount == 0) return 0;
        
        uint128 timeStaked = uint128(block.timestamp) - userStake.since;
        // Calcul optimisé avec SCALE
        uint128 rewards = uint128((uint256(userStake.amount) * uint256(stakingPool.rewardRate) * uint256(timeStaked)) / SCALE);
        return rewards - userStake.claimedRewards;
    }
    
    function _updatePool() internal {
        stakingPool.lastUpdateTime = uint128(block.timestamp);
    }
    
    function setRewardRate(uint128 _newRate) external onlyOwner updateRewards {
        stakingPool.rewardRate = _newRate;
        emit RewardRateUpdated(_newRate);
    }
    
    // View functions optimisées
    function getUserStake(address _user) external view returns (
        uint128 amount,
        uint128 since,
        uint128 claimedRewards,
        bool isStaking,
        uint128 pendingRewards
    ) {
        StakeInfo storage userStake = stakingPool.stakes[_user];
        return (
            userStake.amount,
            userStake.since,
            userStake.claimedRewards,
            userStake.isStaking,
            _calculateRewards(_user)
        );
    }
    
    // Fonction de batch staking pour économiser du gas sur les transactions multiples
    function batchStake(uint128[] calldata _amounts) external nonReentrant updateRewards {
        uint128 totalAmount = 0;
        uint256 length = _amounts.length;
        
        // Calcul du montant total en une seule boucle
        for(uint256 i = 0; i < length;) {
            totalAmount += _amounts[i];
            unchecked { ++i; } // Optimisation gas pour l'incrémentation
        }
        
        if (totalAmount == 0) revert InvalidAmount();
        
        // Appel unique à stake avec le montant total
        _stake(totalAmount);
    }
}
