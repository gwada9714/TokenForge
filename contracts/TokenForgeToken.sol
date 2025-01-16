// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./interfaces/ITaxDistributor.sol";
import "./TokenForgeTaxSystem.sol";

contract TokenForgeToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable {
    using Math for uint256;

    uint8 private immutable _decimals;
    uint256 public maxTxAmount;
    uint256 public maxWalletSize;
    address public immutable taxSystem;

    event MaxTxAmountUpdated(uint256 newAmount);
    event MaxWalletSizeUpdated(uint256 newSize);
    
    modifier onlyValidRecipient(address to) {
        require(to != address(0), "Transfer to zero address");
        _;
    }
    
    modifier respectsMaxTxAmount(uint256 amount) {
        require(amount <= maxTxAmount, "Transfer amount exceeds maxTxAmount");
        _;
    }
    
    modifier respectsMaxWalletSize(address to, uint256 amount) {
        require(
            balanceOf(to) + amount <= maxWalletSize,
            "Transfer would exceed maxWalletSize"
        );
        _;
    }

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply_,
        uint256 maxTxAmount_,
        uint256 maxWalletSize_,
        address taxSystem_
    ) ERC20(name_, symbol_) {
        require(taxSystem_ != address(0), "Tax system cannot be zero address");
        
        _decimals = decimals_;
        _mint(msg.sender, initialSupply_);
        maxTxAmount = maxTxAmount_;
        maxWalletSize = maxWalletSize_;
        taxSystem = taxSystem_;
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override(ERC20, ERC20Pausable) {
        super._beforeTokenTransfer(from, to, amount);
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal virtual override 
        onlyValidRecipient(recipient)
        respectsMaxTxAmount(amount)
        respectsMaxWalletSize(recipient, amount)
    {
        // Calculate taxes
        (uint256 baseTax, uint256 additionalTax) = TokenForgeTaxSystem(taxSystem).calculateTaxAmounts(address(this), amount);
        uint256 totalTax = baseTax + additionalTax;
        uint256 transferAmount = amount - totalTax;

        // Process tax collection
        if (totalTax > 0) {
            super._transfer(sender, address(this), totalTax);
            _approve(address(this), taxSystem, totalTax);
            TokenForgeTaxSystem(taxSystem).processTax(address(this), totalTax, sender, recipient);
        }

        // Transfer remaining amount to recipient
        super._transfer(sender, recipient, transferAmount);
    }

    function setMaxTxAmount(uint256 newMaxTxAmount) external onlyOwner {
        maxTxAmount = newMaxTxAmount;
        emit MaxTxAmountUpdated(newMaxTxAmount);
    }

    function setMaxWalletSize(uint256 newMaxWalletSize) external onlyOwner {
        maxWalletSize = newMaxWalletSize;
        emit MaxWalletSizeUpdated(newMaxWalletSize);
    }
}
