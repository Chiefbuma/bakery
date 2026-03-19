
'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CreditCard, Truck, Store, Calendar, MapPin, Loader2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function CheckoutPage() {
  const router = useRouter();
  const [method, setMethod] = useState<'delivery' | 'pickup'>('pickup');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProceed = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    router.push('/payment');
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <header className="bg-white border-b py-8 sticky top-0 z-50">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Catalog</span>
          </Link>
          <div className="text-2xl font-black font-headline text-primary tracking-tighter">Order Processing</div>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 grid lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-2 space-y-12">
          <section className="space-y-6">
            <h2 className="text-3xl font-black flex items-center gap-4 text-stone-900">
              <span className="bg-primary text-white h-10 w-10 rounded-2xl flex items-center justify-center text-sm font-black shadow-lg shadow-primary/20">1</span>
              Personal Details
            </h2>
            <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-10 grid sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400 block ml-1">Full Guest Name</Label>
                  <Input placeholder="e.g. Jane Doe" className="h-14 border-2 focus:border-primary/50 rounded-2xl bg-stone-50/50" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400 block ml-1">Phone Number</Label>
                  <Input placeholder="+254 700 000 000" className="h-14 border-2 focus:border-primary/50 rounded-2xl bg-stone-50/50" />
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-6">
            <h2 className="text-3xl font-black flex items-center gap-4 text-stone-900">
              <span className="bg-primary text-white h-10 w-10 rounded-2xl flex items-center justify-center text-sm font-black shadow-lg shadow-primary/20">2</span>
              Artisanal Fulfillment
            </h2>
            <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
              <CardContent className="p-0">
                <RadioGroup value={method} onValueChange={v => setMethod(v as any)} className="grid sm:grid-cols-2 gap-0 border-b">
                   <div className={`p-10 border-b sm:border-b-0 sm:border-r flex items-start gap-6 cursor-pointer transition-all ${method === 'pickup' ? 'bg-primary/5' : 'hover:bg-stone-50/50'}`} onClick={() => setMethod('pickup')}>
                      <RadioGroupItem value="pickup" id="pickup" className="mt-1 h-5 w-5 border-2" />
                      <div>
                        <Label htmlFor="pickup" className="text-xl font-black cursor-pointer flex items-center gap-3 text-stone-900">
                          <Store className="h-6 w-6 text-primary" /> Shop Pickup
                        </Label>
                        <p className="text-[11px] text-stone-400 font-black uppercase tracking-widest mt-2">Othaya Main Bakery</p>
                      </div>
                   </div>
                   <div className={`p-10 flex items-start gap-6 cursor-pointer transition-all ${method === 'delivery' ? 'bg-primary/5' : 'hover:bg-stone-50/50'}`} onClick={() => setMethod('delivery')}>
                      <RadioGroupItem value="delivery" id="delivery" className="mt-1 h-5 w-5 border-2" />
                      <div>
                        <Label htmlFor="delivery" className="text-xl font-black cursor-pointer flex items-center gap-3 text-stone-900">
                          <Truck className="h-6 w-6 text-primary" /> Home Delivery
                        </Label>
                        <p className="text-[11px] text-stone-400 font-black uppercase tracking-widest mt-2">Within Nyeri County</p>
                      </div>
                   </div>
                </RadioGroup>
                
                <div className="p-10 bg-stone-50/30 space-y-8">
                   <div className="grid sm:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">
                          <Calendar className="h-4 w-4 text-primary" /> Preferred Date
                        </Label>
                        <Input type="date" className="h-14 border-2 rounded-2xl bg-white" />
                      </div>
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">
                          <MapPin className="h-4 w-4 text-primary" /> {method === 'pickup' ? 'Bakery Point' : 'Exact Address'}
                        </Label>
                        <Input placeholder={method === 'pickup' ? 'WhiskeDelights Othaya' : 'Street, Building, Landmark'} className="h-14 border-2 rounded-2xl bg-white" />
                      </div>
                   </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-2xl sticky top-32 rounded-[3rem] overflow-hidden bg-stone-950 text-white">
            <CardHeader className="bg-primary text-white py-6">
              <CardTitle className="text-[11px] uppercase tracking-[0.3em] font-black text-center">Masterpiece Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="space-y-5">
                 <div className="flex justify-between items-center">
                    <span className="text-[11px] font-black uppercase tracking-widest text-stone-400">Base Selection</span>
                    <span className="font-black text-lg">Ksh 3,200</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[11px] font-black uppercase tracking-widest text-stone-400">Custom Add-ons</span>
                    <span className="font-black text-lg">Ksh 450</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[11px] font-black uppercase tracking-widest text-stone-400">Service Fee</span>
                    <span className="font-black text-green-400 text-lg">FREE</span>
                 </div>
              </div>
              <Separator className="bg-white/10" />
              <div className="flex justify-between items-center py-2">
                 <span className="text-xl font-black uppercase tracking-tighter text-stone-300">Total Value</span>
                 <span className="text-4xl font-black text-primary tracking-tighter">Ksh 3,650</span>
              </div>
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 flex items-start gap-4">
                <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
                <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest leading-relaxed">
                  A 50% deposit (Ksh 1,825) is required to secure your artisanal booking.
                </p>
              </div>
              <Button 
                className="w-full h-20 text-xl font-black gap-3 shadow-2xl rounded-[2rem] transition-transform hover:scale-[1.02]" 
                onClick={handleProceed}
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <CreditCard className="h-6 w-6" />}
                {isProcessing ? 'Verifying...' : 'Finalize & Pay'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
