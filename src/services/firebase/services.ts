import { FirebaseApp, getApps, initializeApp, FirebaseError } from 'firebase/app';
import { Auth, getAuth, connectAuthEmulator } from 'firebase/auth';
import { Firestore, getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { Functions, getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { logger } from '@/core/logger';
import { firebaseConfig, firebaseSettings } from '@/config/firebase/index';

export enum FirebaseServiceStatus {
  INITIALIZING = 'INITIALIZING',
  READY = 'READY',
  ERROR = 'ERROR',
  NOT_INITIALIZED = 'NOT_INITIALIZED'
}

export interface FirebaseServiceState {
  status: FirebaseServiceStatus;
  error?: Error;
}

export class InitializationError extends Error {
  constructor(service: string, originalError: unknown) {
    super(`Failed to initialize ${service}`);
    this.name = 'InitializationError';
    this.cause = originalError;
  }
}

class FirebaseManager {
    private static instance: FirebaseManager;
    private app: FirebaseApp;
    private services = {
        auth: null as Auth | null,
        firestore: null as Firestore | null,
        functions: null as Functions | null
    };
    private serviceState: FirebaseServiceState = {
        status: FirebaseServiceStatus.NOT_INITIALIZED
    };
    private initialized = false;
    private initializationPromise: Promise<void> | null = null;

    private constructor() {
        if (!getApps().length) {
            this.app = initializeApp(firebaseConfig);
        } else {
            this.app = getApps()[0];
        }
        logger.info({ 
            category: 'FirebaseManager', 
            message: 'Firebase instance created',
            metadata: { status: this.serviceState.status }
        });
    }

    static getInstance(): FirebaseManager {
        if (!FirebaseManager.instance) {
            FirebaseManager.instance = new FirebaseManager();
        }
        return FirebaseManager.instance;
    }

    private async initialize(): Promise<void> {
        if (this.initialized) return;
        if (this.initializationPromise) return this.initializationPromise;

        try {
            this.serviceState = {
                status: FirebaseServiceStatus.INITIALIZING
            };
            
            this.initializationPromise = this.initializeServices();
            await this.initializationPromise;
            
        } catch (error) {
            this.handleInitError(error);
            throw error;
        }
    }

    private async initializeServices(): Promise<void> {
        try {
            await Promise.all([
                this.initializeAuth(),
                this.initializeFirestore(),
                this.initializeFunctions()
            ]);
            this.initialized = true;
            this.serviceState = {
                status: FirebaseServiceStatus.READY
            };
        } catch (error) {
            this.handleInitError(error);
            throw error;
        }
    }

    private handleInitError(error: unknown): void {
        this.initialized = false;
        this.initializationPromise = null;
        this.serviceState = {
            status: FirebaseServiceStatus.ERROR,
            error: error instanceof Error ? error : new Error(String(error))
        };
        
        if (error instanceof FirebaseError) {
            logger.error({
                category: 'FirebaseManager',
                message: `Firebase error: ${error.code}`,
                error,
                metadata: { 
                    code: error.code,
                    status: this.serviceState.status 
                }
            });
        } else {
            logger.error({
                category: 'FirebaseManager',
                message: 'Initialization error',
                error,
                metadata: { status: this.serviceState.status }
            });
        }
    }

    public getServiceState(): FirebaseServiceState {
        return this.serviceState;
    }

    private async initializeFirestore(): Promise<void> {
        try {
            this.services.firestore = getFirestore(this.app);
            
            if (firebaseSettings.emulatorMode) {
                const [host, port] = firebaseSettings.firestoreEmulatorHost.split(':');
                connectFirestoreEmulator(this.services.firestore, host, parseInt(port));
            }
        } catch (error) {
            throw new InitializationError('Firestore', error);
        }
    }

    private async initializeFunctions(): Promise<void> {
        try {
            this.services.functions = getFunctions(this.app);
            
            if (firebaseSettings.emulatorMode) {
                const [host, port] = firebaseSettings.functionsEmulatorHost.split(':');
                connectFunctionsEmulator(this.services.functions, host, parseInt(port));
            }
        } catch (error) {
            throw new InitializationError('Functions', error);
        }
    }

    private async initializeAuth(): Promise<void> {
        try {
            this.services.auth = getAuth(this.app);
            
            if (firebaseSettings.emulatorMode) {
                const [host, port] = firebaseSettings.authEmulatorHost.split(':');
                connectAuthEmulator(this.services.auth, `http://${host}:${port}`);
            }
            
            await this.services.auth.authStateReady();
        } catch (error) {
            throw new InitializationError('Auth', error);
        }
    }

    async getAuth(): Promise<Auth> {
        await this.initialize();
        if (!this.services.auth) throw new Error("Auth non initialisé");
        return this.services.auth;
    }

    async getFirestore(): Promise<Firestore> {
        await this.initialize();
        if (!this.services.firestore) throw new Error("Firestore non initialisé");
        return this.services.firestore;
    }

    async getFunctions(): Promise<Functions> {
        await this.initialize();
        if (!this.services.functions) throw new Error("Functions non initialisé");
        return this.services.functions;
    }
}

export const firebaseManager = FirebaseManager.getInstance();
