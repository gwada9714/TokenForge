import { useCommits } from '../hooks/useCommits';

export const CommitList = () => {
  const { commits, loading, error, deleteCommit } = useCommits();

  if (loading) return <div className="flex justify-center p-4">Chargement...</div>;
  if (error) return <div className="text-red-500 p-4">Erreur: {error.message}</div>;

  return (
    <div className="space-y-4">
      {commits.map(commit => (
        <div key={commit.id} className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{commit.message}</h3>
              <p className="text-sm text-gray-500">
                {new Date(commit.date).toLocaleString()}
              </p>
            </div>
            <button 
              onClick={() => deleteCommit(commit.id)}
              className="text-red-500 hover:text-red-700"
            >
              Supprimer
            </button>
          </div>
          
          <div className="mt-3 space-y-2">
            {commit.changes.added.length > 0 && (
              <div className="text-green-600">
                <span className="font-medium">Ajouts:</span> {commit.changes.added.join(', ')}
              </div>
            )}
            {commit.changes.modified.length > 0 && (
              <div className="text-blue-600">
                <span className="font-medium">Modifications:</span> {commit.changes.modified.join(', ')}
              </div>
            )}
            {commit.changes.deleted.length > 0 && (
              <div className="text-red-600">
                <span className="font-medium">Suppressions:</span> {commit.changes.deleted.join(', ')}
              </div>
            )}
          </div>
        </div>
      ))}
      
      {commits.length === 0 && (
        <div className="text-center text-gray-500 p-4">
          Aucun commit à afficher
        </div>
      )}
    </div>
  );
};
