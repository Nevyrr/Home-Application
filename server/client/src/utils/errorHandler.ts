// Utilitaires pour la gestion des erreurs

export const handleError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return "Une erreur inattendue s'est produite";
};

export const logError = (error: unknown, context?: string): void => {
  const message = handleError(error);
  console.error(context ? `[${context}] ${message}` : message, error);
};

