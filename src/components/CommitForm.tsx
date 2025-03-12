import { useState } from "react";
import { useCommits } from "../hooks/useCommits";
import type { Commit } from "../types/commit";

// Types de commits basés sur commitlint.config.cjs
const COMMIT_TYPES = [
  { value: "feat", label: "Fonctionnalité" },
  { value: "fix", label: "Correction" },
  { value: "docs", label: "Documentation" },
  { value: "style", label: "Style" },
  { value: "refactor", label: "Refactorisation" },
  { value: "perf", label: "Performance" },
  { value: "test", label: "Tests" },
  { value: "build", label: "Build" },
  { value: "ci", label: "CI/CD" },
  { value: "chore", label: "Maintenance" },
  { value: "revert", label: "Revert" },
  { value: "contract", label: "Smart Contract" },
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

interface CommitFormProps {
  projectId?: string;
  onSuccess?: () => void;
}

export const CommitForm = ({ projectId, onSuccess }: CommitFormProps) => {
  const { addCommit } = useCommits();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // État du formulaire
  const [message, setMessage] = useState("");
  const [type, setType] = useState("");
  const [scope, setScope] = useState("");
  const [addedFiles, setAddedFiles] = useState("");
  const [modifiedFiles, setModifiedFiles] = useState("");
  const [deletedFiles, setDeletedFiles] = useState("");

  // Convertir une chaîne de fichiers en tableau
  const parseFiles = (filesString: string): string[] => {
    if (!filesString.trim()) return [];
    return filesString
      .split(",")
      .map((file) => file.trim())
      .filter(Boolean);
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      setError("Le message du commit est requis");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const changes: Commit["changes"] = {
        added: parseFiles(addedFiles),
        modified: parseFiles(modifiedFiles),
        deleted: parseFiles(deletedFiles),
      };

      await addCommit(message, changes, {
        type: type || undefined,
        scope: scope || undefined,
        projectId: projectId,
      });

      // Réinitialiser le formulaire
      setMessage("");
      setAddedFiles("");
      setModifiedFiles("");
      setDeletedFiles("");
      setSuccess(true);

      // Appeler le callback de succès si fourni
      if (onSuccess) {
        onSuccess();
      }

      // Effacer le message de succès après 3 secondes
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Ajouter un commit</h2>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4">
          Commit ajouté avec succès !
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de commit
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">Sélectionner un type</option>
              {COMMIT_TYPES.map((commitType) => (
                <option key={commitType.value} value={commitType.value}>
                  {commitType.label}
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
              value={scope}
              onChange={(e) => setScope(e.target.value)}
            >
              <option value="">Sélectionner un scope</option>
              {COMMIT_SCOPES.map((commitScope) => (
                <option key={commitScope.value} value={commitScope.value}>
                  {commitScope.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message du commit *
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Description des changements"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fichiers ajoutés
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            value={addedFiles}
            onChange={(e) => setAddedFiles(e.target.value)}
            placeholder="fichier1.js, fichier2.js, ..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Séparez les fichiers par des virgules
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fichiers modifiés
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            value={modifiedFiles}
            onChange={(e) => setModifiedFiles(e.target.value)}
            placeholder="fichier1.js, fichier2.js, ..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Séparez les fichiers par des virgules
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fichiers supprimés
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            value={deletedFiles}
            onChange={(e) => setDeletedFiles(e.target.value)}
            placeholder="fichier1.js, fichier2.js, ..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Séparez les fichiers par des virgules
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            disabled={loading}
          >
            {loading ? "Ajout en cours..." : "Ajouter le commit"}
          </button>
        </div>
      </form>
    </div>
  );
};
