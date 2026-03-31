'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Loader2,
  MapPin,
  ReceiptText,
  RefreshCw,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { usePaystack } from '@/hooks/use-paystack';
import { quoteOrder, placeOrder } from '@/services/cake-service';
import { WhatsappIcon } from '@/components/icons/whatsapp-icon';
import type {
  CheckoutSessionData,
  OrderQuote,
  OrderQuoteItem,
  PlaceOrderResult,
  ResolvedCustomizationOption,
} from '@/lib/types';

const OWNER_WHATSAPP = process.env.NEXT_PUBLIC_OWNER_WHATSAPP_NUMBER?.trim() || '254796280138';
const MPESA_PAYBILL = process.env.NEXT_PUBLIC_MPESA_PAYBILL_NUMBER?.trim() || '880100';
const MPESA_ACCOUNT_NUMBER = process.env.NEXT_PUBLIC_MPESA_ACCOUNT_NUMBER?.trim() || '908128';
const MPESA_BUSINESS_NAME = process.env.NEXT_PUBLIC_MPESA_BUSINESS_NAME?.trim() || 'WhiskeDelights';

function createPaymentReference() {
  return `WD-PAY-${Date.now().toString().slice(-8)}-${Math.floor(100 + Math.random() * 900)}`;
}

function formatReadableDate(value: string) {
  if (!value) {
    return 'Date pending';
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

function customizationLine(label: string, option: ResolvedCustomizationOption | null | undefined) {
  if (!option) {
    return null;
  }

  return `${label}: ${option.name}`;
}

function quoteSummaryLines(item: OrderQuoteItem | null) {
  if (!item?.customizations) {
    return [];
  }

  const lines = [
    customizationLine('Flavor', item.customizations.flavor),
    customizationLine('Size', item.customizations.size),
    customizationLine('Color', item.customizations.color),
    item.customizations.toppings.length
      ? `Toppings: ${item.customizations.toppings.map((topping) => topping.name).join(', ')}`
      : null,
  ];

  return lines.filter(Boolean) as string[];
}

export default function PaymentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { initializePayment, isReady, error: paystackError } = usePaystack();

  const [checkoutData, setCheckoutData] = useState<CheckoutSessionData | null>(null);
  const [serverQuote, setServerQuote] = useState<OrderQuote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [isQuoting, setIsQuoting] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isFinalizingOrder, setIsFinalizingOrder] = useState(false);
  const [finalizationError, setFinalizationError] = useState<string | null>(null);
  const [savedOrder, setSavedOrder] = useState<PlaceOrderResult | null>(null);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [clientPaymentRef, setClientPaymentRef] = useState<string | null>(null);
  const [paymentMode, setPaymentMode] = useState<'paystack' | 'mpesa_paybill'>(MPESA_PAYBILL ? 'mpesa_paybill' : 'paystack');
  const [mpesaCode, setMpesaCode] = useState('');

  const displayedTotal = serverQuote?.totalAmount ?? checkoutData?.estimatedTotal ?? 0;
  const displayedDeposit = serverQuote?.depositAmount ?? displayedTotal * 0.8;
  const cartItem = checkoutData?.items[0] || null;
  const quotedItem = serverQuote?.items[0] || null;
  const optionSummary = useMemo(() => quoteSummaryLines(quotedItem), [quotedItem]);
  const deliveryLabel = useMemo(() => {
    if (!checkoutData) {
      return 'Checkout details missing';
    }

    return checkoutData.deliveryInfo.delivery_method === 'pickup'
      ? checkoutData.deliveryInfo.pickup_location || 'Nairobi Main Bakery'
      : checkoutData.deliveryInfo.address || 'Delivery address provided';
  }, [checkoutData]);
  const mpesaAccountRef = MPESA_ACCOUNT_NUMBER;
  const successIsPaid = savedOrder?.paymentStatus === 'paid';

  useEffect(() => {
    setClientPaymentRef(createPaymentReference());
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('temp_checkout_data');
      if (!stored) {
        setIsQuoting(false);
        setQuoteError('Checkout data is missing.');
        return;
      }

      const parsed = JSON.parse(stored) as CheckoutSessionData;
      setCheckoutData(parsed);
    } catch {
      setIsQuoting(false);
      setQuoteError('Checkout data is invalid.');
    }
  }, []);

  useEffect(() => {
    if (!checkoutData) {
      return;
    }

    let cancelled = false;

    async function loadQuote() {
      setIsQuoting(true);
      setQuoteError(null);

      try {
        const quote = await quoteOrder({
          items: checkoutData.items,
          deliveryInfo: checkoutData.deliveryInfo,
        });

        if (!cancelled) {
          setServerQuote(quote);
        }
      } catch (error) {
        if (!cancelled) {
          setQuoteError(error instanceof Error ? error.message : 'Order quote failed.');
        }
      } finally {
        if (!cancelled) {
          setIsQuoting(false);
        }
      }
    }

    loadQuote();

    return () => {
      cancelled = true;
    };
  }, [checkoutData]);

  const handleRetryQuote = async () => {
    if (!checkoutData) {
      return;
    }

    setServerQuote(null);
    setQuoteError(null);
    setIsQuoting(true);

    try {
      const quote = await quoteOrder({
        items: checkoutData.items,
        deliveryInfo: checkoutData.deliveryInfo,
      });
      setServerQuote(quote);
    } catch (error) {
      setQuoteError(error instanceof Error ? error.message : 'Order quote failed.');
    } finally {
      setIsQuoting(false);
    }
  };

  const finalizeOrder = async (reference: string, paymentMethod: 'paystack' | 'mpesa_paybill', paymentConfirmed: boolean) => {
    if (!checkoutData) {
      return;
    }

    setIsFinalizingOrder(true);
    setFinalizationError(null);
    setPaymentReference(reference);

    try {
      const result = await placeOrder({
        items: checkoutData.items,
        deliveryInfo: checkoutData.deliveryInfo,
        paymentMethod,
        paymentConfirmed,
        paymentReference: reference,
      });

      setSavedOrder(result);
      localStorage.removeItem('temp_checkout_data');
      localStorage.removeItem('bakery_current_item');
      toast({
        title: paymentConfirmed ? 'Deposit confirmed' : 'Order saved',
        description: paymentConfirmed ? 'Payment received.' : 'Awaiting M-PESA verification.',
      });
    } catch (error) {
      setFinalizationError(error instanceof Error ? error.message : 'Order placement failed.');
      toast({
        variant: 'destructive',
        title: 'Could not save order',
        description: 'Please try again.',
      });
    } finally {
      setIsFinalizingOrder(false);
    }
  };

  const handlePaystackPayment = () => {
    if (!isReady || !serverQuote || !clientPaymentRef) {
      return;
    }

    setIsProcessingPayment(true);

    const handler = initializePayment({
      email: 'orders@whiskedelights.co.ke',
      amount: serverQuote.depositAmount * 100,
      reference: clientPaymentRef,
      callback: async (response: unknown) => {
        const ref =
          typeof response === 'object' &&
          response !== null &&
          'reference' in response &&
          typeof response.reference === 'string'
            ? response.reference
            : clientPaymentRef;

        setIsProcessingPayment(false);
        await finalizeOrder(ref, 'paystack', true);
      },
      onClose: () => {
        setIsProcessingPayment(false);
        toast({
          title: 'Payment closed',
          description: 'You can reopen it any time.',
        });
      },
    });

    if (!handler) {
      setIsProcessingPayment(false);
      toast({
        variant: 'destructive',
        title: 'Payment unavailable',
        description: 'Paystack could not open.',
      });
    }
  };

  const handleMpesaOrder = async () => {
    if (!serverQuote || !clientPaymentRef) {
      return;
    }

    const code = mpesaCode.trim().toUpperCase();
    if (code.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Add M-PESA code',
        description: 'Enter the confirmation code from your SMS.',
      });
      return;
    }

    await finalizeOrder(`MPESA-${code}`, 'mpesa_paybill', false);
  };

  const handleWhatsAppConfirm = () => {
    if (!checkoutData || !serverQuote || !savedOrder) {
      return;
    }

    if (!OWNER_WHATSAPP) {
      toast({
        variant: 'destructive',
        title: 'WhatsApp number missing',
        description: 'Add the WhatsApp number first.',
      });
      return;
    }

    const item = serverQuote.items[0];
    const toppingNames = item.customizations?.toppings.map((topping) => topping.name).join(', ') || 'None';
    const statusLabel = savedOrder.paymentStatus === 'paid' ? 'Deposit Paid' : 'Awaiting Verification';
    const mapPin =
      checkoutData.deliveryInfo.delivery_method === 'delivery' &&
      typeof checkoutData.deliveryInfo.latitude === 'number' &&
      typeof checkoutData.deliveryInfo.longitude === 'number'
        ? `https://maps.google.com/?q=${checkoutData.deliveryInfo.latitude},${checkoutData.deliveryInfo.longitude}`
        : null;
    const message =
      `*WhiskeDelights Order*%0A` +
      `*Order:* ${savedOrder.orderNumber}%0A` +
      `*Status:* ${statusLabel}%0A` +
      `*Payment Ref:* ${paymentReference || clientPaymentRef || 'Pending'}%0A` +
      `*Cake:* ${item.name}%0A` +
      `*Qty:* ${item.quantity}%0A` +
      `*Flavor:* ${item.customizations?.flavor?.name || 'Signature'}%0A` +
      `*Size:* ${item.customizations?.size?.name || 'Standard'}%0A` +
      `*Color:* ${item.customizations?.color?.name || 'Standard'}%0A` +
      `*Toppings:* ${toppingNames}%0A` +
      `*Total:* ${formatPrice(savedOrder.totalAmount)}%0A` +
      `*Deposit:* ${formatPrice(savedOrder.depositAmount)}%0A` +
      `*Date:* ${checkoutData.deliveryInfo.date}%0A` +
      `*Fulfilment:* ${deliveryLabel}%0A` +
      (mapPin ? `*Map Pin:* ${mapPin}%0A` : '') +
      `*Customer:* ${checkoutData.deliveryInfo.name}%0A` +
      `*Phone:* ${checkoutData.deliveryInfo.phone}`;

    window.open(`https://wa.me/${OWNER_WHATSAPP}?text=${message}`, '_blank');
  };

  if (savedOrder) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(168,95,46,0.18),transparent_24rem),#f7f1e8] px-5 py-10 md:px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="section-shell overflow-hidden border-none shadow-none">
              <CardContent className="grid gap-8 p-6 md:grid-cols-[0.95fr_1.05fr] md:p-10">
                <div className="rounded-[2rem] bg-[linear-gradient(180deg,#2f1c14,#16110f)] p-8 text-white">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#f3cf8b]">
                    <Sparkles className="h-3.5 w-3.5" />
                    {successIsPaid ? 'Deposit received' : 'Order received'}
                  </div>
                  <div className="mt-6 space-y-4">
                    <h1 className="text-4xl leading-tight md:text-5xl">
                      {successIsPaid ? 'Your cake is in production.' : 'Your order is waiting for verification.'}
                    </h1>
                    <p className="max-w-md text-sm leading-7 text-white/72">
                      {successIsPaid ? 'Order saved successfully.' : 'Share the M-PESA message on WhatsApp so the bakery can confirm the deposit.'}
                    </p>
                  </div>
                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    <MetricCard label="Total" value={formatPrice(savedOrder.totalAmount)} dark />
                    <MetricCard label="Deposit" value={formatPrice(savedOrder.depositAmount)} dark highlight />
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-8">
                  <div className="space-y-5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-primary">
                        Order number
                      </p>
                      <h2 className="mt-2 text-3xl text-stone-950">{savedOrder.orderNumber}</h2>
                    </div>
                    <div className="rounded-[1.5rem] border border-stone-200 bg-white/70 p-4">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-stone-500">
                        Payment ref
                      </p>
                      <p className="mt-2 text-lg font-semibold text-stone-900">
                        {paymentReference || clientPaymentRef || 'Captured'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      className="h-14 w-full rounded-[1.2rem] bg-[#25D366] text-[0.76rem] font-semibold uppercase tracking-[0.22em] text-white hover:bg-[#1faf56]"
                      onClick={handleWhatsAppConfirm}
                    >
                      <WhatsappIcon className="mr-2 h-5 w-5" />
                      Open WhatsApp
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="h-12 w-full rounded-[1.2rem] border-stone-300 bg-white text-[0.72rem] font-semibold uppercase tracking-[0.2em]"
                    >
                      <Link href="/">Return home</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(168,95,46,0.18),transparent_24rem),#f7f1e8] px-5 pb-16 pt-6 md:px-6 md:pb-24">
      <div className="container mx-auto space-y-8">
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/checkout')}
              className="h-auto px-0 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-stone-500 hover:bg-transparent hover:text-primary"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-4xl text-stone-950 md:text-5xl">Payment</h1>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card className="section-shell overflow-hidden border-none shadow-none">
              <CardContent className="grid gap-6 p-6 md:grid-cols-[0.95fr_1.05fr] md:p-8">
                <div className="relative min-h-[18rem] overflow-hidden rounded-[2rem] bg-stone-100">
                  <Image
                    src={cartItem?.image_data_uri || 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&q=80&w=1200'}
                    alt={cartItem?.name || 'Cake order'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 40vw"
                  />
                  <div className="absolute inset-x-4 bottom-4 rounded-[1.5rem] bg-[rgba(17,14,12,0.72)] p-4 text-white backdrop-blur">
                    <h2 className="mt-2 break-all text-lg leading-tight">
                      {paymentReference || clientPaymentRef || 'Preparing'}
                    </h2>
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-6">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <MetricCard label={serverQuote ? 'Total' : 'Estimate'} value={isQuoting ? 'Calculating...' : formatPrice(displayedTotal)} />
                    <MetricCard label="Deposit" value={isQuoting ? 'Calculating...' : formatPrice(displayedDeposit)} highlight />
                    <MetricCard label="Date" value={checkoutData ? formatReadableDate(checkoutData.deliveryInfo.date) : 'Pending'} />
                    <MetricCard label="Method" value={checkoutData?.deliveryInfo.delivery_method === 'pickup' ? 'Pickup' : 'Delivery'} />
                  </div>

                  {optionSummary.length > 0 && (
                    <div className="rounded-[1.5rem] border border-stone-200 bg-white/75 p-4">
                      <div className="flex flex-wrap gap-2">
                        {optionSummary.map((line) => (
                          <span key={line} className="rounded-full bg-stone-100 px-3 py-1.5 text-[0.72rem] font-medium text-stone-700">
                            {line}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {(paystackError || !isReady || quoteError || finalizationError) && (
              <div className="space-y-4">
                {(paystackError || !isReady) && paymentMode === 'paystack' && (
                  <InlineNotice
                    title={paystackError ? 'Paystack error' : 'Loading Paystack'}
                    description={paystackError || 'Please wait.'}
                    tone={paystackError ? 'danger' : 'neutral'}
                    actionLabel="Reload"
                    onAction={() => window.location.reload()}
                    actionIcon={<RefreshCw className="h-4 w-4" />}
                  />
                )}

                {quoteError && (
                  <InlineNotice
                    title="Quote failed"
                    description={quoteError}
                    tone="danger"
                    secondaryActionLabel="Back to checkout"
                    onSecondaryAction={() => router.push('/checkout')}
                    actionLabel="Retry"
                    onAction={handleRetryQuote}
                    actionIcon={<RefreshCw className="h-4 w-4" />}
                  />
                )}

                {finalizationError && (
                  <InlineNotice
                    title="Could not save order"
                    description={finalizationError}
                    tone="danger"
                  />
                )}
              </div>
            )}
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
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-primary">Payment</p>
                    <h3 className="mt-2 text-3xl text-stone-950">Choose</h3>
                  </div>
                  <div className="rounded-full bg-primary/10 p-3 text-primary">
                    {paymentMode === 'mpesa_paybill' ? <Smartphone className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <PaymentModeCard
                    active={paymentMode === 'paystack'}
                    icon={<Smartphone className="h-4 w-4" />}
                    title="M-PESA STK Push"
                    subtitle="Instant"
                    onClick={() => setPaymentMode('paystack')}
                  />
                  <PaymentModeCard
                    active={paymentMode === 'mpesa_paybill'}
                    icon={<Smartphone className="h-4 w-4" />}
                    title="M-PESA"
                    subtitle="Paybill"
                    onClick={() => setPaymentMode('mpesa_paybill')}
                  />
                </div>

                <div className="space-y-4 rounded-[1.7rem] bg-stone-950 px-5 py-5 text-white">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-white/70">{cartItem?.name || 'Cake order'}</p>
                      <p className="mt-1 text-[0.72rem] uppercase tracking-[0.22em] text-white/55">
                        Quantity {cartItem?.quantity || 1}
                      </p>
                    </div>
                    <ReceiptText className="h-5 w-5 text-[#f3cf8b]" />
                  </div>
                  <div className="h-px bg-white/10" />
                  <PriceRow label={serverQuote ? 'Verified total' : 'Current total'} value={isQuoting ? 'Calculating...' : formatPrice(displayedTotal)} />
                  <PriceRow label="Deposit" value={isQuoting ? 'Calculating...' : formatPrice(displayedDeposit)} emphasis />
                </div>

                <div className="rounded-[1.5rem] border border-stone-200 bg-white/75 p-4">
                  <div className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-stone-500">Date</p>
                      <p className="mt-1 text-sm font-medium text-stone-800">
                        {checkoutData ? formatReadableDate(checkoutData.deliveryInfo.date) : 'Pending'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-stone-500">Fulfilment</p>
                      <p className="mt-1 text-sm font-medium text-stone-800">{deliveryLabel}</p>
                    </div>
                  </div>
                </div>

                {paymentMode === 'paystack' ? (
                  <>
                    <Button
                      onClick={handlePaystackPayment}
                      disabled={isProcessingPayment || isFinalizingOrder || isQuoting || !isReady || !serverQuote || !clientPaymentRef || Boolean(quoteError)}
                      className="h-14 w-full rounded-[1.2rem] text-[0.78rem] font-semibold uppercase tracking-[0.24em]"
                    >
                      {isProcessingPayment || isFinalizingOrder || isQuoting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ChevronRight className="mr-2 h-4 w-4" />
                      )}
                      {isQuoting
                        ? 'Verifying'
                        : isFinalizingOrder
                          ? 'Saving'
                          : isProcessingPayment
                            ? 'Opening'
                            : 'Pay with M-PESA STK Push'}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-4 rounded-[1.5rem] border border-stone-200 bg-white/80 p-4">
                      <MpesaRow label="Business" value={MPESA_BUSINESS_NAME} />
                      <MpesaRow label="Paybill" value={MPESA_PAYBILL} />
                      <MpesaRow label="Account" value={mpesaAccountRef} />
                      <MpesaRow label="Amount" value={isQuoting ? 'Calculating...' : formatPrice(displayedDeposit)} />
                    </div>

                    <Input
                      value={mpesaCode}
                      onChange={(event) => setMpesaCode(event.target.value.toUpperCase())}
                      placeholder="M-PESA code"
                      className="h-12 rounded-xl border-stone-200 bg-white"
                    />

                    <Button
                      onClick={handleMpesaOrder}
                      disabled={isFinalizingOrder || isQuoting || !serverQuote || !clientPaymentRef || Boolean(quoteError)}
                      className="h-14 w-full rounded-[1.2rem] text-[0.78rem] font-semibold uppercase tracking-[0.24em]"
                    >
                      {isFinalizingOrder ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ChevronRight className="mr-2 h-4 w-4" />}
                      {isFinalizingOrder ? 'Saving' : 'I paid by M-PESA'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}

function InlineNotice({
  title,
  description,
  tone,
  actionLabel,
  onAction,
  actionIcon,
  secondaryActionLabel,
  onSecondaryAction,
}: {
  title: string;
  description: string;
  tone: 'danger' | 'neutral';
  actionLabel?: string;
  onAction?: () => void | Promise<void>;
  actionIcon?: ReactNode;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}) {
  const toneClasses = tone === 'danger' ? 'border-red-200 bg-red-50/90' : 'border-stone-200 bg-white/80';

  return (
    <div className={`rounded-[1.7rem] border p-5 ${toneClasses}`}>
      <div className="flex items-start gap-3">
        <div className={`rounded-full p-2 ${tone === 'danger' ? 'bg-red-100 text-red-600' : 'bg-stone-100 text-stone-600'}`}>
          <AlertCircle className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-primary">{title}</p>
            <p className="mt-2 text-sm leading-6 text-stone-700">{description}</p>
          </div>
          {(actionLabel || secondaryActionLabel) && (
            <div className="flex flex-wrap gap-3">
              {secondaryActionLabel && onSecondaryAction && (
                <Button
                  variant="outline"
                  className="h-10 rounded-full border-stone-300 bg-white text-[0.7rem] font-semibold uppercase tracking-[0.2em]"
                  onClick={onSecondaryAction}
                >
                  {secondaryActionLabel}
                </Button>
              )}
              {actionLabel && onAction && (
                <Button
                  className="h-10 rounded-full text-[0.7rem] font-semibold uppercase tracking-[0.2em]"
                  onClick={() => {
                    void onAction();
                  }}
                >
                  {actionIcon ? <span className="mr-2">{actionIcon}</span> : null}
                  {actionLabel}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  dark,
  highlight,
}: {
  label: string;
  value: string;
  dark?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-[1.4rem] border px-4 py-4 ${
        dark
          ? 'border-white/10 bg-white/5'
          : highlight
            ? 'border-amber-200 bg-amber-50'
            : 'border-stone-200 bg-white/70'
      }`}
    >
      <p className={`text-[0.66rem] font-semibold uppercase tracking-[0.24em] ${dark ? 'text-white/60' : 'text-stone-500'}`}>
        {label}
      </p>
      <p className={`mt-2 text-lg font-semibold ${dark ? (highlight ? 'text-[#f3cf8b]' : 'text-white') : highlight ? 'text-primary' : 'text-stone-900'}`}>
        {value}
      </p>
    </div>
  );
}

function PaymentModeCard({
  active,
  icon,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[1.3rem] border p-4 text-left transition-all ${
        active ? 'border-primary bg-primary/[0.08]' : 'border-stone-200 bg-white hover:border-stone-300'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`rounded-full p-2 ${active ? 'bg-primary text-white' : 'bg-stone-100 text-stone-600'}`}>{icon}</div>
        <div>
          <p className="text-sm font-semibold text-stone-900">{title}</p>
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">{subtitle}</p>
        </div>
      </div>
    </button>
  );
}

function MpesaRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[1rem] bg-stone-50 px-4 py-3">
      <span className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-stone-500">{label}</span>
      <span className="text-right text-sm font-semibold text-stone-900">{value}</span>
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
