'use server';

import type { OrderPayload } from './types';

// Use an internal proxy or relative URL for server-side fetches to ensure protocol consistency
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Places an order by sending the data to the backend API.
 * Uses the native Node.js fetch in the server environment.
 */
export async function placeOrder(payload: OrderPayload): Promise<{ success: boolean; orderNumber: string; error?: string; depositAmount: number }> {
  try {
    const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to place order.' }));
        throw new Error(errorData.message || 'Failed to place order.');
    }
    
    const result = await response.json();

    return {
        success: true,
        orderNumber: result.orderNumber,
        depositAmount: result.depositAmount,
    };

  } catch (e) {
    const error = e instanceof Error ? e.message : 'An unknown error occurred.';
    console.error('[PLACE_ORDER_SERVER_ACTION_ERROR]', error);
    return { 
      success: false, 
      error: 'Could not process order. Please try again or contact support.', 
      orderNumber: '', 
      depositAmount: 0 
    };
  }
}

/**
 * Log server-side events for diagnostics.
 */
export async function logServerEvent(message: string) {
  console.log('[SERVER_LOG]', message);
}
