
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Robust price formatter that handles numeric strings and NaN cases gracefully.
 * Defaults to "Ksh 0" if the input is invalid.
 */
export function formatPrice(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return 'Ksh 0';

  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(value)) {
    return 'Ksh 0';
  }

  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
