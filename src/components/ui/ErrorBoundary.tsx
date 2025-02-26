import React, { Component, ErrorInfo } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { logger } from '@/utils/logger';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error({
      message: 'Erreur non gérée dans l\'application',
      category: 'ErrorBoundary',
      error,
      errorInfo
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          p={3}
          textAlign="center"
        >
          <Typography variant="h4" gutterBottom>
            Oups ! Quelque chose s'est mal passé.
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {this.state.error?.message || 'Une erreur inattendue est survenue.'}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleReset}
          >
            Réessayer
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
} 