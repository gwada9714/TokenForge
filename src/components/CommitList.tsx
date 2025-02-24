import { useCommits } from '../hooks/useCommits';

export const CommitList = () => {
  const { commits, loading, error, deleteCommit } = useCommits();

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;

  return (
    <div className="commit-list">
      {commits.map(commit => (
        <div key={commit.id} className="commit-item">
          <h3>{commit.message}</h3>
          <p>Date: {commit.date.toLocaleDateString()}</p>
          <button onClick={() => deleteCommit(commit.id)}>Supprimer</button>
        </div>
      ))}
    </div>
  );
};
