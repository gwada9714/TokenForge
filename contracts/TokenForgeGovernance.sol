// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title TokenForgeGovernance
 * @dev Implements a limited governance system for TokenForge platform
 */
contract TokenForgeGovernance is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // TKN token contract
    IERC20 public immutable tknToken;
    
    // Minimum TKN balance required to create proposals
    uint256 public constant MIN_PROPOSAL_BALANCE = 1000 * 10**18; // 1000 TKN
    
    // Minimum TKN staked required to vote
    uint256 public constant MIN_VOTE_STAKE = 100 * 10**18; // 100 TKN
    
    // Voting period duration
    uint256 public constant VOTING_PERIOD = 7 days;
    
    // Proposal types (limited to non-critical decisions)
    enum ProposalType {
        ADD_BLOCKCHAIN,      // Add new blockchain support
        UI_COLOR_THEME,     // Change UI color theme
        ADD_LANGUAGE        // Add new language support
    }
    
    struct Proposal {
        uint256 id;
        address creator;
        ProposalType proposalType;
        string description;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
        mapping(address => bool) hasVoted;
    }
    
    // Proposal storage
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    
    // Events
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed creator,
        ProposalType proposalType,
        string description
    );
    
    event Voted(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 weight
    );
    
    event ProposalExecuted(uint256 indexed proposalId);
    
    constructor(address _tknToken) {
        require(_tknToken != address(0), "Invalid TKN token address");
        tknToken = IERC20(_tknToken);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Create a new proposal
     * @param proposalType Type of the proposal (must be non-critical)
     * @param description Description of the proposal
     */
    function createProposal(
        ProposalType proposalType,
        string memory description
    ) external nonReentrant {
        require(
            tknToken.balanceOf(msg.sender) >= MIN_PROPOSAL_BALANCE,
            "Insufficient TKN balance to create proposal"
        );
        
        uint256 proposalId = proposalCount++;
        Proposal storage proposal = proposals[proposalId];
        
        proposal.id = proposalId;
        proposal.creator = msg.sender;
        proposal.proposalType = proposalType;
        proposal.description = description;
        proposal.startTime = block.timestamp;
        proposal.endTime = block.timestamp + VOTING_PERIOD;
        
        emit ProposalCreated(proposalId, msg.sender, proposalType, description);
    }
    
    /**
     * @dev Vote on a proposal
     * @param proposalId ID of the proposal
     * @param support True for support, false against
     */
    function vote(uint256 proposalId, bool support) external nonReentrant {
        require(
            tknToken.balanceOf(msg.sender) >= MIN_VOTE_STAKE,
            "Insufficient TKN stake to vote"
        );
        
        Proposal storage proposal = proposals[proposalId];
        
        require(block.timestamp <= proposal.endTime, "Voting period ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        uint256 weight = tknToken.balanceOf(msg.sender);
        
        if (support) {
            proposal.forVotes += weight;
        } else {
            proposal.againstVotes += weight;
        }
        
        proposal.hasVoted[msg.sender] = true;
        
        emit Voted(proposalId, msg.sender, support, weight);
    }
    
    /**
     * @dev Execute a successful proposal
     * @param proposalId ID of the proposal
     */
    function executeProposal(uint256 proposalId) external nonReentrant onlyRole(ADMIN_ROLE) {
        Proposal storage proposal = proposals[proposalId];
        
        require(block.timestamp > proposal.endTime, "Voting period not ended");
        require(!proposal.executed, "Proposal already executed");
        require(proposal.forVotes > proposal.againstVotes, "Proposal not passed");
        
        proposal.executed = true;
        
        // Execution logic is handled off-chain by the admin team
        // This ensures that only safe, non-critical changes can be implemented
        
        emit ProposalExecuted(proposalId);
    }
    
    /**
     * @dev Get proposal details
     */
    function getProposal(uint256 proposalId) external view returns (
        address creator,
        ProposalType proposalType,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        uint256 forVotes,
        uint256 againstVotes,
        bool executed
    ) {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.creator,
            proposal.proposalType,
            proposal.description,
            proposal.startTime,
            proposal.endTime,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.executed
        );
    }
    
    /**
     * @dev Check if an address has voted on a proposal
     */
    function hasVoted(uint256 proposalId, address voter) external view returns (bool) {
        return proposals[proposalId].hasVoted[voter];
    }
}
