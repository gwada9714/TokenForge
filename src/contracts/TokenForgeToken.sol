// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract TokenForgeToken is ERC20, ERC20Burnable, ERC20Pausable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    uint8 private immutable _decimals;
    bool public immutable _mintable;
    bool public immutable _burnable;
    bool public immutable _pausable;

    // TokenForge tax configuration
    uint256 public constant FORGE_TAX_RATE = 100; // 1% = 100 basis points
    address public immutable FORGE_TREASURY;
    address public immutable TAX_DISTRIBUTOR;
    
    // Statistics
    uint256 public totalTaxCollected;
    uint256 public totalTransactions;

    event TaxCollected(address indexed from, address indexed to, uint256 taxAmount);

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimalsArg,
        uint256 initialSupply,
        bool mintable,
        bool burnable,
        bool pausable,
        address forgeTreasury,
        address taxDistributor
    ) ERC20(name, symbol) {
        require(forgeTreasury != address(0), "TokenForge: treasury cannot be zero address");
        require(taxDistributor != address(0), "TokenForge: tax distributor cannot be zero address");
        
        _decimals = decimalsArg;
        _mintable = mintable;
        _burnable = burnable;
        _pausable = pausable;
        FORGE_TREASURY = forgeTreasury;
        TAX_DISTRIBUTOR = taxDistributor;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        if (mintable) {
            _grantRole(MINTER_ROLE, msg.sender);
        }
        if (pausable) {
            _grantRole(PAUSER_ROLE, msg.sender);
        }

        _mint(msg.sender, initialSupply);
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        require(_mintable, "TokenForge: minting is disabled");
        _mint(to, amount);
    }

    function burn(uint256 amount) public virtual override {
        require(_burnable, "TokenForge: burning is disabled");
        super.burn(amount);
    }

    function burnFrom(address account, uint256 amount) public virtual override {
        require(_burnable, "TokenForge: burning is disabled");
        super.burnFrom(account, amount);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        require(_pausable, "TokenForge: pausing is disabled");
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        require(_pausable, "TokenForge: pausing is disabled");
        _unpause();
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override(ERC20, ERC20Pausable) {
        super._beforeTokenTransfer(from, to, amount);
        
        // Skip tax collection for minting, burning, and transfers to/from tax distributor
        if (from != address(0) && to != address(0) && 
            from != TAX_DISTRIBUTOR && to != TAX_DISTRIBUTOR) {
            uint256 taxAmount = (amount * FORGE_TAX_RATE) / 10000; // Calculate 1% tax
            
            // Transfer tax to distributor
            _transfer(from, TAX_DISTRIBUTOR, taxAmount);
            
            totalTaxCollected += taxAmount;
            totalTransactions += 1;
            
            emit TaxCollected(from, to, taxAmount);
        }
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
