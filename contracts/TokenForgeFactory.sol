// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./TokenForgeToken.sol";

contract TokenForgeFactory is Ownable, ReentrancyGuard {
    // Frais de création en USDT/USDC
    uint256 public creationFee;
    // Adresse du stablecoin accepté (USDT/USDC)
    address public stablecoinAddress;
    
    // Mapping des tokens créés par créateur
    mapping(address => address[]) public tokensByCreator;
    // Mapping des détails des tokens
    mapping(address => TokenDetails) public tokenDetails;
    
    struct TokenDetails {
        string name;
        string symbol;
        uint8 decimals;
        uint256 totalSupply;
        address owner;
        bool burnable;
        bool mintable;
        bool pausable;
        uint256 creationTime;
    }
    
    event TokenCreated(
        address indexed tokenAddress,
        address indexed owner,
        string name,
        string symbol,
        uint256 totalSupply
    );
    
    constructor(address _stablecoinAddress, uint256 _creationFee) {
        stablecoinAddress = _stablecoinAddress;
        creationFee = _creationFee;
    }
    
    function createToken(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 totalSupply,
        bool burnable,
        bool mintable,
        bool pausable
    ) external nonReentrant returns (address) {
        // Vérifier et transférer les frais
        require(IERC20(stablecoinAddress).transferFrom(
            msg.sender,
            address(this),
            creationFee
        ), "Fee transfer failed");
        
        // Déployer le nouveau token
        TokenForgeToken newToken = new TokenForgeToken(
            name,
            symbol,
            decimals,
            totalSupply,
            msg.sender,
            burnable,
            mintable,
            pausable
        );
        
        // Enregistrer les détails
        tokensByCreator[msg.sender].push(address(newToken));
        tokenDetails[address(newToken)] = TokenDetails({
            name: name,
            symbol: symbol,
            decimals: decimals,
            totalSupply: totalSupply,
            owner: msg.sender,
            burnable: burnable,
            mintable: mintable,
            pausable: pausable,
            creationTime: block.timestamp
        });
        
        emit TokenCreated(
            address(newToken),
            msg.sender,
            name,
            symbol,
            totalSupply
        );
        
        return address(newToken);
    }
    
    function getTokensByCreator(address creator) 
        external 
        view 
        returns (address[] memory) 
    {
        return tokensByCreator[creator];
    }
    
    function updateCreationFee(uint256 newFee) external onlyOwner {
        creationFee = newFee;
    }
    
    function withdrawFees() external onlyOwner {
        uint256 balance = IERC20(stablecoinAddress).balanceOf(address(this));
        require(IERC20(stablecoinAddress).transfer(owner(), balance), 
            "Withdrawal failed");
    }
} 