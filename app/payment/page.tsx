
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Copy, Loader2, Sparkles, ShoppingBag, CreditCard, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import Script from 'next/script';

const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_placeholder';

export default function PaymentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPaid, setIsPaid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderRef] = useState(`WD-${Math.floor(1000 + Math.random() * 9000)}-BK`);

  // Mock order data
  const orderTotal = 3650;
  const depositAmount = 1825;

  const handlePaystackPayment = () => {
    if (!(window as any).PaystackPop) {
      toast({
        variant: "destructive",
        title: "Payment Gateway Error",
        description: "Could not load payment interface. Please refresh the page.",
      });
      return;
    }

    setIsProcessing(true);

    const handler = (window as any).PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: 'customer@example.com', // In a real app, get this from checkout state
      amount: depositAmount * 100, // Paystack uses Kobo/Cents
      currency: 'KES',
      channels: ['mobile_money', 'card'],
      ref: orderRef,
      metadata: {
        custom_fields: [
          {
            display_name: "Order Number",
            variable_name: "order_number",
            value: orderRef
          }
        ]
      },
      callback: function(response: any) {
        setIsProcessing(false);
        setIsPaid(true);
        toast({
          title: "Payment Successful!",
          description: `Transaction ${response.reference} completed.`,
        });
      },
      onClose: function() {
        setIsProcessing(false);
        toast({
          title: "Payment Cancelled",
          description: "You closed the payment window.",
        });
      }
    });

    handler.openIframe();
  };

  if (isPaid) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="border-none shadow-2xl text-center overflow-hidden">
            <div className="bg-primary h-2 w-full" />
            <CardContent className="p-12 space-y-8">
              <div className="relative inline-block">
                <div className="p-6 bg-green-50 rounded-full border border-green-100">
                  <CheckCircle2 className="h-16 w-16 text-green-500" />
                </div>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                  className="absolute -top-4 -right-4"
                >
                  <Sparkles className="h-10 w-10 text-primary opacity-30" />
                </motion.div>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-black font-headline">Order Confirmed!</h1>
                <p className="text-muted-foreground font-medium">Your deposit has been received. Our master bakers are starting on your creation.</p>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-dashed border-stone-200 flex flex-col items-center gap-2">
                <span className="text-[10px] uppercase font-black text-muted-foreground">Reference Number</span>
                <div className="flex items-center gap-2">
                  <code className="text-lg font-black text-primary">{orderRef}</code>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => {
                    navigator.clipboard.writeText(orderRef);
                    toast({ title: "Copied to clipboard" });
                  }}><Copy className="h-4 w-4" /></Button>
                </div>
              </div>

              <div className="space-y-4">
                <Link href="/">
                  <Button className="w-full h-12 text-lg font-black gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Return to Shop
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />
      
      <header className="bg-white border-b py-6">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2 text-sm font-bold hover:text-primary">
            <Copy className="h-4 w-4 rotate-180" />
            <span>Back to Checkout</span>
          </Button>
          <div className="text-xl font-black font-headline text-primary">Final Confirmation</div>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-2xl">
        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-black">Review Your Order</h2>
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-stone-900 text-white py-4">
                <CardTitle className="text-sm uppercase tracking-[0.2em] font-black">Order ID: {orderRef}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-bold">Total Order Value</span>
                    <span className="text-xl font-black">Ksh {orderTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-primary/5 rounded-xl border border-primary/10">
                    <div className="space-y-1">
                      <span className="text-sm font-black text-primary uppercase tracking-widest">Required Deposit (50%)</span>
                      <p className="text-xs text-muted-foreground font-medium">Pay now to confirm your order slot.</p>
                    </div>
                    <span className="text-2xl font-black text-primary">Ksh {depositAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-stone-100 rounded-xl">
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                  <p className="text-xs font-medium text-stone-600">
                    Secure checkout powered by <strong>Paystack</strong>. Support for M-Pesa, Visa, and Mastercard.
                  </p>
                </div>

                <Button 
                  onClick={handlePaystackPayment} 
                  disabled={isProcessing}
                  className="w-full h-16 text-xl font-black gap-3 shadow-xl bg-primary hover:bg-primary/90 transition-all group relative overflow-hidden"
                >
                  {isProcessing ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="h-6 w-6" />
                      Pay with M-Pesa
                    </>
                  )}
                  {/* Glossy Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                </Button>

                <p className="text-center text-[10px] text-muted-foreground font-medium italic">
                  By clicking Pay, you agree to our terms of service and artisanal baking policy.
                </p>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
