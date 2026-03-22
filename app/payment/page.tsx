'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Copy, Loader2, Sparkles, ShoppingBag, CreditCard, ShieldCheck, ArrowLeft, RefreshCcw, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import Script from 'next/script';
import { WhatsappIcon } from '@/components/icons/whatsapp-icon';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_live_8d9017d3458e0213efd55c219527b9171482e87d';
const OWNER_WHATSAPP = process.env.NEXT_PUBLIC_OWNER_WHATSAPP_NUMBER || '254791034492'; 

export default function PaymentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPaid, setIsPaid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSdkReady, setIsSdkReady] = useState(false);
  const [orderRef] = useState(`WD-${Math.floor(1000 + Math.random() * 9000)}-BK`);
  
  const [checkoutData, setCheckoutData] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem('temp_checkout_data');
    if (data) setCheckoutData(JSON.parse(data));
    
    // Heartbeat check for Paystack Script
    const interval = setInterval(() => {
        if ((window as any).PaystackPop) {
            setIsSdkReady(true);
            clearInterval(interval);
        }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const orderTotal = checkoutData?.total || 0;
  const depositAmount = orderTotal * 0.8;

  const handlePaystackPayment = useCallback(() => {
    const paystack = (window as any).PaystackPop;
    
    if (!paystack) {
      toast({ 
        variant: "destructive", 
        title: "Gateway Not Ready", 
        description: "Re-initializing payment engine. Please wait 2 seconds." 
      });
      return;
    }

    if (!PAYSTACK_PUBLIC_KEY || PAYSTACK_PUBLIC_KEY.length < 10) {
        toast({
            variant: "destructive",
            title: "Security Config Error",
            description: "Production payment key is missing. Contact support."
        });
        return;
    }

    setIsProcessing(true);
    
    try {
        const handler = paystack.setup({
            key: PAYSTACK_PUBLIC_KEY,
            email: 'bakery@whiskedelights.co.ke', // Generic store email
            amount: Math.round(depositAmount * 100),
            currency: 'KES',
            channels: ['mobile_money', 'card'],
            ref: orderRef,
            metadata: {
                custom_fields: [
                    {
                        display_name: "Customer Name",
                        variable_name: "customer_name",
                        value: checkoutData?.name
                    },
                    {
                        display_name: "Customer Phone",
                        variable_name: "customer_phone",
                        value: checkoutData?.phone
                    }
                ]
            },
            callback: function(response: any) {
                setIsProcessing(false);
                setIsPaid(true);
                toast({ title: "Deposit Confirmed", description: "Artisanal booking successfully paid." });
            },
            onClose: function() {
                setIsProcessing(false);
                toast({ title: "Transaction Aborted", description: "The payment window was closed." });
            }
        });
        handler.openIframe();
    } catch (err) {
        setIsProcessing(false);
        console.error('[PAYSTACK_INIT_ERROR]', err);
        toast({ 
            variant: "destructive", 
            title: "Initialization Failed", 
            description: "The payment key provided is invalid or the gateway is busy." 
        });
    }
  }, [depositAmount, orderRef, checkoutData, toast]);

  const handleWhatsAppConfirm = () => {
    if (!checkoutData) return;
    const items = checkoutData.item_details;
    const customizations = items.customizations || {};
    
    const message = `*Hello WhiskeDelights!*%0A` +
      `I've placed an artisanal order.%0A%0A` +
      `*Order Ref:* ${orderRef}%0A` +
      `*Product:* ${items.name}%0A` +
      `*Total Valuation:* ${formatPrice(orderTotal)}%0A` +
      `*80% Deposit Paid:* ${formatPrice(depositAmount)}%0A` +
      `*Delivery Date:* ${checkoutData.date}%0A` +
      `*Logistics:* ${checkoutData.method === 'pickup' ? 'Nairobi Main Bakery' : 'Delivery'}%0A` +
      (checkoutData.latitude ? `*GPS Coordinates:* ${checkoutData.latitude}, ${checkoutData.longitude}` : '');

    window.open(`https://wa.me/${OWNER_WHATSAPP}?text=${message}`, '_blank');
  };

  if (isPaid) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full">
          <Card className="border-none shadow-2xl text-center overflow-hidden rounded-[2.5rem] bg-white">
            <div className="bg-primary h-2 w-full" />
            <CardContent className="p-10 space-y-8">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
              <div className="space-y-2">
                <h1 className="text-3xl font-black font-headline tracking-tight uppercase">Confirmed</h1>
                <p className="text-stone-500 font-black uppercase text-[10px] tracking-widest leading-relaxed">Deposit received. Notify the baker to start production.</p>
              </div>
              <Button className="w-full h-16 text-[12px] font-black gap-3 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white shadow-xl uppercase" onClick={handleWhatsAppConfirm}>
                <WhatsappIcon className="h-5 w-5" />
                Complete on WhatsApp
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-20 selection:bg-primary selection:text-white">
      <Script 
        src="https://js.paystack.co/v1/inline.js" 
        strategy="lazyOnload" 
        onLoad={() => setIsSdkReady(true)}
      />
      
      <header className="bg-white border-b py-4 sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            <ArrowLeft className="h-4 w-4" />
            <span className="no-wrap">Return</span>
          </Button>
          <div className="text-xl font-black font-headline text-primary tracking-tighter">Secure Checkout</div>
          <div className="w-12" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-xl">
        <section className="space-y-8">
          <div className="text-center space-y-1">
            <h2 className="text-3xl font-black tracking-tight uppercase">Deposit Gateway</h2>
            <p className="text-stone-400 font-black uppercase text-[9px] tracking-[0.2em]">80% Artisanal Commitment Required</p>
          </div>

          {!isSdkReady && (
            <Alert variant="destructive" className="bg-amber-50 border-amber-200">
               <AlertCircle className="h-4 w-4 text-amber-600" />
               <AlertTitle className="text-amber-800 font-black uppercase text-[10px]">Payment Engine Initializing</AlertTitle>
               <AlertDescription className="text-amber-700 text-[10px] font-bold">
                  Wait 5 seconds for the Paystack SDK to load. If it persists, click below.
               </AlertDescription>
               <Button variant="outline" size="sm" className="mt-3 h-8 text-[9px] font-black uppercase" onClick={() => window.location.reload()}>
                  <RefreshCcw className="h-3 w-3 mr-2" /> Reload Gate
               </Button>
            </Alert>
          )}

          <Card className="border-none shadow-2xl overflow-hidden rounded-[2.5rem] bg-white">
            <CardHeader className="bg-stone-900 text-white py-4">
              <CardTitle className="text-[9px] uppercase tracking-[0.2em] font-black text-center">Reference: {orderRef}</CardTitle>
            </CardHeader>
            <CardContent className="p-8 md:p-10 space-y-8">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">Masterpiece Total</span>
                  <span className="text-xl font-black text-stone-900">{formatPrice(orderTotal)}</span>
                </div>
                <div className="p-6 bg-primary/5 rounded-[1.5rem] border-2 border-primary/20 flex flex-col gap-3">
                  <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">80% Mandatory Deposit</span>
                  <span className="text-4xl font-black text-primary tracking-tighter">{formatPrice(depositAmount)}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 p-5 bg-stone-50 rounded-2xl border-2 border-stone-100">
                <ShieldCheck className="h-6 w-6 text-green-600 shrink-0" />
                <p className="text-[9px] font-black text-stone-500 uppercase tracking-widest leading-relaxed">
                  256-bit Encryption Secured by Paystack. Supports M-Pesa & Visa.
                </p>
              </div>

              <Button 
                onClick={handlePaystackPayment} 
                disabled={isProcessing || !isSdkReady} 
                className="w-full h-18 text-xl font-black gap-3 shadow-2xl bg-primary hover:bg-primary/95 rounded-2xl uppercase tracking-widest"
              >
                {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <CreditCard className="h-6 w-6" />}
                {isProcessing ? 'Verifying...' : 'Pay Deposit Now'}
              </Button>
              
              {!isSdkReady && (
                <p className="text-center text-[8px] font-black text-stone-400 uppercase tracking-widest">
                  Establishing secure tunnel to gateway...
                </p>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
