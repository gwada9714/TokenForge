import React from "react";
import { useTokenForgeAuth } from "../hooks/useTokenForgeAuth";
import { AuthStatus } from "./AuthStatus";
import { LoginForm } from "./LoginForm";
import { WalletConnection } from "./WalletConnection";
import { AuthProgress } from "./ui/AuthProgress";
import { AuthErrorDisplay } from "./ui/AuthError";
import { AuthStatusBar } from "./ui/AuthStatusBar";

export const AuthenticationFlow: React.FC = () => {
  const {
    status,
    isAuthenticated,
    walletState: { isConnected, isCorrectNetwork, address, chainId },
    error,
    actions: { login, logout },
  } = useTokenForgeAuth();

  const isLoading = status === "loading";
  const showLoginForm = !isAuthenticated && !isLoading;
  const showWalletConnection = isAuthenticated && !isConnected;
  const showNetworkWarning = isConnected && !isCorrectNetwork;

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
    } catch (error) {
      // Error handling is managed by useTokenForgeAuth
    }
  };

  return (
    <div className="flex flex-col space-y-4 p-4 max-w-md mx-auto">
      <AuthStatusBar
        status={status}
        walletAddress={isConnected ? address : null}
        networkName={isConnected ? `Chain ${chainId}` : undefined}
      />

      {isLoading && <AuthProgress status={status} />}

      {error && <AuthErrorDisplay error={error} />}

      {showLoginForm && (
        <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error} />
      )}

      {showWalletConnection && <WalletConnection />}

      {showNetworkWarning && (
        <div
          className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4"
          role="alert"
        >
          <p>Please switch to the correct network to continue.</p>
        </div>
      )}

      {isAuthenticated && (
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      )}

      <AuthStatus status={status} error={error} />
    </div>
  );
};
