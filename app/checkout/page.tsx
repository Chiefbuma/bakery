
'use client';

import { useState, useEffect, useMemo } from 'react';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CreditCard, Truck, Store, Calendar, MapPin, Loader2, ShieldCheck, MapIcon, LocateFixed } from 'lucide-react';
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

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    address: '',
    lat: null as number | null,
    lng: null as number | null
  });

  // Minimum date is 48 hours (2 days) from now
  const minDate = useMemo(() => {
    const d = new Date();
    d.setHours(d.getHours() + 48);
    return d.toISOString().split('T')[0];
  }, []);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({ variant: "destructive", title: "Not Supported", description: "Browser geolocation is not available." });
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({ ...prev, lat: pos.coords.latitude, lng: pos.coords.longitude }));
        setIsGettingLocation(false);
        toast({ title: "Coordinates Locked", description: "Your current location has been mapped." });
      },
      (err) => {
        setIsGettingLocation(false);
        toast({ variant: "destructive", title: "Mapping Error", description: "Please enable location permissions." });
      }
    );
  };

  const handleProceed = async () => {
    if (!formData.name || !formData.phone || !formData.date) {
      toast({ variant: "destructive", title: "Missing Info", description: "Please complete all required fields." });
      return;
    }
    if (method === 'delivery' && (!formData.address || !formData.lat)) {
      toast({ variant: "destructive", title: "Location Missing", description: "Please provide an address and set coordinates for delivery." });
      return;
    }

    setIsProcessing(true);
    // Persist temporary data for payment page simulation
    const depositPercent = 0.8;
    const total = 3650; // Mock total for visual purposes
    const deposit = total * depositPercent;
    
    localStorage.setItem('temp_checkout_data', JSON.stringify({ ...formData, method, total, deposit }));
    
    await new Promise(resolve => setTimeout(resolve, 800));
    router.push('/payment');
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20 selection:bg-primary selection:text-white">
      <header className="bg-white border-b py-4 md:py-8 sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Catalog</span>
          </Link>
          <div className="text-xl md:text-2xl font-black font-headline text-primary tracking-tighter">Order Processing</div>
          <div className="w-12 md:w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-8 md:py-12 grid lg:grid-cols-3 gap-8 md:gap-12 items-start">
        <div className="lg:col-span-2 space-y-8 md:space-y-12">
          <section className="space-y-4 md:space-y-6">
            <h2 className="text-xl md:text-3xl font-black flex items-center gap-3 md:gap-4 text-stone-900 uppercase tracking-tighter">
              <span className="bg-primary text-white h-8 w-8 md:h-10 md:w-10 rounded-xl md:rounded-2xl flex items-center justify-center text-xs md:text-sm font-black shadow-lg shadow-primary/20">1</span>
              Personal Details
            </h2>
            <Card className="border-none shadow-xl rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-white">
              <CardContent className="p-6 md:p-10 grid sm:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-900 block ml-1">Guest Name</Label>
                  <Input 
                    value={formData.name}
                    onChange={e => setFormData(prev => ({...prev, name: e.target.value}))}
                    placeholder="Full Name" 
                    className="h-12 md:h-14 border-2 rounded-xl md:rounded-2xl bg-stone-50/50 font-black uppercase text-[10px]" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-900 block ml-1">Phone Number</Label>
                  <Input 
                    value={formData.phone}
                    onChange={e => setFormData(prev => ({...prev, phone: e.target.value}))}
                    placeholder="+254..." 
                    className="h-12 md:h-14 border-2 rounded-xl md:rounded-2xl bg-stone-50/50 font-black uppercase text-[10px]" 
                  />
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-4 md:space-y-6">
            <h2 className="text-xl md:text-3xl font-black flex items-center gap-3 md:gap-4 text-stone-900 uppercase tracking-tighter">
              <span className="bg-primary text-white h-8 w-8 md:h-10 md:w-10 rounded-xl md:rounded-2xl flex items-center justify-center text-xs md:text-sm font-black shadow-lg shadow-primary/20">2</span>
              Artisanal Fulfillment
            </h2>
            <Card className="border-none shadow-xl rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-white">
              <CardContent className="p-0">
                <RadioGroup value={method} onValueChange={v => setMethod(v as any)} className="grid sm:grid-cols-2 gap-0 border-b">
                   <div className={`p-6 md:p-10 border-b sm:border-b-0 sm:border-r flex items-start gap-4 md:gap-6 cursor-pointer transition-all ${method === 'pickup' ? 'bg-primary/5' : 'hover:bg-stone-50/50'}`} onClick={() => setMethod('pickup')}>
                      <RadioGroupItem value="pickup" id="pickup" className="mt-1 h-5 w-5 border-2" />
                      <div>
                        <Label htmlFor="pickup" className="text-lg md:text-xl font-black cursor-pointer flex items-center gap-2 md:gap-3 text-stone-900 uppercase tracking-widest">
                          <Store className="h-5 w-5 md:h-6 md:w-6 text-primary" /> Shop Pickup
                        </Label>
                        <p className="text-[9px] text-stone-400 font-black uppercase tracking-widest mt-1">Nairobi Main Bakery</p>
                      </div>
                   </div>
                   <div className={`p-6 md:p-10 flex items-start gap-4 md:gap-6 cursor-pointer transition-all ${method === 'delivery' ? 'bg-primary/5' : 'hover:bg-stone-50/50'}`} onClick={() => setMethod('delivery')}>
                      <RadioGroupItem value="delivery" id="delivery" className="mt-1 h-5 w-5 border-2" />
                      <div>
                        <Label htmlFor="delivery" className="text-lg md:text-xl font-black cursor-pointer flex items-center gap-2 md:gap-3 text-stone-900 uppercase tracking-widest">
                          <Truck className="h-5 w-5 md:h-6 md:w-6 text-primary" /> Home Delivery
                        </Label>
                        <p className="text-[9px] text-stone-400 font-black uppercase tracking-widest mt-1">Within Nairobi & Kenya</p>
                      </div>
                   </div>
                </RadioGroup>
                
                <div className="p-6 md:p-10 bg-stone-50/30 space-y-6 md:space-y-8">
                   <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-stone-900 ml-1">
                          <Calendar className="h-4 w-4 text-primary" /> Preferred Date (48h Lead)
                        </Label>
                        <Input 
                          type="date" 
                          min={minDate}
                          value={formData.date}
                          onChange={e => setFormData(prev => ({...prev, date: e.target.value}))}
                          className="h-12 md:h-14 border-2 rounded-xl md:rounded-2xl bg-white font-black" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-stone-900 ml-1">
                          <MapPin className="h-4 w-4 text-primary" /> {method === 'pickup' ? 'Bakery Point' : 'Delivery Address'}
                        </Label>
                        {method === 'pickup' ? (
                          <div className="h-12 md:h-14 border-2 rounded-xl md:rounded-2xl bg-stone-100 flex items-center px-4 text-[10px] font-black uppercase text-stone-600">
                            WhiskeDelights Nairobi
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <Input 
                              value={formData.address}
                              onChange={e => setFormData(prev => ({...prev, address: e.target.value}))}
                              placeholder="Building, Street, Landmark" 
                              className="h-12 md:h-14 border-2 rounded-xl md:rounded-2xl bg-white font-black uppercase text-[10px]" 
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              className="w-full h-12 rounded-xl border-dashed border-2 gap-2 text-[9px] font-black uppercase tracking-widest"
                              onClick={handleGetCurrentLocation}
                              disabled={isGettingLocation}
                            >
                              {isGettingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
                              {formData.lat ? `Cords: ${formData.lat.toFixed(4)}, ${formData.lng?.toFixed(4)}` : 'Set Precise Coordinates'}
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

        <div className="space-y-6 md:space-y-8">
          <Card className="border-none shadow-2xl sticky top-24 md:top-32 rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-stone-950 text-white">
            <CardHeader className="bg-primary text-white py-4 md:py-6">
              <CardTitle className="text-[10px] uppercase tracking-[0.3em] font-black text-center">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-10 space-y-6 md:space-y-8">
              <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Masterpiece</span>
                    <span className="font-black text-md md:text-lg">Ksh 3,200</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Variants</span>
                    <span className="font-black text-md md:text-lg">Ksh 450</span>
                 </div>
              </div>
              <Separator className="bg-white/10" />
              <div className="flex justify-between items-center py-2">
                 <span className="text-lg md:text-xl font-black uppercase tracking-tighter text-stone-300">Total</span>
                 <span className="text-3xl md:text-4xl font-black text-primary tracking-tighter">Ksh 3,650</span>
              </div>
              <div className="p-4 md:p-5 bg-white/5 rounded-2xl border border-white/10 flex items-start gap-3 md:gap-4">
                <ShieldCheck className="h-5 w-5 md:h-6 md:w-6 text-primary shrink-0" />
                <p className="text-[9px] text-stone-400 font-black uppercase tracking-widest leading-relaxed">
                  An 80% deposit (Ksh 2,920) is required to secure your artisanal booking.
                </p>
              </div>
              <Button 
                className="w-full h-16 md:h-20 text-lg md:text-xl font-black gap-2 md:gap-3 shadow-2xl rounded-2xl md:rounded-[2rem] transition-transform hover:scale-[1.01] uppercase tracking-[0.2em]" 
                onClick={handleProceed}
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <CreditCard className="h-6 w-6" />}
                {isProcessing ? 'Verifying...' : 'Confirm & Pay'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
