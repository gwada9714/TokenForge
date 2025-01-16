// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

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

    // TokenForge tax configuration - Fixed at 1% and non-modifiable
    uint256 private constant FORGE_TAX_RATE = 100; // 1% = 100 basis points
    uint256 private constant FORGE_SHARE = 70; // 70% for TokenForge
    uint256 private constant DEV_FUND_SHARE = 15; // 15% for development fund
    uint256 private constant BUYBACK_SHARE = 10; // 10% for buyback and burn
    uint256 private constant STAKING_SHARE = 5; // 5% for staking rewards
    
    address public immutable FORGE_TREASURY;
    address public immutable TAX_DISTRIBUTOR;
    
    // Statistics for profit tracking
    uint256 public totalTaxCollected;
    uint256 public totalTransactions;
    uint256 public totalValueLocked;
    uint256 public totalTaxToForge;
    uint256 public totalTaxToDevFund;
    uint256 public totalTaxToBuyback;
    uint256 public totalTaxToStaking;

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
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
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
            
            // Calculate tax distribution
            uint256 forgeShare = (taxAmount * FORGE_SHARE) / 100;
            uint256 devFundShare = (taxAmount * DEV_FUND_SHARE) / 100;
            uint256 buybackShare = (taxAmount * BUYBACK_SHARE) / 100;
            uint256 stakingShare = (taxAmount * STAKING_SHARE) / 100;
            
            // Update statistics
            totalTaxCollected += taxAmount;
            totalTransactions += 1;
            totalTaxToForge += forgeShare;
            totalTaxToDevFund += devFundShare;
            totalTaxToBuyback += buybackShare;
            totalTaxToStaking += stakingShare;
            
            // Transfer tax shares
            _transfer(from, FORGE_TREASURY, forgeShare);
            _transfer(from, TAX_DISTRIBUTOR, devFundShare + buybackShare + stakingShare);
            
            // Transfer remaining amount
            _transfer(from, to, amount - taxAmount);
            
            emit TaxCollected(from, to, taxAmount);
        }
    }

    function _update(
        address from,
        address to,
        uint256 amount
    ) internal virtual override(ERC20, ERC20Pausable) {
        super._update(from, to, amount);

        if (from != address(0) && to != address(0)) {
            // Calculate and collect tax only for transfers between addresses
            uint256 taxAmount = (amount * FORGE_TAX_RATE) / 10000;
            
            if (taxAmount > 0) {
                // Distribute tax to various addresses
                uint256 forgeAmount = (taxAmount * FORGE_SHARE) / 100;
                uint256 devAmount = (taxAmount * DEV_FUND_SHARE) / 100;
                uint256 buybackAmount = (taxAmount * BUYBACK_SHARE) / 100;
                uint256 stakingAmount = (taxAmount * STAKING_SHARE) / 100;
                
                _transfer(to, FORGE_TREASURY, forgeAmount);
                _transfer(to, TAX_DISTRIBUTOR, devAmount + buybackAmount + stakingAmount);
                
                totalTaxCollected += taxAmount;
            }
            
            totalTransactions++;
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
