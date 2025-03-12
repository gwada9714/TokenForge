import { useState, useEffect, useCallback } from "react";
import {
  deleteCommit as deleteFirebaseCommit,
  addCommit as addFirebaseCommit,
  getCommitsPaginated,
  getCommitStats,
  updateCommit as updateFirebaseCommit,
} from "../lib/firebase/commits";
import type { Commit } from "../types/commit";
import { useAuth } from "./useAuth";

export type CommitFilter = {
  userId?: string;
  projectId?: string;
  type?: string;
  scope?: string;
};

export type CommitStats = {
  total: number;
  byType: Record<string, number>;
  byScope: Record<string, number>;
  totalChanges: {
    added: number;
    modified: number;
    deleted: number;
  };
  timeDistribution: Record<string, number>;
};

export const useCommits = (initialFilter?: CommitFilter) => {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<CommitFilter>(initialFilter || {});
  const [stats, setStats] = useState<CommitStats | null>(null);
  const [pagination, setPagination] = useState({
    hasMore: false,
    lastVisible: null as Commit | null,
    pageSize: 20,
  });
  const { user } = useAuth();

  // Charger les commits avec filtres
  const loadCommits = useCallback(
    async (resetPagination = true) => {
      try {
        setLoading(true);

        // Si l'utilisateur n'est pas connecté et qu'aucun userId n'est spécifié dans le filtre
        if (!user && !filter.userId) {
          setCommits([]);
          setLoading(false);
          return;
        }

        // Utiliser l'ID de l'utilisateur connecté si aucun n'est spécifié dans le filtre
        const userId = filter.userId || (user ? user.uid : undefined);

        let result;

        if (resetPagination) {
          // Première page
          result = await getCommitsPaginated(null, pagination.pageSize, {
            ...filter,
            userId,
          });
        } else {
          // Page suivante
          result = await getCommitsPaginated(
            pagination.lastVisible,
            pagination.pageSize,
            {
              ...filter,
              userId,
            }
          );
        }

        const { commits: newCommits, hasMore, lastVisible } = result;

        // Si nous réinitialisons la pagination, remplacer les commits
        // Sinon, ajouter les nouveaux commits à la liste existante
        if (resetPagination) {
          setCommits(newCommits);
        } else {
          setCommits((prevCommits) => [...prevCommits, ...newCommits]);
        }

        setPagination({
          ...pagination,
          hasMore,
          lastVisible,
        });

        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Erreur lors du chargement des commits")
        );
      } finally {
        setLoading(false);
      }
    },
    [user, filter, pagination.pageSize, pagination.lastVisible]
  );

  // Charger plus de commits (pagination)
  const loadMoreCommits = async () => {
    if (!pagination.hasMore || loading) return;
    await loadCommits(false);
  };

  // Charger les statistiques des commits
  const loadStats = useCallback(
    async (timeRange?: { start: Date; end: Date }) => {
      try {
        const userId = filter.userId || (user ? user.uid : undefined);
        if (!userId && !filter.projectId) return;

        const commitStats = await getCommitStats(
          userId,
          filter.projectId,
          timeRange
        );
        setStats(commitStats);
      } catch (err) {
        console.error("Erreur lors du chargement des statistiques:", err);
      }
    },
    [user, filter]
  );

  // Ajouter un commit
  const addCommit = async (
    message: string,
    changes: Commit["changes"],
    options?: { type?: string; scope?: string; projectId?: string }
  ) => {
    if (!user) return;

    try {
      const newCommit = {
        message,
        userId: user.uid,
        date: new Date(),
        changes,
        ...options,
      };

      await addFirebaseCommit(newCommit);
      await loadCommits(); // Recharger la liste
      if (stats) await loadStats(); // Mettre à jour les statistiques
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Erreur lors de l'ajout du commit")
      );
    }
  };

  // Mettre à jour un commit
  const updateCommit = async (commitId: string, updates: Partial<Commit>) => {
    try {
      await updateFirebaseCommit(commitId, updates);
      setCommits(
        commits.map((commit) =>
          commit.id === commitId ? { ...commit, ...updates } : commit
        )
      );
      if (stats) await loadStats(); // Mettre à jour les statistiques
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Erreur lors de la mise à jour du commit")
      );
    }
  };

  // Supprimer un commit
  const deleteCommit = async (commitId: string) => {
    try {
      await deleteFirebaseCommit(commitId);
      setCommits(commits.filter((commit) => commit.id !== commitId));
      if (stats) await loadStats(); // Mettre à jour les statistiques
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Erreur lors de la suppression du commit")
      );
    }
  };

  // Mettre à jour les filtres
  const updateFilter = (newFilter: Partial<CommitFilter>) => {
    setFilter((prev) => ({ ...prev, ...newFilter }));
  };

  // Réinitialiser les filtres
  const resetFilter = () => {
    setFilter({});
  };

  // Charger les commits au montage et quand les filtres changent
  useEffect(() => {
    loadCommits();
  }, [loadCommits, filter]);

  // Charger les statistiques au montage et quand les filtres changent
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    commits,
    loading,
    error,
    filter,
    stats,
    pagination: {
      hasMore: pagination.hasMore,
      loadMore: loadMoreCommits,
    },
    addCommit,
    updateCommit,
    deleteCommit,
    updateFilter,
    resetFilter,
    refreshCommits: loadCommits,
    refreshStats: loadStats,
  };
};
