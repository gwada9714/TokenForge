import { useCallback } from 'react';
import { useSnackbar } from 'notistack';

export const useAdminErrorHandler = () => {
  const { enqueueSnackbar } = useSnackbar();

  const handleError = useCallback((message: string) => {
    enqueueSnackbar(message, {
      variant: 'error',
      anchorOrigin: { vertical: 'top', horizontal: 'center' }
    });
  }, [enqueueSnackbar]);

  return handleError;
};
