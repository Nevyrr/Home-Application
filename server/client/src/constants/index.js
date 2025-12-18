/**
 * Constantes centralisées de l'application
 */

// Priorités de couleur
export const PRIORITY_COLORS = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  URGENT: 3,
};

// Messages d'erreur
export const ERROR_MESSAGES = {
  REQUIRED_FIELDS: "Tous les champs sont requis",
  INVALID_DATE: "Date invalide",
  NETWORK_ERROR: "Erreur réseau",
  UNAUTHORIZED: "Non autorisé",
  NOT_FOUND: "Ressource non trouvée",
  SERVER_ERROR: "Erreur serveur",
};

// Messages de succès
export const SUCCESS_MESSAGES = {
  CREATED: "Créé avec succès",
  UPDATED: "Mis à jour avec succès",
  DELETED: "Supprimé avec succès",
  LOGGED_IN: "Connexion réussie",
  LOGGED_OUT: "Déconnexion réussie",
};

// Routes
export const ROUTES = {
  HOME: "/",
  SHOPPING: "/shopping",
  CALENDAR: "/calendar",
  REMINDERS: "/reminders",
  TACO: "/taco",
  DASHBOARD: "/dashboard",
  LOGIN: "/login",
  REGISTER: "/register",
};

// Configuration
export const CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_URL || "/api",
  DATE_FORMAT: "DD/MM/YYYY",
  DATE_FORMAT_DISPLAY: "P", // Format localisé pour react-datepicker
};

