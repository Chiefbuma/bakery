'use client';

import { useEffect, useState } from 'react';

const FALLBACK_KEY = 'pk_live_8d9017d3458e0213efd55c219527b9171482e87d';

/**
 * @fileOverview Custom Hook for Resilient Paystack Integration
 * Implements triple-fallback key retrieval and automated script lifecycle management.
 */
export function usePaystack() {
  const [paystackKey, setPaystackKey] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getKey = () => {
      // Priority 1: Runtime environment from window (Phusion Passenger / Browser)
      if (typeof window !== 'undefined' && (window as any).__ENV?.PAYSTACK_KEY) {
        return (window as any).__ENV.PAYSTACK_KEY;
      }
      
      // Priority 2: Next.js public env (Build-time injection)
      if (process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
        return process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
      }
      
      // Priority 3: Hardened Production Fallback
      return FALLBACK_KEY;
    };

    const key = getKey();
    if (!key) {
      setError('Payment gateway configuration is missing.');
      return;
    }
    setPaystackKey(key);

    // Automated Script Lifecycle
    if (!document.querySelector('script[src*="paystack"]')) {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => setIsLoaded(true);
      script.onerror = () => setError('Secure payment bridge failed to initialize.');
      document.body.appendChild(script);
    } else {
      setIsLoaded(true);
    }
  }, []);

  const initializePayment = (options: {
    email: string;
    amount: number;
    currency?: string;
    reference?: string;
    callback?: (response: any) => void;
    onClose?: () => void;
  }) => {
    if (!paystackKey || !isLoaded) {
      console.error('[PAYSTACK_ERROR] Bridge not ready');
      return null;
    }

    // @ts-ignore - PaystackPop is globally injected by the script
    const handler = PaystackPop.setup({
      key: paystackKey,
      email: options.email,
      amount: Math.round(options.amount), // Must be clean integer (Kobo/Cents)
      currency: options.currency || 'KES',
      ref: options.reference || `WD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      metadata: {
        custom_fields: [
          { display_name: "Application", variable_name: "app", value: "WhiskeDelights" }
        ]
      },
      callback: options.callback,
      onClose: options.onClose,
    });

    handler.openIframe();
    return handler;
  };

  return {
    initializePayment,
    isReady: isLoaded && !!paystackKey,
    error,
  };
}
