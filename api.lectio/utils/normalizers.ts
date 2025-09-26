export function normalizeNumbersOnly(input: string): string {
  return input.replace(/\D/g, ""); // Remove todos os caracteres que não são dígitos
}
export function normalizeUTCDate(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}
export function normalizeDate(date?: Date): string {
  if (!date) return "";
  const brazilOffset = -3 * 60 * 60 * 1000; // UTC-3 em milissegundos
  const brazilDate = new Date(date.getTime() + brazilOffset);
  return brazilDate.toISOString().split("T")[0]; // Retorna YYYY-MM-DD no horário brasileiro
}
