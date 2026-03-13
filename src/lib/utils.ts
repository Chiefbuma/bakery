import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Robust price formatter that handles numeric strings and NaN cases gracefully.
 * Defaults to 0 if the input is invalid.
 */
export function formatPrice(amount: number | string): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(value) || value === null || value === undefined) {
    return 'Ksh 0';
  }

  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
