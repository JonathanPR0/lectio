import { normalizeNumbersOnly } from "./normalizers";

// CNPJ/CPF VALIDATION
export function isValidCnpjCpf(value: string): boolean {
  const normalizedValue = normalizeNumbersOnly(value);

  if (normalizedValue.length === 11) {
    return isValidCpf(normalizedValue);
  } else if (normalizedValue.length === 14) {
    return isValidCnpj(normalizedValue);
  }

  return false;
}

function isValidCpf(cpf: string): boolean {
  if (/^(\d)\1+$/.test(cpf)) return false; // Verifica se todos os dígitos são iguais

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(cpf.substring(10, 11));
}

function isValidCnpj(cnpj: string): boolean {
  if (/^(\d)\1+$/.test(cnpj)) return false; // Verifica se todos os dígitos são iguais

  let length = cnpj.length - 2;
  let numbers = cnpj.substring(0, length);
  const digits = cnpj.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  length += 1;
  numbers = cnpj.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return result === parseInt(digits.charAt(1));
}

// PHONE NUMBER VALIDATION
export function isValidPhoneNumber(phoneNumber: string): boolean {
  const normalizedPhone = normalizeNumbersOnly(phoneNumber);

  // Verifica se o número tem entre 10 e 14 dígitos
  return normalizedPhone.length >= 10 && normalizedPhone.length <= 14;
}
