import { useCommits, type CommitFilter } from "../hooks/useCommits";
import type { Commit } from "../types/commit";

// Types de commits basés sur commitlint.config.cjs
const COMMIT_TYPES = [
  {
    value: "feat",
    label: "Fonctionnalité",
    color: "bg-green-100 text-green-800",
  },
  { value: "fix", label: "Correction", color: "bg-red-100 text-red-800" },
  { value: "docs", label: "Documentation", color: "bg-blue-100 text-blue-800" },
  { value: "style", label: "Style", color: "bg-purple-100 text-purple-800" },
  {
    value: "refactor",
    label: "Refactorisation",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "perf",
    label: "Performance",
    color: "bg-indigo-100 text-indigo-800",
  },
  { value: "test", label: "Tests", color: "bg-gray-100 text-gray-800" },
  { value: "build", label: "Build", color: "bg-orange-100 text-orange-800" },
  { value: "ci", label: "CI/CD", color: "bg-pink-100 text-pink-800" },
  { value: "chore", label: "Maintenance", color: "bg-teal-100 text-teal-800" },
  { value: "revert", label: "Revert", color: "bg-red-200 text-red-900" },
  {
    value: "contract",
    label: "Smart Contract",
    color: "bg-blue-200 text-blue-900",
  },
];

// Scopes de commits basés sur commitlint.config.cjs
const COMMIT_SCOPES = [
  { value: "ui", label: "UI" },
  { value: "core", label: "Core" },
  { value: "contract", label: "Smart Contract" },
  { value: "test", label: "Tests" },
  { value: "deps", label: "Dépendances" },
  { value: "config", label: "Configuration" },
  { value: "docs", label: "Documentation" },
];

interface CommitListProps {
  initialFilter?: CommitFilter;
  showFilters?: boolean;
  showStats?: boolean;
  showPagination?: boolean;
  maxHeight?: string;
}

export const CommitList = ({
  initialFilter,
  showFilters = true,
  showStats = true,
  showPagination = true,
  maxHeight,
}: CommitListProps) => {
  const {
    commits,
    loading,
    error,
    filter,
    stats,
    pagination,
    deleteCommit,
    updateFilter,
    resetFilter,
  } = useCommits(initialFilter);

  // Obtenir la couleur pour un type de commit
  const getTypeColor = (type?: string) => {
    if (!type) return "bg-gray-100 text-gray-800";
    const commitType = COMMIT_TYPES.find((t) => t.value === type);
    return commitType?.color || "bg-gray-100 text-gray-800";
  };

  // Obtenir le libellé pour un type de commit
  const getTypeLabel = (type?: string) => {
    if (!type) return "Non spécifié";
    const commitType = COMMIT_TYPES.find((t) => t.value === type);
    return commitType?.label || type;
  };

  // Obtenir le libellé pour un scope de commit
  const getScopeLabel = (scope?: string) => {
    if (!scope) return "";
    const commitScope = COMMIT_SCOPES.find((s) => s.value === scope);
    return commitScope?.label || scope;
  };

  // Formater la date
  const formatDate = (date: Date | { toDate: () => Date } | unknown) => {
    if (!date) {
      return "Date inconnue";
    }

    // Convertir Timestamp Firebase si nécessaire
    const dateObj =
      date instanceof Date
        ? date
        : typeof date === "object" &&
          date !== null &&
          "toDate" in date &&
          typeof date.toDate === "function"
        ? date.toDate()
        : new Date(String(date));

    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj);
  };

  return (
    <div className="space-y-4">
      {/* Filtres */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <h3 className="text-lg font-semibold mb-3">Filtres</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de commit
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={filter.type || ""}
                onChange={(e) =>
                  updateFilter({ type: e.target.value || undefined })
                }
              >
                <option value="">Tous les types</option>
                {COMMIT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scope
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={filter.scope || ""}
                onChange={(e) =>
                  updateFilter({ scope: e.target.value || undefined })
                }
              >
                <option value="">Tous les scopes</option>
                {COMMIT_SCOPES.map((scope) => (
                  <option key={scope.value} value={scope.value}>
                    {scope.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={resetFilter}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques */}
      {showStats && stats && (
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <h3 className="text-lg font-semibold mb-3">Statistiques</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-md">
              <div className="text-sm text-blue-700">Total des commits</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
            <div className="bg-green-50 p-3 rounded-md">
              <div className="text-sm text-green-700">Fichiers ajoutés</div>
              <div className="text-2xl font-bold">
                {stats.totalChanges.added}
              </div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-md">
              <div className="text-sm text-yellow-700">Fichiers modifiés</div>
              <div className="text-2xl font-bold">
                {stats.totalChanges.modified}
              </div>
            </div>
            <div className="bg-red-50 p-3 rounded-md">
              <div className="text-sm text-red-700">Fichiers supprimés</div>
              <div className="text-2xl font-bold">
                {stats.totalChanges.deleted}
              </div>
            </div>
          </div>

          {/* Types de commits */}
          {Object.keys(stats.byType).length > 0 && (
            <div className="mt-4">
              <h4 className="text-md font-semibold mb-2">Types de commits</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.byType).map(([type, count]) => (
                  <div
                    key={type}
                    className={`${getTypeColor(
                      type
                    )} px-3 py-1 rounded-full text-sm flex items-center`}
                  >
                    <span>{getTypeLabel(type)}</span>
                    <span className="ml-2 bg-white bg-opacity-30 px-2 rounded-full">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scopes de commits */}
          {Object.keys(stats.byScope).length > 0 && (
            <div className="mt-4">
              <h4 className="text-md font-semibold mb-2">Scopes de commits</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.byScope).map(([scope, count]) => (
                  <div
                    key={scope}
                    className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    <span>{getScopeLabel(scope)}</span>
                    <span className="ml-2 bg-white bg-opacity-30 px-2 rounded-full">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Liste des commits */}
      <div
        className={`space-y-4 ${
          maxHeight ? `overflow-y-auto ${maxHeight}` : ""
        }`}
      >
        {loading && (
          <div className="flex justify-center p-4">Chargement...</div>
        )}

        {error && (
          <div className="text-red-500 p-4 bg-red-50 rounded-md">
            Erreur: {error.message}
          </div>
        )}

        {!loading && commits.length === 0 && (
          <div className="text-center text-gray-500 p-4 bg-gray-50 rounded-md">
            Aucun commit à afficher
          </div>
        )}

        {commits.map((commit: Commit) => (
          <div key={commit.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {commit.type && (
                    <span
                      className={`${getTypeColor(
                        commit.type
                      )} px-2 py-0.5 rounded-md text-xs`}
                    >
                      {getTypeLabel(commit.type)}
                    </span>
                  )}
                  {commit.scope && (
                    <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-md text-xs">
                      {getScopeLabel(commit.scope)}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold">{commit.message}</h3>
                <p className="text-sm text-gray-500">
                  {formatDate(commit.date)}
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
                  <span className="font-medium">Ajouts:</span>{" "}
                  {commit.changes.added.join(", ")}
                </div>
              )}
              {commit.changes.modified.length > 0 && (
                <div className="text-blue-600">
                  <span className="font-medium">Modifications:</span>{" "}
                  {commit.changes.modified.join(", ")}
                </div>
              )}
              {commit.changes.deleted.length > 0 && (
                <div className="text-red-600">
                  <span className="font-medium">Suppressions:</span>{" "}
                  {commit.changes.deleted.join(", ")}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Pagination */}
        {showPagination && pagination.hasMore && !loading && (
          <div className="flex justify-center mt-4">
            <button
              onClick={pagination.loadMore}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Charger plus
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
