// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract BaseERC20 is ERC20, ERC20Burnable, ERC20Pausable, ERC20Permit, Ownable {
    uint8 private _decimals;
    uint256 private _maxSupply;
    bool private _mintable;

    error MaxSupplyExceeded(uint256 amount, uint256 maxSupply);
    error MintingDisabled();

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimalsValue,
        uint256 initialSupply,
        uint256 initialMaxSupply,
        bool mintable,
        address owner
    ) ERC20(name, symbol) ERC20Permit(name) Ownable(owner) {
        _decimals = decimalsValue;
        _maxSupply = initialMaxSupply;
        _mintable = mintable;
        _mint(owner, initialSupply);
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function maxSupply() public view returns (uint256) {
        return _maxSupply;
    }

    function mintable() public view returns (bool) {
        return _mintable;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        if (!_mintable) revert MintingDisabled();
        if (_maxSupply > 0 && totalSupply() + amount > _maxSupply) {
            revert MaxSupplyExceeded(amount, _maxSupply);
        }
        _mint(to, amount);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Pausable)
    {
        super._update(from, to, value);
    }
}
