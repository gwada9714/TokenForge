import React, { createContext, useReducer, useContext } from "react";
import { useTokenForgeAuth } from "../hooks/useTokenForgeAuth";
import { TokenForgeAuthState } from "../types/auth";
import { authReducer, initialState } from "../reducers/authReducer";
import { AuthAction } from "../actions/authActions";

const TokenForgeAuthContext = createContext<TokenForgeAuthState | undefined>(
  undefined
);

interface Props {
  children: React.ReactNode;
  initialAuthState?: Partial<TokenForgeAuthState>;
}

export const TokenForgeAuthProvider: React.FC<Props> = ({
  children,
  initialAuthState = {},
}) => {
  const [state, dispatch] = useReducer<
    (state: TokenForgeAuthState, action: AuthAction) => TokenForgeAuthState
  >(authReducer, {
    ...initialState,
    ...initialAuthState,
  } as TokenForgeAuthState);

  return (
    <TokenForgeAuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </TokenForgeAuthContext.Provider>
  );
};

export const useTokenForgeAuthContext = () => {
  const context = useContext(TokenForgeAuthContext);
  if (context === undefined) {
    throw new Error(
      "useTokenForgeAuthContext must be used within a TokenForgeAuthProvider"
    );
  }
  return context;
};
