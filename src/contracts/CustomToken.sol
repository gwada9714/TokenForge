// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Nonces.sol";

contract CustomToken is ERC20, ERC20Burnable, ERC20Pausable, ERC20Permit, ERC20Votes, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    uint8 private immutable _decimals;
    bool public immutable _mintable;
    bool public immutable _burnable;
    bool public immutable _pausable;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimalsArg,
        uint256 initialSupply,
        bool mintable,
        bool burnable,
        bool pausable,
        bool permit,
        bool votes
    ) ERC20(name, symbol) ERC20Permit(name) {
        _decimals = decimalsArg;
        _mintable = mintable;
        _burnable = burnable;
        _pausable = pausable;

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
        require(_mintable, "CustomToken: minting is disabled");
        _mint(to, amount);
    }

    function burn(uint256 amount) public virtual override {
        require(_burnable, "CustomToken: burning is disabled");
        super.burn(amount);
    }

    function burnFrom(address account, uint256 amount) public virtual override {
        require(_burnable, "CustomToken: burning is disabled");
        super.burnFrom(account, amount);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        require(_pausable, "CustomToken: pausing is disabled");
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        require(_pausable, "CustomToken: pausing is disabled");
        _unpause();
    }

    // The following functions are overrides required by Solidity.
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Pausable, ERC20Votes)
    {
        super._update(from, to, value);
    }

    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }

    function DOMAIN_SEPARATOR() 
        public 
        view 
        override(ERC20Permit)
        returns (bytes32) 
    {
        return super.DOMAIN_SEPARATOR();
    }
}
