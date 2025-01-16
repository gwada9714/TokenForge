// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./TokenForgeToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TokenForgeFactory is Ownable {
    address public immutable tknToken;
    address public immutable treasury;
    address public immutable taxDistributor;
    
    // Service tiers configuration
    uint256 public constant BASIC_TIER_PRICE = 100 * 10**18; // 100 TKN
    uint256 public constant PREMIUM_TIER_PRICE = 1000 * 10**18; // 1000 TKN

    // Discount rates in basis points (1% = 100)
    uint256 public constant TKN_PAYMENT_DISCOUNT = 2000; // 20% discount when paying with TKN

    struct TokenInfo {
        address tokenAddress;
        string name;
        string symbol;
        uint256 totalSupply;
        address owner;
        uint256 creationTime;
        bool isPremium;
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
        bool isPremium
    );

    constructor(address _tknToken, address _treasury, address _taxDistributor) {
        require(_tknToken != address(0), "TokenForge: TKN token address cannot be zero");
        require(_treasury != address(0), "TokenForge: Treasury address cannot be zero");
        require(_taxDistributor != address(0), "TokenForge: Tax distributor address cannot be zero");
        tknToken = _tknToken;
        treasury = _treasury;
        taxDistributor = _taxDistributor;
    }

    function createToken(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 initialSupply,
        uint256 maxTxAmount,
        uint256 maxWalletSize,
        uint256 taxFee,
        bool isPremium
    ) external {
        uint256 price = isPremium ? PREMIUM_TIER_PRICE : BASIC_TIER_PRICE;
        
        // Handle payment
        IERC20(tknToken).transferFrom(msg.sender, treasury, price);

        // Create new token
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

        // Transfer ownership to the creator
        newToken.transferOwnership(msg.sender);

        // Store token info
        TokenInfo memory tokenInfo = TokenInfo({
            tokenAddress: address(newToken),
            name: name,
            symbol: symbol,
            totalSupply: initialSupply,
            owner: msg.sender,
            creationTime: block.timestamp,
            isPremium: isPremium
        });

        creatorTokens[msg.sender].push(tokenInfo);
        allTokens.push(tokenInfo);

        emit TokenCreated(
            address(newToken),
            msg.sender,
            name,
            symbol,
            initialSupply,
            isPremium
        );
    }

    function getCreatorTokens(address creator) external view returns (TokenInfo[] memory) {
        return creatorTokens[creator];
    }

    function getAllTokens() external view returns (TokenInfo[] memory) {
        return allTokens;
    }

    function getTokenCount() external view returns (uint256) {
        return allTokens.length;
    }

    function calculatePrice(bool isPremium, bool payWithTKN) public pure returns (uint256) {
        uint256 basePrice = isPremium ? PREMIUM_TIER_PRICE : BASIC_TIER_PRICE;
        if (payWithTKN) {
            return basePrice - (basePrice * TKN_PAYMENT_DISCOUNT / 10000);
        }
        return basePrice;
    }

    function withdrawFees() external onlyOwner {
        uint256 balance = IERC20(tknToken).balanceOf(address(this));
        require(balance > 0, "TokenForge: No fees to withdraw");
        IERC20(tknToken).transfer(treasury, balance);
    }
}
