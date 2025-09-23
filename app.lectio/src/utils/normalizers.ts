import { addHours, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function normalizeDate(date?: Date): string {
  if (!date) return "";
  return date.toISOString().split("T")[0];
}

export function normalizeLocalDate(date: Date | string): Date {
  // Se for string, cria uma data
  const dateObj = typeof date === "string" ? parseISO(date) : date;

  // Compensa o fuso horário do Brasil (UTC-3)
  // Adicionando 3 horas para garantir que a data UTC seja interpretada corretamente para o dia do Brasil
  const adjustedDate = addHours(dateObj, 3);

  // Ajusta para meia-noite
  const localMidnight = new Date(
    adjustedDate.getFullYear(),
    adjustedDate.getMonth(),
    adjustedDate.getDate(),
    0,
    0,
    0,
    0,
  );

  console.log("Data original:", dateObj.toString());
  console.log("Data ajustada:", adjustedDate.toString());
  console.log(
    "Normalized Local Date",
    format(localMidnight, "yyyy-MM-dd", { locale: ptBR }),
  );

  return localMidnight;
}
