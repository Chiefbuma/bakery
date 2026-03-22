
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

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    address: '',
    latitude: null as number | null,
    longitude: null as number | null
  });

  // Strict 48-hour (2 days) Lead Time
  const minDate = useMemo(() => {
    const d = new Date();
    d.setHours(d.getHours() + 48);
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
        toast({ title: "Location Captured", description: "GPS coordinates locked for delivery." });
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
      toast({ variant: "destructive", title: "Action Required", description: "Please provide a delivery address." });
      return;
    }

    setIsProcessing(true);
    // In a production app, calculate total from actual cart state
    const total = 3500; 
    const deposit = total * 0.8; // 80% Mandatory Deposit
    
    const checkoutPayload = { 
      ...formData, 
      method, 
      total, 
      deposit,
      pickup_location: method === 'pickup' ? 'Nairobi Main Bakery' : ''
    };
    
    localStorage.setItem('temp_checkout_data', JSON.stringify(checkoutPayload));
    
    await new Promise(resolve => setTimeout(resolve, 800));
    router.push('/payment');
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <header className="bg-white border-b py-6 sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            <span>Gallery</span>
          </Link>
          <div className="text-xl font-black font-headline text-primary tracking-tighter">Order Configuration</div>
          <div className="w-12" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4">
            <h2 className="text-lg font-black flex items-center gap-3 text-stone-900 uppercase tracking-tighter">
              <span className="bg-primary text-white h-8 w-8 rounded-xl flex items-center justify-center text-xs font-black shadow-lg shadow-primary/20">1</span>
              Guest Credentials
            </h2>
            <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white">
              <CardContent className="p-8 grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Full Name</Label>
                  <Input 
                    value={formData.name}
                    onChange={e => setFormData(prev => ({...prev, name: e.target.value}))}
                    placeholder="e.g. Jane Doe" 
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
            <h2 className="text-lg font-black flex items-center gap-3 text-stone-900 uppercase tracking-tighter">
              <span className="bg-primary text-white h-8 w-8 rounded-xl flex items-center justify-center text-xs font-black shadow-lg shadow-primary/20">2</span>
              Fulfillment Logistics
            </h2>
            <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white">
              <CardContent className="p-0">
                <RadioGroup value={method} onValueChange={v => setMethod(v as any)} className="grid sm:grid-cols-2 gap-0 border-b">
                   <div className={`p-8 border-b sm:border-b-0 sm:border-r flex items-start gap-4 cursor-pointer transition-all ${method === 'pickup' ? 'bg-primary/5' : ''}`} onClick={() => setMethod('pickup')}>
                      <RadioGroupItem value="pickup" id="pickup" className="mt-1" />
                      <div>
                        <Label htmlFor="pickup" className="text-md font-black cursor-pointer flex items-center gap-2 text-stone-900 uppercase tracking-widest">
                          <Store className="h-4 w-4 text-primary" /> Pickup
                        </Label>
                        <p className="text-[9px] text-stone-400 font-black uppercase mt-1">Nairobi Main Bakery</p>
                      </div>
                   </div>
                   <div className={`p-8 flex items-start gap-4 cursor-pointer transition-all ${method === 'delivery' ? 'bg-primary/5' : ''}`} onClick={() => setMethod('delivery')}>
                      <RadioGroupItem value="delivery" id="delivery" className="mt-1" />
                      <div>
                        <Label htmlFor="delivery" className="text-md font-black cursor-pointer flex items-center gap-2 text-stone-900 uppercase tracking-widest">
                          <Truck className="h-4 w-4 text-primary" /> Home Delivery
                        </Label>
                        <p className="text-[9px] text-stone-400 font-black uppercase mt-1">Nairobi & Environs</p>
                      </div>
                   </div>
                </RadioGroup>
                
                <div className="p-8 bg-stone-50/30 space-y-6">
                   <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-500">
                          <Calendar className="h-3.5 w-3.5 text-primary" /> Preferred Date (48h Min)
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
                          <MapPin className="h-3.5 w-3.5 text-primary" /> {method === 'pickup' ? 'Pickup Hub' : 'Exact Address'}
                        </Label>
                        {method === 'pickup' ? (
                          <div className="h-12 border-2 rounded-xl bg-stone-100 flex items-center px-4 text-[10px] font-black uppercase text-stone-600">
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
                              {isGettingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
                              {formData.latitude ? `GPS Captured: ${formData.latitude.toFixed(4)}, ${formData.longitude?.toFixed(4)}` : 'Set GPS Location'}
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
              <CardTitle className="text-[10px] uppercase tracking-[0.3em] font-black text-center">Value Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex justify-between items-center py-2">
                 <span className="text-xl font-black uppercase tracking-tighter text-stone-300">Total</span>
                 <span className="text-3xl font-black text-primary tracking-tighter">Ksh 3,500</span>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                <p className="text-[9px] text-stone-400 font-black uppercase leading-relaxed">
                  80% Artisanal Deposit (Ksh 2,800) is mandatory to secure your slot.
                </p>
              </div>
              <Button 
                className="w-full h-16 text-lg font-black gap-2 shadow-2xl rounded-2xl uppercase tracking-widest" 
                onClick={handleProceed}
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}
                {isProcessing ? 'Processing...' : 'Secure Order Now'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
