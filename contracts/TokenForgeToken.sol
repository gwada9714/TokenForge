// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenForgeToken is ERC20, ERC20Burnable, Pausable, Ownable {
    uint8 private _decimals;
    bool public isMintable;
    bool public isBurnable;
    
    event TokenMinted(address indexed to, uint256 amount);
    event TokenBurned(address indexed from, uint256 amount);
    
    constructor(
        string memory name,
        string memory symbol,
        uint8 tokenDecimals,
        uint256 initialSupply,
        address tokenOwner,
        bool burnable,
        bool mintable,
        bool pausable
    ) ERC20(name, symbol) {
        _decimals = tokenDecimals;
        isMintable = mintable;
        isBurnable = burnable;
        
        // Transférer la propriété au créateur
        _transferOwnership(tokenOwner);
        
        // Mint initial supply
        _mint(tokenOwner, initialSupply * (10 ** decimals()));
        
        // Si pausable est true, mettre le token en pause initialement
        if (pausable) {
            _pause();
        }
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    function mint(address to, uint256 amount) public onlyOwner {
        require(isMintable, "Minting is disabled");
        _mint(to, amount);
        emit TokenMinted(to, amount);
    }
    
    function burn(uint256 amount) public override {
        require(isBurnable, "Burning is disabled");
        super.burn(amount);
        emit TokenBurned(_msgSender(), amount);
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
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
} 