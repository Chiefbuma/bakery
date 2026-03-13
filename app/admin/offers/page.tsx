'use client';

import { useState, useEffect } from 'react';
import { getCakes, getSpecialOffer, updateSpecialOffer } from '@/services/cake-service';
import type { Cake, SpecialOffer } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Star, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminOffersPage() {
  const { toast } = useToast();
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [currentOffer, setCurrentOffer] = useState<SpecialOffer | null>(null);
  const [selectedCakeId, setSelectedCakeId] = useState('');
  const [discountPercent, setDiscountPercent] = useState(20);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [cakeList, offer] = await Promise.all([getCakes(), getSpecialOffer()]);
    setCakes(cakeList);
    setCurrentOffer(offer);
    if (offer) {
      setSelectedCakeId(offer.cake.id);
      setDiscountPercent(offer.discount_percentage);
    }
  };

  const handleUpdate = async () => {
    await updateSpecialOffer({ cake_id: selectedCakeId, discount_percentage: discountPercent });
    toast({ title: "Offer Published", description: "The daily special has been updated on the storefront." });
    fetchData();
  };

  if (!currentOffer) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div>
        <h1 className="text-3xl font-black font-headline tracking-tight">Daily Special Editor</h1>
        <p className="text-muted-foreground font-medium">Control the artisanal masterpiece featured on your landing page.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-stone-900 text-white">
            <CardTitle className="text-sm uppercase tracking-[0.2em] font-black">Offer Settings</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
             <div className="space-y-3">
                <Label className="font-black text-xs uppercase tracking-widest text-stone-500">Featured Cake</Label>
                <Select value={selectedCakeId} onValueChange={setSelectedCakeId}>
                  <SelectTrigger className="h-12 border-2 rounded-xl">
                    <SelectValue placeholder="Pick a masterpiece" />
                  </SelectTrigger>
                  <SelectContent>
                    {cakes.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
             </div>

             <div className="space-y-3">
                <Label className="font-black text-xs uppercase tracking-widest text-stone-500">Discount Percentage (%)</Label>
                <Input 
                  type="number" 
                  value={discountPercent} 
                  onChange={(e) => setDiscountPercent(parseInt(e.target.value))} 
                  className="h-12 border-2 rounded-xl text-lg font-black"
                />
             </div>

             <Button className="w-full h-14 text-lg font-black gap-3 shadow-xl rounded-xl mt-4" onClick={handleUpdate}>
               <RefreshCw className="h-5 w-5" />
               Update Storefront
             </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
           <Label className="font-black text-xs uppercase tracking-widest text-muted-foreground ml-2">Live Preview</Label>
           <Card className="border-none shadow-2xl bg-stone-900 text-white overflow-hidden relative rounded-[2rem]">
              <div className="p-8 space-y-6 relative z-10">
                 <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center">
                      <Star className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Active Special</p>
                      <h3 className="text-xl font-black">{currentOffer.cake.name}</h3>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                       <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Original</p>
                       <p className="text-lg font-black text-stone-500 line-through">{formatPrice(currentOffer.original_price)}</p>
                    </div>
                    <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
                       <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Special</p>
                       <p className="text-2xl font-black text-primary">{formatPrice(currentOffer.special_price)}</p>
                    </div>
                 </div>

                 <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Savings</p>
                    <p className="text-xl font-black text-green-400">{formatPrice(currentOffer.savings)} ({currentOffer.discount_percentage}% OFF)</p>
                 </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
           </Card>
        </div>
      </div>
    </motion.div>
  );
}
