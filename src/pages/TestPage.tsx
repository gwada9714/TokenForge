import { useState, useCallback } from 'react';
import { useWeb3 } from '../hooks/useWeb3';
import { TestForm } from '../components/test/TestForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

export const TestPage = () => {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isConnected, address } = useWeb3();

  const handleTest = useCallback(async (testParams: any) => {
    setIsLoading(true);
    setError(null);
    try {
      // Logique de test
      setResults(prev => [...prev, { success: true, message: 'Test successful' }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Token Test Dashboard</h1>
          <p className="text-gray-600">Test your token functionality</p>
        </div>

        <div className="card mb-6">
          <div className="card-header">
            <h2 className="text-xl font-semibold">Wallet Status</h2>
            {isConnected ? (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Connected: {address}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Not connected</span>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold">Test Configuration</h2>
          </div>
          <div className="card-content">
            <TestForm onSubmit={handleTest} disabled={isLoading || !isConnected} />
          </div>
        </div>

        {isLoading && (
          <div className="mt-6">
            <LoadingSpinner />
          </div>
        )}

        {error && (
          <div className="mt-6">
            <ErrorMessage message={error} />
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-6 card">
            <div className="card-header">
              <h2 className="text-xl font-semibold">Test Results</h2>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${
                      result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    } border`}
                  >
                    <p className="text-sm">{result.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 