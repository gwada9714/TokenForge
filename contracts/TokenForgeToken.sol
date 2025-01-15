// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./TokenForgeTKN.sol";

contract TokenForgeToken is ERC20, ReentrancyGuard {
    // Tax configuration
    uint256 private constant BASIS_POINTS = 10000; // 100% = 10000
    uint256 private constant MAX_TAX_RATE = 100; // 1% maximum tax
    uint256 private _taxRate; // Current tax rate in basis points
    
    // Immutable addresses
    address private immutable _treasuryAddress;
    address private immutable _stakingPoolAddress;
    
    // TokenForge Platform Tax
    TokenForgeTKN private immutable _forgeTknToken;
    bool private immutable _forgeTaxEnabled;
    uint256 private constant FORGE_TAX_RATE = 100; // 1% taxe de la forge
    
    // Mappings
    mapping(address => bool) private _isExempt;
    
    // Events
    event TaxRateUpdated(uint256 newRate);
    event TaxCollected(uint256 amount, address treasury);
    event ForgeTaxCollected(uint256 amount);
    event TaxExemptionUpdated(address indexed account, bool exempt);
    
    constructor(
        string memory tokenName,
        string memory tokenSymbol,
        address treasury_,
        address stakingPool_,
        uint256 initialTaxRate_,
        address forgeTknToken_
    ) ERC20(tokenName, tokenSymbol) {
        require(treasury_ != address(0), "Invalid treasury");
        require(stakingPool_ != address(0), "Invalid staking pool");
        require(initialTaxRate_ <= MAX_TAX_RATE, "Tax rate too high");
        
        _treasuryAddress = treasury_;
        _stakingPoolAddress = stakingPool_;
        _taxRate = initialTaxRate_;
        
        // Configuration de la taxe de la forge
        _forgeTaxEnabled = forgeTknToken_ != address(0);
        if (_forgeTaxEnabled) {
            _forgeTknToken = TokenForgeTKN(forgeTknToken_);
        } else {
            _forgeTknToken = TokenForgeTKN(address(0));
        }
        
        // Exemption des adresses critiques
        _isExempt[treasury_] = true;
        _isExempt[stakingPool_] = true;
        
        // Mint initial supply to treasury
        _mint(treasury_, 100_000_000 * 10**decimals()); // 100M tokens
    }
    
    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        require(from != address(0), "Transfer from zero");
        require(to != address(0), "Transfer to zero");
        
        // Calcul des taxes
        uint256 taxAmount = 0;
        uint256 forgeTaxAmount = 0;
        
        if (!_isExempt[from] && !_isExempt[to]) {
            // Taxe standard
            if (_taxRate > 0) {
                taxAmount = (amount * _taxRate) / BASIS_POINTS;
            }
            
            // Taxe de la forge
            if (_forgeTaxEnabled) {
                forgeTaxAmount = (amount * FORGE_TAX_RATE) / BASIS_POINTS;
            }
        }
        
        uint256 netAmount = amount - taxAmount - forgeTaxAmount;
        
        // Transferts
        super._transfer(from, to, netAmount);
        
        if (taxAmount > 0) {
            super._transfer(from, _treasuryAddress, taxAmount);
            emit TaxCollected(taxAmount, _treasuryAddress);
        }
        
        if (forgeTaxAmount > 0 && _forgeTaxEnabled) {
            super._transfer(from, address(_forgeTknToken), forgeTaxAmount);
            _forgeTknToken.distributeForgeFeesFrom(address(this), forgeTaxAmount);
            emit ForgeTaxCollected(forgeTaxAmount);
        }
    }
    
    // Fonctions de gestion des taxes
    function setTaxRate(uint256 newRate) external {
        require(msg.sender == _treasuryAddress, "Not treasury");
        require(newRate <= MAX_TAX_RATE, "Tax rate too high");
        _taxRate = newRate;
        emit TaxRateUpdated(newRate);
    }
    
    function setTaxExemption(address account, bool exempt) external {
        require(msg.sender == _treasuryAddress, "Not treasury");
        _isExempt[account] = exempt;
        emit TaxExemptionUpdated(account, exempt);
    }
    
    // Getters
    function taxRate() external view returns (uint256) {
        return _taxRate;
    }
    
    function isExemptFromTax(address account) external view returns (bool) {
        return _isExempt[account];
    }
    
    function treasury() external view returns (address) {
        return _treasuryAddress;
    }
    
    function stakingPool() external view returns (address) {
        return _stakingPoolAddress;
    }
    
    function isForgeTaxEnabled() external view returns (bool) {
        return _forgeTaxEnabled;
    }
}