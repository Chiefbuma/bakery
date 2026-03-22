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
import { WhatsappIcon } from '@/components/icons/whatsapp-icon';

const PAYSTACK_PUBLIC_KEY = 'pk_live_8d9017d3458e0213efd55c219527b9171482e87d';
const OWNER_WHATSAPP = '254700000000'; // Replace with actual owner number

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

  const orderTotal = checkoutData?.total || 0;
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
        toast({ title: "Deposit Confirmed", description: "Masterpiece scheduled for production." });
      },
      onClose: function() {
        setIsProcessing(false);
        toast({ title: "Aborted", description: "Deposit not completed." });
      }
    });
    handler.openIframe();
  };

  const handleWhatsAppConfirm = () => {
    if (!checkoutData) return;
    
    const items = checkoutData.item_details;
    const message = `*Hello WhiskeDelights!*%0A` +
      `I've placed an artisanal order.%0A%0A` +
      `*Order Ref:* ${orderRef}%0A` +
      `*Product:* ${items.name} (${items.quantity}x)%0A` +
      `*Flavor:* ${items.customizations.flavor}%0A` +
      `*Size:* ${items.customizations.size}%0A` +
      `*Frosting:* ${items.customizations.color}%0A` +
      `*Add-ons:* ${items.customizations.toppings.join(', ') || 'None'}%0A%0A` +
      `*Total Valuation:* ${formatPrice(orderTotal)}%0A` +
      `*80% Deposit Paid:* ${formatPrice(depositAmount)}%0A` +
      `*Delivery Date:* ${checkoutData.date}%0A` +
      `*Location:* ${checkoutData.method === 'pickup' ? 'Nairobi Main Bakery' : checkoutData.address}%0A` +
      (checkoutData.latitude ? `*GPS:* ${checkoutData.latitude}, ${checkoutData.longitude}` : '');

    window.open(`https://wa.me/${OWNER_WHATSAPP}?text=${message}`, '_blank');
  };

  if (isPaid) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full">
          <Card className="border-none shadow-2xl text-center overflow-hidden rounded-[2.5rem] bg-white">
            <div className="bg-primary h-2 w-full" />
            <CardContent className="p-10 space-y-8">
              <div className="relative inline-block">
                <div className="p-6 bg-green-50 rounded-[1.5rem] border border-green-100">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                </div>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }} className="absolute -top-3 -right-3">
                  <Sparkles className="h-8 w-8 text-primary opacity-30" />
                </motion.div>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-black font-headline tracking-tight uppercase">Confirmed</h1>
                <p className="text-stone-500 font-black uppercase text-[10px] tracking-widest leading-relaxed">Artisanal booking secured. Confirm via WhatsApp to start production.</p>
              </div>
              
              <div className="space-y-4">
                <Button 
                  className="w-full h-16 text-[12px] font-black gap-3 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white shadow-xl uppercase tracking-widest" 
                  onClick={handleWhatsAppConfirm}
                >
                  <WhatsappIcon className="h-5 w-5" />
                  Confirm on WhatsApp
                </Button>
                
                <Link href="/">
                  <Button variant="outline" className="w-full h-14 text-[10px] font-black gap-2 rounded-xl uppercase tracking-widest">
                    <ShoppingBag className="h-4 w-4" />
                    Return to Catalog
                  </Button>
                </Link>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border-2 border-dashed border-stone-200 flex flex-col items-center gap-1">
                <span className="text-[8px] uppercase font-black text-stone-400 tracking-widest">Master Reference</span>
                <div className="flex items-center gap-2">
                  <code className="text-lg font-black text-primary">{orderRef}</code>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-stone-400" onClick={() => {
                    navigator.clipboard.writeText(orderRef);
                    toast({ title: "Ref Copied" });
                  }}><Copy className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-20 selection:bg-primary selection:text-white">
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />
      <header className="bg-white border-b py-4 sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            <ArrowLeft className="h-4 w-4" />
            <span className="no-wrap">Return</span>
          </Button>
          <div className="text-xl font-black font-headline text-primary tracking-tighter">Secure Payment</div>
          <div className="w-12" />
        </div>
      </header>
      <main className="container mx-auto px-4 py-12 max-w-xl">
        <section className="space-y-8">
          <div className="text-center space-y-1">
            <h2 className="text-3xl font-black tracking-tight uppercase">Deposit Gateway</h2>
            <p className="text-stone-400 font-black uppercase text-[9px] tracking-[0.2em]">80% Artisanal Verification Required</p>
          </div>
          <Card className="border-none shadow-2xl overflow-hidden rounded-[2.5rem] bg-white">
            <CardHeader className="bg-stone-900 text-white py-4">
              <CardTitle className="text-[9px] uppercase tracking-[0.2em] font-black text-center">Reference: {orderRef}</CardTitle>
            </CardHeader>
            <CardContent className="p-8 md:p-10 space-y-8">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">Total Value</span>
                  <span className="text-xl font-black text-stone-900">{formatPrice(orderTotal)}</span>
                </div>
                <div className="p-6 bg-primary/5 rounded-[1.5rem] border-2 border-primary/20 flex flex-col gap-3">
                  <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Mandatory 80% Deposit</span>
                  <span className="text-4xl font-black text-primary tracking-tighter">{formatPrice(depositAmount)}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 bg-stone-50 rounded-2xl border-2 border-stone-100">
                <ShieldCheck className="h-6 w-6 text-green-600 shrink-0" />
                <p className="text-[9px] font-black text-stone-500 uppercase tracking-widest leading-relaxed">
                  Encryption Secured by Paystack. Supports M-Pesa & Card.
                </p>
              </div>
              <Button 
                onClick={handlePaystackPayment} 
                disabled={isProcessing} 
                className="w-full h-18 text-xl font-black gap-3 shadow-2xl bg-primary hover:bg-primary/95 rounded-2xl uppercase tracking-widest"
              >
                {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <CreditCard className="h-6 w-6" />}
                {isProcessing ? 'Verifying...' : 'Secure Booking Now'}
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}