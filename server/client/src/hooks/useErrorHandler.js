/**
 * Hook personnalisé pour la gestion des erreurs
 */

import { useState, useCallback } from "react";

export const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleError = useCallback((errorMessage) => {
    setError(errorMessage);
    setSuccess(null);
  }, []);

  const handleSuccess = useCallback((successMessage) => {
    setSuccess(successMessage);
    setError(null);
  }, []);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const handleAsyncOperation = useCallback(async (asyncFn, successMsg) => {
    try {
      const result = await asyncFn();
      if (successMsg) {
        handleSuccess(successMsg);
      }
      return result;
    } catch (err) {
      handleError(err.message || "Une erreur est survenue");
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

