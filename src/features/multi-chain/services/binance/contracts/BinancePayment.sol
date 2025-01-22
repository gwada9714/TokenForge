// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title BinancePayment
 * @dev Contract for handling payments in BNB and BEP20 tokens for TokenForge services
 */
contract BinancePayment is Ownable, ReentrancyGuard, Pausable {
    // Events
    event PaymentReceived(
        address indexed payer,
        address indexed token,
        uint256 amount,
        string serviceType,
        string sessionId
    );
    
    event PaymentRefunded(
        address indexed recipient,
        address indexed token,
        uint256 amount,
        string sessionId
    );

    // Trusted receiver address
    address public immutable receiverAddress;

    // Supported tokens mapping
    mapping(address => bool) public supportedTokens;

    // Constructor
    constructor(address _receiverAddress) {
        require(_receiverAddress != address(0), "Invalid receiver address");
        receiverAddress = _receiverAddress;
    }

    /**
     * @dev Add or remove supported token
     * @param tokenAddress The address of the BEP20 token
     * @param isSupported Whether the token should be supported
     */
    function setTokenSupport(address tokenAddress, bool isSupported) external onlyOwner {
        require(tokenAddress != address(0), "Invalid token address");
        supportedTokens[tokenAddress] = isSupported;
    }

    /**
     * @dev Make a payment with BEP20 token
     * @param tokenAddress The address of the BEP20 token
     * @param amount The amount to pay
     * @param serviceType The type of service being paid for
     * @param sessionId The unique session ID for this payment
     */
    function payWithToken(
        address tokenAddress,
        uint256 amount,
        string calldata serviceType,
        string calldata sessionId
    ) external nonReentrant whenNotPaused {
        require(supportedTokens[tokenAddress], "Token not supported");
        require(amount > 0, "Amount must be greater than 0");
        
        IERC20 token = IERC20(tokenAddress);
        
        // Transfer tokens from user to this contract
        require(
            token.transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );
        
        // Transfer tokens to receiver
        require(
            token.transfer(receiverAddress, amount),
            "Transfer to receiver failed"
        );
        
        emit PaymentReceived(
            msg.sender,
            tokenAddress,
            amount,
            serviceType,
            sessionId
        );
    }

    /**
     * @dev Make a payment with BNB
     * @param serviceType The type of service being paid for
     * @param sessionId The unique session ID for this payment
     */
    function payWithBNB(
        string calldata serviceType,
        string calldata sessionId
    ) external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "Amount must be greater than 0");
        
        // Transfer BNB to receiver
        (bool sent, ) = receiverAddress.call{value: msg.value}("");
        require(sent, "BNB transfer failed");
        
        emit PaymentReceived(
            msg.sender,
            address(0),
            msg.value,
            serviceType,
            sessionId
        );
    }

    /**
     * @dev Emergency refund of BEP20 tokens
     * @param tokenAddress The address of the BEP20 token
     * @param to The address to refund to
     * @param amount The amount to refund
     * @param sessionId The session ID of the payment being refunded
     */
    function refundToken(
        address tokenAddress,
        address to,
        uint256 amount,
        string calldata sessionId
    ) external onlyOwner nonReentrant {
        require(to != address(0), "Invalid recipient address");
        require(amount > 0, "Amount must be greater than 0");
        
        IERC20 token = IERC20(tokenAddress);
        require(token.transfer(to, amount), "Refund transfer failed");
        
        emit PaymentRefunded(to, tokenAddress, amount, sessionId);
    }

    /**
     * @dev Emergency refund of BNB
     * @param to The address to refund to
     * @param amount The amount to refund
     * @param sessionId The session ID of the payment being refunded
     */
    function refundBNB(
        address payable to,
        uint256 amount,
        string calldata sessionId
    ) external onlyOwner nonReentrant {
        require(to != address(0), "Invalid recipient address");
        require(amount > 0, "Amount must be greater than 0");
        require(address(this).balance >= amount, "Insufficient balance");
        
        (bool sent, ) = to.call{value: amount}("");
        require(sent, "BNB refund failed");
        
        emit PaymentRefunded(to, address(0), amount, sessionId);
    }

    /**
     * @dev Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // Allow the contract to receive BNB
    receive() external payable {}
}
