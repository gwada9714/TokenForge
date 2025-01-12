// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Le contrat CustomToken reste inchangé

contract TokenFactory is Ownable {
    struct TokenConfig {
        string name;
        string symbol;
        uint256 totalSupply;
        uint8 decimals;
        bool burnable;
        bool mintable;
    }

    uint256 public tokenCreationFee;
    mapping(address => address[]) public userTokens;
    event TokenCreated(address indexed creator, address tokenAddress, string name, string symbol);
    
    event TokenCreationFeeUpdated(uint256 oldFee, uint256 newFee);
    
    mapping(address => bool) public isTokenCreatedHere;

    constructor(uint256 _tokenCreationFee) Ownable(msg.sender) {
        tokenCreationFee = _tokenCreationFee;
    }

    // Le reste du contrat reste inchangé
}