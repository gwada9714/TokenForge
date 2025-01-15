// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenForgeToken is ERC20, ERC20Burnable, Pausable, AccessControl, Ownable {
    uint8 private _decimals;
    bool public isMintable;
    bool public isBurnable;
    
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
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
        isBurnable = burnable;
        isMintable = mintable;
        _mint(tokenOwner, initialSupply);
        _setupRole(DEFAULT_ADMIN_ROLE, tokenOwner);
        _setupRole(MINTER_ROLE, tokenOwner);
        if (pausable) {
            _pause();
        }
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    function mint(address to, uint256 amount) public {
        require(isMintable, "Minting is disabled");
        require(hasRole(MINTER_ROLE, msg.sender), "Must have minter role to mint");
        _mint(to, amount);
        emit TokenMinted(to, amount);
    }
    
    function burn(uint256 amount) public virtual override {
        require(isBurnable, "Burning is disabled");
        super.burn(amount);
        emit TokenBurned(msg.sender, amount);
    }
    
    function burnFrom(address account, uint256 amount) public virtual override {
        require(isBurnable, "Burning is disabled");
        super.burnFrom(account, amount);
        emit TokenBurned(account, amount);
    }
    
    function pause() public onlyOwner {
        _pause();
    }
    
    function unpause() public onlyOwner {
        _unpause();
    }
    
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }
}