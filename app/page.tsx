'use client';

import { useState } from 'react';
import { CAKES, SPECIAL_OFFER } from '@/lib/data';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingBasket, ArrowRight, Sparkles, Clock, Utensils, Phone } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { InstagramIcon } from '@/components/icons/instagram-icon';
import { WhatsappIcon } from '@/components/icons/whatsapp-icon';

export default function BakeryLandingPage() {
  const [filter, setFilter] = useState('All');
  const categories = ['All', ...Array.from(new Set(CAKES.map(c => c.category)))];

  const filteredCakes = filter === 'All' 
    ? CAKES 
    : CAKES.filter(c => c.category === filter);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white">
      {/* Premium Glossy Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-stone-950">
        {/* Background Layer with Glossy Sheen */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?auto=format&fit=crop&q=80&w=2000" 
            alt="Bakery background"
            fill
            className="object-cover opacity-30 scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-stone-950 via-stone-900/90 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent opacity-20" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center py-20">
          <motion.div 
            initial={{ opacity: 0, x: -40 }} 
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            {/* Glossy Hero Text Container */}
            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-8 md:p-12 rounded-[2.5rem] shadow-2xl space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-primary font-black text-[10px] uppercase tracking-[0.2em]">
                <Sparkles className="h-3 w-3 animate-pulse" />
                <span>Artisanal Excellence</span>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.85] font-headline tracking-tighter">
                  Baking <br/>
                  <span className="text-primary italic relative">
                    Dreams
                    <motion.span 
                      initial={{ width: 0 }} 
                      animate={{ width: '100%' }} 
                      className="absolute -bottom-2 left-0 h-1 bg-primary/30 rounded-full" 
                    />
                  </span> <br/>
                  Daily
                </h1>
                <p className="text-lg md:text-xl text-stone-300 max-w-lg leading-relaxed font-medium">
                  WhiskeDelights crafts <span className="text-white font-bold underline decoration-primary/50 underline-offset-4">artisanal cakes</span> that transform every celebration into an unforgettable masterpiece.
                </p>
              </div>

              <div className="flex flex-wrap gap-5 pt-4">
                <Link href="#menu">
                  <Button size="lg" className="h-16 px-10 text-lg font-black shadow-[0_0_40px_rgba(var(--primary),0.3)] hover:shadow-[0_0_60px_rgba(var(--primary),0.5)] transition-all">
                    Browse Menu
                  </Button>
                </Link>
                <Link href={`/cakes/${SPECIAL_OFFER.cake.id}`}>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="h-16 px-10 text-lg font-black border-white/20 text-white bg-white/10 backdrop-blur-2xl hover:bg-white/20 transition-all shadow-2xl"
                  >
                    Claim Offer
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }} 
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "backOut" }}
            className="relative"
          >
            {/* Glossy Backdrop for Cake */}
            <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full scale-75" />
            
            <div className="relative aspect-square max-w-lg mx-auto group">
              <div className="absolute inset-0 rounded-full border border-white/10 p-8">
                <div className="absolute inset-0 rounded-full border border-white/5 animate-[spin_20s_linear_infinite]" />
              </div>
              
              <div className="relative h-full w-full rounded-full overflow-hidden border-[12px] border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] bg-stone-900">
                <Image 
                  src={SPECIAL_OFFER.cake.image_data_uri || ''} 
                  alt={SPECIAL_OFFER.cake.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-1000"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>

              {/* Floating High-Gloss Info Card */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-10 -left-10 md:bottom-0 md:-left-5 bg-white/10 backdrop-blur-2xl border border-white/20 p-6 rounded-3xl shadow-2xl max-w-[240px]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-primary text-white border-none text-[10px] font-black uppercase">Daily Special</Badge>
                  <div className="flex text-primary">
                    <Star className="h-3 w-3 fill-current" />
                    <Star className="h-3 w-3 fill-current" />
                    <Star className="h-3 w-3 fill-current" />
                  </div>
                </div>
                <h3 className="text-white font-black text-lg leading-tight mb-1">{SPECIAL_OFFER.cake.name}</h3>
                <p className="text-stone-400 text-xs line-clamp-2 mb-3">Indulge in our signature cocoa masterpiece, baked fresh this morning.</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-primary font-black text-2xl">{formatPrice(SPECIAL_OFFER.special_price)}</span>
                  <span className="text-stone-500 text-sm line-through decoration-primary/50">{formatPrice(SPECIAL_OFFER.original_price)}</span>
                </div>
              </motion.div>

              {/* Animated Glossy Badge */}
              <div className="absolute top-0 -right-5 h-36 w-36 bg-primary rounded-full flex flex-col items-center justify-center text-white shadow-[0_0_50px_rgba(var(--primary),0.4)] rotate-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
                <motion.div 
                  animate={{ x: ['-100%', '100%'] }} 
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-white/20 -skew-x-12 translate-x-full" 
                />
                <span className="text-[10px] uppercase font-black tracking-widest opacity-80">Special Save</span>
                <span className="text-5xl font-black">{SPECIAL_OFFER.discount_percentage}%</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Collections */}
      <section id="menu" className="py-32 container mx-auto px-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-primary/50 to-transparent" />
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest">
              <Utensils className="h-3 w-3" />
              <span>Curated Selection</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black font-headline tracking-tight">The Bakery Gallery</h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              Each creation is a unique journey of flavor, texture, and artistry, handcrafted daily in our Othaya kitchen.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map(cat => (
              <Button 
                key={cat} 
                variant={filter === cat ? "default" : "outline"}
                onClick={() => setFilter(cat)}
                className={cn(
                  "rounded-full px-8 h-12 font-bold transition-all",
                  filter === cat ? "shadow-lg shadow-primary/20" : "hover:border-primary hover:text-primary"
                )}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredCakes.map((cake, idx) => (
            <motion.div 
              key={cake.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="group overflow-hidden border-none bg-white shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-500 rounded-[2.5rem]">
                <div className="relative h-80 overflow-hidden">
                  <Image 
                    src={cake.image_data_uri || ''} 
                    alt={cake.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    data-ai-hint="luxury cake"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="absolute top-6 right-6 flex flex-col gap-3">
                    <Badge className="bg-white/95 text-black border-none backdrop-blur-md px-3 py-1 font-black shadow-lg">
                      <Star className="h-3 w-3 fill-primary text-primary mr-1.5" />
                      {cake.rating}
                    </Badge>
                    <Badge variant="secondary" className="bg-stone-900/80 text-white backdrop-blur-md border-none px-3 py-1 font-bold shadow-lg">
                      <Clock className="h-3 w-3 mr-1.5" />
                      {cake.ready_time}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{cake.category}</span>
                      <h3 className="text-2xl font-black tracking-tight">{cake.name}</h3>
                    </div>
                    <span className="text-2xl font-black text-primary">{formatPrice(cake.base_price)}</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed line-clamp-2 mb-8 text-sm">
                    {cake.description}
                  </p>
                  <Link href={`/cakes/${cake.id}`}>
                    <Button className="w-full h-14 rounded-2xl gap-3 font-black group transition-all">
                      {cake.customizable ? 'Customize Masterpiece' : 'Reserve Now'}
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Signature Footer */}
      <footer className="py-24 border-t border-primary/10 bg-stone-50 overflow-hidden relative">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        
        <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                <ShoppingBasket className="h-6 w-6 text-white" />
              </div>
              <span className="text-3xl font-black font-headline tracking-tighter">WhiskeDelights</span>
            </div>
            <p className="text-stone-400 max-w-xs text-sm font-medium">
              Transforming your celebrations into high-gloss masterpieces, one artisanal slice at a time.
            </p>
          </div>
          
          <div className="text-sm text-stone-400 font-bold">
            © 2024 WhiskeDelights Artisanal Bakery.
          </div>
          
          <div className="flex gap-4">
            <Link href="#" title="Instagram" className="h-12 w-12 rounded-2xl bg-white border border-stone-200 flex items-center justify-center hover:text-primary hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all group">
              <InstagramIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </Link>
            <Link href="#" title="WhatsApp" className="h-12 w-12 rounded-2xl bg-white border border-stone-200 flex items-center justify-center hover:text-primary hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all group">
              <WhatsappIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </Link>
            <Link href="#" title="Contact Us" className="h-12 w-12 rounded-2xl bg-white border border-stone-200 flex items-center justify-center hover:text-primary hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all group">
              <Phone className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
