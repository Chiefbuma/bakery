'use client';

import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  CreditCard,
  Loader2,
  LocateFixed,
  MapPin,
  PackageCheck,
  Store,
  Truck,
  UserRound,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import type { CartItem, CheckoutSessionData } from '@/lib/types';

function formatDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatReadableDate(value: string) {
  if (!value) {
    return 'Choose a production date';
  }

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-KE', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed);
}

function getSummaryLines(cartItem: CartItem | null) {
  if (!cartItem?.customizations) {
    return [];
  }

  const lines = [
    cartItem.customizations.flavor && `Flavor: ${cartItem.customizations.flavor}`,
    cartItem.customizations.size && `Size: ${cartItem.customizations.size}`,
    cartItem.customizations.color && `Color: ${cartItem.customizations.color}`,
    cartItem.customizations.toppings.length
      ? `Toppings: ${cartItem.customizations.toppings.join(', ')}`
      : null,
  ];

  return lines.filter(Boolean) as string[];
}

function getPinnedLocationFallback() {
  return 'Pinned GPS location';
}

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [method, setMethod] = useState<'delivery' | 'pickup'>('pickup');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [cartItem] = useState<CartItem | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    const data = window.localStorage.getItem('bakery_current_item');
    return data ? (JSON.parse(data) as CartItem) : null;
  });

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    address: '',
    latitude: null as number | null,
    longitude: null as number | null,
  });

  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return formatDateInputValue(d);
  }, []);

  const estimatedTotal = cartItem?.totalPrice || 0;
  const estimatedDeposit = estimatedTotal * 0.8;
  const customizationSummary = getSummaryLines(cartItem);

  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        variant: 'destructive',
        title: 'GPS unavailable',
        description: 'Your browser does not support location access.',
      });
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({
          ...prev,
          latitude,
          longitude,
          address: getPinnedLocationFallback(),
        }));
        setIsGettingLocation(false);
        setIsResolvingAddress(true);

        try {
          const response = await fetch(
            `/api/location/reverse?lat=${encodeURIComponent(String(latitude))}&lon=${encodeURIComponent(String(longitude))}`
          );

          if (!response.ok) {
            throw new Error('Reverse geocoding failed');
          }

          const data = await response.json();
          const locationLabel =
            typeof data?.location === 'string' && data.location.trim().length > 0
              ? data.location.trim()
              : getPinnedLocationFallback();

          setFormData((prev) => ({
            ...prev,
            latitude,
            longitude,
            address: locationLabel,
          }));

          toast({
            title: 'Location added',
            description: 'The delivery location has been filled from your GPS pin.',
          });
        } catch {
          setFormData((prev) => ({
            ...prev,
            latitude,
            longitude,
            address: getPinnedLocationFallback(),
          }));
          toast({
            title: 'GPS pin saved',
            description: 'We saved the pin. You can still adjust the location name if needed.',
          });
        } finally {
          setIsResolvingAddress(false);
        }
      },
      () => {
        setIsGettingLocation(false);
        setIsResolvingAddress(false);
        toast({
          variant: 'destructive',
          title: 'Location blocked',
          description: 'Enable location access or continue with a written delivery address.',
        });
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const handleProceed = async () => {
    if (!cartItem) {
      toast({
        variant: 'destructive',
        title: 'No cake selected',
        description: 'Choose a cake first, then return to checkout.',
      });
      router.push('/');
      return;
    }

    if (!formData.name || !formData.phone || !formData.date) {
      toast({
        variant: 'destructive',
        title: 'Missing details',
        description: 'Add your name, phone, and preferred date to continue.',
      });
      return;
    }

    if (method === 'delivery' && !formData.address) {
      toast({
        variant: 'destructive',
        title: 'Delivery address needed',
        description: 'Please enter the address or landmark for delivery.',
      });
      return;
    }

    if (formData.date < minDate) {
      toast({
        variant: 'destructive',
        title: 'Date too soon',
        description: `Choose ${minDate} or later to keep the 48-hour lead time.`,
      });
      return;
    }

    setIsProcessing(true);

    const checkoutPayload: CheckoutSessionData = {
      items: [cartItem],
      deliveryInfo: {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        delivery_method: method,
        address: method === 'delivery' ? formData.address.trim() : '',
        latitude: method === 'delivery' ? formData.latitude : null,
        longitude: method === 'delivery' ? formData.longitude : null,
        date: formData.date,
        pickup_location: method === 'pickup' ? 'Nairobi Main Bakery' : '',
      },
      estimatedTotal,
    };

    localStorage.setItem('temp_checkout_data', JSON.stringify(checkoutPayload));
    await new Promise((resolve) => setTimeout(resolve, 500));
    router.push('/payment');
  };

  if (!cartItem) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(168,95,46,0.18),transparent_24rem),#f7f1e8] px-5 py-10 md:px-6">
        <div className="container mx-auto max-w-3xl">
          <div className="section-shell p-8 text-center md:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <PackageCheck className="h-7 w-7" />
            </div>
            <div className="mt-6 space-y-3">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-primary">
                Checkout
              </p>
              <h1 className="text-4xl text-stone-950">Your order starts with a cake.</h1>
              <p className="mx-auto max-w-lg text-sm leading-7 text-stone-600">
                There is no active cake in this session yet. Return to the menu, pick a design you love,
                and we&apos;ll bring you right back here for details and payment.
              </p>
            </div>
            <Button asChild className="mt-8 h-12 rounded-full px-6 text-[0.75rem] font-semibold uppercase tracking-[0.24em]">
              <Link href="/">
                Browse cakes
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(168,95,46,0.18),transparent_24rem),#f7f1e8] px-5 pb-16 pt-6 md:px-6 md:pb-24">
      <div className="container mx-auto space-y-8">
        <header className="space-y-4">
          <Link
            href={cartItem.cakeId ? `/cakes/${cartItem.cakeId}` : '/'}
            className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-stone-500 transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="text-4xl text-stone-950 md:text-5xl">Checkout</h1>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card className="section-shell overflow-hidden border-none shadow-none">
              <CardContent className="grid gap-6 p-6 md:grid-cols-[0.95fr_1.05fr] md:p-8">
                <div className="relative min-h-[17rem] overflow-hidden rounded-[2rem] bg-stone-100">
                  <Image
                    src={cartItem.image_data_uri || 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&q=80&w=1200'}
                    alt={cartItem.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 40vw"
                  />
                  <div className="absolute inset-x-4 bottom-4 rounded-[1.5rem] bg-[rgba(17,14,12,0.72)] p-4 text-white backdrop-blur">
                    <h2 className="text-3xl leading-tight">{cartItem.name}</h2>
                    <p className="mt-1 text-sm text-white/75">Qty {cartItem.quantity}</p>
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-6">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <InfoTile label="Total" value={formatPrice(estimatedTotal)} />
                    <InfoTile label="Deposit" value={formatPrice(estimatedDeposit)} highlight />
                    <InfoTile label="Date" value={formatReadableDate(formData.date)} />
                    <InfoTile label="Method" value={method === 'pickup' ? 'Bakery pickup' : 'Delivery'} />
                  </div>

                  {customizationSummary.length > 0 && (
                    <div className="rounded-[1.6rem] border border-stone-200/80 bg-white/70 p-4">
                      <div className="flex flex-wrap gap-2">
                        {customizationSummary.map((item) => (
                          <span
                            key={item}
                            className="rounded-full bg-stone-100 px-3 py-1.5 text-[0.72rem] font-medium text-stone-700"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="section-shell border-none shadow-none">
              <CardContent className="space-y-7 p-6 md:p-8">
                <div className="space-y-2">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-primary">
                    Details
                  </p>
                  <h3 className="text-3xl text-stone-950">Contact</h3>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <FieldShell label="Full name" icon={<UserRound className="h-4 w-4" />}>
                    <Input
                      value={formData.name}
                      onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                      placeholder="Customer name"
                      className="h-12 rounded-xl border-stone-200 bg-white"
                    />
                  </FieldShell>

                  <FieldShell label="Phone number" icon={<PhoneGlyph />}>
                    <Input
                      value={formData.phone}
                      onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
                      placeholder="07..."
                      className="h-12 rounded-xl border-stone-200 bg-white"
                    />
                  </FieldShell>
                </div>
              </CardContent>
            </Card>

            <Card className="section-shell border-none shadow-none">
              <CardContent className="space-y-7 p-6 md:p-8">
                <div className="space-y-2">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-primary">
                    Delivery
                  </p>
                  <h3 className="text-3xl text-stone-950">Pickup or delivery</h3>
                </div>

                <RadioGroup
                  value={method}
                  onValueChange={(value) => setMethod(value === 'delivery' ? 'delivery' : 'pickup')}
                  className="grid gap-4 md:grid-cols-2"
                >
                  <MethodCard
                    id="pickup"
                    value="pickup"
                    active={method === 'pickup'}
                    icon={<Store className="h-5 w-5" />}
                    title="Pickup"
                    description="Collect from Nairobi Main Bakery."
                  />
                  <MethodCard
                    id="delivery"
                    value="delivery"
                    active={method === 'delivery'}
                    icon={<Truck className="h-5 w-5" />}
                    title="Delivery"
                    description="Add your address and GPS pin."
                  />
                </RadioGroup>

                <div className="grid gap-5 md:grid-cols-2">
                  <FieldShell label="Preferred date" icon={<CalendarDays className="h-4 w-4" />}>
                    <Input
                      type="date"
                      min={minDate}
                      value={formData.date}
                      onChange={(event) => setFormData((prev) => ({ ...prev, date: event.target.value }))}
                      className="h-12 rounded-xl border-stone-200 bg-white"
                    />
                    <p className="text-xs text-stone-500">
                      Earliest available date is {formatReadableDate(minDate)}.
                    </p>
                  </FieldShell>

                  <FieldShell
                    label={method === 'pickup' ? 'Pickup point' : 'Delivery location'}
                    icon={<MapPin className="h-4 w-4" />}
                  >
                    {method === 'pickup' ? (
                      <div className="rounded-[1.2rem] border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700">
                        Nairobi Main Bakery
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Input
                          value={formData.address}
                          onChange={(event) => setFormData((prev) => ({ ...prev, address: event.target.value }))}
                          placeholder="Location from GPS"
                          className="h-12 rounded-xl border-stone-200 bg-white"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleGetCurrentLocation}
                          disabled={isGettingLocation || isResolvingAddress}
                          className="h-11 w-full rounded-xl border-dashed border-stone-300 bg-white text-[0.72rem] font-semibold uppercase tracking-[0.18em]"
                        >
                          {isGettingLocation || isResolvingAddress ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <LocateFixed className="mr-2 h-4 w-4" />
                          )}
                          {isResolvingAddress
                            ? 'Finding location'
                            : formData.latitude
                              ? 'Refresh GPS pin'
                              : 'Add GPS pin'}
                        </Button>
                      </div>
                    )}
                  </FieldShell>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="space-y-6"
          >
            <Card className="section-shell sticky top-24 border-none shadow-none">
              <CardContent className="space-y-6 p-6 md:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-primary">
                      Payment
                    </p>
                    <h3 className="mt-2 text-3xl text-stone-950">Totals</h3>
                  </div>
                  <div className="rounded-full bg-primary/10 p-3 text-primary">
                    <CreditCard className="h-5 w-5" />
                  </div>
                </div>

                <div className="space-y-4 rounded-[1.7rem] bg-stone-950 px-5 py-5 text-white">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-white/70">{cartItem.name}</p>
                      <p className="mt-1 text-[0.72rem] uppercase tracking-[0.22em] text-white/55">
                        Quantity {cartItem.quantity}
                      </p>
                    </div>
                    <span className="text-lg font-semibold">{formatPrice(estimatedTotal)}</span>
                  </div>
                  <div className="h-px bg-white/10" />
                  <PriceRow label="Total" value={formatPrice(estimatedTotal)} />
                  <PriceRow label="Deposit" value={formatPrice(estimatedDeposit)} emphasis />
                </div>

                <Button
                  onClick={handleProceed}
                  disabled={isProcessing}
                  className="h-14 w-full rounded-[1.2rem] text-[0.78rem] font-semibold uppercase tracking-[0.24em]"
                >
                  {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ChevronRight className="mr-2 h-4 w-4" />}
                  {isProcessing ? 'Preparing' : 'Continue'}
                </Button>
              </CardContent>
            </Card>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}

function FieldShell({
  label,
  icon,
  children,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-stone-500">
        <span className="text-primary">{icon}</span>
        {label}
      </Label>
      {children}
    </div>
  );
}

function MethodCard({
  id,
  value,
  active,
  icon,
  title,
  description,
}: {
  id: string;
  value: string;
  active: boolean;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <label
      htmlFor={id}
      className={`cursor-pointer rounded-[1.7rem] border p-5 transition-all ${
        active
          ? 'border-primary bg-primary/[0.08] shadow-[0_20px_40px_rgba(168,95,46,0.08)]'
          : 'border-stone-200 bg-white hover:border-stone-300'
      }`}
    >
      <div className="flex items-start gap-4">
        <RadioGroupItem id={id} value={value} className="mt-1 border-stone-400" />
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-2 ${active ? 'bg-primary text-white' : 'bg-stone-100 text-stone-600'}`}>
              {icon}
            </div>
            <span className="text-lg font-semibold text-stone-900">{title}</span>
          </div>
          <p className="text-sm leading-6 text-stone-600">{description}</p>
        </div>
      </div>
    </label>
  );
}

function InfoTile({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-[1.4rem] border px-4 py-4 ${highlight ? 'border-amber-200 bg-amber-50' : 'border-stone-200 bg-white/70'}`}>
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-stone-500">{label}</p>
      <p className={`mt-2 text-lg font-semibold ${highlight ? 'text-primary' : 'text-stone-900'}`}>{value}</p>
    </div>
  );
}

function PriceRow({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-white/70">{label}</span>
      <span className={emphasis ? 'text-xl font-semibold text-[#f3cf8b]' : 'text-base font-medium text-white'}>
        {value}
      </span>
    </div>
  );
}

function PhoneGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.9]">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07A19.5 19.5 0 0 1 5.15 12.8 19.8 19.8 0 0 1 2.08 4.09 2 2 0 0 1 4.07 2h3a2 2 0 0 1 2 1.72c.12.89.33 1.76.63 2.61a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6.09 6.09l1.47-1.25a2 2 0 0 1 2.11-.45c.85.3 1.72.51 2.61.63A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
