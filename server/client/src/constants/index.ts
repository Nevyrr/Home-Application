// Constantes centralisées pour l'application

/**
 * Unites de quantite utilisees partout dans les courses (ajout manuel ET assistant IA).
 * Source unique de verite cote frontend : QuantityInput et la revue des articles proposes
 * par l'IA doivent tous les deux s'appuyer sur cette liste pour rester coherents.
 */
export const SHOPPING_UNITS = ["", "g", "Kg", "mL", "L"] as const;
export type ShoppingUnit = (typeof SHOPPING_UNITS)[number];

export const PRIORITY_COLORS = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
} as const;

export const PRIORITY_LABELS = {
  [PRIORITY_COLORS.LOW]: "Faible",
  [PRIORITY_COLORS.MEDIUM]: "Moyenne",
  [PRIORITY_COLORS.HIGH]: "Haute",
} as const;

