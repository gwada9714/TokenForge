import { useState, useEffect } from 'react';
import { getUserCommits, deleteCommit as deleteFirebaseCommit, addCommit as addFirebaseCommit } from '../lib/firebase/commits';
import type { Commit } from '../types/commit';
import { useAuth } from './useAuth';

export const useCommits = () => {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  // Charger les commits
  const loadCommits = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userCommits = await getUserCommits(user.uid);
      setCommits(userCommits);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors du chargement des commits'));
    } finally {
      setLoading(false);
    }
  };

  // Ajouter un commit
  const addCommit = async (message: string, changes: Commit['changes']) => {
    if (!user) return;

    try {
      const newCommit = {
        message,
        userId: user.uid,
        date: new Date(),
        changes
      };

      await addFirebaseCommit(newCommit);
      await loadCommits(); // Recharger la liste
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors de l\'ajout du commit'));
    }
  };

  // Supprimer un commit
  const deleteCommit = async (commitId: string) => {
    try {
      await deleteFirebaseCommit(commitId);
      setCommits(commits.filter(commit => commit.id !== commitId));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors de la suppression du commit'));
    }
  };

  // Charger les commits au montage et quand l'utilisateur change
  useEffect(() => {
    loadCommits();
  }, [user]);

  return {
    commits,
    loading,
    error,
    addCommit,
    deleteCommit,
    refreshCommits: loadCommits
  };
};
