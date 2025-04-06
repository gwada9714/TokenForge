import { TokenForgeUser } from "../types/authTypes";

let refreshInterval: NodeJS.Timeout | null = null;

export const authSyncService = {
  startTokenRefresh: async (): Promise<void> => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }

    // Refresh token toutes les 55 minutes (le token expire après 1 heure)
    refreshInterval = setInterval(async () => {
      try {
        // Logique de refresh à implémenter
        console.log("Refreshing token...");
      } catch (error) {
        console.error("Error refreshing token:", error);
      }
    }, 55 * 60 * 1000);
  },

  stopTokenRefresh: (): void => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  },
};
