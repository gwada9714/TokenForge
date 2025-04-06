class MockWalletReconnectionService {
  private static instance: MockWalletReconnectionService;

  private constructor() {}

  static getInstance(): MockWalletReconnectionService {
    if (!MockWalletReconnectionService.instance) {
      MockWalletReconnectionService.instance =
        new MockWalletReconnectionService();
    }
    return MockWalletReconnectionService.instance;
  }

  isCorrectNetwork(_chainId: number): boolean {
    return true;
  }

  async reconnectWallet(): Promise<boolean> {
    return true;
  }

  startReconnectionAttempts(): void {}

  stopReconnectionAttempts(): void {}
}

export const walletReconnectionService =
  MockWalletReconnectionService.getInstance();
