// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./TokenForgeToken.sol";
import "./TokenForgeTaxSystem.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract TokenForgeFactory is Ownable, Pausable {
    address public immutable tknToken;
    address public immutable treasury;
    address public immutable taxSystem;
    
    // Service tiers configuration
    uint256 public constant BASIC_TIER_PRICE = 100 * 10**18; // 100 TKN

    // Discount rates in basis points (1% = 100)
    uint256 public constant TKN_PAYMENT_DISCOUNT = 2000; // 20% discount when paying with TKN

    struct TokenInfo {
        address tokenAddress;
        string name;
        string symbol;
        uint256 totalSupply;
        address owner;
        uint256 creationTime;
        uint256 additionalTaxRate;
    }

    // Mapping of created tokens
    mapping(address => TokenInfo[]) public creatorTokens;
    TokenInfo[] public allTokens;

    event TokenCreated(
        address indexed tokenAddress,
        address indexed creator,
        string name,
        string symbol,
        uint256 totalSupply,
        uint256 additionalTaxRate
    );

    constructor(address _tknToken, address _treasury, address _taxSystem) {
        require(_tknToken != address(0), "TokenForge: TKN token address cannot be zero");
        require(_treasury != address(0), "TokenForge: Treasury address cannot be zero");
        require(_taxSystem != address(0), "TokenForge: Tax system address cannot be zero");
        tknToken = _tknToken;
        treasury = _treasury;
        taxSystem = _taxSystem;
    }

    /**
     * @dev Pauses all token operations.
     * See {Pausable-_pause}.
     *
     * Requirements:
     * - The contract must not be paused.
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses all token operations.
     * See {Pausable-_unpause}.
     *
     * Requirements:
     * - The contract must be paused.
     */
    function unpause() public onlyOwner {
        _unpause();
    }

    function createToken(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        uint256 maxTxAmount,
        uint256 maxWalletSize,
        uint256 additionalTaxRate
    ) external whenNotPaused {
        uint256 price = BASIC_TIER_PRICE;
        
        // Handle payment
        IERC20(tknToken).transferFrom(msg.sender, treasury, price);

        // Create new token with tax configuration
        TokenForgeToken newToken = new TokenForgeToken(
            name,
            symbol,
            18,
            totalSupply,
            maxTxAmount,
            maxWalletSize,
            taxSystem
        );

        // Configure tax for the new token
        TokenForgeTaxSystem(taxSystem).configureTax(
            address(newToken),
            additionalTaxRate,
            msg.sender
        );

        // Transfer ownership to the creator
        newToken.transferOwnership(msg.sender);

        // Store token info
        TokenInfo memory tokenInfo = TokenInfo({
            tokenAddress: address(newToken),
            name: name,
            symbol: symbol,
            totalSupply: totalSupply,
            owner: msg.sender,
            creationTime: block.timestamp,
            additionalTaxRate: additionalTaxRate
        });

        creatorTokens[msg.sender].push(tokenInfo);
        allTokens.push(tokenInfo);

        emit TokenCreated(
            address(newToken),
            msg.sender,
            name,
            symbol,
            totalSupply,
            additionalTaxRate
        );
    }

    function getCreatorTokens(address creator) external view whenNotPaused returns (TokenInfo[] memory) {
        return creatorTokens[creator];
    }

    function getAllTokens() external view whenNotPaused returns (TokenInfo[] memory) {
        return allTokens;
    }

    function getTokenCount() external view whenNotPaused returns (uint256) {
        return allTokens.length;
    }

    function withdrawFees() external onlyOwner whenNotPaused {
        uint256 balance = IERC20(tknToken).balanceOf(address(this));
        require(balance > 0, "TokenForge: No fees to withdraw");
        IERC20(tknToken).transfer(treasury, balance);
    }
}
