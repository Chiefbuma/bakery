'use server';

import type { OrderPayload } from './types';

// Use relative API URL for consistent protocol handling
const API_URL = '/api';

/**
 * Places an order by sending the data to the backend API.
 * Uses robust parsing to prevent "Unexpected end of JSON input" errors.
 */
export async function placeOrder(payload: OrderPayload): Promise<{ success: boolean; orderNumber: string; error?: string; depositAmount: number }> {
  try {
    // Note: Since this is a server action, it might need the full domain if called from a non-relative context,
    // but Next.js usually handles internal routing. For CloudLinux/Passenger, we ensure absolute consistency.
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    
    const response = await fetch(`${baseUrl}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
    });

    const text = await response.text();
    
    if (!response.ok) {
        let message = 'Order placement failed.';
        try {
          const errorData = JSON.parse(text);
          message = errorData.message || message;
        } catch (e) {
          // If not JSON, it's likely an HTML error page from the server
          console.error('[PLACE_ORDER_HTML_ERROR]', text.substring(0, 100));
        }
        throw new Error(message);
    }
    
    const result = JSON.parse(text);

    return {
        success: true,
        orderNumber: result.orderNumber,
        depositAmount: result.depositAmount,
    };

  } catch (e) {
    const error = e instanceof Error ? e.message : 'An unknown error occurred.';
    console.error('[PLACE_ORDER_ACTION_CRITICAL_ERROR]', error);
    return { 
      success: false, 
      error: error, 
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