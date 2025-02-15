import { useState } from 'react';
import { Commit } from '../types/commit';

export const useCommits = () => {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createCommit = async (commitData: Omit<Commit, 'id' | 'date'>) => {
    setLoading(true);
    try {
      const newCommit: Commit = {
        ...commitData,
        id: crypto.randomUUID(),
        date: new Date()
      };
      setCommits(prev => [...prev, newCommit]);
      return newCommit;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors de la création du commit'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCommits = () => commits;

  const deleteCommit = async (commitId: string) => {
    setLoading(true);
    try {
      setCommits(prev => prev.filter(commit => commit.id !== commitId));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors de la suppression du commit'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    commits,
    loading,
    error,
    createCommit,
    getCommits,
    deleteCommit
  };
};
