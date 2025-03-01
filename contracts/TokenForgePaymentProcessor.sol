// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title TokenForgePaymentProcessor
 * @dev Contrat pour gérer les paiements de TokenForge en cryptomonnaies natives et stablecoins
 */
contract TokenForgePaymentProcessor is Ownable, ReentrancyGuard {
    // Adresse du wallet destinataire des paiements
    address public paymentWallet;
    
    // Liste des tokens acceptés
    mapping(address => bool) public acceptedTokens;
    
    // Structure pour stocker les informations de session de paiement
    struct PaymentSession {
        string sessionId;
        address payerAddress;
        address tokenAddress; // null (address(0)) pour les paiements en crypto native
        uint256 amountDue;
        uint256 createdAt;
        uint256 expiresAt;
        bool completed;
    }
    
    // Mapping des sessions de paiement par ID
    mapping(string => PaymentSession) public paymentSessions;
    
    // Événements
    event PaymentSessionCreated(
        string sessionId,
        address payerAddress,
        address tokenAddress,
        uint256 amountDue,
        uint256 expiresAt
    );
    
    event NativePaymentReceived(
        string sessionId,
        address payer,
        uint256 amount
    );
    
    event TokenPaymentReceived(
        string sessionId,
        address payer,
        address token,
        uint256 amount
    );
    
    event TokenAdded(address tokenAddress);
    event TokenRemoved(address tokenAddress);
    
    /**
     * @dev Constructeur
     * @param _paymentWallet Adresse du wallet qui recevra les paiements
     * @param _initialTokens Tableau des adresses de tokens acceptés initialement
     */
    constructor(address _paymentWallet, address[] memory _initialTokens) {
        require(_paymentWallet != address(0), "Invalid payment wallet");
        paymentWallet = _paymentWallet;
        
        for (uint i = 0; i < _initialTokens.length; i++) {
            _addAcceptedToken(_initialTokens[i]);
        }
    }
    
    /**
     * @dev Fonction pour recevoir des paiements en crypto native
     */
    receive() external payable {
        // Cette fonction permet de recevoir des paiements directs en ETH, BNB, etc.
        emit NativePaymentReceived("direct", msg.sender, msg.value);
    }
    
    /**
     * @dev Fonction de secours
     */
    fallback() external payable {
        // Redirection vers la fonction receive
        emit NativePaymentReceived("fallback", msg.sender, msg.value);
    }
    
    /**
     * @dev Ajouter un token à la liste des tokens acceptés
     * @param tokenAddress Adresse du contrat de token
     */
    function addAcceptedToken(address tokenAddress) external onlyOwner {
        _addAcceptedToken(tokenAddress);
    }
    
    /**
     * @dev Implémentation interne pour ajouter un token
     */
    function _addAcceptedToken(address tokenAddress) internal {
        require(tokenAddress != address(0), "Invalid token address");
        require(!acceptedTokens[tokenAddress], "Token already accepted");
        
        acceptedTokens[tokenAddress] = true;
        emit TokenAdded(tokenAddress);
    }
    
    /**
     * @dev Retirer un token de la liste des tokens acceptés
     * @param tokenAddress Adresse du contrat de token
     */
    function removeAcceptedToken(address tokenAddress) external onlyOwner {
        require(acceptedTokens[tokenAddress], "Token not in accepted list");
        
        acceptedTokens[tokenAddress] = false;
        emit TokenRemoved(tokenAddress);
    }
    
    /**
     * @dev Mettre à jour l'adresse du wallet de paiement
     * @param newWallet Nouvelle adresse du wallet
     */
    function updatePaymentWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Invalid wallet address");
        paymentWallet = newWallet;
    }
    
    /**
     * @dev Créer une nouvelle session de paiement pour crypto native
     * @param sessionId Identifiant unique de la session
     * @param payerAddress Adresse qui effectuera le paiement
     * @param amountDue Montant dû (avec les décimales appropriées)
     * @param validityPeriod Durée de validité en secondes
     */
    function createNativePaymentSession(
        string calldata sessionId,
        address payerAddress,
        uint256 amountDue,
        uint256 validityPeriod
    ) external onlyOwner {
        _createPaymentSession(
            sessionId,
            payerAddress,
            address(0), // Adresse nulle pour les paiements en crypto native
            amountDue,
            validityPeriod
        );
    }
    
    /**
     * @dev Créer une nouvelle session de paiement pour token
     * @param sessionId Identifiant unique de la session
     * @param payerAddress Adresse qui effectuera le paiement
     * @param tokenAddress Adresse du token à utiliser
     * @param amountDue Montant dû (avec les décimales appropriées)
     * @param validityPeriod Durée de validité en secondes
     */
    function createTokenPaymentSession(
        string calldata sessionId,
        address payerAddress,
        address tokenAddress,
        uint256 amountDue,
        uint256 validityPeriod
    ) external onlyOwner {
        require(acceptedTokens[tokenAddress], "Token not accepted");
        _createPaymentSession(
            sessionId,
            payerAddress,
            tokenAddress,
            amountDue,
            validityPeriod
        );
    }
    
    /**
     * @dev Implémentation interne pour créer une session de paiement
     */
    function _createPaymentSession(
        string calldata sessionId,
        address payerAddress,
        address tokenAddress,
        uint256 amountDue,
        uint256 validityPeriod
    ) internal {
        require(bytes(sessionId).length > 0, "Empty session ID");
        require(payerAddress != address(0), "Invalid payer address");
        require(amountDue > 0, "Amount must be greater than 0");
        require(validityPeriod > 0, "Validity period must be greater than 0");
        require(paymentSessions[sessionId].createdAt == 0, "Session ID already exists");
        
        uint256 expiresAt = block.timestamp + validityPeriod;
        
        PaymentSession memory session = PaymentSession({
            sessionId: sessionId,
            payerAddress: payerAddress,
            tokenAddress: tokenAddress,
            amountDue: amountDue,
            createdAt: block.timestamp,
            expiresAt: expiresAt,
            completed: false
        });
        
        paymentSessions[sessionId] = session;
        
        emit PaymentSessionCreated(
            sessionId,
            payerAddress,
            tokenAddress,
            amountDue,
            expiresAt
        );
    }
    
    /**
     * @dev Effectuer un paiement en crypto native pour une session donnée
     * @param sessionId Identifiant de la session de paiement
     */
    function makeNativePayment(string calldata sessionId) external payable nonReentrant {
        PaymentSession storage session = paymentSessions[sessionId];
        
        require(bytes(session.sessionId).length > 0, "Session not found");
        require(!session.completed, "Payment already completed");
        require(block.timestamp <= session.expiresAt, "Session expired");
        require(msg.sender == session.payerAddress, "Not authorized payer");
        require(session.tokenAddress == address(0), "Not a native crypto payment session");
        require(msg.value >= session.amountDue, "Insufficient payment amount");
        
        // Marquer la session comme complétée avant le transfert
        session.completed = true;
        
        // Transférer les fonds au wallet de paiement
        (bool success, ) = paymentWallet.call{value: msg.value}("");
        require(success, "Transfer failed");
        
        emit NativePaymentReceived(
            sessionId,
            msg.sender,
            msg.value
        );
    }
    
    /**
     * @dev Effectuer un paiement en token pour une session donnée
     * @param sessionId Identifiant de la session de paiement
     */
    function makeTokenPayment(string calldata sessionId) external nonReentrant {
        PaymentSession storage session = paymentSessions[sessionId];
        
        require(bytes(session.sessionId).length > 0, "Session not found");
        require(!session.completed, "Payment already completed");
        require(block.timestamp <= session.expiresAt, "Session expired");
        require(msg.sender == session.payerAddress, "Not authorized payer");
        require(session.tokenAddress != address(0), "Not a token payment session");
        
        IERC20 token = IERC20(session.tokenAddress);
        uint256 amountDue = session.amountDue;
        
        // Vérifier l'allowance
        require(
            token.allowance(msg.sender, address(this)) >= amountDue,
            "Insufficient allowance"
        );
        
        // Marquer la session comme complétée avant le transfert
        session.completed = true;
        
        // Effectuer le transfert
        bool success = token.transferFrom(msg.sender, paymentWallet, amountDue);
        require(success, "Token transfer failed");
        
        emit TokenPaymentReceived(
            sessionId,
            msg.sender,
            session.tokenAddress,
            amountDue
        );
    }
    
    /**
     * @dev Paiement direct en token (sans session)
     * @param tokenAddress Adresse du token
     * @param amount Montant à payer
     */
    function directTokenPayment(address tokenAddress, uint256 amount) external nonReentrant {
        require(acceptedTokens[tokenAddress], "Token not accepted");
        require(amount > 0, "Amount must be greater than 0");
        
        IERC20 token = IERC20(tokenAddress);
        
        // Vérifier l'allowance
        require(
            token.allowance(msg.sender, address(this)) >= amount,
            "Insufficient allowance"
        );
        
        // Effectuer le transfert
        bool success = token.transferFrom(msg.sender, paymentWallet, amount);
        require(success, "Token transfer failed");
        
        emit TokenPaymentReceived(
            "direct",
            msg.sender,
            tokenAddress,
            amount
        );
    }
    
    /**
     * @dev Annuler une session de paiement expirée
     * @param sessionId Identifiant de la session
     */
    function cancelExpiredSession(string calldata sessionId) external onlyOwner {
        PaymentSession storage session = paymentSessions[sessionId];
        
        require(bytes(session.sessionId).length > 0, "Session not found");
        require(!session.completed, "Payment already completed");
        require(block.timestamp > session.expiresAt, "Session not expired yet");
        
        // Supprimer la session
        delete paymentSessions[sessionId];
    }
    
    /**
     * @dev Vérifier si une session de paiement est complétée
     * @param sessionId Identifiant de la session
     * @return true si le paiement est complété, false sinon
     */
    function isPaymentCompleted(string calldata sessionId) external view returns (bool) {
        return paymentSessions[sessionId].completed;
    }
    
    /**
     * @dev Récupérer des tokens envoyés par erreur
     * @param tokenAddress Adresse du token à récupérer
     */
    function rescueTokens(address tokenAddress) external onlyOwner {
        IERC20 token = IERC20(tokenAddress);
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No tokens to rescue");
        
        bool success = token.transfer(paymentWallet, balance);
        require(success, "Token rescue failed");
    }
    
    /**
     * @dev Récupérer des cryptos natives envoyées par erreur
     */
    function rescueNative() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No native crypto to rescue");
        
        (bool success, ) = paymentWallet.call{value: balance}("");
        require(success, "Native crypto rescue failed");
    }
    
    /**
     * @dev Vérifier si un token est accepté
     * @param tokenAddress Adresse du token
     * @return true si le token est accepté, false sinon
     */
    function isTokenAccepted(address tokenAddress) external view returns (bool) {
        return acceptedTokens[tokenAddress];
    }
}
