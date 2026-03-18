import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Robust price formatter for the WhiskeDelights system.
 * Prevents "KshNaN" errors by defaulting to "Ksh 0" for any non-numeric or malformed input.
 */
export function formatPrice(amount: number | string | null | undefined): string {
  // 1. Handle null, undefined, or empty strings immediately
  if (amount === null || amount === undefined || amount === '') return 'Ksh 0';

  let value: number;
  
  // 2. Safely parse string inputs
  if (typeof amount === 'string') {
    const sanitized = amount.replace(/[Ksh,]/gi, '').trim();
    value = parseFloat(sanitized);
  } else {
    value = amount;
  }
  
  // 3. Final check for NaN or Infinity to prevent UI crashes
  if (isNaN(value) || !isFinite(value)) {
    return 'Ksh 0';
  }

  // 4. Format for Kenyan Shillings
  try {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value).replace('KES', 'Ksh');
  } catch (e) {
    // Fallback if Intl fails
    return `Ksh ${Math.floor(value).toLocaleString()}`;
  }
}
