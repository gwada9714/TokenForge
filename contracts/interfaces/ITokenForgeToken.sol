// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ITokenForgeBasic
 * @dev Interface de base pour l'Apprenti Forgeron (débutant)
 */
interface ITokenForgeBasic {
    // Fonctions de lecture de base
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    
    // Fonctions de transfert de base
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);

    // Events de base
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

/**
 * @title ITokenForgeIntermediate
 * @dev Interface pour le Forgeron (intermédiaire)
 */
interface ITokenForgeIntermediate is ITokenForgeBasic {
    // Gestion des taxes
    function taxRate() external view returns (uint256);
    function treasury() external view returns (address);
    function stakingPool() external view returns (address);
    function isExemptFromTax(address account) external view returns (bool);
    
    // Gestion de la propriété
    function owner() external view returns (address);
    function renounceOwnership() external;
    
    // Events intermédiaires
    event TaxRateUpdated(uint256 newRate);
    event ExemptStatusUpdated(address indexed account, bool exempt);
}

/**
 * @title ITokenForgeAdvanced
 * @dev Interface pour le Maître Forgeron (expert)
 */
interface ITokenForgeAdvanced is ITokenForgeIntermediate {
    // Configuration avancée des taxes
    function setTaxRate(uint256 newRate) external;
    function setExemptStatus(address account, bool exempt) external;
    function updateTreasuryAddress(address newTreasury) external;
    function updateStakingPoolAddress(address newStakingPool) external;
    
    // Gouvernance
    function createProposal(string memory description, uint256 votingPeriod) external returns (uint256);
    function vote(uint256 proposalId, bool support) external;
    function executeProposal(uint256 proposalId) external;
    function getProposalInfo(uint256 proposalId) external view returns (
        string memory description,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 startTime,
        uint256 endTime,
        bool executed
    );
    
    // Events avancés
    event ProposalCreated(uint256 indexed proposalId, address indexed creator, string description);
    event Voted(uint256 indexed proposalId, address indexed voter, bool support, uint256 votes);
    event ProposalExecuted(uint256 indexed proposalId);
}

/**
 * @title ITokenForgeDev
 * @dev Interface pour le Forgeron du Code (développeur)
 */
interface ITokenForgeDev is ITokenForgeAdvanced {
    // Informations techniques
    function getImplementationVersion() external pure returns (string memory);
    function getContractState() external view returns (
        uint256 currentTaxRate,
        address treasuryAddress,
        address stakingPoolAddress,
        uint256 totalProposals,
        uint256 totalHolders
    );
    
    // Hooks et callbacks personnalisables
    function setTransferHook(address hook) external;
    function setGovernanceHook(address hook) external;
    
    // Events techniques
    event HookUpdated(string indexed hookType, address indexed newHook);
    event StateUpdated(string indexed updateType, bytes data);
}

/**
 * @title ITokenForgeInvestor
 * @dev Interface pour l'Investisseur
 */
interface ITokenForgeInvestor {
    // Informations de transparence
    function getTokenInfo() external view returns (
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        uint256 circulatingSupply,
        address owner,
        bool ownershipRenounced,
        uint256 taxRate,
        address treasury,
        address stakingPool
    );
    
    // Statistiques et métriques
    function getMarketMetrics() external view returns (
        uint256 holders,
        uint256 transactions,
        uint256 totalTaxCollected,
        uint256 treasuryBalance,
        uint256 stakingPoolBalance
    );
    
    // Events de transparence
    event TokenMetricsUpdated(
        uint256 holders,
        uint256 transactions,
        uint256 totalTaxCollected
    );
}

/**
 * @title ITokenForgeToken
 * @dev Interface principale qui combine toutes les interfaces
 */
interface ITokenForgeToken is 
    ITokenForgeBasic,
    ITokenForgeIntermediate,
    ITokenForgeAdvanced,
    ITokenForgeDev,
    ITokenForgeInvestor
{}
