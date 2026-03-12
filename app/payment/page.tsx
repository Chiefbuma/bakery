
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Copy, Loader2, Sparkles, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ConfirmationPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsProcessing(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Securing Your Order...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <Card className="border-none shadow-2xl text-center overflow-hidden">
          <div className="bg-primary h-2 w-full" />
          <CardContent className="p-12 space-y-8">
            <div className="relative inline-block">
              <div className="p-6 bg-green-50 rounded-full border border-green-100">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                className="absolute -top-4 -right-4"
              >
                <Sparkles className="h-10 w-10 text-primary opacity-30" />
              </motion.div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-black font-headline">Order Confirmed!</h1>
              <p className="text-muted-foreground font-medium">Your delicious creation is now in our master bakers' queue.</p>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-dashed border-stone-200 flex flex-col items-center gap-2">
              <span className="text-[10px] uppercase font-black text-muted-foreground">Reference Number</span>
              <div className="flex items-center gap-2">
                <code className="text-lg font-black text-primary">WD-7829-BK</code>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Copy className="h-4 w-4" /></Button>
              </div>
            </div>

            <div className="space-y-4">
              <Link href="/">
                <Button className="w-full h-12 text-lg font-black gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Keep Browsing
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground">
                A confirmation email with deposit instructions has been sent to your inbox.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
