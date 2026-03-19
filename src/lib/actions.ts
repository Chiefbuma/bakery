'use server';

import type { OrderPayload } from './types';

/**
 * Places an order by sending the data to the backend API.
 */
export async function placeOrder(payload: OrderPayload): Promise<{ success: boolean; orderNumber: string; error?: string; depositAmount: number }> {
  try {
    // Determine the base URL for the server environment
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://whiskedelights.co.ke/api';
    
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
        } catch (e) {}
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
