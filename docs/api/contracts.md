# Contrats Intelligents TokenForge

## Vue d'ensemble

TokenForge utilise plusieurs contrats intelligents pour gérer les tokens et le marketplace. Cette documentation détaille les interfaces et les fonctions disponibles.

## Contrats

### TokenForgeFactory

Contrat principal pour la création de tokens.

#### Interface

```solidity
interface ITokenForgeFactory {
    function createToken(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        uint8 decimals,
        address owner
    ) external returns (address);

    function getUserTokens(address user)
        external
        view
        returns (address[] memory);
}
```

#### Utilisation avec ethers.js

```typescript
const factory = new Contract(address, abi, signer);
const tx = await factory.createToken(
  "Mon Token",
  "MTK",
  ethers.utils.parseEther("1000000"),
  18,
  ownerAddress
);
```

### TokenForgeMarketplace

Contrat pour la gestion du marketplace.

#### Interface

```solidity
interface ITokenForgeMarketplace {
    struct Item {
        uint256 id;
        address tokenAddress;
        uint256 amount;
        uint256 price;
        address seller;
        bool active;
    }

    function listItem(
        address tokenAddress,
        uint256 amount,
        uint256 price
    ) external;

    function buyItem(uint256 itemId)
        external
        payable;

    function cancelListing(uint256 itemId)
        external;

    function getItem(uint256 itemId)
        external
        view
        returns (Item memory);
}
```

#### Utilisation avec ethers.js

```typescript
const marketplace = new Contract(address, abi, signer);
const tx = await marketplace.listItem(
  tokenAddress,
  ethers.utils.parseEther("100"),
  ethers.utils.parseEther("1")
);
```

## Événements

### TokenForgeFactory

```solidity
event TokenCreated(
    address indexed token,
    address indexed owner,
    string name,
    string symbol
);
```

### TokenForgeMarketplace

```solidity
event ItemListed(
    uint256 indexed itemId,
    address indexed seller,
    address indexed tokenAddress,
    uint256 amount,
    uint256 price
);

event ItemSold(
    uint256 indexed itemId,
    address indexed buyer,
    address indexed seller,
    uint256 price
);

event ItemCancelled(
    uint256 indexed itemId,
    address indexed seller
);
```

## Hooks React

### useTokenForgeFactory

```typescript
const { createToken, getUserTokens, isLoading, error } = useTokenForgeFactory();
```

### useTokenForgeMarketplace

```typescript
const { listItem, buyItem, cancelListing, getItem, isLoading, error } =
  useTokenForgeMarketplace();
```

## Gestion des Erreurs

Les erreurs courantes incluent :

- `InsufficientBalance`: Solde insuffisant
- `InvalidAmount`: Montant invalide
- `Unauthorized`: Non autorisé
- `ItemNotFound`: Item non trouvé
- `ItemNotActive`: Item non actif

## Tests et Vérification

Pour tester les contrats :

```bash
npx hardhat test
```

Pour vérifier les contrats sur Etherscan :

```bash
npx hardhat verify --network mainnet CONTRACT_ADDRESS CONSTRUCTOR_ARGS
```
