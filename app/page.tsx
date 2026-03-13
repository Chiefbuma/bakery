'use client';

import { useState } from 'react';
import { CAKES, SPECIAL_OFFER } from '@/lib/data';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingBasket, ArrowRight, Sparkles, Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { InstagramIcon } from '@/components/icons/instagram-icon';
import { WhatsappIcon } from '@/components/icons/whatsapp-icon';
import { Input } from '@/components/ui/input';

export default function BakeryLandingPage() {
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const categories = ['All', ...Array.from(new Set(CAKES.map(c => c.category)))];

  const filteredCakes = CAKES.filter(c => {
    const matchesFilter = filter === 'All' || c.category === filter;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white">
      {/* Premium Glossy Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-stone-950">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?auto=format&fit=crop&q=80&w=2000" 
            alt="Bakery background"
            fill
            className="object-cover opacity-30 scale-105"
            priority
            data-ai-hint="bakery background"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-stone-950 via-stone-900/90 to-transparent" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center py-20">
          <motion.div 
            initial={{ opacity: 0, x: -40 }} 
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Glossy Transparent Heading Background */}
            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-8 md:p-12 rounded-[2.5rem] shadow-2xl space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-primary font-black text-[10px] uppercase tracking-[0.2em]">
                <Sparkles className="h-3 w-3 animate-pulse" />
                <span>Artisanal Excellence</span>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.85] font-headline tracking-tighter">
                  Baking <br/>
                  <span className="text-primary italic relative">Dreams Daily</span>
                </h1>
                <p className="text-lg md:text-xl text-stone-300 max-w-lg leading-relaxed font-medium">
                  WhiskeDelights crafts artisanal cakes that transform every celebration into an unforgettable masterpiece.
                </p>
              </div>

              <div className="flex flex-wrap gap-5 pt-4">
                <Link href="#menu">
                  <Button size="lg" className="h-16 px-10 text-lg font-black shadow-xl">
                    Browse Menu
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="relative flex flex-col items-center gap-8"
          >
            <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full scale-75" />
            
            {/* Square Placeholder for Special Offer */}
            <div className="relative aspect-square w-full max-w-lg mx-auto group">
              <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden border-[12px] border-white/5 shadow-2xl bg-stone-900">
                <Image 
                  src={SPECIAL_OFFER.cake.image_data_uri || ''} 
                  alt={SPECIAL_OFFER.cake.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-1000"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>

              {/* Glossy Special Offer Card */}
              <div className="absolute -bottom-10 -left-10 bg-white/10 backdrop-blur-2xl border border-white/20 p-6 rounded-3xl shadow-2xl max-w-[240px]">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-primary text-white border-none text-[10px] font-black uppercase">Daily Special</Badge>
                </div>
                <h3 className="text-white font-black text-lg leading-tight mb-1">{SPECIAL_OFFER.cake.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-primary font-black text-2xl">{formatPrice(SPECIAL_OFFER.special_price)}</span>
                  <span className="text-stone-500 text-sm line-through">{formatPrice(SPECIAL_OFFER.original_price)}</span>
                </div>
              </div>

              <div className="absolute -top-5 -right-5 h-32 w-32 bg-primary rounded-full flex flex-col items-center justify-center text-white shadow-xl rotate-12 z-20">
                <span className="text-[10px] uppercase font-black tracking-widest opacity-80">Save</span>
                <span className="text-4xl font-black">{SPECIAL_OFFER.discount_percentage}%</span>
              </div>
            </div>

            {/* Glossy Transparent Claim Offer Button placed near the cake */}
            <Link href={`/cakes/${SPECIAL_OFFER.cake.id}`} className="w-full max-w-lg">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full h-16 text-xl font-black border-white/20 text-white bg-white/10 backdrop-blur-2xl hover:bg-white/20 transition-all shadow-2xl rounded-2xl group"
              >
                Claim Offer Now
                <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Collections with Vertical Scrollable Gallery */}
      <section id="menu" className="py-24 container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-4">
            <h2 className="text-5xl font-black font-headline tracking-tight">Artisanal Gallery</h2>
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search catalog..." 
                className="pl-10 h-12 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <Button 
                key={cat} 
                variant={filter === cat ? "default" : "outline"}
                onClick={() => setFilter(cat)}
                className="rounded-full px-6 font-bold"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Catalog Scrollable View - Fixed height with vertical scroll */}
        <div className="h-[900px] overflow-y-auto pr-4 custom-scrollbar bg-stone-50/30 rounded-[3rem] p-8 border">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredCakes.map((cake) => (
              <motion.div key={cake.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="group overflow-hidden border-none bg-white shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2.5rem]">
                  <div className="relative h-72 overflow-hidden">
                    <Image src={cake.image_data_uri || ''} alt={cake.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white/95 text-black border-none px-3 py-1 font-black shadow-md">
                        <Star className="h-3 w-3 fill-primary text-primary mr-1" /> {cake.rating}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">{cake.category}</span>
                        <h3 className="text-2xl font-black">{cake.name}</h3>
                      </div>
                      <span className="text-xl font-black text-primary">{formatPrice(cake.base_price)}</span>
                    </div>
                    <Link href={`/cakes/${cake.id}`}>
                      <Button className="w-full h-14 rounded-2xl gap-2 font-black shadow-lg shadow-primary/10">
                        {cake.customizable ? 'Customize' : 'Order Now'}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Signature Footer with Icons */}
      <footer className="py-20 border-t bg-stone-50">
        <div className="container mx-auto px-6 grid md:grid-cols-3 gap-12 items-center">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
              <ShoppingBasket className="h-6 w-6 text-white" />
            </div>
            <span className="text-3xl font-black font-headline">WhiskeDelights</span>
          </div>
          
          <div className="flex justify-center gap-6">
            <Link href="#" className="h-14 w-14 rounded-2xl bg-white border shadow-sm flex items-center justify-center hover:bg-primary/5 hover:text-primary transition-all group">
              <InstagramIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
            </Link>
            <Link href="#" className="h-14 w-14 rounded-2xl bg-white border shadow-sm flex items-center justify-center hover:bg-green-50 hover:text-green-600 transition-all group">
              <WhatsappIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
            </Link>
          </div>
          
          <div className="text-center md:text-right">
             <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">© 2024 WhiskeDelights Artisanal Bakery</p>
             <p className="text-[10px] text-stone-400 mt-1">Othaya Branch • Nyeri County</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
