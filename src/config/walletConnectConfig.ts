export const walletConnectProjectId = import.meta.env
  .VITE_WALLET_CONNECT_PROJECT_ID as string;

if (!walletConnectProjectId) {
  throw new Error(
    "Missing VITE_WALLET_CONNECT_PROJECT_ID environment variable"
  );
}
