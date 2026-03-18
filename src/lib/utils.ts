import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Robust price formatter for the WhiskeDelights system.
 * Prevents "KshNaN" errors by defaulting to "Ksh 0" for any non-numeric input.
 */
export function formatPrice(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') return 'Ksh 0';

  let value: number;
  if (typeof amount === 'string') {
    // Remove currency prefix, commas, and whitespace before parsing
    const sanitized = amount.replace(/[Ksh,]/gi, '').trim();
    value = parseFloat(sanitized);
  } else {
    value = amount;
  }
  
  // Final check to prevent NaN in UI
  if (isNaN(value) || !isFinite(value)) {
    return 'Ksh 0';
  }

  try {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value).replace('KES', 'Ksh');
  } catch (e) {
    return `Ksh ${Math.floor(value)}`;
  }
}
