'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CreditCard, Truck, Store, Calendar, MapPin, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function CheckoutPage() {
  const router = useRouter();
  const [method, setMethod] = useState<'delivery' | 'pickup'>('pickup');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProceed = async () => {
    setIsProcessing(true);
    // Simulate navigation/processing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    router.push('/payment');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="min-h-screen bg-stone-50 pb-20"
    >
      <header className="bg-white border-b py-6 sticky top-0 z-50">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Continue Shopping</span>
          </Link>
          <div className="text-xl font-black font-headline text-primary">Checkout</div>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {/* Customer Details */}
          <section className="space-y-4">
            <h2 className="text-2xl font-black flex items-center gap-2">
              <span className="bg-primary text-white h-8 w-8 rounded-full flex items-center justify-center text-sm">1</span>
              Contact Information
            </h2>
            <Card className="border-none shadow-sm">
              <CardContent className="p-6 grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Name</Label>
                  <Input placeholder="John Doe" className="h-12 border-2 focus:border-primary/50 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Phone Number</Label>
                  <Input placeholder="+254 700 000 000" className="h-12 border-2 focus:border-primary/50 rounded-xl" />
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Delivery Logic */}
          <section className="space-y-4">
            <h2 className="text-2xl font-black flex items-center gap-2">
              <span className="bg-primary text-white h-8 w-8 rounded-full flex items-center justify-center text-sm">2</span>
              Delivery Preferences
            </h2>
            <Card className="border-none shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <RadioGroup value={method} onValueChange={v => setMethod(v as any)} className="grid sm:grid-cols-2 gap-0">
                   <div className={`p-6 border-b sm:border-b-0 sm:border-r flex items-start gap-4 cursor-pointer transition-colors ${method === 'pickup' ? 'bg-primary/5' : 'hover:bg-stone-50'}`} onClick={() => setMethod('pickup')}>
                      <RadioGroupItem value="pickup" id="pickup" className="mt-1" />
                      <div>
                        <Label htmlFor="pickup" className="text-lg font-black cursor-pointer flex items-center gap-2">
                          <Store className="h-5 w-5 text-primary" /> Shop Pickup
                        </Label>
                        <p className="text-xs text-muted-foreground font-medium">Collect from our Othaya main branch.</p>
                      </div>
                   </div>
                   <div className={`p-6 flex items-start gap-4 cursor-pointer transition-colors ${method === 'delivery' ? 'bg-primary/5' : 'hover:bg-stone-50'}`} onClick={() => setMethod('delivery')}>
                      <RadioGroupItem value="delivery" id="delivery" className="mt-1" />
                      <div>
                        <Label htmlFor="delivery" className="text-lg font-black cursor-pointer flex items-center gap-2">
                          <Truck className="h-5 w-5 text-primary" /> Home Delivery
                        </Label>
                        <p className="text-xs text-muted-foreground font-medium">Delivered within Nyeri County.</p>
                      </div>
                   </div>
                </RadioGroup>
                
                <div className="p-6 bg-stone-50/50 border-t space-y-6">
                   <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          <Calendar className="h-3 w-3" /> Pick a Date
                        </Label>
                        <Input type="date" className="h-12 border-2 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {method === 'pickup' ? 'Pickup Location' : 'Delivery Address'}
                        </Label>
                        <Input placeholder={method === 'pickup' ? 'Main Branch (Othaya)' : 'Street / Landmark'} className="h-12 border-2 rounded-xl" />
                      </div>
                   </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card className="border-none shadow-lg sticky top-24 rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-primary text-white">
              <CardTitle className="text-sm uppercase tracking-[0.2em] font-black">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-muted-foreground">Artisanal Base</span>
                    <span className="font-black">Ksh 3,200</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-muted-foreground">Custom Upgrades</span>
                    <span className="font-black">Ksh 450</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-muted-foreground">Fulfillment Fee</span>
                    <span className="font-black text-green-600">FREE</span>
                 </div>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                 <span className="text-lg font-black uppercase tracking-tighter">Total Due</span>
                 <span className="text-3xl font-black text-primary">Ksh 3,650</span>
              </div>
              <div className="p-4 bg-stone-50 rounded-2xl text-[10px] text-muted-foreground font-medium italic border border-dashed border-stone-200">
                A 50% deposit (Ksh 1,825) is required to confirm your artisanal booking.
              </div>
              <Button 
                className="w-full h-16 text-lg font-black gap-2 shadow-xl hover:shadow-2xl transition-all rounded-2xl" 
                onClick={handleProceed}
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <CreditCard className="h-5 w-5" />}
                {isProcessing ? 'Processing Order...' : 'Proceed to Payment'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </motion.div>
  );
}