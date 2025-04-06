import { useCallback } from "react";
import { BaseLogger } from "../core/logger";

export const useLogger = (context: string) => {
  const logger = new BaseLogger(context);

  const logError = useCallback((message: string, error?: Error) => {
    logger.error(message, { error });
  }, []);

  const logInfo = useCallback((message: string, data?: unknown) => {
    logger.info(message, { data });
  }, []);

  return {
    logError,
    logInfo,
    logger,
  };
};
