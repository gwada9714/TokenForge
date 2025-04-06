import { TokenForgeUser } from "../../types";

class MockFirebaseService {
  private static instance: MockFirebaseService;

  private constructor() {}

  static getInstance(): MockFirebaseService {
    if (!MockFirebaseService.instance) {
      MockFirebaseService.instance = new MockFirebaseService();
    }
    return MockFirebaseService.instance;
  }

  async signIn(_email: string, _password: string): Promise<TokenForgeUser> {
    return Promise.resolve({} as TokenForgeUser);
  }

  async signUp(_email: string, _password: string): Promise<TokenForgeUser> {
    return Promise.resolve({} as TokenForgeUser);
  }

  async signOut(): Promise<void> {
    return Promise.resolve();
  }

  async resetPassword(_email: string): Promise<void> {
    return Promise.resolve();
  }

  async updateProfile(
    _displayName?: string,
    _photoURL?: string
  ): Promise<TokenForgeUser> {
    return Promise.resolve({} as TokenForgeUser);
  }

  async getUserData(_uid: string): Promise<TokenForgeUser> {
    return Promise.resolve({} as TokenForgeUser);
  }

  onAuthStateChanged(
    callback: (user: TokenForgeUser | null) => void
  ): () => void {
    callback(null);
    return () => {};
  }
}

export const firebaseService = MockFirebaseService.getInstance();
