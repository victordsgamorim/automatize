import { z } from 'zod';

const WEIGHTS_1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const WEIGHTS_2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

export function isValidCnpj(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += Number(digits[i]) * WEIGHTS_1[i];
  }
  let remainder = sum % 11;
  const firstCheck = remainder < 2 ? 0 : 11 - remainder;
  if (firstCheck !== Number(digits[12])) return false;

  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += Number(digits[i]) * WEIGHTS_2[i];
  }
  remainder = sum % 11;
  const secondCheck = remainder < 2 ? 0 : 11 - remainder;
  return secondCheck === Number(digits[13]);
}

export const cnpjSchema = z
  .string()
  .transform((val) => val.replace(/\D/g, ''))
  .refine(isValidCnpj, { message: 'Invalid CNPJ' });
