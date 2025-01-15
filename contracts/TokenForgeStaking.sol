// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenForgeStaking is ReentrancyGuard, Ownable {
    IERC20 public stakingToken;
    
    struct StakeInfo {
        uint256 amount;
        uint256 since;
        uint256 claimedRewards;
    }
    
    struct Pool {
        uint256 rewardRate; // Rewards per second per token
        uint256 totalStaked;
        uint256 lastUpdateTime;
        mapping(address => StakeInfo) stakes;
    }
    
    Pool public stakingPool;
    uint256 public constant MINIMUM_STAKE_TIME = 1 days;
    
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    
    constructor(address _stakingToken) {
        stakingToken = IERC20(_stakingToken);
        stakingPool.rewardRate = 1e15; // 0.001 tokens per second per staked token
        stakingPool.lastUpdateTime = block.timestamp;
    }
    
    function stake(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Cannot stake 0");
        updatePool();
        
        stakingPool.totalStaked += _amount;
        stakingPool.stakes[msg.sender].amount += _amount;
        if (stakingPool.stakes[msg.sender].since == 0) {
            stakingPool.stakes[msg.sender].since = block.timestamp;
        }
        
        require(stakingToken.transferFrom(msg.sender, address(this), _amount), "Stake failed");
        emit Staked(msg.sender, _amount);
    }
    
    function withdraw(uint256 _amount) external nonReentrant {
        StakeInfo storage userStake = stakingPool.stakes[msg.sender];
        require(_amount > 0 && _amount <= userStake.amount, "Invalid amount");
        require(block.timestamp >= userStake.since + MINIMUM_STAKE_TIME, "Staking period not met");
        
        updatePool();
        claimRewards();
        
        stakingPool.totalStaked -= _amount;
        userStake.amount -= _amount;
        if (userStake.amount == 0) {
            userStake.since = 0;
        }
        
        require(stakingToken.transfer(msg.sender, _amount), "Withdraw failed");
        emit Withdrawn(msg.sender, _amount);
    }
    
    function claimRewards() public nonReentrant {
        updatePool();
        uint256 rewards = calculateRewards(msg.sender);
        if (rewards > 0) {
            stakingPool.stakes[msg.sender].claimedRewards += rewards;
            require(stakingToken.transfer(msg.sender, rewards), "Reward transfer failed");
            emit RewardsClaimed(msg.sender, rewards);
        }
    }
    
    function calculateRewards(address _user) public view returns (uint256) {
        StakeInfo storage userStake = stakingPool.stakes[_user];
        if (userStake.amount == 0) {
            return 0;
        }
        
        uint256 timeStaked = block.timestamp - userStake.since;
        uint256 rewards = (userStake.amount * stakingPool.rewardRate * timeStaked) / 1e18;
        return rewards - userStake.claimedRewards;
    }
    
    function updatePool() internal {
        stakingPool.lastUpdateTime = block.timestamp;
    }
    
    function setRewardRate(uint256 _newRate) external onlyOwner {
        updatePool();
        stakingPool.rewardRate = _newRate;
    }
    
    function getUserStake(address _user) external view returns (uint256 amount, uint256 since, uint256 claimedRewards) {
        StakeInfo storage userStake = stakingPool.stakes[_user];
        return (userStake.amount, userStake.since, userStake.claimedRewards);
    }
    
    function getPoolInfo() external view returns (uint256 totalStaked, uint256 rewardRate, uint256 lastUpdateTime) {
        return (stakingPool.totalStaked, stakingPool.rewardRate, stakingPool.lastUpdateTime);
    }
}
