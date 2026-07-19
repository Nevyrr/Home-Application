/** Stored care dates are local calendar days, formatted as DD/MM/YYYY. */
export const parseStoredDate = (value?: string | null): Date | null => {
  if (!value || !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) return null;
  const [day, month, year] = value.split("/").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : null;
};

export const toStoredDate = (date: Date | null): string => {
  if (!date || Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
};

export const startOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** Sort reminders chronologically, keeping missing or invalid dates at the end. */
export const compareDueDates = (left?: string | null, right?: string | null): number => {
  const leftTime = parseStoredDate(left)?.getTime();
  const rightTime = parseStoredDate(right)?.getTime();
  if (leftTime === undefined) return rightTime === undefined ? 0 : 1;
  if (rightTime === undefined) return -1;
  return leftTime - rightTime;
};

