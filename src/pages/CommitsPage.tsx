import { useState } from "react";
import { CommitList } from "../components/CommitList";
import { CommitForm } from "../components/CommitForm";
import { useAuth } from "../hooks/useAuth";

export const CommitsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"list" | "add">("list");
  const [refreshKey, setRefreshKey] = useState(0);

  // Fonction pour rafraîchir la liste des commits après l'ajout d'un nouveau commit
  const handleCommitAdded = () => {
    setRefreshKey((prev) => prev + 1);
    setActiveTab("list");
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md">
          Vous devez être connecté pour accéder à la gestion des commits.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Commits</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2 rounded-md ${
              activeTab === "list"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Liste des commits
          </button>
          <button
            onClick={() => setActiveTab("add")}
            className={`px-4 py-2 rounded-md ${
              activeTab === "add"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Ajouter un commit
          </button>
        </div>
      </div>

      {activeTab === "list" ? (
        <div key={refreshKey}>
          <CommitList
            showFilters={true}
            showStats={true}
            showPagination={true}
            maxHeight="calc(100vh - 250px)"
          />
        </div>
      ) : (
        <CommitForm onSuccess={handleCommitAdded} />
      )}
    </div>
  );
};

export default CommitsPage;
