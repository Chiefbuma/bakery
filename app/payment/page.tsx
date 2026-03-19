'use client';

import { useState, useEffect } from 'react';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Copy, Loader2, Sparkles, ShoppingBag, CreditCard, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import Script from 'next/script';

const PAYSTACK_PUBLIC_KEY = 'pk_live_8d9017d3458e0213efd55c219527b9171482e87d';

export default function PaymentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPaid, setIsPaid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderRef] = useState(`WD-${Math.floor(1000 + Math.random() * 9000)}-BK`);
  
  const [checkoutData, setCheckoutData] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem('temp_checkout_data');
    if (data) setCheckoutData(JSON.parse(data));
  }, []);

  // Enforce 80% Deposit Rule
  const orderTotal = checkoutData?.total || 3650;
  const depositAmount = orderTotal * 0.8;

  const handlePaystackPayment = () => {
    if (!(window as any).PaystackPop) {
      toast({ variant: "destructive", title: "Gateway Failure", description: "Payment engine not initialized." });
      return;
    }
    setIsProcessing(true);
    const handler = (window as any).PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: 'customer@whiskedelights.co.ke',
      amount: depositAmount * 100,
      currency: 'KES',
      channels: ['mobile_money', 'card'],
      ref: orderRef,
      callback: function() {
        setIsProcessing(false);
        setIsPaid(true);
        toast({ title: "Payment Confirmed", description: `Deposit of ${formatPrice(depositAmount)} received.` });
      },
      onClose: function() {
        setIsProcessing(false);
        toast({ title: "Transaction Aborted", description: "Deposit was not completed." });
      }
    });
    handler.openIframe();
  };

  if (isPaid) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full">
          <Card className="border-none shadow-2xl text-center overflow-hidden rounded-[2.5rem] bg-white">
            <div className="bg-primary h-2 w-full" />
            <CardContent className="p-8 md:p-12 space-y-8">
              <div className="relative inline-block">
                <div className="p-6 md:p-8 bg-green-50 rounded-[1.5rem] border border-green-100">
                  <CheckCircle2 className="h-12 w-12 md:h-16 md:w-16 text-green-500" />
                </div>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }} className="absolute -top-3 -right-3">
                  <Sparkles className="h-8 w-8 text-primary opacity-30" />
                </motion.div>
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-black font-headline tracking-tight uppercase">Confirmed</h1>
                <p className="text-stone-500 font-black uppercase text-[9px] tracking-widest leading-relaxed">80% Deposit received. Our masters are starting your creation.</p>
              </div>
              <div className="p-5 bg-stone-50 rounded-xl border-2 border-dashed border-stone-200 flex flex-col items-center gap-2">
                <span className="text-[8px] uppercase font-black text-stone-400 tracking-widest">Master Reference</span>
                <div className="flex items-center gap-2">
                  <code className="text-xl font-black text-primary tracking-tighter">{orderRef}</code>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-stone-400" onClick={() => {
                    navigator.clipboard.writeText(orderRef);
                    toast({ title: "Copied to clipboard" });
                  }}><Copy className="h-4 w-4" /></Button>
                </div>
              </div>
              <Link href="/">
                <Button className="w-full h-16 text-lg font-black gap-2 rounded-xl shadow-xl uppercase tracking-widest">
                  <ShoppingBag className="h-5 w-5" />
                  Return Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-20 selection:bg-primary selection:text-white">
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />
      <header className="bg-white border-b py-6 md:py-8 sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="text-xl md:text-2xl font-black font-headline text-primary tracking-tighter">Secure Payment Gateway</div>
          <div className="w-10 md:w-20" />
        </div>
      </header>
      <main className="container mx-auto px-4 md:px-6 py-12 md:py-16 max-w-2xl">
        <section className="space-y-8 md:space-y-10">
          <div className="text-center space-y-1">
            <h2 className="text-2xl md:text-4xl font-black tracking-tight uppercase">Deposit Verification</h2>
            <p className="text-stone-400 font-black uppercase text-[9px] tracking-[0.2em]">Mandatory 80% to Secure Artisanal Booking</p>
          </div>
          <Card className="border-none shadow-2xl overflow-hidden rounded-[2.5rem] md:rounded-[3rem] bg-white">
            <CardHeader className="bg-stone-900 text-white py-4 md:py-5">
              <CardTitle className="text-[9px] uppercase tracking-[0.2em] font-black text-center">Reference: {orderRef}</CardTitle>
            </CardHeader>
            <CardContent className="p-8 md:p-12 space-y-8 md:space-y-10">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">Total Valuation</span>
                  <span className="text-xl md:text-2xl font-black text-stone-900">{formatPrice(orderTotal)}</span>
                </div>
                <div className="p-6 md:p-8 bg-primary/5 rounded-[1.5rem] md:rounded-[2rem] border-2 border-primary/20 flex flex-col gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Required Deposit (80%)</span>
                    <p className="text-[8px] text-stone-500 font-black uppercase tracking-widest">Secures your artisanal creation slot</p>
                  </div>
                  <span className="text-4xl md:text-5xl font-black text-primary tracking-tighter">{formatPrice(depositAmount)}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 md:p-6 bg-stone-50 rounded-2xl border-2 border-stone-100">
                <ShieldCheck className="h-6 w-6 md:h-8 md:w-8 text-green-600 shrink-0" />
                <p className="text-[9px] font-black text-stone-500 uppercase tracking-widest leading-relaxed">
                  Encryption Secured by Paystack. Supports M-Pesa & Card Payments.
                </p>
              </div>
              <Button 
                onClick={handlePaystackPayment} 
                disabled={isProcessing} 
                className="w-full h-16 md:h-20 text-xl md:text-2xl font-black gap-3 shadow-2xl bg-primary hover:bg-primary/95 rounded-[1.5rem] md:rounded-[2rem] uppercase tracking-widest"
              >
                {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <CreditCard className="h-6 w-6" />}
                {isProcessing ? 'Verifying...' : 'Pay Deposit Now'}
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}