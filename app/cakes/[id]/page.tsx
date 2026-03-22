'use client';

import { useState, useEffect, useMemo, use } from 'react';
import { getCakeById, getCustomizationOptions } from '@/services/cake-service';
import type { Cake, CustomizationOptions } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ShoppingCart, ArrowLeft, Star, Info, Minus, Plus, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export default function CakeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  
  const [cake, setCake] = useState<Cake | null>(null);
  const [options, setOptions] = useState<CustomizationOptions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const [quantity, setQuantity] = useState(1);
  const [flavorId, setFlavorId] = useState('');
  const [sizeId, setSizeId] = useState('');
  const [colorId, setColorId] = useState('');
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [foundCake, customizationOptions] = await Promise.all([
          getCakeById(id),
          getCustomizationOptions()
        ]);
        setCake(foundCake);
        setOptions(customizationOptions);
        
        if (customizationOptions.flavors?.length > 0) setFlavorId(customizationOptions.flavors[0].id.toString());
        if (customizationOptions.sizes?.length > 0) setSizeId(customizationOptions.sizes[0].id.toString());
        if (customizationOptions.colors?.length > 0) setColorId(customizationOptions.colors[0].id.toString());
        
      } catch (error) {
        console.error('Failed to load cake details', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  const totalPrice = useMemo(() => {
    if (!cake) return 0;
    const base = Number(cake.base_price) || 0;
    let addons = 0;
    if (cake.customizable && options) {
      const flavor = options.flavors?.find(f => f.id.toString() === flavorId);
      const size = options.sizes?.find(s => s.id.toString() === sizeId);
      const color = options.colors?.find(c => c.id.toString() === colorId);
      addons += Number(flavor?.price) || 0;
      addons += Number(size?.price) || 0;
      addons += Number(color?.price) || 0;
      addons += selectedToppings.reduce((acc, tid) => {
        const topping = options.toppings?.find(t => t.id.toString() === tid);
        return acc + (Number(topping?.price) || 0);
      }, 0);
    }
    return (base + addons) * quantity;
  }, [cake, options, quantity, flavorId, sizeId, colorId, selectedToppings]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-stone-500 font-black uppercase tracking-[0.2em] text-[10px]">Assembling Masterpiece...</p>
      </div>
    );
  }

  if (!cake || !options) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-3xl font-black font-headline mb-4">Recipe Unavailable</h1>
      <Link href="/"><Button className="rounded-xl px-10 h-14 font-black text-lg">Back to Catalog</Button></Link>
    </div>
  );

  const handleAddToCart = async () => {
    setIsAdding(true);
    
    // Create Cart Payload for WhatsApp & Checkout
    const cartItem = {
      cakeId: cake.id,
      name: cake.name,
      quantity,
      price: totalPrice / quantity,
      totalPrice,
      customizations: {
        flavor: options.flavors.find(f => f.id.toString() === flavorId)?.name,
        size: options.sizes.find(s => s.id.toString() === sizeId)?.name,
        color: options.colors.find(c => c.id.toString() === colorId)?.name,
        toppings: selectedToppings.map(tid => options.toppings.find(t => t.id.toString() === tid)?.name)
      }
    };
    
    localStorage.setItem('bakery_current_item', JSON.stringify(cartItem));
    
    await new Promise(resolve => setTimeout(resolve, 800));
    toast({ title: "Masterpiece Ready", description: `${quantity}x ${cake.name} added to booking.` });
    router.push('/checkout');
  };

  const toggleTopping = (tid: string) => {
    setSelectedToppings(prev => prev.includes(tid) ? prev.filter(id => id !== tid) : [...prev, tid]);
  };

  return (
    <div className="min-h-screen bg-stone-50/50 pb-20 selection:bg-primary selection:text-white">
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="no-wrap">Catalog</span>
          </Link>
          <div className="text-xl font-black font-headline text-primary tracking-tighter">WhiskeDelights</div>
          <div className="w-16" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 grid lg:grid-cols-2 gap-12 items-start">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="relative aspect-square w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white bg-white">
            <Image 
              src={cake.image_data_uri || 'https://picsum.photos/seed/cake/800/800'} 
              alt={cake.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute bottom-6 left-6 right-6">
               <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border shadow-xl flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary mb-0.5">Base Selection</p>
                    <p className="text-xl font-black">{formatPrice(cake.base_price)}</p>
                  </div>
                  <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white">
                    <Sparkles className="h-5 w-5" />
                  </div>
               </div>
            </div>
          </div>
        </motion.div>

        <div className="space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-white font-black px-3 py-0.5 text-[8px] uppercase tracking-widest border-none">{cake.category}</Badge>
              <div className="flex items-center text-[11px] font-black text-stone-700">
                <Star className="h-3 w-3 text-primary fill-primary mr-1" />
                {cake.rating || 'New'}
              </div>
            </div>
            <h1 className="text-4xl font-black font-headline leading-none text-stone-900">{cake.name}</h1>
            <p className="text-stone-500 font-black text-[11px] leading-relaxed uppercase tracking-widest opacity-70">{cake.description}</p>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border space-y-8">
            {cake.customizable ? (
              <div className="space-y-10">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-900 block border-l-4 border-primary pl-3">1. Flavor Profile</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {options.flavors?.map(flavor => (
                      <div key={flavor.id} onClick={() => setFlavorId(flavor.id.toString())} className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${flavorId === flavor.id.toString() ? 'border-primary bg-primary/5 shadow-inner' : 'border-stone-100 hover:border-stone-200 bg-stone-50/30'}`}>
                        <div className="space-y-0.5">
                          <Label className="font-black text-[11px] cursor-pointer block no-wrap">{flavor.name}</Label>
                        </div>
                        <span className="text-[10px] font-black text-primary">+{formatPrice(flavor.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-900 block border-l-4 border-primary pl-3">2. Dimensions</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {options.sizes?.map(size => (
                      <div key={size.id} onClick={() => setSizeId(size.id.toString())} className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all cursor-pointer text-center ${sizeId === size.id.toString() ? 'border-primary bg-primary/5 shadow-inner' : 'border-stone-100 hover:border-stone-200 bg-stone-50/30'}`}>
                        <span className="font-black text-[9px] uppercase tracking-widest no-wrap">{size.name}</span>
                        <span className="text-[8px] font-black text-primary mt-1">{formatPrice(size.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-900 block border-l-4 border-primary pl-3">3. Theme</Label>
                  <div className="flex flex-wrap gap-2">
                    {options.colors?.map(color => (
                      <button key={color.id} onClick={() => setColorId(color.id.toString())} className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${colorId === color.id.toString() ? 'border-primary bg-primary/5' : 'border-stone-100 hover:border-stone-200'}`}>
                        <div className="h-3 w-3 rounded-full border" style={{ backgroundColor: color.hex_value }} />
                        <span className="text-[9px] font-black uppercase tracking-widest no-wrap">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-stone-950 text-white rounded-2xl flex items-start gap-4">
                <Info className="h-6 w-6 text-primary shrink-0" />
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">Signature Recipe</p>
                  <p className="text-stone-400 font-black uppercase text-[10px] tracking-widest leading-relaxed">Crafted to specific profile. No variants.</p>
                </div>
              </div>
            )}

            <div className="pt-8 border-t space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white shadow-sm" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="h-4 w-4" /></Button>
                  <span className="text-xl font-black w-8 text-center">{quantity}</span>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white shadow-sm" onClick={() => setQuantity(quantity + 1)}><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Final Value</p>
                  <p className="text-3xl font-black text-primary tracking-tighter">{formatPrice(totalPrice)}</p>
                </div>
              </div>

              <Button size="lg" className="w-full h-16 text-lg font-black gap-3 shadow-xl rounded-2xl uppercase tracking-widest" onClick={handleAddToCart} disabled={isAdding}>
                {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShoppingCart className="h-5 w-5" />}
                {isAdding ? 'Processing...' : 'Secure Booking'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}