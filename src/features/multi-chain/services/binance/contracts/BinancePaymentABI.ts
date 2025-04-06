export const BinancePaymentABI = [
  // Events
  "event PaymentProcessed(address indexed payer, uint256 amount, string indexed sessionId)",
  "event PaymentRefunded(address indexed recipient, uint256 amount, string indexed sessionId)",

  // View functions
  "function receiverAddress() view returns (address)",
  "function isTokenSupported(address token) view returns (bool)",

  // State changing functions
  "function processPayment(address tokenAddress, uint256 amount, string calldata sessionId)",
  "function refundPayment(address to, uint256 amount, string calldata sessionId)",
  "function setTokenSupport(address tokenAddress, bool isSupported)",
  "function pause()",
  "function unpause()",
];
