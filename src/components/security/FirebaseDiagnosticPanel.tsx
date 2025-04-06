import React, { useEffect, useState } from "react";
import { getDiagnostics, getFirebaseStatus } from "@/config/firebase/index";

interface DiagnosticPanelProps {
  onClose?: () => void;
}

interface FirebaseDiagnostics {
  firebase?: {
    initialized?: boolean;
    currentUser?: unknown;
    status?: string;
    error?: unknown;
  };
  environment?: {
    nodeEnv?: string;
    hasApiKey?: boolean;
    hasAuthDomain?: boolean;
    hasProjectId?: boolean;
  };
  configPresent?: boolean;
  emulatorsConfigured?: boolean;
}

export const FirebaseDiagnosticPanel: React.FC<DiagnosticPanelProps> = ({
  onClose,
}) => {
  const [diagnostics, setDiagnostics] = useState<FirebaseDiagnostics | null>(
    null
  );
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchDiagnostics = async () => {
      try {
        const diag = await getDiagnostics();
        setDiagnostics(diag);
        const firebaseStatus = await getFirebaseStatus();
        setStatus(JSON.stringify(firebaseStatus, null, 2));
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Une erreur inconnue est survenue"
        );
      }
    };

    fetchDiagnostics();
  }, []);

  if (error) {
    return (
      <div className="fixed inset-0 bg-red-50 p-4 rounded-lg shadow-lg max-w-2xl mx-auto mt-10">
        <h2 className="text-red-600 text-xl font-bold mb-4">Erreur Firebase</h2>
        <p className="text-red-700">{error}</p>
        {onClose && (
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Fermer
          </button>
        )}
      </div>
    );
  }

  if (!diagnostics) {
    return (
      <div className="fixed inset-0 bg-gray-50 p-4 rounded-lg shadow-lg max-w-2xl mx-auto mt-10">
        <p className="text-gray-600">Chargement des diagnostics...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white p-4 rounded-lg shadow-lg max-w-2xl mx-auto mt-10 overflow-auto">
      <h2 className="text-2xl font-bold mb-6">Diagnostic Firebase</h2>

      <div className="space-y-6">
        <section>
          <h3 className="text-lg font-semibold mb-2">État des Services</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(diagnostics).map(
              ([key, value]: [string, unknown]) => {
                if (typeof value === "object" && value !== null) {
                  const serviceValue = value as {
                    isInitialized?: boolean;
                    error?: string;
                  };
                  if (serviceValue.isInitialized !== undefined) {
                    return (
                      <div key={key} className="p-3 bg-gray-50 rounded">
                        <div className="font-medium">{key}</div>
                        <div
                          className={`text-sm ${
                            serviceValue.isInitialized
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {serviceValue.isInitialized
                            ? "Initialisé"
                            : "Non initialisé"}
                        </div>
                        {serviceValue.error && (
                          <div className="text-sm text-red-500">
                            {serviceValue.error}
                          </div>
                        )}
                      </div>
                    );
                  }
                }
                return null;
              }
            )}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">Configuration</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded">
              <div className="font-medium">Configuration présente</div>
              <div
                className={`text-sm ${
                  diagnostics.configPresent ? "text-green-600" : "text-red-600"
                }`}
              >
                {diagnostics.configPresent ? "Oui" : "Non"}
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="font-medium">Émulateurs configurés</div>
              <div
                className={`text-sm ${
                  diagnostics.emulatorsConfigured
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {diagnostics.emulatorsConfigured ? "Oui" : "Non"}
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">Logs récents</h3>
          <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto max-h-40">
            {status}
          </pre>
        </section>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Fermer
        </button>
      )}
    </div>
  );
};
