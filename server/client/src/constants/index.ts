// Constantes centralisées pour l'application

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

