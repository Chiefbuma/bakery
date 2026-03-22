
'use client';

import { useState, useEffect, useMemo } from 'react';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CreditCard, Truck, Store, Calendar, MapPin, Loader2, ShieldCheck, LocateFixed } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [method, setMethod] = useState<'delivery' | 'pickup'>('pickup');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [cartItem, setCartItem] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    address: '',
    latitude: null as number | null,
    longitude: null as number | null
  });

  useEffect(() => {
    const data = localStorage.getItem('bakery_current_item');
    if (data) setCartItem(JSON.parse(data));
  }, []);

  // Strict 48-hour (2 days) Lead Time Enforcement
  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2); // Minimum 2 days from today
    return d.toISOString().split('T')[0];
  }, []);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({ variant: "destructive", title: "GPS Error", description: "Browser does not support geolocation." });
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({ ...prev, latitude, longitude }));
        setIsGettingLocation(false);
        toast({ title: "Coordinates Locked", description: "GPS location captured successfully for delivery." });
      },
      (error) => {
        setIsGettingLocation(false);
        toast({ variant: "destructive", title: "Access Denied", description: "Please enable location services for precise delivery." });
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const handleProceed = async () => {
    if (!formData.name || !formData.phone || !formData.date) {
      toast({ variant: "destructive", title: "Required Info", description: "Please complete the guest credentials." });
      return;
    }
    if (method === 'delivery' && !formData.address) {
      toast({ variant: "destructive", title: "Address Required", description: "Provide a landmark or address for delivery." });
      return;
    }

    setIsProcessing(true);
    const total = cartItem?.totalPrice || 0;
    const deposit = total * 0.8; // Strict 80% Mandatory Deposit
    
    const checkoutPayload = { 
      ...formData, 
      method, 
      total, 
      deposit,
      item_details: cartItem,
      pickup_location: method === 'pickup' ? 'Nairobi Main Bakery' : ''
    };
    
    localStorage.setItem('temp_checkout_data', JSON.stringify(checkoutPayload));
    
    await new Promise(resolve => setTimeout(resolve, 800));
    router.push('/payment');
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20 selection:bg-primary selection:text-white">
      <header className="bg-white border-b py-4 sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            <span className="no-wrap">Return</span>
          </Link>
          <div className="text-xl font-black font-headline text-primary tracking-tighter">Artisanal Checkout</div>
          <div className="w-12" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4">
            <h2 className="text-md font-black flex items-center gap-2 text-stone-900 uppercase tracking-tighter">
              <span className="bg-primary text-white h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-black shadow-lg">1</span>
              Guest Credentials
            </h2>
            <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white">
              <CardContent className="p-6 grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Full Name</Label>
                  <Input 
                    value={formData.name}
                    onChange={e => setFormData(prev => ({...prev, name: e.target.value}))}
                    placeholder="Guest Name" 
                    className="h-12 border-2 rounded-xl font-black text-[11px]" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Phone</Label>
                  <Input 
                    value={formData.phone}
                    onChange={e => setFormData(prev => ({...prev, phone: e.target.value}))}
                    placeholder="07..." 
                    className="h-12 border-2 rounded-xl font-black text-[11px]" 
                  />
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-4">
            <h2 className="text-md font-black flex items-center gap-2 text-stone-900 uppercase tracking-tighter">
              <span className="bg-primary text-white h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-black shadow-lg">2</span>
              Logistics & Location
            </h2>
            <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white">
              <CardContent className="p-0">
                <RadioGroup value={method} onValueChange={v => setMethod(v as any)} className="grid grid-cols-2 gap-0 border-b">
                   <div className={`p-6 border-r flex items-start gap-3 cursor-pointer transition-all ${method === 'pickup' ? 'bg-primary/5' : ''}`} onClick={() => setMethod('pickup')}>
                      <RadioGroupItem value="pickup" id="pickup" className="mt-1" />
                      <div>
                        <Label htmlFor="pickup" className="text-[11px] font-black cursor-pointer flex items-center gap-2 text-stone-900 uppercase tracking-widest">
                          <Store className="h-3 w-3 text-primary" /> Pickup
                        </Label>
                        <p className="text-[8px] text-stone-400 font-black uppercase mt-1">Nairobi Hub</p>
                      </div>
                   </div>
                   <div className={`p-6 flex items-start gap-3 cursor-pointer transition-all ${method === 'delivery' ? 'bg-primary/5' : ''}`} onClick={() => setMethod('delivery')}>
                      <RadioGroupItem value="delivery" id="delivery" className="mt-1" />
                      <div>
                        <Label htmlFor="delivery" className="text-[11px] font-black cursor-pointer flex items-center gap-2 text-stone-900 uppercase tracking-widest">
                          <Truck className="h-3 w-3 text-primary" /> Delivery
                        </Label>
                        <p className="text-[8px] text-stone-400 font-black uppercase mt-1">Exact Address</p>
                      </div>
                   </div>
                </RadioGroup>
                
                <div className="p-6 bg-stone-50/30 space-y-6">
                   <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-500">
                          <Calendar className="h-3.5 w-3.5 text-primary" /> Date (48h Lead)
                        </Label>
                        <Input 
                          type="date" 
                          min={minDate}
                          value={formData.date}
                          onChange={e => setFormData(prev => ({...prev, date: e.target.value}))}
                          className="h-12 border-2 rounded-xl bg-white font-black text-[11px]" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-500">
                          <MapPin className="h-3.5 w-3.5 text-primary" /> {method === 'pickup' ? 'Hub Location' : 'Full Address'}
                        </Label>
                        {method === 'pickup' ? (
                          <div className="h-12 border-2 rounded-xl bg-stone-100 flex items-center px-4 text-[10px] font-black uppercase text-stone-600 no-wrap">
                            Nairobi Main Bakery
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <Input 
                              value={formData.address}
                              onChange={e => setFormData(prev => ({...prev, address: e.target.value}))}
                              placeholder="House, Street, Area" 
                              className="h-12 border-2 rounded-xl bg-white font-black text-[11px]" 
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              className="w-full h-11 rounded-xl border-dashed border-2 gap-2 text-[9px] font-black uppercase"
                              onClick={handleGetCurrentLocation}
                              disabled={isGettingLocation}
                            >
                              {isGettingLocation ? <Loader2 className="h-3 w-3 animate-spin" /> : <LocateFixed className="h-3 w-3" />}
                              {formData.latitude ? `GPS Coordinates Locked` : 'Set Precise Location'}
                            </Button>
                          </div>
                        )}
                      </div>
                   </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-stone-950 text-white">
            <CardHeader className="bg-primary text-white py-4">
              <CardTitle className="text-[10px] uppercase tracking-[0.2em] font-black text-center">Valuation Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex justify-between items-center py-2">
                 <span className="text-xl font-black uppercase tracking-tighter text-stone-300">Total</span>
                 <span className="text-3xl font-black text-primary tracking-tighter">{formatPrice(cartItem?.totalPrice || 0)}</span>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-start gap-3">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <p className="text-[9px] text-stone-400 font-black uppercase leading-relaxed">
                  80% Artisanal Deposit ({formatPrice((cartItem?.totalPrice || 0) * 0.8)}) is mandatory to secure production.
                </p>
              </div>
              <Button 
                className="w-full h-16 text-lg font-black gap-2 shadow-2xl rounded-2xl uppercase tracking-widest" 
                onClick={handleProceed}
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}
                {isProcessing ? 'Processing...' : 'Secure Booking'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
