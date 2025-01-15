// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract LiquidityLocker is Ownable, ReentrancyGuard {
    struct Lock {
        address token;
        uint256 amount;
        uint256 unlockTime;
        bool isWithdrawn;
    }
    
    mapping(address => Lock[]) public locks;
    
    event LiquidityLocked(address indexed token, address indexed owner, uint256 amount, uint256 unlockTime);
    event LiquidityUnlocked(address indexed token, address indexed owner, uint256 amount);
    
    constructor() {}
    
    function lockLiquidity(
        address token,
        uint256 amount,
        uint256 lockDuration
    ) external nonReentrant {
        require(token != address(0), "Adresse token invalide");
        require(amount > 0, "Montant doit etre superieur a 0");
        require(lockDuration > 0, "Duree de verrouillage invalide");
        
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        
        uint256 unlockTime = block.timestamp + lockDuration;
        locks[msg.sender].push(Lock(token, amount, unlockTime, false));
        
        emit LiquidityLocked(token, msg.sender, amount, unlockTime);
    }
    
    function unlockLiquidity(uint256 lockIndex) external nonReentrant {
        Lock[] storage userLocks = locks[msg.sender];
        require(lockIndex < userLocks.length, "Index de verrouillage invalide");
        
        Lock storage lock = userLocks[lockIndex];
        require(!lock.isWithdrawn, "Liquidite deja retiree");
        require(block.timestamp >= lock.unlockTime, "Periode de verrouillage non terminee");
        
        lock.isWithdrawn = true;
        IERC20(lock.token).transfer(msg.sender, lock.amount);
        
        emit LiquidityUnlocked(lock.token, msg.sender, lock.amount);
    }
    
    function getLocks(address owner) external view returns (Lock[] memory) {
        return locks[owner];
    }
}
