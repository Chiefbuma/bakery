
'use client';

import { useState } from 'react';
import { CAKES, SPECIAL_OFFER } from '@/lib/data';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingBasket, ArrowRight, Sparkles, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function BakeryLandingPage() {
  const [filter, setFilter] = useState('All');
  const categories = ['All', ...Array.from(new Set(CAKES.map(c => c.category)))];

  const filteredCakes = filter === 'All' 
    ? CAKES 
    : CAKES.filter(c => c.category === filter);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section with Special Offer */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?auto=format&fit=crop&q=80&w=2000" 
            alt="Bakery background"
            fill
            className="object-cover brightness-[0.4]"
            priority
          />
        </div>
        
        <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary-foreground font-bold text-xs uppercase tracking-widest">
              <Sparkles className="h-3 w-3" />
              <span>Daily Special</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white leading-none font-headline">
              Baking <br/><span className="text-primary italic">Dreams</span> Daily
            </h1>
            <p className="text-xl text-stone-300 max-w-lg leading-relaxed">
              WhiskeDelights crafts artisanal cakes that transform every celebration into an unforgettable masterpiece. 
            </p>
            <div className="flex gap-4">
              <Link href="#menu">
                <Button size="lg" className="h-14 px-8 text-lg font-bold">Browse Menu</Button>
              </Link>
              <Link href={`/cakes/${SPECIAL_OFFER.cake.id}`}>
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg font-bold border-white/20 text-white hover:bg-white/10">Claim Offer</Button>
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="hidden lg:block relative"
          >
            <div className="relative aspect-square max-w-md mx-auto">
              <Image 
                src={SPECIAL_OFFER.cake.image_data_uri || ''} 
                alt={SPECIAL_OFFER.cake.name}
                fill
                className="rounded-full object-cover border-8 border-white/5 shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-primary rounded-full flex flex-col items-center justify-center text-white shadow-xl rotate-12">
                <span className="text-xs uppercase font-black">Save</span>
                <span className="text-3xl font-black">{SPECIAL_OFFER.discount_percentage}%</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories / Filter */}
      <section id="menu" className="py-20 container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <div className="space-y-2">
            <h2 className="text-4xl font-black font-headline">The Bakery Gallery</h2>
            <p className="text-muted-foreground">Artisanal creations, handcrafted for your joy.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <Button 
                key={cat} 
                variant={filter === cat ? "default" : "outline"}
                onClick={() => setFilter(cat)}
                className="rounded-full"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCakes.map((cake, idx) => (
            <motion.div 
              key={cake.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="group overflow-hidden border-primary/10 hover:border-primary/30 transition-all hover:shadow-xl">
                <div className="relative h-64 overflow-hidden">
                  <Image 
                    src={cake.image_data_uri || ''} 
                    alt={cake.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    data-ai-hint="cake dessert"
                  />
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <Badge className="bg-white/90 text-black border-none backdrop-blur-md">
                      <Star className="h-3 w-3 fill-primary text-primary mr-1" />
                      {cake.rating}
                    </Badge>
                    <Badge variant="secondary" className="backdrop-blur-md opacity-90">
                      <Clock className="h-3 w-3 mr-1" />
                      {cake.ready_time}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-black">{cake.name}</h3>
                    <span className="text-xl font-bold text-primary">{formatPrice(cake.base_price)}</span>
                  </div>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-6">
                    {cake.description}
                  </p>
                  <Link href={`/cakes/${cake.id}`}>
                    <Button className="w-full gap-2 font-bold group">
                      {cake.customizable ? 'Customize & Order' : 'Order Now'}
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-12 border-t bg-stone-50">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <ShoppingBasket className="h-8 w-8 text-primary" />
            <span className="text-2xl font-black font-headline tracking-tighter">WhiskeDelights</span>
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            © 2024 WhiskeDelights Artisanal Bakery. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm font-bold">
            <Link href="#" className="hover:text-primary">Instagram</Link>
            <Link href="#" className="hover:text-primary">Facebook</Link>
            <Link href="#" className="hover:text-primary">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
