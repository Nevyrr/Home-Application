export const isSameDate = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

export const convertStringToDate = (dateString: string | null | undefined): Date => {
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

