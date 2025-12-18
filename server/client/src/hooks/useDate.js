/**
 * Hook personnalisé pour la gestion des dates
 */

import { useMemo } from "react";

/**
 * Convertit une chaîne de date au format DD/MM/YYYY en objet Date
 */
export const useDateConverter = () => {
  const convertStringToDate = (dateString) => {
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

  return { convertStringToDate };
};

/**
 * Hook pour formater une date
 */
export const useDateFormat = () => {
  const formatDate = (date, format = "DD/MM/YYYY") => {
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

  return { formatDate };
};

