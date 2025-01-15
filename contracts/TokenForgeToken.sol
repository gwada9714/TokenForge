// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/ITokenForgeToken.sol";

/**
 * @title TokenForgeToken
 * @dev Implémentation complète du token TokenForge avec tous les niveaux de fonctionnalités
 */
contract TokenForgeToken is ITokenForgeToken {
    // Single storage slot for all config (saves massive gas)
    uint256 private _d; // All data packed: owner (160) | decimals (8) | flags (4) | totalSupply (84)
    
    // Constant bit positions
    uint256 private constant OWNER_SHIFT = 96;
    uint256 private constant DECIMALS_SHIFT = 88;
    uint256 private constant FLAGS_SHIFT = 84;
    
    // Tax configuration
    uint256 private constant BASIS_POINTS = 10000; // 100% = 10000
    uint256 private constant MAX_TAX_RATE = 100; // 1% maximum tax
    uint256 private _taxRate; // Current tax rate in basis points
    address private immutable _treasury;
    address private immutable _stakingPool;
    mapping(address => bool) private _isExempt;
    
    // Governance
    struct Proposal {
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        mapping(address => bool) hasVoted;
    }
    
    uint256 private _proposalCount;
    mapping(uint256 => Proposal) private _proposals;
    uint256 private constant MIN_VOTING_PERIOD = 3 days;
    uint256 private constant MAX_VOTING_PERIOD = 7 days;
    uint256 private constant MIN_PROPOSAL_THRESHOLD = 100000 * 10**18; // 100,000 tokens
    
    // Flags (uses only 4 bits total)
    uint256 private constant F_MINT = 1;
    uint256 private constant F_BURN = 2;
    uint256 private constant F_PAUSE = 4;
    uint256 private constant F_PAUSED = 8;

    // Token metadata - stored in code, not storage
    string private constant _name = "TokenForge Token";
    string private constant _symbol = "TFT";
    
    // Mappings - can't be packed but optimized access
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    // Advanced features
    address private _transferHook;
    address private _governanceHook;
    uint256 private _totalTransactions;
    uint256 private _totalTaxCollected;
    bool private _ownershipRenounced;

    // Error type - ultra gas efficient
    error E(uint8);  // Single byte error codes for maximum gas efficiency

    modifier onlyOwner() {
        if (msg.sender != owner()) revert E(1);
        _;
    }
    
    modifier whenNotPaused() {
        if((_d >> FLAGS_SHIFT) & F_PAUSED != 0) revert E(2);
        _;
    }

    constructor(address treasury_, address stakingPool_) {
        require(treasury_ != address(0) && stakingPool_ != address(0), "Invalid addresses");
        _treasury = treasury_;
        _stakingPool = stakingPool_;
        _taxRate = 50; // 0.5% default tax
        
        // Initialize packed storage
        _d = (uint256(uint160(msg.sender)) << OWNER_SHIFT) | // owner address
             (uint256(18) << DECIMALS_SHIFT) |              // 18 decimals
             0;                                             // no flags, zero supply
        
        _isExempt[msg.sender] = true; // Owner is exempt
        _isExempt[treasury_] = true;
        _isExempt[stakingPool_] = true;
    }

    // Implémentation ITokenForgeBasic
    function name() external pure override returns (string memory) { return _name; }
    function symbol() external pure override returns (string memory) { return _symbol; }
    function decimals() external view override returns (uint8) { return uint8((_d >> DECIMALS_SHIFT) & 0xFF); }
    function totalSupply() external view override returns (uint256) { return _d & ((1 << FLAGS_SHIFT) - 1); }
    function balanceOf(address account) external view override returns (uint256) { return _balances[account]; }
    
    function transfer(address to, uint256 amount) public override whenNotPaused returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }
    
    function allowance(address holder, address spender) external view override returns (uint256) {
        return _allowances[holder][spender];
    }
    
    function approve(address spender, uint256 amount) external override returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) external override whenNotPaused returns (bool) {
        _spendAllowance(from, msg.sender, amount);
        _transfer(from, to, amount);
        return true;
    }

    // Implémentation ITokenForgeIntermediate
    function owner() public view override returns (address) {
        return address(uint160(_d >> OWNER_SHIFT));
    }
    
    function renounceOwnership() external override onlyOwner {
        _ownershipRenounced = true;
        _d = (_d & ~(uint256(type(uint160).max) << OWNER_SHIFT)) | (uint256(uint160(address(0))) << OWNER_SHIFT);
    }
    
    function treasury() external view override returns (address) {
        return _treasury;
    }
    
    function stakingPool() external view override returns (address) {
        return _stakingPool;
    }
    
    function taxRate() external view override returns (uint256) {
        return _taxRate;
    }
    
    function isExemptFromTax(address account) external view override returns (bool) {
        return _isExempt[account];
    }

    // Implémentation ITokenForgeAdvanced
    function setTaxRate(uint256 newRate) external override onlyOwner {
        require(newRate <= MAX_TAX_RATE, "Tax too high");
        _taxRate = newRate;
        emit TaxRateUpdated(newRate);
    }
    
    function setExemptStatus(address account, bool exempt) external override onlyOwner {
        _isExempt[account] = exempt;
        emit ExemptStatusUpdated(account, exempt);
    }
    
    function updateTreasuryAddress(address /* newTreasury */) external view override onlyOwner {
        revert("Treasury address is immutable");
    }
    
    function updateStakingPoolAddress(address /* newStakingPool */) external view override onlyOwner {
        revert("Staking pool address is immutable");
    }
    
    function createProposal(string memory description, uint256 votingPeriod) external override returns (uint256) {
        require(_balances[msg.sender] >= MIN_PROPOSAL_THRESHOLD, "Insufficient tokens");
        require(votingPeriod >= MIN_VOTING_PERIOD && votingPeriod <= MAX_VOTING_PERIOD, "Invalid period");
        
        uint256 proposalId = _proposalCount++;
        Proposal storage proposal = _proposals[proposalId];
        proposal.description = description;
        proposal.startTime = block.timestamp;
        proposal.endTime = block.timestamp + votingPeriod;
        
        emit ProposalCreated(proposalId, msg.sender, description);
        return proposalId;
    }
    
    function vote(uint256 proposalId, bool support) external override {
        Proposal storage proposal = _proposals[proposalId];
        require(block.timestamp >= proposal.startTime, "Not started");
        require(block.timestamp <= proposal.endTime, "Ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        uint256 votes = _balances[msg.sender];
        require(votes > 0, "No voting power");
        
        if (support) {
            proposal.forVotes += votes;
        } else {
            proposal.againstVotes += votes;
        }
        
        proposal.hasVoted[msg.sender] = true;
        emit Voted(proposalId, msg.sender, support, votes);
    }
    
    function executeProposal(uint256 proposalId) external override {
        Proposal storage proposal = _proposals[proposalId];
        require(block.timestamp > proposal.endTime, "Voting ongoing");
        require(!proposal.executed, "Already executed");
        require(proposal.forVotes > proposal.againstVotes, "Proposal rejected");
        
        proposal.executed = true;
        emit ProposalExecuted(proposalId);
    }
    
    function getProposalInfo(uint256 proposalId) external view override returns (
        string memory description,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 startTime,
        uint256 endTime,
        bool executed
    ) {
        Proposal storage proposal = _proposals[proposalId];
        return (
            proposal.description,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.startTime,
            proposal.endTime,
            proposal.executed
        );
    }

    // Implémentation ITokenForgeDev
    function getImplementationVersion() external pure override returns (string memory) {
        return "1.0.0";
    }
    
    function getContractState() external view override returns (
        uint256 currentTaxRate,
        address treasuryAddress,
        address stakingPoolAddress,
        uint256 totalProposals,
        uint256 totalHolders
    ) {
        return (
            _taxRate,
            _treasury,
            _stakingPool,
            _proposalCount,
            _getTotalHolders()
        );
    }
    
    function setTransferHook(address hook) external override onlyOwner {
        _transferHook = hook;
        emit HookUpdated("transfer", hook);
    }
    
    function setGovernanceHook(address hook) external override onlyOwner {
        _governanceHook = hook;
        emit HookUpdated("governance", hook);
    }

    // Implémentation ITokenForgeInvestor
    function getTokenInfo() external view override returns (
        string memory name_,
        string memory symbol_,
        uint256 totalSupply_,
        uint256 circulatingSupply_,
        address owner_,
        bool ownershipRenounced_,
        uint256 currentTaxRate_,
        address treasuryAddress_,
        address stakingPoolAddress_
    ) {
        return (
            _name,
            _symbol,
            this.totalSupply(),
            this.totalSupply(),
            owner(),
            _ownershipRenounced,
            _taxRate,
            _treasury,
            _stakingPool
        );
    }
    
    function getMarketMetrics() external view override returns (
        uint256 holders,
        uint256 transactions,
        uint256 totalTaxCollected,
        uint256 treasuryBalance,
        uint256 stakingPoolBalance
    ) {
        return (
            _getTotalHolders(),
            _totalTransactions,
            _totalTaxCollected,
            _balances[_treasury],
            _balances[_stakingPool]
        );
    }

    // Fonctions internes
    function _transfer(address sender, address recipient, uint256 amount) internal {
        if(recipient == address(0)) revert E(5);
        if(_balances[sender] < amount) revert E(3);
        
        // Calculate tax if applicable
        uint256 taxAmount = 0;
        if (!_isExempt[sender] && !_isExempt[recipient] && _taxRate > 0) {
            taxAmount = (amount * _taxRate) / BASIS_POINTS;
            _totalTaxCollected += taxAmount;
        }
        
        unchecked {
            // Transfer main amount
            _balances[sender] = _balances[sender] - amount;
            _balances[recipient] = _balances[recipient] + (amount - taxAmount);
            
            // Distribute tax
            if (taxAmount > 0) {
                uint256 treasuryShare = (taxAmount * 75) / 100; // 75% to treasury
                uint256 stakingShare = taxAmount - treasuryShare; // 25% to staking pool
                _balances[_treasury] += treasuryShare;
                _balances[_stakingPool] += stakingShare;
            }
            
            _totalTransactions++;
        }
        
        emit Transfer(sender, recipient, amount);
        
        if (_transferHook != address(0)) {
            (bool success,) = _transferHook.call(
                abi.encodeWithSignature(
                    "onTransfer(address,address,uint256,uint256)",
                    sender, recipient, amount, taxAmount
                )
            );
            require(success, "Transfer hook failed");
        }
    }
    
    function _approve(address tokenOwner, address spender, uint256 amount) internal {
        require(tokenOwner != address(0), "Approve from zero");
        require(spender != address(0), "Approve to zero");

        _allowances[tokenOwner][spender] = amount;
        emit Approval(tokenOwner, spender, amount);
    }
    
    function _spendAllowance(address tokenOwner, address spender, uint256 amount) internal {
        uint256 currentAllowance = _allowances[tokenOwner][spender];
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "Insufficient allowance");
            unchecked {
                _approve(tokenOwner, spender, currentAllowance - amount);
            }
        }
    }
    
    function _getTotalHolders() internal pure returns (uint256 total) {
        // Note: Cette implémentation est simplifiée.
        // Dans une version production, nous utiliserions un compteur maintenu
        // lors des transferts pour plus d'efficacité.
        return 0;
    }
}