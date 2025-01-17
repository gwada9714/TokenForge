// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CustomERC20 is ERC20, ERC20Burnable, Ownable {
    uint256 private _maxSupply;
    bool private _isMintable;
    uint8 private _decimals;

    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimalsValue,
        uint256 _initialSupply,
        uint256 _maxTokenSupply,
        bool /* _isBurnable */,  // Non utilisé car ERC20Burnable est toujours activé
        bool _isTokenMintable,
        address _initialOwner
    ) ERC20(_name, _symbol) Ownable() {
        require(_initialSupply > 0, "Initial supply must be greater than 0");
        require(_maxTokenSupply >= _initialSupply, "Max supply must be greater than or equal to initial supply");
        
        _maxSupply = _maxTokenSupply;
        _isMintable = _isTokenMintable;
        _decimals = _decimalsValue;
        
        _transferOwnership(_initialOwner);
        _mint(_initialOwner, _initialSupply);
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        require(_isMintable, "Minting is disabled for this token");
        require(totalSupply() + amount <= _maxSupply, "Cannot exceed max supply");
        _mint(to, amount);
    }

    function maxSupply() public view returns (uint256) {
        return _maxSupply;
    }

    function isMintable() public view returns (bool) {
        return _isMintable;
    }
}
