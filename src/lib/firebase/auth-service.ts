import { signInWithEmailAndPassword, User } from 'firebase/auth';
import { getFirebaseAuth } from './auth';
import { handleFirebaseError } from '../../utils/error-handler';

export const authService = {
  async signIn(email: string, password: string): Promise<User> {
    try {
      const auth = getFirebaseAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error) {
      throw handleFirebaseError(error);
    }
  },

  async signOut(): Promise<void> {
    try {
      const auth = getFirebaseAuth();
      await auth.signOut();
    } catch (error) {
      throw handleFirebaseError(error);
    }
  }
};
