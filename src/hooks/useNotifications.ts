import { useCallback, useReducer } from "react";

interface NotificationState {
  error: string | null;
  success: string | null;
  info: string | null;
}

type NotificationAction =
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_SUCCESS"; payload: string | null }
  | { type: "SET_INFO"; payload: string | null }
  | { type: "CLEAR_ALL" };

const initialState: NotificationState = {
  error: null,
  success: null,
  info: null,
};

function notificationReducer(
  state: NotificationState,
  action: NotificationAction
): NotificationState {
  switch (action.type) {
    case "SET_ERROR":
      return { ...state, error: action.payload, success: null, info: null };
    case "SET_SUCCESS":
      return { ...state, success: action.payload, error: null, info: null };
    case "SET_INFO":
      return { ...state, info: action.payload, error: null, success: null };
    case "CLEAR_ALL":
      return { error: null, success: null, info: null };
    default:
      return state;
  }
}

export function useNotifications() {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  const setError = useCallback((message: string | null) => {
    dispatch({ type: "SET_ERROR", payload: message });
  }, []);

  const setSuccess = useCallback((message: string | null) => {
    dispatch({ type: "SET_SUCCESS", payload: message });
  }, []);

  const setInfo = useCallback((message: string | null) => {
    dispatch({ type: "SET_INFO", payload: message });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: "CLEAR_ALL" });
  }, []);

  return {
    ...state,
    setError,
    setSuccess,
    setInfo,
    clearAll,
  };
}
