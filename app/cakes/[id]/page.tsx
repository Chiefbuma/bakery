
'use client';

import { useState, useEffect, useMemo, use } from 'react';
import { getCakes, getCustomizationOptions } from '@/services/cake-service';
import type { Cake, CustomizationOptions } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, ArrowLeft, Star, Info, Minus, Plus, Loader2 } from 'lucide-react';
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
        const [cakeList, customizationOptions] = await Promise.all([
          getCakes(),
          getCustomizationOptions()
        ]);
        const foundCake = cakeList.find(c => c.id === id);
        setCake(foundCake || null);
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
    const base = cake ? Number(cake.base_price) : 0;
    if (isNaN(base)) return 0;
    
    let total = base;
    
    if (cake?.customizable && options) {
      const flavor = options.flavors?.find(f => f.id.toString() === flavorId);
      const size = options.sizes?.find(s => s.id.toString() === sizeId);
      const color = options.colors?.find(c => c.id.toString() === colorId);
      
      total += Number(flavor?.price) || 0;
      total += Number(size?.price) || 0;
      total += Number(color?.price) || 0;
      
      const toppingsPrice = selectedToppings.reduce((acc, tid) => {
        const topping = options.toppings?.find(t => t.id.toString() === tid);
        return acc + (Number(topping?.price) || 0);
      }, 0);

      total += toppingsPrice;
    }

    const result = total * quantity;
    return isNaN(result) ? 0 : result;
  }, [cake, options, quantity, flavorId, sizeId, colorId, selectedToppings]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-stone-500 font-bold uppercase tracking-widest text-xs">Preparing the Recipe...</p>
      </div>
    );
  }

  if (!cake || !options) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-2xl font-black font-headline">Cake Not Found</h1>
      <p className="text-muted-foreground mb-6">This artisanal recipe is currently unavailable.</p>
      <Link href="/"><Button className="rounded-xl px-8 h-12 font-black">Return to Gallery</Button></Link>
    </div>
  );

  const handleAddToCart = async () => {
    setIsAdding(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    toast({
      title: "Added to cart!",
      description: `${quantity}x ${cake.name} successfully added.`,
    });
    router.push('/checkout');
  };

  const toggleTopping = (tid: string) => {
    setSelectedToppings(prev => 
      prev.includes(tid) ? prev.filter(id => id !== tid) : [...prev, tid]
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background pb-20"
    >
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Gallery</span>
          </Link>
          <div className="text-xl font-black font-headline text-primary">WhiskeDelights</div>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 grid lg:grid-cols-2 gap-16">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-2xl border bg-stone-100">
            <Image 
              src={cake.image_data_uri || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600'} 
              alt={cake.name}
              fill
              className="object-cover"
              priority
            />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
               <Badge variant="outline" className="font-bold border-primary text-primary">{cake.category}</Badge>
               <div className="flex items-center text-sm font-bold">
                 <Star className="h-4 w-4 text-primary fill-primary mr-1" />
                 {cake.rating || 'New'} <span className="text-muted-foreground ml-1 font-medium">({cake.orders_count}+ orders)</span>
               </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black font-headline leading-tight">{cake.name}</h1>
            <p className="text-muted-foreground leading-relaxed font-medium">
              {cake.description}
            </p>
          </div>

          <Separator />

          {cake.customizable ? (
            <div className="space-y-8">
              <div className="space-y-4">
                <Label className="text-base font-black uppercase tracking-widest text-stone-500 text-[10px]">1. Choose Flavor</Label>
                <RadioGroup value={flavorId} onValueChange={setFlavorId} className="grid sm:grid-cols-2 gap-3">
                  {options.flavors?.map(flavor => (
                    <div key={flavor.id} className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${flavorId === flavor.id.toString() ? 'border-primary bg-primary/5' : 'border-stone-100 hover:border-primary/30'}`} onClick={() => setFlavorId(flavor.id.toString())}>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value={flavor.id.toString()} id={`f-${flavor.id}`} />
                        <div>
                          <Label htmlFor={`f-${flavor.id}`} className="font-bold cursor-pointer text-sm">{flavor.name}</Label>
                          {flavor.description && <p className="text-[10px] text-muted-foreground font-medium">{flavor.description}</p>}
                        </div>
                      </div>
                      <span className="text-xs font-black text-primary">+{formatPrice(flavor.price)}</span>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-black uppercase tracking-widest text-stone-500 text-[10px]">2. Pick Your Size</Label>
                <RadioGroup value={sizeId} onValueChange={setSizeId} className="grid grid-cols-3 gap-3">
                  {options.sizes?.map(size => (
                    <div key={size.id} className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all cursor-pointer text-center ${sizeId === size.id.toString() ? 'border-primary bg-primary/5' : 'border-stone-100 hover:border-primary/30'}`} onClick={() => setSizeId(size.id.toString())}>
                      <RadioGroupItem value={size.id.toString()} id={`s-${size.id}`} className="sr-only" />
                      <span className="font-black text-sm">{size.name}</span>
                      <span className="text-[10px] text-muted-foreground font-bold">{size.serves}</span>
                      <span className="text-xs font-black text-primary mt-2">+{formatPrice(size.price)}</span>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-black uppercase tracking-widest text-stone-500 text-[10px]">3. Frosting Theme</Label>
                <div className="flex flex-wrap gap-4">
                  {options.colors?.map(color => (
                    <button 
                      key={color.id} 
                      onClick={() => setColorId(color.id.toString())}
                      className={`group flex items-center gap-2 p-1.5 pr-4 rounded-full border-2 transition-all ${colorId === color.id.toString() ? 'border-primary bg-primary/5' : 'border-stone-100 hover:border-primary/30'}`}
                    >
                      <div className="h-6 w-6 rounded-full border border-stone-200" style={{ backgroundColor: color.hex_value }} />
                      <span className="text-xs font-bold">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-black uppercase tracking-widest text-stone-500 text-[10px]">4. Extra Decorations</Label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {options.toppings?.map(topping => (
                    <div key={topping.id} className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedToppings.includes(topping.id.toString()) ? 'border-primary bg-primary/5' : 'border-stone-100 hover:border-primary/30'}`} onClick={() => toggleTopping(topping.id.toString())}>
                      <div className="flex items-center gap-3">
                        <Checkbox checked={selectedToppings.includes(topping.id.toString())} onCheckedChange={() => toggleTopping(topping.id.toString())} />
                        <span className="text-sm font-bold">{topping.name}</span>
                      </div>
                      <span className="text-xs font-black text-primary">+{formatPrice(topping.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-primary/5 rounded-2xl flex items-start gap-4 border border-primary/10">
              <Info className="h-6 w-6 text-primary shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-black text-primary uppercase tracking-widest text-[10px] mb-1">Standard Collection</p>
                <p className="text-muted-foreground font-medium">This artisanal creation is baked to our signature recipe and cannot be customized. It represents the purest expression of our bakery's heritage.</p>
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 bg-stone-100 p-2 rounded-full border">
                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 bg-white shadow-sm" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="h-4 w-4" /></Button>
                <span className="text-xl font-black w-8 text-center">{quantity}</span>
                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 bg-white shadow-sm" onClick={() => setQuantity(quantity + 1)}><Plus className="h-4 w-4" /></Button>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Total Value</p>
                <p className="text-4xl font-black text-primary">{formatPrice(totalPrice)}</p>
              </div>
            </div>

            <Button size="lg" className="w-full h-16 text-xl font-black gap-3 shadow-xl hover:shadow-2xl transition-all rounded-2xl" onClick={handleAddToCart} disabled={isAdding}>
              {isAdding ? <Loader2 className="h-6 w-6 animate-spin" /> : <ShoppingCart className="h-6 w-6" />}
              {isAdding ? 'Preparing Order...' : 'Place Order'}
            </Button>
            <p className="text-center text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              Ready for pickup or delivery within <span className="text-foreground">{cake.ready_time}</span>
            </p>
          </div>
        </motion.div>
      </main>
    </motion.div>
  );
}
