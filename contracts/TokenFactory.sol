// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./TokenForgeToken.sol";

contract TokenFactory is Ownable {
    uint256 public tokenCreationFee;
    mapping(address => TokenForgeToken[]) private userTokens;
    TokenForgeToken[] public allTokens;

    event TokenCreated(address indexed creator, address indexed tokenAddress);
    event TokenCreationFeeUpdated(uint256 oldFee, uint256 newFee);

    constructor(uint256 _tokenCreationFee) {
        tokenCreationFee = _tokenCreationFee;
    }

    function createToken(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 initialSupply,
        uint256 maxTxAmount,
        uint256 maxWalletSize,
        uint256 taxFee,
        address taxDistributor
    ) external payable returns (address) {
        require(msg.value >= tokenCreationFee, "TokenFactory: Insufficient fee");

        TokenForgeToken newToken = new TokenForgeToken(
            name,
            symbol,
            decimals,
            initialSupply,
            maxTxAmount,
            maxWalletSize,
            taxFee,
            taxDistributor
        );

        userTokens[msg.sender].push(newToken);
        allTokens.push(newToken);

        // Transfer ownership to the creator
        newToken.transferOwnership(msg.sender);

        emit TokenCreated(msg.sender, address(newToken));
        return address(newToken);
    }

    function updateTokenCreationFee(uint256 _newFee) external onlyOwner {
        uint256 oldFee = tokenCreationFee;
        tokenCreationFee = _newFee;
        emit TokenCreationFeeUpdated(oldFee, _newFee);
    }

    function getUserTokens(address user) external view returns (TokenForgeToken[] memory) {
        return userTokens[user];
    }

    function getAllTokens() external view returns (TokenForgeToken[] memory) {
        return allTokens;
    }

    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "TokenFactory: No fees to withdraw");
        payable(owner()).transfer(balance);
    }
}