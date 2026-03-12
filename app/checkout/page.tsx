
'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CreditCard, Truck, Store, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const [method, setMethod] = useState<'delivery' | 'pickup'>('pickup');

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <header className="bg-white border-b py-6">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold hover:text-primary">
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
                  <Label>Full Name</Label>
                  <Input placeholder="John Doe" className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input placeholder="+254 700 000 000" className="h-12" />
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
                   <div className={`p-6 border-b sm:border-b-0 sm:border-r flex items-start gap-4 cursor-pointer transition-colors ${method === 'pickup' ? 'bg-primary/5' : ''}`} onClick={() => setMethod('pickup')}>
                      <RadioGroupItem value="pickup" id="pickup" className="mt-1" />
                      <div>
                        <Label htmlFor="pickup" className="text-lg font-black cursor-pointer flex items-center gap-2">
                          <Store className="h-5 w-5 text-primary" /> Shop Pickup
                        </Label>
                        <p className="text-sm text-muted-foreground">Collect your order from our Othaya main branch.</p>
                      </div>
                   </div>
                   <div className={`p-6 flex items-start gap-4 cursor-pointer transition-colors ${method === 'delivery' ? 'bg-primary/5' : ''}`} onClick={() => setMethod('delivery')}>
                      <RadioGroupItem value="delivery" id="delivery" className="mt-1" />
                      <div>
                        <Label htmlFor="delivery" className="text-lg font-black cursor-pointer flex items-center gap-2">
                          <Truck className="h-5 w-5 text-primary" /> Home Delivery
                        </Label>
                        <p className="text-sm text-muted-foreground">Delivered to your doorstep within Nyeri County.</p>
                      </div>
                   </div>
                </RadioGroup>
                
                <div className="p-6 bg-stone-50/50 border-t space-y-6">
                   <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" /> Pick a Date
                        </Label>
                        <Input type="date" className="h-12" />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" /> Preference
                        </Label>
                        <Input placeholder={method === 'pickup' ? 'Branch Location' : 'Street Address'} className="h-12" />
                      </div>
                   </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card className="border-none shadow-lg sticky top-24">
            <CardHeader className="bg-primary text-white rounded-t-lg">
              <CardTitle className="text-lg uppercase tracking-widest font-black">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                 <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-muted-foreground">Subtotal</span>
                    <span className="font-black">Ksh 3,200</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-muted-foreground">Customizations</span>
                    <span className="font-black">Ksh 450</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-muted-foreground">Service Fee</span>
                    <span className="font-black text-green-600">FREE</span>
                 </div>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                 <span className="text-lg font-black uppercase">Total</span>
                 <span className="text-2xl font-black text-primary">Ksh 3,650</span>
              </div>
              <div className="p-4 bg-stone-100 rounded-lg text-[10px] text-muted-foreground font-medium italic">
                A 50% deposit (Ksh 1,825) is required to confirm your artisanal order.
              </div>
              <Link href="/payment">
                <Button className="w-full h-14 text-lg font-black gap-2 shadow-xl">
                  Proceed to Payment
                  <CreditCard className="h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
