export function calculateDaysDifference(date1: Date | string, date2: Date | string): number {
  const normalizedDate1 =
    typeof date1 === "string"
      ? new Date(date1)
      : new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const normalizedDate2 =
    typeof date2 === "string"
      ? new Date(date2)
      : new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());

  const timeDifference = normalizedDate1.getTime() - normalizedDate2.getTime();
  return Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Converte de milissegundos para dias
}

export function calculateHoursDifference(date1: Date | string, date2: Date | string): number {
  const normalizedDate1 = typeof date1 === "string" ? new Date(date1) : date1;
  const normalizedDate2 = typeof date2 === "string" ? new Date(date2) : date2;

  const timeDifference = normalizedDate1.getTime() - normalizedDate2.getTime();
  return Math.floor(timeDifference / (1000 * 60 * 60)); // Converte de milissegundos para horas
}
