// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title TokenForgeBridge
 * @dev Manages cross-chain token transfers between Ethereum and BSC
 */
contract TokenForgeBridge is ReentrancyGuard, AccessControl {
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    
    // Chain IDs
    uint256 public constant ETH_CHAIN_ID = 1;
    uint256 public constant BSC_CHAIN_ID = 56;
    
    // Mapping of supported tokens
    mapping(address => bool) public supportedTokens;
    
    // Mapping of processed transactions
    mapping(bytes32 => bool) public processedTxs;
    
    // Bridge fees
    uint256 public bridgeFee;
    address public feeCollector;
    
    // Events
    event TokensLocked(
        address indexed token,
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 targetChain,
        bytes32 transactionId
    );
    
    event TokensUnlocked(
        address indexed token,
        address indexed to,
        uint256 amount,
        uint256 sourceChain,
        bytes32 transactionId
    );
    
    event TokenAdded(address indexed token);
    event TokenRemoved(address indexed token);
    event FeeUpdated(uint256 newFee);
    event FeeCollectorUpdated(address newCollector);
    
    constructor(address _feeCollector, uint256 _bridgeFee) {
        require(_feeCollector != address(0), "Invalid fee collector");
        
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(VALIDATOR_ROLE, msg.sender);
        
        feeCollector = _feeCollector;
        bridgeFee = _bridgeFee;
    }
    
    /**
     * @dev Locks tokens for cross-chain transfer
     * @param token Token address
     * @param amount Amount to transfer
     * @param targetChain Destination chain ID
     * @param recipient Recipient address on target chain
     */
    function lockTokens(
        address token,
        uint256 amount,
        uint256 targetChain,
        address recipient
    ) external payable nonReentrant {
        require(supportedTokens[token], "Token not supported");
        require(msg.value >= bridgeFee, "Insufficient bridge fee");
        require(targetChain == ETH_CHAIN_ID || targetChain == BSC_CHAIN_ID, "Invalid chain");
        require(targetChain != block.chainid, "Cannot bridge to same chain");
        
        // Transfer bridge fee
        payable(feeCollector).transfer(bridgeFee);
        if (msg.value > bridgeFee) {
            payable(msg.sender).transfer(msg.value - bridgeFee);
        }
        
        // Generate transaction ID
        bytes32 txId = keccak256(
            abi.encodePacked(
                token,
                msg.sender,
                recipient,
                amount,
                block.chainid,
                targetChain,
                block.timestamp
            )
        );
        
        // Lock tokens
        require(
            IERC20(token).transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );
        
        emit TokensLocked(
            token,
            msg.sender,
            recipient,
            amount,
            targetChain,
            txId
        );
    }
    
    /**
     * @dev Unlocks tokens after cross-chain transfer
     * @param token Token address
     * @param recipient Recipient address
     * @param amount Amount to unlock
     * @param sourceChain Source chain ID
     * @param transactionId Original transaction ID
     */
    function unlockTokens(
        address token,
        address recipient,
        uint256 amount,
        uint256 sourceChain,
        bytes32 transactionId
    ) external onlyRole(VALIDATOR_ROLE) nonReentrant {
        require(supportedTokens[token], "Token not supported");
        require(!processedTxs[transactionId], "Transaction already processed");
        require(sourceChain == ETH_CHAIN_ID || sourceChain == BSC_CHAIN_ID, "Invalid chain");
        
        processedTxs[transactionId] = true;
        
        require(
            IERC20(token).transfer(recipient, amount),
            "Token transfer failed"
        );
        
        emit TokensUnlocked(
            token,
            recipient,
            amount,
            sourceChain,
            transactionId
        );
    }
    
    // Admin functions
    function addToken(address token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(token != address(0), "Invalid token address");
        supportedTokens[token] = true;
        emit TokenAdded(token);
    }
    
    function removeToken(address token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        supportedTokens[token] = false;
        emit TokenRemoved(token);
    }
    
    function updateFee(uint256 newFee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        bridgeFee = newFee;
        emit FeeUpdated(newFee);
    }
    
    function updateFeeCollector(address newCollector) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newCollector != address(0), "Invalid fee collector");
        feeCollector = newCollector;
        emit FeeCollectorUpdated(newCollector);
    }
    
    // View functions
    function isTokenSupported(address token) external view returns (bool) {
        return supportedTokens[token];
    }
    
    function isTransactionProcessed(bytes32 txId) external view returns (bool) {
        return processedTxs[txId];
    }
}
