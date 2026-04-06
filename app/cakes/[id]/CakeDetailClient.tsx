'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  Loader2,
  Minus,
  Plus,
  ShoppingCart,
  Sparkles,
  Star,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { Cake, CartItem, CustomizationOptions } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function CakeDetailClient({
  cake,
  options,
}: {
  cake: Cake;
  options: CustomizationOptions;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [flavorId, setFlavorId] = useState(
    cake.customizable && options.flavors[0] ? String(options.flavors[0].id) : ''
  );
  const [sizeId, setSizeId] = useState(
    cake.customizable && options.sizes[0] ? String(options.sizes[0].id) : ''
  );
  const [colorId, setColorId] = useState(
    cake.customizable && options.colors[0] ? String(options.colors[0].id) : ''
  );
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);

  const totalPrice = useMemo(() => {
    const base = Number(cake.base_price) || 0;
    let addons = 0;

    if (cake.customizable) {
      const flavor = options.flavors?.find((item) => String(item.id) === flavorId);
      const size = options.sizes?.find((item) => String(item.id) === sizeId);
      const color = options.colors?.find((item) => String(item.id) === colorId);

      addons += Number(flavor?.price) || 0;
      addons += Number(size?.price) || 0;
      addons += Number(color?.price) || 0;
      addons += selectedToppings.reduce((sum, toppingId) => {
        const topping = options.toppings?.find((item) => String(item.id) === toppingId);
        return sum + (Number(topping?.price) || 0);
      }, 0);
    }

    return (base + addons) * quantity;
  }, [cake, options, quantity, flavorId, sizeId, colorId, selectedToppings]);

  const selectedFlavor = options.flavors.find((item) => String(item.id) === flavorId);
  const selectedSize = options.sizes.find((item) => String(item.id) === sizeId);
  const selectedColor = options.colors.find((item) => String(item.id) === colorId);

  const toggleTopping = (toppingId: string) => {
    setSelectedToppings((current) =>
      current.includes(toppingId) ? current.filter((item) => item !== toppingId) : [...current, toppingId]
    );
  };

  const handleAddToCart = async () => {
    setIsAdding(true);

    const cartItem: CartItem = {
      id: cake.id,
      cakeId: cake.id,
      name: cake.name,
      quantity,
      price: totalPrice / quantity,
      totalPrice,
      image_data_uri: cake.image_data_uri,
      customizations: cake.customizable
        ? {
            flavor: selectedFlavor?.name || null,
            size: selectedSize?.name || null,
            color: selectedColor?.name || null,
            toppings: selectedToppings
              .map((toppingId) => options.toppings.find((item) => String(item.id) === toppingId)?.name)
              .filter((name): name is string => Boolean(name)),
          }
        : undefined,
      customizationSelectionIds: cake.customizable
        ? {
            flavorId: flavorId || null,
            sizeId: sizeId || null,
            colorId: colorId || null,
            toppingIds: selectedToppings,
          }
        : undefined,
    };

    localStorage.setItem('bakery_current_item', JSON.stringify(cartItem));
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast({ title: 'Added to booking', description: `${quantity} x ${cake.name} is ready for checkout.` });
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf5_0%,#f3e6d8_100%)] px-5 pb-16 pt-6 md:px-6 md:pt-8">
      <div className="container mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-stone-500 transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to menu
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/70 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-stone-500">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Calm ordering experience
          </div>
        </header>

        <main className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_23rem]">
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="section-shell overflow-hidden p-4 md:p-6">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] xl:items-center">
                <div className="space-y-4">
                  <div className="relative aspect-[4/4.6] overflow-hidden rounded-[1.8rem] bg-stone-100 xl:aspect-[4/4.9]">
                    <Image
                      src={cake.image_data_uri || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=1200'}
                      alt={cake.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>

                <div className="space-y-6 px-2 py-2 md:px-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="rounded-full border-none bg-primary/10 px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-primary">
                      {cake.category}
                    </Badge>
                    <div className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-stone-600">
                      <Star className="h-3.5 w-3.5 text-primary" />
                      {cake.rating || 'New'}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h1 className="max-w-3xl text-5xl leading-[0.94] text-stone-950 md:text-6xl xl:text-[4.5rem]">
                      {cake.name}
                    </h1>
                    <p className="max-w-2xl text-base leading-7 text-stone-600 xl:text-lg">
                      {cake.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {cake.customizable ? (
              <div className="section-shell p-5 md:p-6 xl:p-7">
                <div className="space-y-8">
                  <OptionSection title="Flavor" subtitle="Choose the core taste profile.">
                    <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                      {options.flavors.map((flavor) => {
                        const isSelected = flavorId === String(flavor.id);
                        return (
                          <SelectableCard
                            key={flavor.id}
                            selected={isSelected}
                            title={flavor.name}
                            price={flavor.price}
                            description={flavor.description || 'Signature bakery flavor'}
                            onClick={() => setFlavorId(String(flavor.id))}
                          />
                        );
                      })}
                    </div>
                  </OptionSection>

                  <OptionSection title="Size" subtitle="Pick the cake size that fits the moment.">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {options.sizes.map((size) => {
                        const isSelected = sizeId === String(size.id);
                        return (
                          <SelectableCard
                            key={size.id}
                            selected={isSelected}
                            title={size.name}
                            price={size.price}
                            description={size.serves}
                            compact
                            onClick={() => setSizeId(String(size.id))}
                          />
                        );
                      })}
                    </div>
                  </OptionSection>

                  <OptionSection title="Color" subtitle="Set the final look for the cake finish.">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {options.colors.map((color) => {
                        const isSelected = colorId === String(color.id);
                        return (
                          <button
                            key={color.id}
                            type="button"
                            onClick={() => setColorId(String(color.id))}
                            className={`flex items-center justify-between rounded-[1.2rem] border px-4 py-4 text-left transition-all ${
                              isSelected
                                ? 'border-primary bg-primary/8 shadow-[0_12px_30px_rgba(168,95,46,0.12)]'
                                : 'border-stone-200 bg-white hover:border-stone-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className="h-5 w-5 rounded-full border border-stone-200"
                                style={{ backgroundColor: color.hex_value }}
                              />
                              <div>
                                <p className="text-sm font-semibold text-stone-900">{color.name}</p>
                                <p className="text-[0.72rem] uppercase tracking-[0.18em] text-stone-400">Finish color</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-primary">{formatPrice(color.price)}</p>
                              {isSelected ? <Check className="ml-auto mt-1 h-4 w-4 text-primary" /> : null}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </OptionSection>

                  <OptionSection title="Toppings" subtitle="Optional finishing touches.">
                    <div className="grid gap-4 lg:grid-cols-2">
                      {options.toppings.map((topping) => {
                        const isSelected = selectedToppings.includes(String(topping.id));
                        return (
                          <label
                            key={topping.id}
                            className={`flex cursor-pointer items-center justify-between rounded-[1.2rem] border px-4 py-4 transition-all ${
                              isSelected ? 'border-primary bg-primary/8' : 'border-stone-200 bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleTopping(String(topping.id))}
                              />
                              <span className="text-sm font-medium text-stone-800">{topping.name}</span>
                            </div>
                            <span className="text-sm font-semibold text-primary">{formatPrice(topping.price)}</span>
                          </label>
                        );
                      })}
                    </div>
                  </OptionSection>
                </div>
              </div>
            ) : null}
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="space-y-5 xl:sticky xl:top-24 xl:self-start"
          >
            <div className="section-shell p-6 md:p-7">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-primary">Your selection</p>
              <div className="mt-4 space-y-5">
                <div className="flex items-center justify-between rounded-[1.2rem] bg-stone-50 px-4 py-3">
                  <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-stone-500">Quantity</span>
                  <div className="flex items-center gap-2 rounded-full bg-white p-1 shadow-sm">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-10 text-center text-lg font-semibold text-stone-900">{quantity}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 rounded-[1.4rem] bg-stone-950 p-5 text-white">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/60">Current total</p>
                      <p className="mt-2 text-4xl font-semibold text-[#f2c27b]">{formatPrice(totalPrice)}</p>
                    </div>
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white/60">
                      {cake.ready_time}
                    </p>
                  </div>
                  <p className="text-sm leading-6 text-white/72">
                    Deposit payment happens on the next screen after delivery details are confirmed.
                  </p>
                </div>

                <div className="grid gap-3 rounded-[1.2rem] border border-stone-200 bg-white p-4">
                  <SummaryRow label="Cake" value={cake.name} />
                  {cake.customizable ? (
                    <>
                      <SummaryRow label="Flavor" value={selectedFlavor?.name || 'Not selected'} />
                      <SummaryRow label="Size" value={selectedSize?.name || 'Not selected'} />
                      <SummaryRow label="Color" value={selectedColor?.name || 'Not selected'} />
                      <SummaryRow
                        label="Toppings"
                        value={selectedToppings.length > 0
                          ? selectedToppings
                              .map((toppingId) => options.toppings.find((item) => String(item.id) === toppingId)?.name)
                              .filter(Boolean)
                              .join(', ')
                          : 'None'}
                      />
                    </>
                  ) : null}
                </div>

                <Button
                  size="lg"
                  className="h-14 w-full rounded-[1rem] text-[0.74rem] font-semibold uppercase tracking-[0.24em]"
                  onClick={handleAddToCart}
                  disabled={isAdding}
                >
                  {isAdding ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <ShoppingCart className="h-4.5 w-4.5" />}
                  {isAdding ? 'Preparing booking' : 'Continue to checkout'}
                </Button>
              </div>
            </div>
          </motion.aside>
        </main>
      </div>
    </div>
  );
}

function OptionSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <Label className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-primary">{title}</Label>
        <p className="text-sm text-stone-500">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function SelectableCard({
  selected,
  title,
  description,
  price,
  compact = false,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  price: number;
  compact?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[1.2rem] border px-4 py-4 text-left transition-all ${
        selected
          ? 'border-primary bg-primary/8 shadow-[0_12px_30px_rgba(168,95,46,0.12)]'
          : 'border-stone-200 bg-white hover:border-stone-300'
      }`}
    >
      <div className={`flex ${compact ? 'flex-col gap-3' : 'items-start justify-between gap-4'}`}>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-stone-900">{title}</p>
          <p className="text-sm leading-6 text-stone-500">{description}</p>
        </div>
        <div className={`${compact ? 'flex items-center justify-between' : 'text-right'} min-w-fit`}>
          <p className="text-sm font-semibold text-primary">{formatPrice(price)}</p>
          {selected ? <Check className={`${compact ? '' : 'ml-auto'} mt-1 h-4 w-4 text-primary`} /> : null}
        </div>
      </div>
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-stone-400">{label}</span>
      <span className="max-w-[16rem] text-right text-sm font-medium text-stone-700">{value}</span>
    </div>
  );
}
