// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./interfaces/ITokenForgeToken.sol";

contract TokenForgeLaunchpad is ReentrancyGuard, Ownable {
    using Math for uint256;
    
    struct Pool {
        ITokenForgeToken token;
        uint256 tokenPrice;
        uint256 hardCap;
        uint256 softCap;
        uint256 minContribution;
        uint256 maxContribution;
        uint256 startTime;
        uint256 endTime;
        uint256 totalRaised;
        uint256 totalTokensSold;
        bool finalized;
        bool cancelled;
        mapping(address => uint256) contributions;
    }
    
    mapping(uint256 => Pool) public pools;
    uint256 public poolCount;
    IERC20 public platformToken; // TKN token
    uint256 public platformFee; // in basis points (1% = 100)
    
    event PoolCreated(uint256 indexed poolId, address indexed token);
    event Contributed(uint256 indexed poolId, address indexed contributor, uint256 amount);
    event TokensClaimed(uint256 indexed poolId, address indexed contributor, uint256 amount);
    event PoolFinalized(uint256 indexed poolId);
    event PoolCancelled(uint256 indexed poolId);
    event RefundClaimed(uint256 indexed poolId, address indexed contributor, uint256 amount);
    
    constructor(address _platformToken) {
        platformToken = IERC20(_platformToken);
        platformFee = 100; // 1%
    }
    
    function createPool(
        address _token,
        uint256 _tokenPrice,
        uint256 _hardCap,
        uint256 _softCap,
        uint256 _minContribution,
        uint256 _maxContribution,
        uint256 _startTime,
        uint256 _endTime
    ) external nonReentrant returns (uint256) {
        require(_token != address(0), "Invalid token");
        require(_startTime > block.timestamp, "Start time must be in future");
        require(_endTime > _startTime, "End time must be after start time");
        require(_hardCap > _softCap, "Hard cap must be greater than soft cap");
        require(_maxContribution >= _minContribution, "Max contribution must be >= min");
        
        uint256 poolId = poolCount++;
        Pool storage pool = pools[poolId];
        
        pool.token = ITokenForgeToken(_token);
        pool.tokenPrice = _tokenPrice;
        pool.hardCap = _hardCap;
        pool.softCap = _softCap;
        pool.minContribution = _minContribution;
        pool.maxContribution = _maxContribution;
        pool.startTime = _startTime;
        pool.endTime = _endTime;
        
        // Transfer tokens to contract
        uint256 tokensRequired = _hardCap.mul(1e18).div(_tokenPrice);
        require(pool.token.transferFrom(msg.sender, address(this), tokensRequired), "Token transfer failed");
        
        emit PoolCreated(poolId, _token);
        return poolId;
    }
    
    function contribute(uint256 _poolId) external payable nonReentrant {
        Pool storage pool = pools[_poolId];
        require(block.timestamp >= pool.startTime, "Pool not started");
        require(block.timestamp <= pool.endTime, "Pool ended");
        require(!pool.finalized && !pool.cancelled, "Pool not active");
        require(msg.value >= pool.minContribution, "Below min contribution");
        require(msg.value <= pool.maxContribution, "Above max contribution");
        require(pool.totalRaised.add(msg.value) <= pool.hardCap, "Hard cap reached");
        
        uint256 userTotal = pool.contributions[msg.sender].add(msg.value);
        require(userTotal <= pool.maxContribution, "Would exceed max contribution");
        
        pool.contributions[msg.sender] = userTotal;
        pool.totalRaised = pool.totalRaised.add(msg.value);
        
        emit Contributed(_poolId, msg.sender, msg.value);
    }
    
    function finalizePool(uint256 _poolId) external nonReentrant {
        Pool storage pool = pools[_poolId];
        require(msg.sender == owner() || msg.sender == pool.token.owner(), "Not authorized");
        require(block.timestamp > pool.endTime || pool.totalRaised >= pool.hardCap, "Cannot finalize yet");
        require(!pool.finalized && !pool.cancelled, "Pool not active");
        require(pool.totalRaised >= pool.softCap, "Soft cap not reached");
        
        pool.finalized = true;
        
        // Calculate and transfer platform fee
        uint256 feeAmount = pool.totalRaised.mul(platformFee).div(10000);
        payable(owner()).transfer(feeAmount);
        
        // Transfer remaining funds to token owner
        payable(pool.token.owner()).transfer(pool.totalRaised.sub(feeAmount));
        
        emit PoolFinalized(_poolId);
    }
    
    function cancelPool(uint256 _poolId) external {
        Pool storage pool = pools[_poolId];
        require(msg.sender == owner() || msg.sender == pool.token.owner(), "Not authorized");
        require(!pool.finalized && !pool.cancelled, "Pool not active");
        
        pool.cancelled = true;
        
        // Return tokens to owner
        uint256 remainingTokens = pool.token.balanceOf(address(this));
        require(pool.token.transfer(pool.token.owner(), remainingTokens), "Token return failed");
        
        emit PoolCancelled(_poolId);
    }
    
    function claimTokens(uint256 _poolId) external nonReentrant {
        Pool storage pool = pools[_poolId];
        require(pool.finalized, "Pool not finalized");
        
        uint256 contribution = pool.contributions[msg.sender];
        require(contribution > 0, "No contribution");
        
        uint256 tokenAmount = contribution.mul(1e18).div(pool.tokenPrice);
        pool.contributions[msg.sender] = 0;
        pool.totalTokensSold = pool.totalTokensSold.add(tokenAmount);
        
        require(pool.token.transfer(msg.sender, tokenAmount), "Token transfer failed");
        
        emit TokensClaimed(_poolId, msg.sender, tokenAmount);
    }
    
    function claimRefund(uint256 _poolId) external nonReentrant {
        Pool storage pool = pools[_poolId];
        require(pool.cancelled || 
                (block.timestamp > pool.endTime && pool.totalRaised < pool.softCap),
                "Refund not available");
        
        uint256 contribution = pool.contributions[msg.sender];
        require(contribution > 0, "No contribution");
        
        pool.contributions[msg.sender] = 0;
        payable(msg.sender).transfer(contribution);
        
        emit RefundClaimed(_poolId, msg.sender, contribution);
    }
    
    function getPoolInfo(uint256 _poolId) external view returns (
        address token,
        uint256 tokenPrice,
        uint256 hardCap,
        uint256 softCap,
        uint256 totalRaised,
        uint256 startTime,
        uint256 endTime,
        bool finalized,
        bool cancelled
    ) {
        Pool storage pool = pools[_poolId];
        return (
            address(pool.token),
            pool.tokenPrice,
            pool.hardCap,
            pool.softCap,
            pool.totalRaised,
            pool.startTime,
            pool.endTime,
            pool.finalized,
            pool.cancelled
        );
    }
    
    function getContribution(uint256 _poolId, address _contributor) external view returns (uint256) {
        return pools[_poolId].contributions[_contributor];
    }
    
    function setPlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1000, "Fee too high"); // Max 10%
        platformFee = _newFee;
    }
}
