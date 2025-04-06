import React, { useState, useEffect } from "react";
import { TextField, Button, Box, Alert } from "@mui/material";
import { useTokenForgeAuth } from "../hooks/useTokenForgeAuth";
import { AuthError, AuthErrorCode, createAuthError } from "../errors/AuthError";
import { logger } from "../../../core/logger";

export const SignUpForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authReady, setAuthReady] = useState(false);
  const { error: contextError, signUp } = useTokenForgeAuth();
  const [localError, setLocalError] = useState<AuthError | null>(null);

  // Initialiser auth de manière asynchrone
  useEffect(() => {
    const setupAuth = async () => {
      try {
        // Le service firebaseAuth est déjà initialisé automatiquement
        setAuthReady(true);

        logger.debug({
          category: "Auth",
          message: "Service Auth initialisé avec succès",
        });
      } catch (error) {
        const authError = createAuthError(
          AuthErrorCode.INTERNAL_ERROR,
          "Erreur lors de l'initialisation du service d'authentification",
          error instanceof Error ? error : undefined
        );

        logger.error({
          category: "Auth",
          message: "Échec de l'initialisation du service Auth",
          error: authError,
        });

        setLocalError(authError);
      }
    };

    setupAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authReady) {
      setLocalError(
        createAuthError(
          AuthErrorCode.INTERNAL_ERROR,
          "Le service d'authentification n'est pas prêt"
        )
      );
      return;
    }

    if (password !== confirmPassword) {
      const passwordError = createAuthError(
        AuthErrorCode.INVALID_PASSWORD,
        "Les mots de passe ne correspondent pas"
      );

      setLocalError(passwordError);
      return;
    }

    try {
      setLocalError(null);
      await signUp(email, password);
    } catch (err) {
      let errorCode: AuthErrorCode;

      switch ((err as any)?.code) {
        case "auth/email-already-in-use":
          errorCode = AuthErrorCode.EMAIL_ALREADY_IN_USE;
          break;
        case "auth/invalid-email":
          errorCode = AuthErrorCode.INVALID_EMAIL;
          break;
        case "auth/weak-password":
          errorCode = AuthErrorCode.WEAK_PASSWORD;
          break;
        default:
          errorCode = AuthErrorCode.UNKNOWN_ERROR;
          break;
      }

      const authError = createAuthError(
        errorCode,
        (err as any)?.message || "Une erreur inconnue est survenue",
        err
      );

      setLocalError(authError);
    }
  };

  const displayError = contextError || localError;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      {displayError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {displayError.message}
        </Alert>
      )}
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Adresse email"
        name="email"
        autoComplete="email"
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Mot de passe"
        type="password"
        id="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="confirmPassword"
        label="Confirmer le mot de passe"
        type="password"
        id="confirmPassword"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={!authReady}
      >
        S'inscrire
      </Button>
    </Box>
  );
};
