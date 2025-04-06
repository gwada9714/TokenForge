import { getFirebaseManager } from "../services";
import { getAuth, signInAnonymously, signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

/**
 * Tests des règles de sécurité Firestore
 * Ces tests vérifient que les règles de sécurité Firestore fonctionnent correctement
 * pour différents types d'utilisateurs et d'opérations.
 */
export class FirestoreSecurityTest {
  /**
   * Test d'accès anonyme en lecture
   * Vérifie qu'un utilisateur anonyme ne peut pas lire les collections protégées
   */
  static async testAnonymousRead(): Promise<any> {
    try {
      // S'assure qu'aucun utilisateur n'est connecté
      const auth = getAuth();
      await signOut(auth);

      // Se connecte en tant qu'utilisateur anonyme
      await signInAnonymously(auth);

      // Obtient l'instance Firestore
      const fbManager = await getFirebaseManager();
      const db = fbManager.db;

      // Tente de lire une collection protégée
      const usersCollection = collection(db, "users");

      try {
        await getDocs(usersCollection);

        return {
          success: false,
          message:
            "ERREUR DE SÉCURITÉ: Lecture anonyme autorisée pour une collection protégée",
          data: {
            isAnonymous: auth.currentUser?.isAnonymous || false,
          },
        };
      } catch (error) {
        // C'est le comportement attendu - la lecture devrait être rejetée
        return {
          success: true,
          message:
            "Lecture anonyme correctement rejetée pour la collection protégée",
          data: {
            isAnonymous: auth.currentUser?.isAnonymous || false,
            error: error instanceof Error ? error.message : String(error),
          },
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Erreur lors du test de lecture anonyme: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error: error,
      };
    } finally {
      // Déconnexion pour nettoyer l'état
      const auth = getAuth();
      await signOut(auth);
    }
  }

  /**
   * Test d'accès anonyme aux rapports CSP
   * Vérifie qu'un utilisateur anonyme peut créer des rapports CSP mais pas les lire
   */
  static async testAnonymousCspViolation(): Promise<any> {
    try {
      // S'assure qu'aucun utilisateur n'est connecté
      const auth = getAuth();
      await signOut(auth);

      // Se connecte en tant qu'utilisateur anonyme
      await signInAnonymously(auth);

      // Obtient l'instance Firestore
      const fbManager = await getFirebaseManager();
      const db = fbManager.db;

      // Tente de créer un rapport de violation CSP
      const cspCollection = collection(db, "cspViolations");

      try {
        const docRef = await addDoc(cspCollection, {
          userAgent: "Test User Agent",
          violatedDirective: "script-src",
          blockedURI: "https://malicious-site.com/script.js",
          reportedAt: Timestamp.now(),
        });

        // Maintenant, tente de lire le rapport créé
        let canRead = false;
        try {
          await getDoc(docRef);
          canRead = true;
        } catch (readError) {
          canRead = false;
        }

        // Nettoie après le test
        try {
          await deleteDoc(docRef);
        } catch (cleanupError) {
          console.error("Erreur lors du nettoyage:", cleanupError);
        }

        return {
          success: !canRead, // Succès si peut créer mais ne peut pas lire
          message: canRead
            ? "ERREUR DE SÉCURITÉ: Un utilisateur anonyme peut lire les rapports CSP"
            : "Comportement correct: Un utilisateur anonyme peut créer mais pas lire les rapports CSP",
          data: {
            isAnonymous: auth.currentUser?.isAnonymous || false,
            canCreate: true,
            canRead: canRead,
          },
        };
      } catch (error) {
        return {
          success: false,
          message:
            "Échec: Un utilisateur anonyme ne peut pas créer de rapport CSP",
          data: {
            isAnonymous: auth.currentUser?.isAnonymous || false,
            error: error instanceof Error ? error.message : String(error),
          },
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Erreur lors du test des violations CSP: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error: error,
      };
    } finally {
      // Déconnexion pour nettoyer l'état
      const auth = getAuth();
      await signOut(auth);
    }
  }

  /**
   * Test d'accès authentifié en lecture de son propre profil
   * Vérifie qu'un utilisateur authentifié peut lire et modifier son propre profil
   */
  static async testAuthenticatedUserProfile(): Promise<any> {
    try {
      // Obtient l'instance Firestore et l'état d'authentification actuel
      const fbManager = await getFirebaseManager();
      const db = fbManager.db;
      const auth = getAuth();

      // Vérifie si un utilisateur est connecté
      if (!auth.currentUser) {
        return {
          success: false,
          message:
            "Utilisateur non authentifié. Connectez-vous d'abord pour exécuter ce test.",
          data: {
            isAuthenticated: false,
          },
        };
      }

      const userId = auth.currentUser.uid;

      // Test de lecture du profil utilisateur
      const userRef = doc(db, "users", userId);
      let userExists = false;
      let updateSuccess = false;

      try {
        const userDoc = await getDoc(userRef);
        userExists = userDoc.exists();

        if (userExists) {
          // Test de mise à jour du profil (lastLogin uniquement)
          try {
            await updateDoc(userRef, {
              lastLogin: serverTimestamp(),
            });
            updateSuccess = true;
          } catch (updateError) {
            updateSuccess = false;
          }
        } else {
          // Tente de créer un profil utilisateur s'il n'existe pas
          try {
            await addDoc(collection(db, "users"), {
              userId: userId,
              email: auth.currentUser.email,
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
            });
            userExists = true;
          } catch (createError) {
            userExists = false;
          }
        }

        return {
          success: userExists || updateSuccess,
          message: `L'utilisateur ${
            userExists ? "peut accéder à" : "n'a pas encore"
          } son profil. ${updateSuccess ? "Mise à jour réussie." : ""}`,
          data: {
            userId: userId,
            userExists: userExists,
            updateSuccess: updateSuccess,
          },
        };
      } catch (error) {
        return {
          success: false,
          message: "Échec d'accès au profil utilisateur",
          error: error,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Erreur lors du test de profil utilisateur: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error: error,
      };
    }
  }

  /**
   * Test d'accès aux wallets
   * Vérifie qu'un utilisateur authentifié peut gérer ses propres wallets
   */
  static async testWalletAccess(): Promise<any> {
    try {
      // Obtient l'instance Firestore et l'état d'authentification actuel
      const fbManager = await getFirebaseManager();
      const db = fbManager.db;
      const auth = getAuth();

      // Vérifie si un utilisateur est connecté
      if (!auth.currentUser) {
        return {
          success: false,
          message:
            "Utilisateur non authentifié. Connectez-vous d'abord pour exécuter ce test.",
          data: {
            isAuthenticated: false,
          },
        };
      }

      const userId = auth.currentUser.uid;
      const isEmailVerified = auth.currentUser.emailVerified;

      // Collection wallets
      const walletsCollection = collection(db, "wallets");
      const q = query(walletsCollection, where("userId", "==", userId));

      try {
        // Vérifie si l'utilisateur a déjà des wallets enregistrés
        const snapshot = await getDocs(q);
        const walletDocs = snapshot.docs;

        // Si l'utilisateur n'a pas d'email vérifié, il ne pourra pas créer de wallet
        if (!isEmailVerified) {
          return {
            success: true,
            message:
              "Email non vérifié: Impossible de créer un wallet (comportement correct)",
            data: {
              userId: userId,
              isEmailVerified: isEmailVerified,
              existingWallets: walletDocs.length,
            },
          };
        }

        // Si l'utilisateur a déjà des wallets, teste la lecture
        if (walletDocs.length > 0) {
          return {
            success: true,
            message: "Accès en lecture aux wallets réussi",
            data: {
              userId: userId,
              isEmailVerified: isEmailVerified,
              wallets: walletDocs.map((doc) => doc.data()),
            },
          };
        } else {
          // L'utilisateur n'a pas encore de wallet, essayons d'en créer un
          try {
            // Tente de créer un nouveau wallet
            const newWalletRef = await addDoc(walletsCollection, {
              userId: userId,
              address: "0x1234567890123456789012345678901234567890", // Adresse valide selon le format
              createdAt: serverTimestamp(),
              name: "Test Wallet",
            });

            // Nettoie après le test
            try {
              await deleteDoc(newWalletRef);
            } catch (cleanupError) {
              console.error("Erreur lors du nettoyage:", cleanupError);
            }

            return {
              success: true,
              message: "Création de wallet réussie",
              data: {
                userId: userId,
                isEmailVerified: isEmailVerified,
              },
            };
          } catch (createError) {
            return {
              success: false,
              message: `Échec de création de wallet: ${
                createError instanceof Error
                  ? createError.message
                  : String(createError)
              }`,
              data: {
                userId: userId,
                isEmailVerified: isEmailVerified,
                error: createError,
              },
            };
          }
        }
      } catch (error) {
        return {
          success: false,
          message: "Échec d'accès aux wallets",
          error: error,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Erreur lors du test d'accès aux wallets: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error: error,
      };
    }
  }

  /**
   * Test d'accès à d'autres profils utilisateurs
   * Vérifie qu'un utilisateur ne peut pas accéder aux profils d'autres utilisateurs
   */
  static async testOtherUserAccess(): Promise<any> {
    try {
      // Obtient l'instance Firestore et l'état d'authentification actuel
      const fbManager = await getFirebaseManager();
      const db = fbManager.db;
      const auth = getAuth();

      // Vérifie si un utilisateur est connecté
      if (!auth.currentUser) {
        return {
          success: false,
          message:
            "Utilisateur non authentifié. Connectez-vous d'abord pour exécuter ce test.",
          data: {
            isAuthenticated: false,
          },
        };
      }

      // Pour tester les règles de sécurité, essayons d'accéder à un ID utilisateur qui n'est pas le nôtre
      const otherUserId = "other-user-id-123456";
      const otherUserRef = doc(db, "users", otherUserId);

      try {
        await getDoc(otherUserRef);

        // Si nous arrivons ici, c'est que la règle de sécurité n'a pas fonctionné
        return {
          success: false,
          message:
            "ERREUR DE SÉCURITÉ: Accès au profil d'un autre utilisateur réussi",
          data: {
            currentUserId: auth.currentUser.uid,
            otherUserId: otherUserId,
          },
        };
      } catch (error) {
        // C'est le comportement attendu - l'accès devrait être refusé
        return {
          success: true,
          message:
            "Sécurité fonctionnelle: Accès au profil d'un autre utilisateur correctement refusé",
          data: {
            currentUserId: auth.currentUser.uid,
            otherUserId: otherUserId,
            error: error instanceof Error ? error.message : String(error),
          },
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Erreur lors du test d'accès à d'autres profils: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error: error,
      };
    }
  }
}
