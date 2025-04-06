import React, { useState } from "react";
import { useDocument, useQuery, useCollection } from "@/hooks/useFirestore";
import { where, orderBy, limit } from "firebase/firestore";
import { logger } from "@/core/logger";

const FirestoreHooksDemo: React.FC = () => {
  // États pour les formulaires
  const [collectionName, setCollectionName] = useState("tokens");
  const [documentId, setDocumentId] = useState("");
  const [queryField, setQueryField] = useState("type");
  const [queryValue, setQueryValue] = useState("token");
  const [newDocData, setNewDocData] = useState(
    '{"name": "Nouveau Token", "type": "token"}'
  );
  const [updateDocData, setUpdateDocData] = useState(
    '{"name": "Token Mis à Jour"}'
  );

  // États pour les options
  const [realtimeEnabled, setRealtimeEnabled] = useState(true);
  const [cacheEnabled, setCacheEnabled] = useState(true);

  // Utilisation du hook useDocument pour récupérer un document
  const {
    data: document,
    loading: documentLoading,
    error: documentError,
    reload: reloadDocument,
    invalidateCache: invalidateDocumentCache,
  } = useDocument(collectionName, documentId || null, {
    realtime: realtimeEnabled,
    cacheEnabled: cacheEnabled,
  });

  // Utilisation du hook useQuery pour exécuter une requête
  const {
    data: queryResults,
    loading: queryLoading,
    error: queryError,
    reload: reloadQuery,
    invalidateCache: invalidateQueryCache,
  } = useQuery(
    collectionName,
    [
      where(queryField, "==", queryValue),
      orderBy("createdAt", "desc"),
      limit(5),
    ],
    {
      realtime: realtimeEnabled,
      cacheEnabled: cacheEnabled,
    }
  );

  // Utilisation du hook useCollection pour les opérations CRUD
  const { addDocument, updateDocument, deleteDocument } =
    useCollection(collectionName);

  // Fonction pour ajouter un document
  const handleAddDocument = async () => {
    try {
      let data = {};
      try {
        data = JSON.parse(newDocData);
      } catch (error) {
        alert("Erreur de format JSON");
        return;
      }

      const docId = await addDocument(data);
      alert(`Document ajouté avec succès. ID: ${docId}`);

      // Recharger la requête pour afficher le nouveau document
      reloadQuery();
    } catch (error) {
      logger.error({
        category: "FirestoreHooksDemo",
        message: "Erreur lors de l'ajout d'un document",
        error: error instanceof Error ? error : new Error(String(error)),
      });
      alert(
        `Erreur lors de l'ajout du document: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  // Fonction pour mettre à jour un document
  const handleUpdateDocument = async () => {
    if (!documentId) {
      alert("Veuillez spécifier un ID de document");
      return;
    }

    try {
      let data = {};
      try {
        data = JSON.parse(updateDocData);
      } catch (error) {
        alert("Erreur de format JSON");
        return;
      }

      await updateDocument(documentId, data);
      alert("Document mis à jour avec succès");

      // Recharger le document pour afficher les modifications
      reloadDocument();
    } catch (error) {
      logger.error({
        category: "FirestoreHooksDemo",
        message: "Erreur lors de la mise à jour d'un document",
        error: error instanceof Error ? error : new Error(String(error)),
      });
      alert(
        `Erreur lors de la mise à jour du document: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  // Fonction pour supprimer un document
  const handleDeleteDocument = async () => {
    if (!documentId) {
      alert("Veuillez spécifier un ID de document");
      return;
    }

    if (
      confirm(`Êtes-vous sûr de vouloir supprimer le document ${documentId} ?`)
    ) {
      try {
        await deleteDocument(documentId);
        alert("Document supprimé avec succès");

        // Réinitialiser l'état du document et recharger la requête
        setDocumentId("");
        reloadQuery();
      } catch (error) {
        logger.error({
          category: "FirestoreHooksDemo",
          message: "Erreur lors de la suppression d'un document",
          error: error instanceof Error ? error : new Error(String(error)),
        });
        alert(
          `Erreur lors de la suppression du document: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">
        Démonstration des Hooks Firestore
      </h2>

      {/* Options générales */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h3 className="text-lg font-semibold mb-2">Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={realtimeEnabled}
                onChange={(e) => setRealtimeEnabled(e.target.checked)}
                className="form-checkbox"
              />
              <span>Temps réel</span>
            </label>
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={cacheEnabled}
                onChange={(e) => setCacheEnabled(e.target.checked)}
                className="form-checkbox"
              />
              <span>Cache activé</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Collection
            </label>
            <input
              type="text"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section Document */}
        <div className="p-4 border rounded">
          <h3 className="text-lg font-semibold mb-4">useDocument</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID Document
            </label>
            <div className="flex">
              <input
                type="text"
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                className="flex-1 p-2 border rounded-l"
                placeholder="Entrez l'ID du document"
              />
              <button
                onClick={reloadDocument}
                className="px-3 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600"
              >
                Charger
              </button>
            </div>
          </div>

          <div className="mb-4">
            <button
              onClick={invalidateDocumentCache}
              className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2"
              disabled={!documentId}
            >
              Invalider Cache
            </button>
          </div>

          {/* Affichage de l'état */}
          <div className="mt-4">
            <h4 className="font-medium mb-2">État:</h4>
            <div className="p-2 bg-gray-100 rounded">
              {documentLoading === "loading" && <p>Chargement...</p>}
              {documentError && (
                <p className="text-red-500">Erreur: {documentError.message}</p>
              )}
              {documentLoading === "success" &&
                (document ? (
                  <pre className="text-xs overflow-auto max-h-40">
                    {JSON.stringify(document, null, 2)}
                  </pre>
                ) : (
                  <p className="text-gray-500">Document non trouvé</p>
                ))}
            </div>
          </div>

          {/* Formulaire de mise à jour */}
          <div className="mt-4">
            <h4 className="font-medium mb-2">Mettre à jour le document:</h4>
            <div className="mb-2">
              <textarea
                value={updateDocData}
                onChange={(e) => setUpdateDocData(e.target.value)}
                className="w-full p-2 border rounded font-mono text-sm"
                rows={4}
                placeholder="Entrez les données JSON"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleUpdateDocument}
                className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                disabled={!documentId}
              >
                Mettre à jour
              </button>
              <button
                onClick={handleDeleteDocument}
                className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                disabled={!documentId}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>

        {/* Section Query */}
        <div className="p-4 border rounded">
          <h3 className="text-lg font-semibold mb-4">useQuery</h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Champ
              </label>
              <input
                type="text"
                value={queryField}
                onChange={(e) => setQueryField(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valeur
              </label>
              <input
                type="text"
                value={queryValue}
                onChange={(e) => setQueryValue(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="mb-4">
            <button
              onClick={reloadQuery}
              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
            >
              Exécuter Requête
            </button>
            <button
              onClick={invalidateQueryCache}
              className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Invalider Cache
            </button>
          </div>

          {/* Affichage des résultats */}
          <div className="mt-4">
            <h4 className="font-medium mb-2">
              Résultats ({queryResults.length}):
            </h4>
            <div className="p-2 bg-gray-100 rounded">
              {queryLoading === "loading" && <p>Chargement...</p>}
              {queryError && (
                <p className="text-red-500">Erreur: {queryError.message}</p>
              )}
              {queryLoading === "success" &&
                (queryResults.length > 0 ? (
                  <div className="overflow-auto max-h-60">
                    {queryResults.map((item, index) => (
                      <div
                        key={index}
                        className="mb-2 p-2 bg-white rounded shadow-sm"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-sm">
                            ID: {item.id}
                          </span>
                          <button
                            onClick={() => setDocumentId(item.id)}
                            className="text-xs text-blue-500 hover:underline"
                          >
                            Charger
                          </button>
                        </div>
                        <pre className="text-xs overflow-auto max-h-20">
                          {JSON.stringify(item, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Aucun résultat</p>
                ))}
            </div>
          </div>

          {/* Formulaire d'ajout */}
          <div className="mt-4">
            <h4 className="font-medium mb-2">Ajouter un document:</h4>
            <div className="mb-2">
              <textarea
                value={newDocData}
                onChange={(e) => setNewDocData(e.target.value)}
                className="w-full p-2 border rounded font-mono text-sm"
                rows={4}
                placeholder="Entrez les données JSON"
              />
            </div>
            <button
              onClick={handleAddDocument}
              className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Ajouter Document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirestoreHooksDemo;
