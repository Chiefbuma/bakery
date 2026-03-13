'use client';

import { useState, useEffect, useMemo } from 'react';
import { getCakes, getSpecialOffer } from '@/services/cake-service';
import type { Cake, SpecialOffer } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingBasket, ArrowRight, Sparkles, Search, Loader2, Utensils } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { InstagramIcon } from '@/components/icons/instagram-icon';
import { WhatsappIcon } from '@/components/icons/whatsapp-icon';
import { Input } from '@/components/ui/input';

export default function BakeryLandingPage() {
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [specialOffer, setSpecialOffer] = useState<SpecialOffer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cakeList, offer] = await Promise.all([getCakes(), getSpecialOffer()]);
        setCakes(cakeList || []);
        setSpecialOffer(offer);
      } catch (error) {
        console.error('Failed to load landing page data', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const categories = useMemo(() => {
    if (!cakes.length) return ['All'];
    return ['All', ...Array.from(new Set(cakes.map(c => c.category)))];
  }, [cakes]);

  const filteredCakes = useMemo(() => {
    return cakes.filter(c => {
      const matchesFilter = filter === 'All' || c.category === filter;
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [cakes, filter, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center space-y-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <Loader2 className="h-16 w-16 text-primary animate-spin" />
          <p className="text-stone-400 font-black tracking-[0.3em] uppercase text-xs animate-pulse">Pre-heating the Oven...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white"
    >
      {/* Navigation Header */}
      <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-stone-200">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Utensils className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black font-headline tracking-tighter hidden sm:block">WhiskeDelights</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-stone-500">
            <Link href="#menu" className="hover:text-primary transition-colors">Artisanal Gallery</Link>
            <Link href="/admin/login" className="hover:text-primary transition-colors">Staff Portal</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="#menu">
              <Button className="rounded-full font-black px-6 h-12 shadow-xl shadow-primary/20">Order Now</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-stone-950">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?auto=format&fit=crop&q=80&w=2000" 
            alt="Bakery background"
            fill
            className="object-cover opacity-20 scale-105"
            priority
            data-ai-hint="bakery background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-transparent to-stone-950" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-24 items-center py-16 md:py-24">
          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-8 md:p-16 rounded-[3rem] shadow-2xl space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary font-black text-[10px] uppercase tracking-[0.2em]">
                <Sparkles className="h-3 w-3 animate-pulse" />
                <span>Nyeri's Finest Bakery</span>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.9] font-headline tracking-tighter">
                  Baking <br/>
                  <span className="text-primary italic">Dreams Daily</span>
                </h1>
                <p className="text-lg md:text-xl text-stone-400 max-w-lg leading-relaxed font-medium">
                  We handcraft every creation using time-honored techniques and the finest local ingredients to transform your moments into masterpieces.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="#menu" className="flex-1">
                  <Button className="w-full h-16 text-xl font-black rounded-2xl shadow-2xl shadow-primary/20">Explore Gallery</Button>
                </Link>
                <Link href="#menu" className="flex-1">
                  <Button variant="outline" className="w-full h-16 text-xl font-black rounded-2xl border-white/20 text-white hover:bg-white/10">Custom Order</Button>
                </Link>
              </div>
            </div>
          </motion.div>

          {specialOffer && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full scale-75" />
              
              <div className="relative group p-4 md:p-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3.5rem] shadow-2xl">
                <div className="relative aspect-square w-full rounded-[2.5rem] overflow-hidden border-8 border-white/5 shadow-2xl bg-stone-900 mb-8">
                  <Image 
                    src={specialOffer.cake.image_data_uri || 'https://picsum.photos/seed/special/600/600'} 
                    alt={specialOffer.cake.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-1000"
                    priority
                  />
                  <div className="absolute top-6 right-6 h-24 w-24 md:h-32 md:w-32 bg-primary rounded-full flex flex-col items-center justify-center text-white shadow-2xl rotate-12 z-20 border-4 border-white/20 animate-bounce">
                    <span className="text-[10px] uppercase font-black tracking-widest opacity-80">Save</span>
                    <span className="text-3xl md:text-4xl font-black">{specialOffer.discount_percentage}%</span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-4 pb-4">
                  <div className="space-y-2">
                    <Badge className="bg-primary text-white border-none text-[10px] font-black uppercase tracking-widest">Masterpiece of the Day</Badge>
                    <h3 className="text-3xl md:text-4xl font-black text-white font-headline">{specialOffer.cake.name}</h3>
                    <div className="flex items-baseline gap-3">
                      <span className="text-primary font-black text-3xl">{formatPrice(specialOffer.special_price)}</span>
                      <span className="text-stone-500 text-lg line-through font-bold">{formatPrice(specialOffer.original_price)}</span>
                    </div>
                  </div>
                  <Link href={`/cakes/${specialOffer.cake.id}`} className="w-full md:w-auto">
                    <Button className="w-full h-16 px-10 text-xl font-black rounded-2xl bg-white text-stone-950 hover:bg-primary hover:text-white transition-all group">
                      Claim
                      <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Gallery Section */}
      <section id="menu" className="py-24 md:py-32 container mx-auto px-6">
        <div className="flex flex-col gap-12 mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4 text-center md:text-left"
          >
            <h2 className="text-5xl md:text-7xl font-black font-headline tracking-tighter">Artisanal Gallery</h2>
            <p className="text-muted-foreground font-medium max-w-xl">Browse our collection of signature recipes and bespoke creations, designed to make your celebrations memorable.</p>
          </motion.div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search catalog..." 
                className="pl-12 h-14 rounded-2xl border-2 focus:border-primary/50 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map(cat => (
                <Button 
                  key={cat} 
                  variant={filter === cat ? "default" : "outline"}
                  onClick={() => setFilter(cat)}
                  className="rounded-full px-8 font-black h-12 shadow-sm whitespace-nowrap"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-stone-50 rounded-[3rem] p-6 md:p-12 border shadow-inner">
          <AnimatePresence mode="popLayout">
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12"
            >
              {filteredCakes.map((cake) => (
                <motion.div 
                  key={cake.id} 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="h-full"
                >
                  <Card className="group h-full flex flex-col overflow-hidden border-none bg-white shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2.5rem]">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image 
                        src={cake.image_data_uri || 'https://picsum.photos/seed/cake/600/400'} 
                        alt={cake.name} 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                      <div className="absolute top-6 right-6">
                        <Badge className="bg-white/95 text-black border-none px-4 py-1.5 font-black shadow-xl rounded-full">
                          <Star className="h-4 w-4 fill-primary text-primary mr-2" /> {cake.rating || 'New'}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-8 flex-1 flex flex-col justify-between">
                      <div className="mb-8">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest block mb-2">{cake.category}</span>
                        <h3 className="text-2xl md:text-3xl font-black mb-3 font-headline">{cake.name}</h3>
                        <p className="text-muted-foreground text-sm line-clamp-2">{cake.description}</p>
                      </div>
                      <div className="flex items-center justify-between pt-6 border-t border-stone-100">
                        <span className="text-2xl font-black text-primary">{formatPrice(cake.base_price)}</span>
                        <Link href={`/cakes/${cake.id}`}>
                          <Button size="lg" className="rounded-2xl gap-3 font-black px-8">
                            {cake.customizable ? 'Customize' : 'Order'}
                            <ArrowRight className="h-5 w-5" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
          {filteredCakes.length === 0 && (
            <div className="py-24 flex flex-col items-center justify-center text-stone-400">
              <Sparkles className="h-20 w-20 mb-6 opacity-10" />
              <p className="font-black uppercase tracking-[0.3em] text-sm italic">No matches in our recipe book</p>
            </div>
          )}
        </div>
      </section>

      {/* Signature Footer */}
      <footer className="py-24 border-t bg-stone-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
                  <Utensils className="h-6 w-6 text-white" />
                </div>
                <span className="text-3xl font-black font-headline tracking-tighter">WhiskeDelights</span>
              </div>
              <p className="text-muted-foreground font-medium max-w-sm">Crafting premium artisanal cakes for Nyeri County and beyond. Every slice tells a story of passion and quality.</p>
              <div className="flex gap-4">
                <Link href="#" className="h-14 w-14 rounded-2xl bg-white border shadow-sm flex items-center justify-center hover:bg-primary hover:text-white transition-all group">
                  <InstagramIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
                </Link>
                <Link href="#" className="h-14 w-14 rounded-2xl bg-white border shadow-sm flex items-center justify-center hover:bg-green-600 hover:text-white transition-all group">
                  <WhatsappIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
                </Link>
              </div>
            </div>
            
            <div className="space-y-6">
              <h4 className="font-black uppercase tracking-widest text-xs">Navigation</h4>
              <ul className="space-y-4 text-sm font-bold text-muted-foreground">
                <li><Link href="#menu" className="hover:text-primary transition-colors">The Gallery</Link></li>
                <li><Link href="#menu" className="hover:text-primary transition-colors">Custom Orders</Link></li>
                <li><Link href="/admin/login" className="hover:text-primary transition-colors">Staff Portal</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="font-black uppercase tracking-widest text-xs">Visit Us</h4>
              <ul className="space-y-4 text-sm font-bold text-muted-foreground">
                <li>Othaya Main Road, Othaya</li>
                <li>Nyeri County, Kenya</li>
                <li>Mon - Sat: 8am - 7pm</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t flex flex-col md:flex-row justify-between items-center gap-6">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">© 2024 WhiskeDelights Artisanal Bakery</p>
             <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-stone-400">
               <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
               <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
             </div>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
