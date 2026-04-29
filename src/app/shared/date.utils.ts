export const formatDateToApi = (value: Date): string => {
  const day = String(value.getDate()).padStart(2, '0');
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const year = value.getFullYear();

  return `${day}.${month}.${year}`;
};

export const parseApiDate = (value: string | Date): Date => {
  if (value instanceof Date) {
    return value;
  }

  const formattedMatch = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);

  if (formattedMatch) {
    const [, dayValue, monthValue, yearValue] = formattedMatch;
    return new Date(
      Number(yearValue),
      Number(monthValue) - 1,
      Number(dayValue),
    );
  }

  return new Date(value);
};
