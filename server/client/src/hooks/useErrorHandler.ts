/**
 * Hook personnalisé pour la gestion des erreurs
 */

import { useState, useCallback } from "react";

export const useErrorHandler = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleError = useCallback((errorMessage: string): void => {
    setError(errorMessage);
    setSuccess(null);
  }, []);

  const handleSuccess = useCallback((successMessage: string): void => {
    setSuccess(successMessage);
    setError(null);
  }, []);

  const clearMessages = useCallback((): void => {
    setError(null);
    setSuccess(null);
  }, []);

  const handleAsyncOperation = useCallback(async <T,>(
    asyncFn: () => Promise<T>,
    successMsg?: string | null
  ): Promise<T> => {
    try {
      const result = await asyncFn();
      if (successMsg) {
        handleSuccess(successMsg);
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue";
      handleError(errorMessage);
      throw err;
    }
  }, [handleError, handleSuccess]);

  return {
    error,
    success,
    setError,
    setSuccess,
    handleError,
    handleSuccess,
    clearMessages,
    handleAsyncOperation,
  };
};

