// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./interfaces/ITaxDistributor.sol";

contract TokenForgeToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable {
    using Math for uint256;

    uint8 private immutable _decimals;
    ITaxDistributor public immutable taxDistributor;
    uint256 public immutable taxFee;
    uint256 public immutable maxTxAmount;
    uint256 public immutable maxWalletSize;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        uint256 initialSupply,
        uint256 maxTxAmount_,
        uint256 maxWalletSize_,
        uint256 taxFee_,
        address taxDistributor_
    ) ERC20(name, symbol) {
        require(taxFee_ <= 1000, "TokenForgeToken: tax fee cannot exceed 10%");
        require(taxDistributor_ != address(0), "TokenForgeToken: tax distributor cannot be zero address");
        require(maxTxAmount_ > 0, "TokenForgeToken: max tx amount must be greater than 0");
        require(maxWalletSize_ > 0, "TokenForgeToken: max wallet size must be greater than 0");

        _decimals = decimals_;
        taxFee = taxFee_;
        maxTxAmount = maxTxAmount_;
        maxWalletSize = maxWalletSize_;
        taxDistributor = ITaxDistributor(taxDistributor_);

        _mint(msg.sender, initialSupply);
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

        if (from != address(0) && to != address(0)) {
            require(amount <= maxTxAmount, "TokenForgeToken: transfer amount exceeds maxTxAmount");
            require(
                balanceOf(to) + amount <= maxWalletSize,
                "TokenForgeToken: recipient balance would exceed maxWalletSize"
            );
        }
    }

    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");

        _beforeTokenTransfer(from, to, amount);

        uint256 fromBalance = balanceOf(from);
        require(fromBalance >= amount, "ERC20: transfer amount exceeds balance");

        uint256 taxAmount = 0;
        if (from != owner() && to != owner() && taxFee > 0) {
            taxAmount = amount.mulDiv(taxFee, 10000);
            super._transfer(from, address(taxDistributor), taxAmount);
            taxDistributor.distributeTax(taxAmount);
        }

        uint256 transferAmount = amount - taxAmount;
        super._transfer(from, to, transferAmount);

        _afterTokenTransfer(from, to, transferAmount);
    }
}
