/**
 * Exemples d'utilisation des fonctionnalités avancées du service Firestore
 * Ce fichier sert de documentation pratique pour illustrer les différentes façons
 * d'utiliser les transactions et opérations batch dans TokenForge
 */

import { firestoreService } from "../firestore";
import { logger } from "@/core/logger";
import { Timestamp } from "firebase/firestore";

/**
 * Exemple d'utilisation de batch pour mettre à jour plusieurs documents en une seule opération
 * Utile pour les opérations de masse comme le marquage de notifications comme lues
 */
export async function markMultipleNotificationsAsRead(
  userId: string,
  notificationIds: string[]
): Promise<void> {
  try {
    const batch = await firestoreService.createBatch();

    // Mettre à jour chaque notification en une seule opération atomique
    notificationIds.forEach((notificationId) => {
      batch.update(`users/${userId}/notifications`, notificationId, {
        read: true,
        readAt: Timestamp.now(),
      });
    });

    // Exécuter toutes les mises à jour en une seule opération réseau
    await batch.commit();

    logger.info({
      category: "Notifications",
      message: `${notificationIds.length} notifications marquées comme lues`,
      data: { userId },
    });
  } catch (error) {
    logger.error({
      category: "Notifications",
      message: "Erreur lors du marquage des notifications comme lues",
      error: error instanceof Error ? error : new Error(String(error)),
    });
    throw error;
  }
}

/**
 * Exemple d'utilisation de transactions pour effectuer un transfert de tokens entre wallets
 * Garantit que les deux wallets sont mis à jour de manière atomique
 */
export async function transferTokensBetweenWallets(
  fromWalletId: string,
  toWalletId: string,
  amount: number,
  tokenType: string
): Promise<boolean> {
  try {
    // Vérification préalable
    if (amount <= 0) {
      throw new Error("Le montant du transfert doit être positif");
    }

    const result = await firestoreService.executeTransaction(
      async (transaction) => {
        // Lire les documents des deux wallets
        const fromWalletRef = transaction.get(`wallets/${fromWalletId}`);
        const toWalletRef = transaction.get(`wallets/${toWalletId}`);

        const fromWallet = (await fromWalletRef).data();
        const toWallet = (await toWalletRef).data();

        if (!fromWallet || !toWallet) {
          throw new Error("Wallet source ou destination non trouvé");
        }

        // Vérifier que le wallet source a suffisamment de tokens
        const currentBalance = fromWallet.balances?.[tokenType] || 0;
        if (currentBalance < amount) {
          throw new Error("Solde insuffisant pour effectuer le transfert");
        }

        // Calculer les nouveaux soldes
        const newFromBalance = currentBalance - amount;
        const newToBalance = (toWallet.balances?.[tokenType] || 0) + amount;

        // Mettre à jour les deux wallets de manière atomique
        const fromUpdate = {
          [`balances.${tokenType}`]: newFromBalance,
          lastUpdated: Timestamp.now(),
        };

        const toUpdate = {
          [`balances.${tokenType}`]: newToBalance,
          lastUpdated: Timestamp.now(),
        };

        transaction.update(`wallets/${fromWalletId}`, fromUpdate);
        transaction.update(`wallets/${toWalletId}`, toUpdate);

        // Créer un enregistrement de transaction
        const transactionId = `transfer_${Date.now()}`;
        transaction.set("transactions", transactionId, {
          type: "transfer",
          fromWallet: fromWalletId,
          toWallet: toWalletId,
          amount,
          tokenType,
          status: "completed",
          timestamp: Timestamp.now(),
        });

        return true;
      }
    );

    logger.info({
      category: "Wallets",
      message: "Transfert de tokens réussi",
      data: { fromWalletId, toWalletId, amount, tokenType },
    });

    return result;
  } catch (error) {
    logger.error({
      category: "Wallets",
      message: "Erreur lors du transfert de tokens",
      error: error instanceof Error ? error : new Error(String(error)),
      data: { fromWalletId, toWalletId, amount, tokenType },
    });

    // Retourner false pour indiquer l'échec du transfert
    return false;
  }
}

/**
 * Exemple d'utilisation de requêtes avancées avec pagination pour lister les transactions
 * d'un utilisateur avec tri par date et pagination
 */
export async function getUserTransactions(
  userId: string,
  limit = 10,
  lastTransaction?: any
): Promise<{ transactions: any[]; hasMore: boolean; lastTransaction?: any }> {
  try {
    // Construire les contraintes de la requête
    const constraints = [
      where("userId", "==", userId), // Filtrer par utilisateur
      where("status", "==", "completed"), // Ne récupérer que les transactions complétées
      where(
        "timestamp",
        ">",
        Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      ), // Seulement les 30 derniers jours
    ];

    // Exécuter la requête paginée
    const result = await firestoreService.advancedQuery(
      "transactions",
      constraints,
      lastTransaction
    );

    return {
      transactions: result.results,
      hasMore: result.hasMore,
      lastTransaction: result.lastDoc,
    };
  } catch (error) {
    logger.error({
      category: "Transactions",
      message: "Erreur lors de la récupération des transactions utilisateur",
      error: error instanceof Error ? error : new Error(String(error)),
      data: { userId },
    });
    return { transactions: [], hasMore: false };
  }
}

/**
 * Exemple d'utilisation de createBatch pour créer une collection de NFTs
 */
export async function createNFTCollection(
  collectionName: string,
  ownerId: string,
  nftCount: number,
  baseMetadata: Record<string, unknown>
): Promise<string[]> {
  try {
    const batch = await firestoreService.createBatch();
    const nftIds: string[] = [];

    // Créer l'entité collection
    const collectionId = `collection_${Date.now()}`;
    batch.set("nftCollections", collectionId, {
      name: collectionName,
      ownerId,
      totalSupply: nftCount,
      createdAt: Timestamp.now(),
      status: "active",
    });

    // Créer chaque NFT dans la collection (maximum de 500 NFTs par batch dans Firestore)
    const maxBatchSize = 500;
    if (nftCount > maxBatchSize) {
      throw new Error(
        `Impossible de créer plus de ${maxBatchSize} NFTs en une seule opération`
      );
    }

    for (let i = 0; i < nftCount; i++) {
      const nftId = `${collectionId}_${i + 1}`;
      nftIds.push(nftId);

      batch.set("nfts", nftId, {
        collectionId,
        tokenId: i + 1,
        ownerId,
        metadata: {
          ...baseMetadata,
          name: `${baseMetadata.name || collectionName} #${i + 1}`,
        },
        createdAt: Timestamp.now(),
        status: "minted",
      });
    }

    // Exécuter le batch
    await batch.commit();

    logger.info({
      category: "NFTs",
      message: `Collection de ${nftCount} NFTs créée avec succès`,
      data: { collectionId, ownerId },
    });

    return nftIds;
  } catch (error) {
    logger.error({
      category: "NFTs",
      message: "Erreur lors de la création de la collection de NFTs",
      error: error instanceof Error ? error : new Error(String(error)),
      data: { collectionName, ownerId, nftCount },
    });
    throw error;
  }
}
