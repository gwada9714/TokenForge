import { useState, useEffect } from "react";
import { adminService } from "../services/adminService";
import { errorService } from "../services/errorService";

interface AdminState {
  isAdmin: boolean;
  loading: boolean;
  error: Error | null;
}

export function useAdminStatus(userId: string | undefined) {
  const [state, setState] = useState<AdminState>({
    isAdmin: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!userId) {
        setState({
          isAdmin: false,
          loading: false,
          error: null,
        });
        return;
      }

      try {
        const isAdmin = await adminService.verifyAdminStatus(userId);
        setState({
          isAdmin,
          loading: false,
          error: null,
        });
      } catch (error) {
        setState({
          isAdmin: false,
          loading: false,
          error: errorService.handleError(error),
        });
      }
    };

    checkAdminStatus();
  }, [userId]);

  return state;
}
