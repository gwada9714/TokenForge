// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./tokens/BaseERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Create2.sol";

contract TokenFactory is Ownable {
    event TokenCreated(
        address indexed tokenAddress,
        string indexed name,
        string indexed symbol,
        address owner
    );
    
    error InvalidParams();
    
    constructor(address initialOwner) {
        _transferOwnership(initialOwner);
    }

    function createToken(
        string calldata name,
        string calldata symbol,
        uint8 decimals,
        uint256 initialSupply,
        bytes32 salt
    ) external returns (address) {
        if (bytes(name).length == 0 || bytes(symbol).length == 0 || initialSupply == 0) 
            revert InvalidParams();
        
        bytes memory bytecode = abi.encodePacked(
            type(BaseERC20).creationCode,
            abi.encode(name, symbol, decimals, initialSupply, msg.sender)
        );

        address tokenAddress = Create2.deploy(0, salt, bytecode);
        
        emit TokenCreated(tokenAddress, name, symbol, msg.sender);
        return tokenAddress;
    }
}
