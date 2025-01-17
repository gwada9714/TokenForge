// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./CustomERC20.sol";

contract TokenFactory is Ownable, Pausable {
    // Mapping pour suivre les tokens créés
    mapping(address => bool) public isTokenCreated;

    // Événement émis lors de la création d'un nouveau token
    event TokenCreated(
        address indexed creator,
        string name,
        string symbol
    );

    constructor() Ownable() Pausable() {
        _transferOwnership(msg.sender);
    }

    /**
     * @dev Crée un nouveau token ERC20
     * @param name Nom du token
     * @param symbol Symbole du token
     * @param initialSupply Supply initial du token
     * @param maxSupply Supply maximum du token
     * @param isBurnable Si le token peut être brûlé
     * @param isMintable Si le token peut être minté
     * @return address L'adresse du nouveau token créé
     */
    function createToken(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 initialSupply,
        uint256 maxSupply,
        bool isBurnable,
        bool isMintable
    ) public whenNotPaused returns (address) {
        require(initialSupply > 0, "InvalidInitialSupply");
        require(maxSupply >= initialSupply, "InvalidMaxSupply");

        bytes memory bytecode = type(CustomERC20).creationCode;
        bytes memory constructorArgs = abi.encode(
            name,
            symbol,
            decimals,
            initialSupply,
            maxSupply,
            isBurnable,
            isMintable,
            msg.sender
        );

        address tokenAddress = _deploy(bytecode, constructorArgs);
        
        // Marquer le token comme créé
        isTokenCreated[tokenAddress] = true;
        
        // Émettre l'événement de création
        emit TokenCreated(msg.sender, name, symbol);
        
        return tokenAddress;
    }

    /**
     * @dev Crée un nouveau token ERC20 avec des paramètres prédéfinis
     */
    function createBasicToken(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 initialSupply,
        uint256 maxSupply,
        bool isBurnable,
        bool isMintable
    ) public whenNotPaused returns (address) {
        require(initialSupply > 0, "InvalidInitialSupply");
        require(maxSupply >= initialSupply, "InvalidMaxSupply");

        bytes memory bytecode = type(CustomERC20).creationCode;
        bytes memory constructorArgs = abi.encode(
            name,
            symbol,
            decimals,
            initialSupply,
            maxSupply,
            isBurnable,
            isMintable,
            msg.sender
        );

        return _deploy(bytecode, constructorArgs);
    }

    /**
     * @dev Déploie un nouveau contrat
     */
    function _deploy(
        bytes memory bytecode,
        bytes memory constructorArgs
    ) internal returns (address addr) {
        require(address(this).balance >= msg.value, "InsufficientBalance");
        require(bytecode.length != 0, "Create2EmptyBytecode");

        assembly {
            addr := create2(
                callvalue(),
                add(bytecode, 0x20),
                mload(bytecode),
                constructorArgs
            )
        }

        require(addr != address(0), "FailedDeployment");
    }

    /**
     * @dev Met en pause le contrat
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev Retire la pause du contrat
     */
    function unpause() public onlyOwner {
        _unpause();
    }
}
