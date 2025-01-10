// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./tokens/BaseERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Create2.sol";

contract TokenFactory is Ownable {
    event TokenCreated(
        address indexed tokenAddress,
        string name,
        string symbol,
        string tokenType,
        address indexed owner
    );
    
    mapping(address => bool) public isTokenCreatedHere;
    
    error InvalidInitialSupply();
    error InvalidMaxSupply();
    
    constructor(address initialOwner) Ownable(initialOwner) {}

    function createERC20(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 initialSupply,
        uint256 maxSupply,
        bool mintable,
        bytes32 salt
    ) external returns (address) {
        if (maxSupply > 0 && initialSupply > maxSupply) revert InvalidInitialSupply();
        
        bytes memory bytecode = abi.encodePacked(
            type(BaseERC20).creationCode,
            abi.encode(name, symbol, decimals, initialSupply, maxSupply, mintable, msg.sender)
        );

        address tokenAddress = Create2.deploy(0, salt, bytecode);
        
        isTokenCreatedHere[tokenAddress] = true;
        emit TokenCreated(tokenAddress, name, symbol, "ERC20", msg.sender);
        
        return tokenAddress;
    }

    function predictERC20Address(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 initialSupply,
        uint256 maxSupply,
        bool mintable,
        bytes32 salt
    ) external view returns (address) {
        if (maxSupply > 0 && initialSupply > maxSupply) revert InvalidInitialSupply();
        
        bytes memory bytecode = abi.encodePacked(
            type(BaseERC20).creationCode,
            abi.encode(name, symbol, decimals, initialSupply, maxSupply, mintable, msg.sender)
        );

        return Create2.computeAddress(salt, keccak256(bytecode));
    }
}
