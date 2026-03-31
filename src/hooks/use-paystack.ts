'use client';

import { useEffect, useState } from 'react';

function isValidPaystackPublicKey(value: string | null | undefined) {
  if (!value) {
    return false;
  }

  if (value.includes('placeholder') || value.includes('replace_me')) {
    return false;
  }

  return /^pk_(test|live)_[a-zA-Z0-9]+$/.test(value);
}

function getPaystackKey() {
  if (typeof window !== 'undefined' && (window as any).__ENV?.PAYSTACK_KEY) {
    const runtimeKey = (window as any).__ENV.PAYSTACK_KEY as string;
    return isValidPaystackPublicKey(runtimeKey) ? runtimeKey : null;
  }

  if (process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
    return isValidPaystackPublicKey(process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY)
      ? process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
      : null;
  }

  return null;
}

/**
 * @fileOverview Custom Hook for Resilient Paystack Integration
 * Implements triple-fallback key retrieval and automated script lifecycle management.
 */
export function usePaystack() {
  const [paystackKey] = useState<string | null>(() => getPaystackKey());
  const [isLoaded, setIsLoaded] = useState(() => {
    if (typeof document === 'undefined') {
      return false;
    }

    return Boolean(document.querySelector('script[src*="paystack"]'));
  });
  const [error, setError] = useState<string | null>(() =>
    getPaystackKey()
      ? null
      : 'Set NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY to a real Paystack public key (pk_test_... or pk_live_...).'
  );

  useEffect(() => {
    if (!paystackKey) {
      return;
    }

    // Automated Script Lifecycle
    if (!document.querySelector('script[src*="paystack"]')) {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => setIsLoaded(true);
      script.onerror = () => setError('Secure payment bridge failed to initialize.');
      document.body.appendChild(script);
    }
  }, [paystackKey]);

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

    const callback = (response: any) => {
      if (typeof options.callback === 'function') {
        void options.callback(response);
      }
    };

    const onClose = () => {
      if (typeof options.onClose === 'function') {
        options.onClose();
      }
    };

    try {
      const paystack = (window as any).PaystackPop;
      if (!paystack?.setup) {
        setError('Secure payment bridge is not available yet.');
        return null;
      }

      const handler = paystack.setup({
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
        callback,
        onClose,
      });

      handler.openIframe();
      return handler;
    } catch (setupError) {
      console.error('[PAYSTACK_SETUP_ERROR]', setupError);
      setError('Secure payment bridge failed to open.');
      return null;
    }
  };

  return {
    initializePayment,
    isReady: isLoaded && !!paystackKey,
    error,
  };
}
