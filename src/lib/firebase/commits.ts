import { firestoreService } from "./firestore";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
  limit,
  Timestamp,
  startAfter,
  getDoc,
} from "firebase/firestore";
import type { Commit } from "@/types/commit";
import { logger } from "@/core/logger";

const COMMITS_COLLECTION = "commits";

// Ajouter un nouveau commit
export const addCommit = async (commit: Omit<Commit, "id">) => {
  try {
    const db = await firestoreService.ensureInitialized();
    const docRef = await addDoc(collection(db, COMMITS_COLLECTION), {
      ...commit,
      date: new Date(),
    });

    logger.info({
      category: "Commits",
      message: "Nouveau commit ajouté",
      data: { commitId: docRef.id },
    });

    return docRef.id;
  } catch (error) {
    logger.error({
      category: "Commits",
      message: "Erreur lors de l'ajout du commit",
      error: error instanceof Error ? error : new Error(String(error)),
    });
    throw error;
  }
};

// Récupérer les commits d'un utilisateur
export const getUserCommits = async (userId: string, limitCount = 50) => {
  try {
    const db = await firestoreService.ensureInitialized();
    const q = query(
      collection(db, COMMITS_COLLECTION),
      where("userId", "==", userId),
      orderBy("date", "desc"),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    const commits = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Commit[];

    logger.debug({
      category: "Commits",
      message: `${commits.length} commits récupérés pour l'utilisateur`,
      data: { userId },
    });

    return commits;
  } catch (error) {
    logger.error({
      category: "Commits",
      message: "Erreur lors de la récupération des commits",
      error: error instanceof Error ? error : new Error(String(error)),
      data: { userId },
    });
    throw error;
  }
};

// Récupérer les commits par projet
export const getProjectCommits = async (projectId: string, limitCount = 50) => {
  try {
    const db = await firestoreService.ensureInitialized();
    const q = query(
      collection(db, COMMITS_COLLECTION),
      where("projectId", "==", projectId),
      orderBy("date", "desc"),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    const commits = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Commit[];

    logger.debug({
      category: "Commits",
      message: `${commits.length} commits récupérés pour le projet`,
      data: { projectId },
    });

    return commits;
  } catch (error) {
    logger.error({
      category: "Commits",
      message: "Erreur lors de la récupération des commits du projet",
      error: error instanceof Error ? error : new Error(String(error)),
      data: { projectId },
    });
    throw error;
  }
};

// Récupérer les commits par type (feat, fix, etc.)
export const getCommitsByType = async (type: string, limitCount = 50) => {
  try {
    const db = await firestoreService.ensureInitialized();
    const q = query(
      collection(db, COMMITS_COLLECTION),
      where("type", "==", type),
      orderBy("date", "desc"),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    const commits = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Commit[];

    logger.debug({
      category: "Commits",
      message: `${commits.length} commits de type ${type} récupérés`,
      data: { type },
    });

    return commits;
  } catch (error) {
    logger.error({
      category: "Commits",
      message: `Erreur lors de la récupération des commits de type ${type}`,
      error: error instanceof Error ? error : new Error(String(error)),
      data: { type },
    });
    throw error;
  }
};

// Récupérer les commits par scope (ui, core, etc.)
export const getCommitsByScope = async (scope: string, limitCount = 50) => {
  try {
    const db = await firestoreService.ensureInitialized();
    const q = query(
      collection(db, COMMITS_COLLECTION),
      where("scope", "==", scope),
      orderBy("date", "desc"),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    const commits = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Commit[];

    logger.debug({
      category: "Commits",
      message: `${commits.length} commits du scope ${scope} récupérés`,
      data: { scope },
    });

    return commits;
  } catch (error) {
    logger.error({
      category: "Commits",
      message: `Erreur lors de la récupération des commits du scope ${scope}`,
      error: error instanceof Error ? error : new Error(String(error)),
      data: { scope },
    });
    throw error;
  }
};

// Pagination des commits
export const getCommitsPaginated = async (
  lastVisibleCommit: Commit | null,
  pageSize = 20,
  filters?: {
    userId?: string;
    projectId?: string;
    type?: string;
    scope?: string;
  }
) => {
  try {
    const db = await firestoreService.ensureInitialized();

    // Construire la requête de base
    let q = query(
      collection(db, COMMITS_COLLECTION),
      orderBy("date", "desc"),
      limit(pageSize)
    );

    // Ajouter les filtres si présents
    const conditions = [];
    if (filters?.userId) conditions.push(where("userId", "==", filters.userId));
    if (filters?.projectId)
      conditions.push(where("projectId", "==", filters.projectId));
    if (filters?.type) conditions.push(where("type", "==", filters.type));
    if (filters?.scope) conditions.push(where("scope", "==", filters.scope));

    // Reconstruire la requête avec les filtres
    if (conditions.length > 0) {
      q = query(
        collection(db, COMMITS_COLLECTION),
        ...conditions,
        orderBy("date", "desc"),
        limit(pageSize)
      );
    }

    // Ajouter la pagination si un dernier commit est fourni
    if (lastVisibleCommit) {
      const lastDocRef = doc(db, COMMITS_COLLECTION, lastVisibleCommit.id);
      const lastDoc = await getDoc(lastDocRef);

      if (lastDoc.exists()) {
        q = query(
          collection(db, COMMITS_COLLECTION),
          ...conditions,
          orderBy("date", "desc"),
          startAfter(lastDoc),
          limit(pageSize)
        );
      }
    }

    const querySnapshot = await getDocs(q);
    const commits = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Commit[];

    // Déterminer s'il y a plus de résultats
    const hasMore = commits.length === pageSize;

    logger.debug({
      category: "Commits",
      message: `${commits.length} commits récupérés avec pagination`,
      data: { filters, hasMore },
    });

    return {
      commits,
      hasMore,
      lastVisible: commits.length > 0 ? commits[commits.length - 1] : null,
    };
  } catch (error) {
    logger.error({
      category: "Commits",
      message: "Erreur lors de la récupération paginée des commits",
      error: error instanceof Error ? error : new Error(String(error)),
      data: { filters },
    });
    throw error;
  }
};

// Obtenir des statistiques sur les commits
export const getCommitStats = async (
  userId?: string,
  projectId?: string,
  timeRange?: { start: Date; end: Date }
) => {
  try {
    const db = await firestoreService.ensureInitialized();

    // Construire la requête de base
    const conditions = [];
    if (userId) conditions.push(where("userId", "==", userId));
    if (projectId) conditions.push(where("projectId", "==", projectId));

    // Ajouter la plage de temps si spécifiée
    if (timeRange) {
      conditions.push(where("date", ">=", timeRange.start));
      conditions.push(where("date", "<=", timeRange.end));
    }

    const q = query(
      collection(db, COMMITS_COLLECTION),
      ...conditions,
      orderBy("date", "desc")
    );

    const querySnapshot = await getDocs(q);
    const commits = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Commit[];

    // Calculer les statistiques
    const stats = {
      total: commits.length,
      byType: {} as Record<string, number>,
      byScope: {} as Record<string, number>,
      totalChanges: {
        added: 0,
        modified: 0,
        deleted: 0,
      },
      timeDistribution: {} as Record<string, number>,
    };

    // Analyser chaque commit pour les statistiques
    commits.forEach((commit) => {
      // Par type
      if (commit.type) {
        stats.byType[commit.type] = (stats.byType[commit.type] || 0) + 1;
      }

      // Par scope
      if (commit.scope) {
        stats.byScope[commit.scope] = (stats.byScope[commit.scope] || 0) + 1;
      }

      // Changements
      if (commit.changes) {
        stats.totalChanges.added += commit.changes.added?.length || 0;
        stats.totalChanges.modified += commit.changes.modified?.length || 0;
        stats.totalChanges.deleted += commit.changes.deleted?.length || 0;
      }

      // Distribution temporelle (par jour)
      if (commit.date) {
        const date =
          commit.date instanceof Date
            ? commit.date
            : (commit.date as unknown as Timestamp)?.toDate?.() || new Date();

        const dateKey = date.toISOString().split("T")[0]; // Format YYYY-MM-DD
        stats.timeDistribution[dateKey] =
          (stats.timeDistribution[dateKey] || 0) + 1;
      }
    });

    logger.info({
      category: "Commits",
      message: "Statistiques des commits générées",
      data: {
        userId,
        projectId,
        timeRange: timeRange
          ? `${timeRange.start.toISOString()} - ${timeRange.end.toISOString()}`
          : "all time",
        totalCommits: stats.total,
      },
    });

    return stats;
  } catch (error) {
    logger.error({
      category: "Commits",
      message: "Erreur lors de la génération des statistiques des commits",
      error: error instanceof Error ? error : new Error(String(error)),
      data: { userId, projectId },
    });
    throw error;
  }
};

// Supprimer un commit
export const deleteCommit = async (commitId: string) => {
  try {
    const db = await firestoreService.ensureInitialized();
    await deleteDoc(doc(db, COMMITS_COLLECTION, commitId));

    logger.info({
      category: "Commits",
      message: "Commit supprimé",
      data: { commitId },
    });
  } catch (error) {
    logger.error({
      category: "Commits",
      message: "Erreur lors de la suppression du commit",
      error: error instanceof Error ? error : new Error(String(error)),
      data: { commitId },
    });
    throw error;
  }
};

// Mettre à jour un commit
export const updateCommit = async (
  commitId: string,
  updates: Partial<Commit>
) => {
  try {
    const db = await firestoreService.ensureInitialized();
    const commitRef = doc(db, COMMITS_COLLECTION, commitId);
    await updateDoc(commitRef, updates);

    logger.info({
      category: "Commits",
      message: "Commit mis à jour",
      data: { commitId },
    });
  } catch (error) {
    logger.error({
      category: "Commits",
      message: "Erreur lors de la mise à jour du commit",
      error: error instanceof Error ? error : new Error(String(error)),
      data: { commitId },
    });
    throw error;
  }
};
