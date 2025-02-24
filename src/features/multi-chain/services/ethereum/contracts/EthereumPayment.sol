// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EthereumPayment is ReentrancyGuard, Ownable {
    address public constant TREASURY = 0xc6E1e8A4AAb35210751F3C4366Da0717510e0f1A;
    
    event PaymentProcessed(
        string sessionId,
        address indexed from,
        address indexed token,
        uint256 amount,
        uint256 timestamp
    );

    event PaymentFailed(
        string sessionId,
        address indexed from,
        address indexed token,
        uint256 amount,
        string reason
    );

    mapping(string => bool) public processedSessions;
    mapping(address => bool) public supportedTokens;

    constructor() Ownable(msg.sender) {
        // Ajouter les tokens supportés par défaut
        supportedTokens[address(0)] = true; // ETH natif
        supportedTokens[0xdAC17F958D2ee523a2206206994597C13D831ec7] = true; // USDT
        supportedTokens[0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48] = true; // USDC
    }

    function processPayment(
        string calldata sessionId,
        address token,
        uint256 amount
    ) external payable nonReentrant {
        require(!processedSessions[sessionId], "Session deja traitee");
        require(supportedTokens[token], "Token non supporte");
        require(amount > 0, "Montant invalide");

        try {
            if (token == address(0)) {
                require(msg.value == amount, "Montant ETH incorrect");
                (bool success, ) = TREASURY.call{value: amount}("");
                require(success, "Transfert ETH echoue");
            } else {
                IERC20 tokenContract = IERC20(token);
                require(
                    tokenContract.transferFrom(msg.sender, TREASURY, amount),
                    "Transfert token echoue"
                );
            }

            processedSessions[sessionId] = true;
            emit PaymentProcessed(sessionId, msg.sender, token, amount, block.timestamp);
        } catch (bytes memory reason) {
            emit PaymentFailed(sessionId, msg.sender, token, amount, string(reason));
            revert("Paiement echoue");
        }
    }

    function addSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = true;
    }

    function removeSupportedToken(address token) external onlyOwner {
        require(token != address(0), "Impossible de supprimer ETH");
        supportedTokens[token] = false;
    }

    function withdrawStuckTokens(address token) external onlyOwner {
        if (token == address(0)) {
            (bool success, ) = TREASURY.call{value: address(this).balance}("");
            require(success, "Retrait ETH echoue");
        } else {
            IERC20 tokenContract = IERC20(token);
            uint256 balance = tokenContract.balanceOf(address(this));
            require(
                tokenContract.transfer(TREASURY, balance),
                "Retrait token echoue"
            );
        }
    }

    receive() external payable {
        revert("Utiliser processPayment()");
    }
}
