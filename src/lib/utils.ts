
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Robust price formatter that handles numeric strings and NaN cases gracefully.
 * Defaults to 0 if the input is invalid or null.
 */
export function formatPrice(amount: number | string | null | undefined): string {
  // Convert null/undefined to 0 immediately
  if (amount === null || amount === undefined) return 'Ksh 0';

  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Handle NaN or invalid numeric strings
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
