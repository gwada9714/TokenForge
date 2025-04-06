import React, { Component, ErrorInfo, ReactNode } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import { errorService, ErrorSeverity } from "../../../core/errors/ErrorService";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnChange?: any[];
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Composant ErrorBoundary pour capturer les erreurs dans l'arbre de composants
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  /**
   * Dérive l'état à partir d'une erreur
   */
  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  /**
   * Capture les informations d'erreur
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Journaliser l'erreur
    errorService.handleError(
      error,
      `Erreur non gérée dans le composant: ${error.message}`,
      ErrorSeverity.ERROR,
      { errorInfo: errorInfo.componentStack }
    );

    // Appeler le callback onError si fourni
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  /**
   * Réinitialise l'état d'erreur lorsque les props de réinitialisation changent
   */
  public componentDidUpdate(prevProps: Props) {
    if (
      this.state.hasError &&
      this.props.resetOnChange &&
      prevProps.resetOnChange &&
      JSON.stringify(prevProps.resetOnChange) !==
        JSON.stringify(this.props.resetOnChange)
    ) {
      this.handleReset();
    }
  }

  /**
   * Réinitialise l'état d'erreur
   */
  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render() {
    if (this.state.hasError) {
      // Utiliser le fallback personnalisé s'il est fourni
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Sinon, utiliser le fallback par défaut
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="200px"
          p={3}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 600,
              width: "100%",
              borderRadius: 2,
              textAlign: "center",
            }}
          >
            <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />

            <Typography variant="h5" gutterBottom fontWeight="bold">
              Oups ! Quelque chose s'est mal passé.
            </Typography>

            <Typography variant="body1" color="text.secondary" paragraph>
              {this.state.error?.message ||
                "Une erreur inattendue est survenue."}
            </Typography>

            {process.env.NODE_ENV === "development" && this.state.errorInfo && (
              <Box
                component="pre"
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: "grey.100",
                  borderRadius: 1,
                  overflow: "auto",
                  fontSize: "0.8rem",
                  textAlign: "left",
                  maxHeight: "200px",
                }}
              >
                {this.state.errorInfo.componentStack}
              </Box>
            )}

            <Button
              variant="contained"
              color="primary"
              onClick={this.handleReset}
              startIcon={<RefreshIcon />}
              sx={{ mt: 3 }}
            >
              Réessayer
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
