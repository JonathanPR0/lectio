export function normalizeNumbersOnly(input: string): string {
  return input.replace(/\D/g, ""); // Remove todos os caracteres que não são dígitos
}
export function normalizeUTCDate(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}
export function normalizeDate(date?: Date): string {
  if (!date) return "";
  return date.toISOString().split("T")[0];
}
