export const notificationService = {
  notifyLoginSuccess: jest.fn(),
  notifyLoginError: jest.fn(),
  notifyLogout: jest.fn(),
  notifyEmailVerified: jest.fn(),
  notifyEmailVerificationError: jest.fn(),
  notifyWalletConnected: jest.fn(),
  notifyWalletDisconnected: jest.fn(),
  notifyNetworkChanged: jest.fn(),
};
