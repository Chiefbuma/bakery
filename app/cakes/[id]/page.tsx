
'use client';

import { useState, useEffect, useMemo, use } from 'react';
import { getCakeById, getCustomizationOptions } from '@/services/cake-service';
import type { Cake, CustomizationOptions } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
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
        <p className="text-stone-500 font-black uppercase tracking-[0.2em] text-[10px]">Assembling the Masterpiece...</p>
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
    await new Promise(resolve => setTimeout(resolve, 800));
    toast({ title: "Order Ready!", description: `${quantity}x ${cake.name} added to your basket.` });
    router.push('/checkout');
  };

  const toggleTopping = (tid: string) => {
    setSelectedToppings(prev => prev.includes(tid) ? prev.filter(id => id !== tid) : [...prev, tid]);
  };

  return (
    <div className="min-h-screen bg-stone-50/50 pb-20 selection:bg-primary selection:text-white">
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Gallery</span>
          </Link>
          <div className="text-2xl font-black font-headline text-primary tracking-tighter">WhiskeDelights</div>
          <div className="w-16" />
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 grid lg:grid-cols-2 gap-16 items-start">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="relative aspect-square w-full rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white bg-white">
            <Image 
              src={cake.image_data_uri || 'https://picsum.photos/seed/cake/800/800'} 
              alt={cake.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute bottom-8 left-8 right-8">
               <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border shadow-xl flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Base Recipe</p>
                    <p className="text-2xl font-black">{formatPrice(cake.base_price)}</p>
                  </div>
                  <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center text-white">
                    <Sparkles className="h-6 w-6" />
                  </div>
               </div>
            </div>
          </div>
        </motion.div>

        <div className="space-y-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge className="bg-primary text-white font-black px-4 py-1 text-[9px] uppercase tracking-[0.2em] border-none">{cake.category}</Badge>
              <div className="flex items-center text-sm font-black text-stone-700">
                <Star className="h-4 w-4 text-primary fill-primary mr-1" />
                {cake.rating || 'New'} <span className="text-stone-400 ml-2 font-bold">(Popular)</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-black font-headline leading-none text-stone-900">{cake.name}</h1>
            <p className="text-stone-500 font-medium text-lg leading-relaxed">{cake.description}</p>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border space-y-10">
            {cake.customizable ? (
              <>
                <div className="space-y-6">
                  <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400 block border-l-4 border-primary pl-4">1. Select Flavor Profile</Label>
                  <RadioGroup value={flavorId} onValueChange={setFlavorId} className="grid sm:grid-cols-2 gap-4">
                    {options.flavors?.map(flavor => (
                      <div key={flavor.id} onClick={() => setFlavorId(flavor.id.toString())} className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all cursor-pointer ${flavorId === flavor.id.toString() ? 'border-primary bg-primary/5 shadow-inner' : 'border-stone-100 hover:border-stone-200 bg-stone-50/30'}`}>
                        <div className="space-y-0.5">
                          <Label className="font-black text-sm cursor-pointer block">{flavor.name}</Label>
                          {flavor.description && <p className="text-[10px] text-stone-400 font-bold uppercase">{flavor.description}</p>}
                        </div>
                        <span className="text-xs font-black text-primary">+{formatPrice(flavor.price)}</span>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-6">
                  <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400 block border-l-4 border-primary pl-4">2. Choose Dimensions</Label>
                  <RadioGroup value={sizeId} onValueChange={setSizeId} className="grid grid-cols-3 gap-4">
                    {options.sizes?.map(size => (
                      <div key={size.id} onClick={() => setSizeId(size.id.toString())} className={`flex flex-col items-center p-5 rounded-2xl border-2 transition-all cursor-pointer text-center ${sizeId === size.id.toString() ? 'border-primary bg-primary/5 shadow-inner' : 'border-stone-100 hover:border-stone-200 bg-stone-50/30'}`}>
                        <span className="font-black text-xs uppercase tracking-widest">{size.name}</span>
                        <span className="text-[9px] text-stone-400 font-black mt-1 uppercase">{size.serves}</span>
                        <span className="text-xs font-black text-primary mt-3">{formatPrice(size.price)}</span>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-6">
                  <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400 block border-l-4 border-primary pl-4">3. Frosting Theme</Label>
                  <div className="flex flex-wrap gap-4">
                    {options.colors?.map(color => (
                      <button key={color.id} onClick={() => setColorId(color.id.toString())} className={`flex items-center gap-3 px-6 py-3 rounded-full border-2 transition-all ${colorId === color.id.toString() ? 'border-primary bg-primary/5' : 'border-stone-100 hover:border-stone-200'}`}>
                        <div className="h-5 w-5 rounded-full border" style={{ backgroundColor: color.hex_value }} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400 block border-l-4 border-primary pl-4">4. Additional Elements</Label>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {options.toppings?.map(topping => (
                      <div key={topping.id} onClick={() => toggleTopping(topping.id.toString())} className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all cursor-pointer ${selectedToppings.includes(topping.id.toString()) ? 'border-primary bg-primary/5 shadow-inner' : 'border-stone-100 hover:border-stone-200 bg-stone-50/30'}`}>
                        <div className="flex items-center gap-3">
                          <Checkbox checked={selectedToppings.includes(topping.id.toString())} className="rounded-md border-2" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{topping.name}</span>
                        </div>
                        <span className="text-xs font-black text-primary">+{formatPrice(topping.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 bg-stone-950 text-white rounded-[2rem] flex items-start gap-5 shadow-2xl">
                <div className="h-14 w-14 bg-primary rounded-2xl flex items-center justify-center shrink-0">
                  <Info className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2">Signature Masterpiece</p>
                  <p className="text-stone-400 font-bold leading-relaxed">This recipe is crafted to its specific artisanal profile and does not support custom variants.</p>
                </div>
              </div>
            )}

            <div className="pt-10 border-t space-y-8">
              <div className="flex items-center justify-between gap-8">
                <div className="flex items-center gap-6 bg-stone-100 p-2 rounded-3xl border border-stone-200">
                  <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white shadow-sm hover:bg-white" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="h-5 w-5" /></Button>
                  <span className="text-2xl font-black w-10 text-center">{quantity}</span>
                  <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white shadow-sm hover:bg-white" onClick={() => setQuantity(quantity + 1)}><Plus className="h-5 w-5" /></Button>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] mb-1">Final Value</p>
                  <p className="text-5xl font-black text-primary tracking-tighter">{formatPrice(totalPrice)}</p>
                </div>
              </div>

              <Button size="lg" className="w-full h-20 text-xl font-black gap-4 shadow-2xl rounded-3xl transition-transform hover:scale-[1.01]" onClick={handleAddToCart} disabled={isAdding}>
                {isAdding ? <Loader2 className="h-6 w-6 animate-spin" /> : <ShoppingCart className="h-6 w-6" />}
                {isAdding ? 'Preparing Order...' : 'Confirm Order'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
