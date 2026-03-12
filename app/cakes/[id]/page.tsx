
'use client';

import { useState, useMemo, use } from 'react';
import { CAKES, CUSTOMIZATION_OPTIONS } from '@/lib/data';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, ArrowLeft, Star, Info, Minus, Plus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function CakeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const cake = CAKES.find(c => c.id === id);

  const [quantity, setQuantity] = useState(1);
  const [flavorId, setFlavorId] = useState(cake?.defaultFlavorId || 'f1');
  const [sizeId, setSizeId] = useState('s1');
  const [colorId, setColorId] = useState('c1');
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);

  const totalPrice = useMemo(() => {
    if (!cake) return 0;
    let total = cake.base_price;
    
    if (cake.customizable) {
      const flavor = CUSTOMIZATION_OPTIONS.flavors.find(f => f.id === flavorId);
      const size = CUSTOMIZATION_OPTIONS.sizes.find(s => s.id === sizeId);
      const color = CUSTOMIZATION_OPTIONS.colors.find(c => c.id === colorId);
      const toppingsPrice = selectedToppings.reduce((acc, tid) => {
        return acc + (CUSTOMIZATION_OPTIONS.toppings.find(t => t.id === tid)?.price || 0);
      }, 0);

      total += (flavor?.price || 0) + (size?.price || 0) + (color?.price || 0) + toppingsPrice;
    }

    return total * quantity;
  }, [cake, quantity, flavorId, sizeId, colorId, selectedToppings]);

  if (!cake) return <div>Cake not found</div>;

  const handleAddToCart = () => {
    // In a real app, this would update a global cart state or localStorage
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
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Gallery</span>
          </Link>
          <div className="text-xl font-black font-headline text-primary">WhiskeDelights</div>
          <div className="w-20"></div> {/* Spacer */}
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 grid lg:grid-cols-2 gap-16">
        {/* Left: Product Media */}
        <div className="space-y-6">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-2xl border">
            <Image 
              src={cake.image_data_uri || ''} 
              alt={cake.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
             {/* Thumbnail placeholders */}
             {[1,2,3,4].map(i => (
                <div key={i} className="aspect-square rounded-lg bg-stone-100 border overflow-hidden relative opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
                  <Image src={cake.image_data_uri || ''} alt="Alt view" fill className="object-cover" />
                </div>
             ))}
          </div>
        </div>

        {/* Right: Customization & Info */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
               <Badge variant="outline" className="font-bold">{cake.category}</Badge>
               <div className="flex items-center text-sm font-bold">
                 <Star className="h-4 w-4 text-primary fill-primary mr-1" />
                 {cake.rating} <span className="text-muted-foreground ml-1 font-medium">({cake.orders_count}+ orders)</span>
               </div>
            </div>
            <h1 className="text-4xl font-black font-headline leading-tight">{cake.name}</h1>
            <p className="text-muted-foreground leading-relaxed">
              {cake.description}
            </p>
          </div>

          <Separator />

          {cake.customizable ? (
            <div className="space-y-8">
              {/* Flavor */}
              <div className="space-y-4">
                <Label className="text-base font-black">Choose Flavor</Label>
                <RadioGroup value={flavorId} onValueChange={setFlavorId} className="grid sm:grid-cols-2 gap-3">
                  {CUSTOMIZATION_OPTIONS.flavors.map(flavor => (
                    <div key={flavor.id} className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer ${flavorId === flavor.id ? 'border-primary bg-primary/5' : 'border-stone-100'}`}>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value={flavor.id} id={flavor.id} />
                        <div>
                          <Label htmlFor={flavor.id} className="font-bold cursor-pointer">{flavor.name}</Label>
                          {flavor.description && <p className="text-[10px] text-muted-foreground">{flavor.description}</p>}
                        </div>
                      </div>
                      <span className="text-xs font-black text-primary">+{formatPrice(flavor.price)}</span>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Size */}
              <div className="space-y-4">
                <Label className="text-base font-black">Pick Your Size</Label>
                <RadioGroup value={sizeId} onValueChange={setSizeId} className="grid grid-cols-3 gap-3">
                  {CUSTOMIZATION_OPTIONS.sizes.map(size => (
                    <div key={size.id} className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all cursor-pointer text-center ${sizeId === size.id ? 'border-primary bg-primary/5' : 'border-stone-100'}`}>
                      <RadioGroupItem value={size.id} id={size.id} className="sr-only" />
                      <span className="font-bold text-sm">{size.name}</span>
                      <span className="text-[10px] text-muted-foreground">{size.serves}</span>
                      <span className="text-xs font-black text-primary mt-2">+{formatPrice(size.price)}</span>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Color */}
              <div className="space-y-4">
                <Label className="text-base font-black">Frosting Theme</Label>
                <div className="flex flex-wrap gap-4">
                  {CUSTOMIZATION_OPTIONS.colors.map(color => (
                    <button 
                      key={color.id} 
                      onClick={() => setColorId(color.id)}
                      className={`group flex items-center gap-2 p-1.5 pr-4 rounded-full border-2 transition-all ${colorId === color.id ? 'border-primary bg-primary/5' : 'border-stone-100'}`}
                    >
                      <div className="h-6 w-6 rounded-full border border-stone-200" style={{ backgroundColor: color.hex_value }} />
                      <span className="text-xs font-bold">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toppings */}
              <div className="space-y-4">
                <Label className="text-base font-black">Extra Decorations</Label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {CUSTOMIZATION_OPTIONS.toppings.map(topping => (
                    <div key={topping.id} className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer ${selectedToppings.includes(topping.id) ? 'border-primary bg-primary/5' : 'border-stone-100'}`} onClick={() => toggleTopping(topping.id)}>
                      <div className="flex items-center gap-3">
                        <Checkbox checked={selectedToppings.includes(topping.id)} onCheckedChange={() => toggleTopping(topping.id)} />
                        <span className="text-sm font-bold">{topping.name}</span>
                      </div>
                      <span className="text-xs font-black text-primary">+{formatPrice(topping.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-primary/5 rounded-xl flex items-start gap-3 border border-primary/10">
              <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold text-primary">Standard Collection</p>
                <p className="text-muted-foreground">This artisanal creation is baked to our signature recipe and cannot be customized.</p>
              </div>
            </div>
          )}

          <Separator />

          {/* Pricing & Cart Action */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 bg-stone-100 p-1.5 rounded-full border">
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="h-4 w-4" /></Button>
                <span className="text-lg font-black w-8 text-center">{quantity}</span>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => setQuantity(quantity + 1)}><Plus className="h-4 w-4" /></Button>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Total Valuation</p>
                <p className="text-4xl font-black text-primary">{formatPrice(totalPrice)}</p>
              </div>
            </div>

            <Button size="lg" className="w-full h-16 text-xl font-black gap-3 shadow-xl hover:shadow-2xl transition-all" onClick={handleAddToCart}>
              <ShoppingCart className="h-6 w-6" />
              Place Order
            </Button>
            <p className="text-center text-xs text-muted-foreground font-medium">
              Ready for pickup or delivery within <span className="text-foreground font-bold">{cake.ready_time}</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
