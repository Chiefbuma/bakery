
'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Copy, Loader2, Sparkles, ShoppingBag, CreditCard, ShieldCheck } from 'lucide-react';
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

  const orderTotal = 3650;
  const depositAmount = 1825;

  const handlePaystackPayment = () => {
    if (!(window as any).PaystackPop) {
      toast({ variant: "destructive", title: "Gateway Failure", description: "Payment interface not ready. Refresh." });
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
      callback: function(response: any) {
        setIsProcessing(false);
        setIsPaid(true);
        toast({ title: "Success!", description: `Deposit of ${formatPrice(depositAmount)} confirmed.` });
      },
      onClose: function() {
        setIsProcessing(false);
        toast({ title: "Cancelled", description: "Transaction aborted by guest." });
      }
    });
    handler.openIframe();
  };

  if (isPaid) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full">
          <Card className="border-none shadow-2xl text-center overflow-hidden rounded-[3rem] bg-white">
            <div className="bg-primary h-3 w-full" />
            <CardContent className="p-14 space-y-10">
              <div className="relative inline-block">
                <div className="p-8 bg-green-50 rounded-[2rem] border border-green-100">
                  <CheckCircle2 className="h-16 w-16 text-green-500" />
                </div>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }} className="absolute -top-4 -right-4">
                  <Sparkles className="h-10 w-10 text-primary opacity-40" />
                </motion.div>
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-black font-headline tracking-tight">Booking Confirmed</h1>
                <p className="text-stone-500 font-bold uppercase text-[10px] tracking-widest leading-relaxed">Deposit received. Our master bakers have been notified of your artisanal request.</p>
              </div>
              <div className="p-6 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 flex flex-col items-center gap-3">
                <span className="text-[10px] uppercase font-black text-stone-400 tracking-[0.2em]">Official Reference</span>
                <div className="flex items-center gap-3">
                  <code className="text-2xl font-black text-primary tracking-tighter">{orderRef}</code>
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-stone-400 hover:text-primary" onClick={() => {
                    navigator.clipboard.writeText(orderRef);
                    toast({ title: "Copied" });
                  }}><Copy className="h-5 w-5" /></Button>
                </div>
              </div>
              <Link href="/">
                <Button className="w-full h-16 text-lg font-black gap-3 rounded-2xl shadow-xl">
                  <ShoppingBag className="h-6 w-6" />
                  Continue Journey
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />
      <header className="bg-white border-b py-8 sticky top-0 z-50">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest hover:text-primary">
            <ShoppingBag className="h-5 w-5 rotate-180" />
            <span>Back to Checkout</span>
          </Button>
          <div className="text-2xl font-black font-headline text-primary tracking-tighter">Secure Payment</div>
          <div className="w-24" />
        </div>
      </header>
      <main className="container mx-auto px-6 py-16 max-w-2xl">
        <section className="space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-black tracking-tight">One Last Step</h2>
            <p className="text-stone-400 font-black uppercase text-[10px] tracking-[0.3em]">Confirm your booking reference and pay deposit</p>
          </div>
          <Card className="border-none shadow-2xl overflow-hidden rounded-[3rem] bg-white">
            <CardHeader className="bg-stone-900 text-white py-6">
              <CardTitle className="text-[11px] uppercase tracking-[0.3em] font-black text-center">Ref Ledger ID: {orderRef}</CardTitle>
            </CardHeader>
            <CardContent className="p-12 space-y-10">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-black uppercase tracking-widest text-stone-400">Total Valuation</span>
                  <span className="text-2xl font-black text-stone-900">{formatPrice(orderTotal)}</span>
                </div>
                <div className="p-8 bg-primary/5 rounded-3xl border-2 border-primary/20 flex flex-col gap-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Deposit Requirement (50%)</span>
                    <p className="text-xs text-stone-500 font-bold uppercase">Immediate payment confirms artisanal slot</p>
                  </div>
                  <span className="text-5xl font-black text-primary tracking-tighter">{formatPrice(depositAmount)}</span>
                </div>
              </div>
              <div className="flex items-center gap-5 p-6 bg-stone-50 rounded-2xl border-2 border-stone-100">
                <ShieldCheck className="h-8 w-8 text-green-600 shrink-0" />
                <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest leading-relaxed">
                  Verified Payment Gateway. Supported by M-Pesa, Card & Mobile Money.
                </p>
              </div>
              <Button onClick={handlePaystackPayment} disabled={isProcessing} className="w-full h-20 text-2xl font-black gap-4 shadow-2xl bg-primary hover:bg-primary/95 transition-transform hover:scale-[1.01] rounded-[2rem]">
                {isProcessing ? <Loader2 className="h-7 w-7 animate-spin" /> : <CreditCard className="h-7 w-7" />}
                {isProcessing ? 'Verifying Gateway...' : 'Pay Deposit Now'}
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
