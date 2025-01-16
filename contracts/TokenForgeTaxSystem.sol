// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title TokenForgeTaxSystem
 * @dev Manages the token forge tax system with base and additional tax rates
 */
contract TokenForgeTaxSystem is Ownable, ReentrancyGuard {
    // Constants for tax rates (in basis points, 1 bp = 0.01%)
    uint256 public constant BASE_TAX_RATE = 50; // 0.5%
    uint256 public constant MAX_ADDITIONAL_TAX_RATE = 150; // 1.5%
    
    struct TokenTaxConfig {
        uint256 additionalTaxRate; // Additional tax rate set by token creator
        address creatorWallet; // Wallet to receive additional tax
        bool isConfigured; // Flag to check if tax is configured
    }
    
    // Mapping of token address to its tax configuration
    mapping(address => TokenTaxConfig) public tokenTaxConfigs;
    
    // TaxDistributor contract address
    address public taxDistributor;
    
    // Events
    event TaxConfigured(
        address indexed tokenAddress,
        uint256 additionalTaxRate,
        address creatorWallet
    );
    
    event TaxCollected(
        address indexed tokenAddress,
        uint256 baseTaxAmount,
        uint256 additionalTaxAmount,
        address indexed sender,
        address indexed recipient
    );
    
    constructor(address _taxDistributor) {
        require(_taxDistributor != address(0), "Tax distributor cannot be zero");
        taxDistributor = _taxDistributor;
    }
    
    /**
     * @dev Configures tax for a token
     * @param tokenAddress The address of the token
     * @param additionalTaxRate Additional tax rate in basis points
     * @param creatorWallet Wallet to receive additional tax
     */
    function configureTax(
        address tokenAddress,
        uint256 additionalTaxRate,
        address creatorWallet
    ) external {
        require(!tokenTaxConfigs[tokenAddress].isConfigured, "Tax already configured");
        require(additionalTaxRate <= MAX_ADDITIONAL_TAX_RATE, "Tax rate too high");
        require(creatorWallet != address(0), "Invalid creator wallet");
        
        tokenTaxConfigs[tokenAddress] = TokenTaxConfig({
            additionalTaxRate: additionalTaxRate,
            creatorWallet: creatorWallet,
            isConfigured: true
        });
        
        emit TaxConfigured(tokenAddress, additionalTaxRate, creatorWallet);
    }
    
    /**
     * @dev Calculates tax amounts for a transfer
     * @param tokenAddress The address of the token
     * @param amount The transfer amount
     * @return baseTax The base tax amount
     * @return additionalTax The additional tax amount
     */
    function calculateTaxAmounts(address tokenAddress, uint256 amount)
        public
        view
        returns (uint256 baseTax, uint256 additionalTax)
    {
        baseTax = (amount * BASE_TAX_RATE) / 10000;
        
        TokenTaxConfig memory config = tokenTaxConfigs[tokenAddress];
        if (config.isConfigured) {
            additionalTax = (amount * config.additionalTaxRate) / 10000;
        }
        
        return (baseTax, additionalTax);
    }
    
    /**
     * @dev Processes tax collection during transfer
     * @param tokenAddress The address of the token
     * @param amount The transfer amount
     */
    function processTax(
        address tokenAddress,
        uint256 amount,
        address sender,
        address recipient
    ) external nonReentrant {
        (uint256 baseTax, uint256 additionalTax) = calculateTaxAmounts(tokenAddress, amount);
        
        IERC20 token = IERC20(tokenAddress);
        
        // Transfer base tax to distributor
        if (baseTax > 0) {
            require(
                token.transferFrom(sender, taxDistributor, baseTax),
                "Base tax transfer failed"
            );
        }
        
        // Transfer additional tax to creator wallet if configured
        TokenTaxConfig memory config = tokenTaxConfigs[tokenAddress];
        if (config.isConfigured && additionalTax > 0) {
            require(
                token.transferFrom(sender, config.creatorWallet, additionalTax),
                "Additional tax transfer failed"
            );
        }
        
        emit TaxCollected(
            tokenAddress,
            baseTax,
            additionalTax,
            sender,
            recipient
        );
    }
    
    /**
     * @dev Updates the tax distributor address
     * @param newTaxDistributor New tax distributor address
     */
    function setTaxDistributor(address newTaxDistributor) external onlyOwner {
        require(newTaxDistributor != address(0), "Invalid tax distributor");
        taxDistributor = newTaxDistributor;
    }
}
