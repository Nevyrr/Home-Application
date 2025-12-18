/**
 * Gestionnaire d'erreurs centralisé
 */

/**
 * Extrait le message d'erreur d'une réponse API ou d'une erreur
 */
export const extractErrorMessage = (error) => {
  if (typeof error === "string") {
    return error;
  }

  if (error?.response?.data?.error) {
    return error.response.data.error;
  }

  if (error?.message) {
    return error.message;
  }

  return "Une erreur inattendue est survenue";
};

/**
 * Gère les erreurs HTTP communes
 */
export const handleHttpError = (status) => {
  const errorMessages = {
    400: "Requête invalide",
    401: "Non autorisé. Veuillez vous reconnecter.",
    403: "Accès interdit",
    404: "Ressource non trouvée",
    500: "Erreur serveur. Veuillez réessayer plus tard.",
    503: "Service temporairement indisponible",
  };

  return errorMessages[status] || "Une erreur est survenue";
};

