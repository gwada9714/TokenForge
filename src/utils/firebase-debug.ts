import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { logger, LogLevel } from './firebase-logger';

export class FirebaseDebugger {
  private static getGlobalObject(): any {
    return typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : null;
  }

  private static formatObject(obj: any): string {
    try {
      return JSON.stringify(obj, (key, value) => {
        if (value instanceof Function) return 'function';
        if (value instanceof Promise) return 'promise';
        return value;
      }, 2);
    } catch (error) {
      return `[Non-serializable object: ${typeof obj}]`;
    }
  }

  static getGlobalFirebaseState(): void {
    const global = this.getGlobalObject();
    if (!global) {
      logger.log(LogLevel.ERROR, 'Environnement global non disponible');
      return;
    }

    // Vérifier Firebase dans l'objet global
    const firebaseGlobal = (global as any).firebase;
    logger.log(LogLevel.INFO, 'État global Firebase:', this.formatObject(firebaseGlobal));

    // Vérifier les dépendances Firebase
    const firebaseDeps = Object.keys(global).filter(key => 
      key.toLowerCase().includes('firebase') || 
      (typeof (global as any)[key] === 'object' && (global as any)[key]?.SDK_VERSION)
    );
    logger.log(LogLevel.INFO, 'Dépendances Firebase disponibles:', firebaseDeps);
  }

  static getDependencyTree(): void {
    const global = this.getGlobalObject();
    if (!global) return;

    // Vérifier les modules Firebase chargés
    const modules = Object.keys(global).filter(key => {
      const value = (global as any)[key];
      return value && typeof value === 'object' && (
        key.includes('firebase') ||
        value.SDK_VERSION ||
        value.INTERNAL?.registerComponent
      );
    });

    logger.log(LogLevel.INFO, 'Modules Firebase chargés:', modules);

    // Vérifier les versions des modules
    modules.forEach(moduleName => {
      const module = (global as any)[moduleName];
      if (module?.SDK_VERSION) {
        logger.log(LogLevel.INFO, `Version du module ${moduleName}:`, module.SDK_VERSION);
      }
    });
  }

  static async checkFirebaseState(app: FirebaseApp): Promise<void> {
    try {
      logger.log(LogLevel.INFO, 'État de l\'application Firebase:', {
        name: app.name,
        options: app.options,
        automaticDataCollectionEnabled: app.automaticDataCollectionEnabled
      });

      // Vérifier si l'app est initialisée
      if (!app.name) {
        throw new Error('L\'application Firebase n\'est pas correctement initialisée');
      }

      // Vérifier les modules disponibles
      const modules = await this.getLoadedModules(app);
      logger.log(LogLevel.INFO, 'Modules Firebase disponibles:', modules);

    } catch (error) {
      logger.log(LogLevel.ERROR, 'Erreur lors de la vérification de l\'état Firebase:', error);
      throw error;
    }
  }

  static async checkAuthState(auth: Auth): Promise<void> {
    try {
      logger.log(LogLevel.INFO, 'État de l\'authentification:', {
        currentUser: auth.currentUser,
        languageCode: auth.languageCode,
        tenantId: auth.tenantId,
        settings: {
          appVerificationDisabledForTesting: auth.settings?.appVerificationDisabledForTesting,
          authDomain: auth.config?.authDomain
        }
      });

      // Vérifier si Auth est initialisé
      if (!auth.app) {
        throw new Error('L\'authentification n\'est pas correctement initialisée');
      }

    } catch (error) {
      logger.log(LogLevel.ERROR, 'Erreur lors de la vérification de l\'état Auth:', error);
      throw error;
    }
  }

  private static async getLoadedModules(app: FirebaseApp): Promise<string[]> {
    const modules: string[] = [];
    
    try {
      // Tester chaque module Firebase
      const moduleTests = [
        { name: 'auth', test: async () => (await import('firebase/auth')).getAuth(app) },
        { name: 'firestore', test: async () => (await import('firebase/firestore')).getFirestore(app) },
        { name: 'storage', test: async () => (await import('firebase/storage')).getStorage(app) },
        { name: 'functions', test: async () => (await import('firebase/functions')).getFunctions(app) }
      ];

      for (const { name, test } of moduleTests) {
        try {
          await test();
          modules.push(name);
        } catch (error) {
          logger.log(LogLevel.WARN, `Module ${name} non disponible:`, error);
        }
      }
    } catch (error) {
      logger.log(LogLevel.ERROR, 'Erreur lors du test des modules:', error);
    }

    return modules;
  }
}
