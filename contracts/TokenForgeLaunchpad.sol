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
        address token;
        uint256 softCap;
        uint256 hardCap;
        uint256 presaleRate;
        uint256 listingRate;
        uint256 startTime;
        uint256 endTime;
        uint256 minContribution;
        uint256 maxContribution;
        uint256 raisedAmount;
        bool finalized;
        bool cancelled;
        mapping(address => uint256) contributions;
    }

    mapping(uint256 => Pool) public pools;
    uint256 public poolCount;
    uint256 public platformFee; // in basis points (e.g., 100 = 1%)

    event PoolCreated(uint256 indexed poolId, address indexed token);
    event Contributed(uint256 indexed poolId, address indexed contributor, uint256 amount);
    event PoolFinalized(uint256 indexed poolId);
    event PoolCancelled(uint256 indexed poolId);
    event TokensClaimed(uint256 indexed poolId, address indexed contributor, uint256 amount);
    event ContributionRefunded(uint256 indexed poolId, address indexed contributor, uint256 amount);

    constructor(uint256 _platformFee) {
        require(_platformFee <= 1000, "TokenForgeLaunchpad: Platform fee cannot exceed 10%");
        platformFee = _platformFee;
    }

    function createPool(
        address _token,
        uint256 _softCap,
        uint256 _hardCap,
        uint256 _presaleRate,
        uint256 _listingRate,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _minContribution,
        uint256 _maxContribution
    ) external returns (uint256) {
        require(_token != address(0), "TokenForgeLaunchpad: Token cannot be zero address");
        require(_softCap > 0 && _hardCap > _softCap, "TokenForgeLaunchpad: Invalid caps");
        require(_presaleRate > 0 && _listingRate > 0, "TokenForgeLaunchpad: Invalid rates");
        require(_startTime > block.timestamp && _endTime > _startTime, "TokenForgeLaunchpad: Invalid times");
        require(_minContribution > 0 && _maxContribution > _minContribution, "TokenForgeLaunchpad: Invalid contribution limits");

        uint256 poolId = poolCount++;
        Pool storage pool = pools[poolId];

        pool.token = _token;
        pool.softCap = _softCap;
        pool.hardCap = _hardCap;
        pool.presaleRate = _presaleRate;
        pool.listingRate = _listingRate;
        pool.startTime = _startTime;
        pool.endTime = _endTime;
        pool.minContribution = _minContribution;
        pool.maxContribution = _maxContribution;

        uint256 tokensRequired = (_hardCap * _presaleRate) / 1e18;
        IERC20(_token).transferFrom(msg.sender, address(this), tokensRequired);

        emit PoolCreated(poolId, _token);
        return poolId;
    }

    function contribute(uint256 _poolId) external payable nonReentrant {
        Pool storage pool = pools[_poolId];
        require(!pool.cancelled, "TokenForgeLaunchpad: Pool is cancelled");
        require(!pool.finalized, "TokenForgeLaunchpad: Pool is finalized");
        require(block.timestamp >= pool.startTime, "TokenForgeLaunchpad: Pool not started");
        require(block.timestamp <= pool.endTime, "TokenForgeLaunchpad: Pool ended");
        require(msg.value >= pool.minContribution, "TokenForgeLaunchpad: Below min contribution");
        require(msg.value <= pool.maxContribution, "TokenForgeLaunchpad: Above max contribution");

        uint256 newContribution = pool.contributions[msg.sender] + msg.value;
        require(newContribution <= pool.maxContribution, "TokenForgeLaunchpad: Would exceed max contribution");

        uint256 remainingCap = pool.hardCap - pool.raisedAmount;
        uint256 contribution = Math.min(msg.value, remainingCap);

        if (contribution < msg.value) {
            payable(msg.sender).transfer(msg.value - contribution);
        }

        pool.contributions[msg.sender] = newContribution;
        pool.raisedAmount += contribution;

        emit Contributed(_poolId, msg.sender, contribution);
    }

    function finalizePool(uint256 _poolId) external nonReentrant {
        Pool storage pool = pools[_poolId];
        require(!pool.cancelled, "TokenForgeLaunchpad: Pool is cancelled");
        require(!pool.finalized, "TokenForgeLaunchpad: Pool is already finalized");
        require(
            block.timestamp > pool.endTime || pool.raisedAmount >= pool.hardCap,
            "TokenForgeLaunchpad: Pool cannot be finalized yet"
        );
        require(pool.raisedAmount >= pool.softCap, "TokenForgeLaunchpad: Soft cap not reached");

        pool.finalized = true;

        uint256 platformFeeAmount = (pool.raisedAmount * platformFee) / 10000;
        payable(owner()).transfer(platformFeeAmount);
        payable(msg.sender).transfer(pool.raisedAmount - platformFeeAmount);

        emit PoolFinalized(_poolId);
    }

    function cancelPool(uint256 _poolId) external {
        Pool storage pool = pools[_poolId];
        require(!pool.finalized, "TokenForgeLaunchpad: Pool is finalized");
        require(!pool.cancelled, "TokenForgeLaunchpad: Pool is already cancelled");
        require(msg.sender == owner() || IERC20(pool.token).balanceOf(address(this)) == 0, "TokenForgeLaunchpad: Not authorized");

        pool.cancelled = true;
        emit PoolCancelled(_poolId);
    }

    function claimTokens(uint256 _poolId) external nonReentrant {
        Pool storage pool = pools[_poolId];
        require(pool.finalized, "TokenForgeLaunchpad: Pool not finalized");
        require(pool.contributions[msg.sender] > 0, "TokenForgeLaunchpad: No contribution");

        uint256 contribution = pool.contributions[msg.sender];
        uint256 tokenAmount = (contribution * pool.presaleRate) / 1e18;

        pool.contributions[msg.sender] = 0;
        IERC20(pool.token).transfer(msg.sender, tokenAmount);

        emit TokensClaimed(_poolId, msg.sender, tokenAmount);
    }

    function refund(uint256 _poolId) external nonReentrant {
        Pool storage pool = pools[_poolId];
        require(pool.cancelled || (block.timestamp > pool.endTime && pool.raisedAmount < pool.softCap),
            "TokenForgeLaunchpad: Refund not available");
        require(pool.contributions[msg.sender] > 0, "TokenForgeLaunchpad: No contribution");

        uint256 refundAmount = pool.contributions[msg.sender];
        pool.contributions[msg.sender] = 0;
        payable(msg.sender).transfer(refundAmount);

        emit ContributionRefunded(_poolId, msg.sender, refundAmount);
    }

    function updatePlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1000, "TokenForgeLaunchpad: Platform fee cannot exceed 10%");
        platformFee = _newFee;
    }

    function getPool(uint256 _poolId) external view returns (
        address token,
        uint256 softCap,
        uint256 hardCap,
        uint256 presaleRate,
        uint256 listingRate,
        uint256 startTime,
        uint256 endTime,
        uint256 minContribution,
        uint256 maxContribution,
        uint256 raisedAmount,
        bool finalized,
        bool cancelled
    ) {
        Pool storage pool = pools[_poolId];
        return (
            pool.token,
            pool.softCap,
            pool.hardCap,
            pool.presaleRate,
            pool.listingRate,
            pool.startTime,
            pool.endTime,
            pool.minContribution,
            pool.maxContribution,
            pool.raisedAmount,
            pool.finalized,
            pool.cancelled
        );
    }

    function getContribution(uint256 _poolId, address _contributor) external view returns (uint256) {
        return pools[_poolId].contributions[_contributor];
    }
}
