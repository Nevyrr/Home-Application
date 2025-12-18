/**
 * Utilitaires pour la manipulation des dates
 */

/**
 * Convertit une chaîne de date au format DD/MM/YYYY en objet Date
 */
export const convertStringToDate = (dateString) => {
  if (!dateString) {
    return new Date();
  }

  const [day, month, year] = dateString.split("/");

  if (!day || !month || !year) {
    return new Date();
  }

  const date = new Date(
    `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
  );

  if (isNaN(date.getTime())) {
    return new Date();
  }

  return date;
};

/**
 * Formate une date selon le format spécifié
 */
export const formatDate = (date, format = "DD/MM/YYYY") => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return "";
  }

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return format
    .replace("DD", day)
    .replace("MM", month)
    .replace("YYYY", year);
};

/**
 * Vérifie si deux dates sont identiques (même jour)
 */
export const isSameDate = (date1, date2) => {
  if (!date1 || !date2) return false;
  
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
};

/**
 * Valide qu'une date est valide
 */
export const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date.getTime());
};

