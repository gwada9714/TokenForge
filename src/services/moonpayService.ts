import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ethers } from 'ethers';

export interface MoonPayTransaction {
  id: string;
  userId: string;
  amount: string;
  status: 'pending' | 'completed' | 'failed';
  transactionHash?: string;
  tempWalletAddress?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  error?: string;
}

export interface TempWallet {
  id: string;
  address: string;
  privateKey: string;
  userId: string;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  used: boolean;
}

class MoonPayService {
  private readonly transactionsCollection = collection(db, 'moonpayTransactions');
  private readonly walletsCollection = collection(db, 'tempWallets');
  private readonly WALLET_EXPIRY_HOURS = 24; // Les portefeuilles expirent après 24h

  // Crée un portefeuille temporaire pour recevoir les fonds de MoonPay
  async createTempWallet(userId: string): Promise<TempWallet> {
    if (!userId) {
      throw new Error('ID utilisateur requis');
    }

    try {
      const wallet = ethers.Wallet.createRandom();
      const now = Timestamp.now();
      const expiresAt = Timestamp.fromDate(
        new Date(now.toDate().getTime() + this.WALLET_EXPIRY_HOURS * 60 * 60 * 1000)
      );

      const tempWallet: Omit<TempWallet, 'id'> = {
        address: wallet.address,
        privateKey: wallet.privateKey,
        userId,
        createdAt: now,
        expiresAt,
        used: false
      };

      const docRef = await addDoc(this.walletsCollection, tempWallet);
      return { ...tempWallet, id: docRef.id };
    } catch (error) {
      console.error('Error creating temp wallet:', error);
      throw new Error('Erreur lors de la création du portefeuille temporaire');
    }
  }

  // Initie une transaction MoonPay
  async initiateTransaction(userId: string, amount: string): Promise<MoonPayTransaction> {
    if (!userId || !amount) {
      throw new Error('ID utilisateur et montant requis');
    }

    try {
      const tempWallet = await this.createTempWallet(userId);
      const now = Timestamp.now();

      const transaction: Omit<MoonPayTransaction, 'id'> = {
        userId,
        amount,
        status: 'pending',
        tempWalletAddress: tempWallet.address,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(this.transactionsCollection, transaction);
      return { ...transaction, id: docRef.id };
    } catch (error) {
      console.error('Error initiating transaction:', error);
      throw new Error('Erreur lors de l\'initialisation de la transaction');
    }
  }

  // Met à jour le statut d'une transaction
  async updateTransactionStatus(
    transactionId: string,
    status: MoonPayTransaction['status'],
    transactionHash?: string,
    error?: string
  ): Promise<void> {
    if (!transactionId) {
      throw new Error('ID de transaction requis');
    }

    try {
      const transactionRef = doc(this.transactionsCollection, transactionId);
      const transactionDoc = await getDoc(transactionRef);

      if (!transactionDoc.exists()) {
        throw new Error('Transaction non trouvée');
      }

      const updateData: Partial<MoonPayTransaction> = {
        status,
        updatedAt: Timestamp.now()
      };

      if (transactionHash) {
        updateData.transactionHash = transactionHash;
      }

      if (error) {
        updateData.error = error;
      }

      await updateDoc(transactionRef, updateData);
    } catch (error) {
      console.error('Error updating transaction status:', error);
      throw new Error('Erreur lors de la mise à jour du statut de la transaction');
    }
  }

  // Récupère une transaction par son ID
  async getTransaction(transactionId: string): Promise<MoonPayTransaction | null> {
    if (!transactionId) {
      throw new Error('ID de transaction requis');
    }

    try {
      const transactionDoc = await getDoc(doc(this.transactionsCollection, transactionId));
      
      if (!transactionDoc.exists()) {
        return null;
      }

      return { 
        id: transactionDoc.id, 
        ...transactionDoc.data() 
      } as MoonPayTransaction;
    } catch (error) {
      console.error('Error getting transaction:', error);
      throw new Error('Erreur lors de la récupération de la transaction');
    }
  }

  // Récupère toutes les transactions d'un utilisateur
  async getUserTransactions(userId: string): Promise<MoonPayTransaction[]> {
    if (!userId) {
      throw new Error('ID utilisateur requis');
    }

    try {
      const q = query(
        this.transactionsCollection,
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MoonPayTransaction[];
    } catch (error) {
      console.error('Error getting user transactions:', error);
      throw new Error('Erreur lors de la récupération des transactions');
    }
  }

  // Nettoie les portefeuilles temporaires expirés
  async cleanupExpiredWallets(): Promise<void> {
    try {
      const now = Timestamp.now();
      const q = query(
        this.walletsCollection,
        where('expiresAt', '<=', now),
        where('used', '==', false)
      );

      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);

      querySnapshot.forEach((docSnapshot) => {
        batch.update(docSnapshot.ref, { used: true });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error cleaning up expired wallets:', error);
      throw new Error('Erreur lors du nettoyage des portefeuilles expirés');
    }
  }
}

export const moonpayService = new MoonPayService();
