// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract TKNToken is ERC20, ERC20Burnable, Pausable, Ownable, ERC20Permit {
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10**18; // 100M tokens
    
    // Staking configuration
    uint256 public constant MINIMUM_STAKE_AMOUNT = 1000 * 10**18; // 1000 TKN
    uint256 public constant STAKING_PERIOD = 30 days;
    uint256 public constant APY = 500; // 5% APY = 500 basis points

    struct Stake {
        uint256 amount;
        uint256 timestamp;
        uint256 lastRewardClaim;
    }

    mapping(address => Stake) public stakes;
    uint256 public totalStaked;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);

    constructor() ERC20("TokenForge", "TKN") ERC20Permit("TokenForge") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function stake(uint256 amount) external {
        require(amount >= MINIMUM_STAKE_AMOUNT, "TKN: Below minimum stake amount");
        require(balanceOf(msg.sender) >= amount, "TKN: Insufficient balance");

        // Transfer tokens to contract
        _transfer(msg.sender, address(this), amount);

        // Update or create stake
        if (stakes[msg.sender].amount > 0) {
            // Claim any pending rewards before updating stake
            _claimReward(msg.sender);
        }

        stakes[msg.sender] = Stake({
            amount: amount,
            timestamp: block.timestamp,
            lastRewardClaim: block.timestamp
        });

        totalStaked += amount;
        emit Staked(msg.sender, amount);
    }

    function unstake() external {
        Stake storage userStake = stakes[msg.sender];
        require(userStake.amount > 0, "TKN: No stake found");
        require(
            block.timestamp >= userStake.timestamp + STAKING_PERIOD,
            "TKN: Staking period not completed"
        );

        // Claim any pending rewards
        _claimReward(msg.sender);

        uint256 amount = userStake.amount;
        totalStaked -= amount;
        delete stakes[msg.sender];

        // Transfer staked tokens back
        _transfer(address(this), msg.sender, amount);
        
        emit Unstaked(msg.sender, amount);
    }

    function claimReward() external {
        _claimReward(msg.sender);
    }

    function _claimReward(address staker) internal {
        Stake storage userStake = stakes[staker];
        require(userStake.amount > 0, "TKN: No stake found");

        uint256 timeElapsed = block.timestamp - userStake.lastRewardClaim;
        uint256 reward = (userStake.amount * APY * timeElapsed) / (365 days * 10000);

        if (reward > 0) {
            userStake.lastRewardClaim = block.timestamp;
            _mint(staker, reward);
            emit RewardClaimed(staker, reward);
        }
    }

    function getStakeInfo(address staker) external view returns (
        uint256 amount,
        uint256 timestamp,
        uint256 pendingReward
    ) {
        Stake memory userStake = stakes[staker];
        uint256 timeElapsed = block.timestamp - userStake.lastRewardClaim;
        uint256 reward = (userStake.amount * APY * timeElapsed) / (365 days * 10000);

        return (
            userStake.amount,
            userStake.timestamp,
            reward
        );
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }
}
