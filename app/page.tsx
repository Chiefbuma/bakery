'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Clock3,
  Loader2,
  Search,
  Sparkles,
  Star,
  UtensilsCrossed,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getCakes, getSpecialOffer } from '@/services/cake-service';
import type { Cake, SpecialOffer } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { InstagramIcon } from '@/components/icons/instagram-icon';
import { WhatsappIcon } from '@/components/icons/whatsapp-icon';

export default function BakeryLandingPage() {
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [specialOffer, setSpecialOffer] = useState<SpecialOffer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [navigatingId, setNavigatingId] = useState<string | null>(null);

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
    if (!cakes.length) {
      return ['All'];
    }

    return ['All', ...Array.from(new Set(cakes.map((cake) => cake.category)))];
  }, [cakes]);

  const filteredCakes = useMemo(() => {
    return cakes.filter((cake) => {
      const matchesFilter = filter === 'All' || cake.category === filter;
      const matchesSearch = cake.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [cakes, filter, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(168,95,46,0.24),transparent_26rem),#201815] flex flex-col items-center justify-center space-y-5">
        <Loader2 className="h-12 w-12 animate-spin text-[#f3cf8b]" />
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.42em] text-[#f5e8d7]">
          Preparing today&apos;s gallery
        </p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen text-foreground">
      <header className="sticky top-0 z-50 border-b border-white/60 bg-[rgba(255,250,244,0.86)] backdrop-blur-xl">
        <div className="container mx-auto flex h-18 items-center justify-between px-5 md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#cf8b4b,#8f4520)] text-white shadow-[0_16px_30px_rgba(143,69,32,0.2)]">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <div>
              <p className="font-headline text-2xl text-stone-900">WhiskeDelights</p>
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.34em] text-stone-500">
                Modern cake atelier
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-stone-500 md:flex">
            <Link href="#special" className="transition-colors hover:text-primary">Special</Link>
            <Link href="#menu" className="transition-colors hover:text-primary">Menu</Link>
            <Link href="#contact" className="transition-colors hover:text-primary">Contact</Link>
          </nav>

          <Link href="#menu">
            <Button className="h-11 rounded-full px-6 text-[0.72rem] font-semibold uppercase tracking-[0.24em] shadow-[0_18px_36px_rgba(168,95,46,0.18)]">
              Order a cake
            </Button>
          </Link>
        </div>
      </header>

      <main>
        <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-stone-950">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?auto=format&fit=crop&q=80&w=2000"
              alt="Bakery background"
              fill
              className="object-cover opacity-20 scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-transparent to-stone-950" />
          </div>

          <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-24 items-center py-12">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-8 md:p-12 rounded-[2.5rem] shadow-2xl space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary font-black text-[7px] uppercase tracking-[0.2em]">
                  <Sparkles className="h-3 w-3 animate-pulse" />
                  <span>Kenya&apos;s Finest Bakery</span>
                </div>

                <div className="space-y-4">
                  <h1 className="text-5xl md:text-7xl font-black text-white leading-[1] font-headline tracking-tighter">
                    Artisanal <br />
                    <span className="text-primary">Excellence</span>
                  </h1>
                  <p className="text-xs md:text-sm text-stone-300 max-w-lg leading-relaxed font-black uppercase tracking-[0.2em]">
                    Masterpieces Created Daily with Uncompromising Passion.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link href="#menu" className="flex-1">
                    <Button className="w-full h-14 text-[10px] font-black rounded-xl shadow-2xl shadow-primary/20 uppercase tracking-[0.2em]">
                      Explore Gallery
                    </Button>
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
                <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-75" />

                <div className="relative group p-4 md:p-6 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden">
                  <div className="relative aspect-square w-full rounded-[2rem] overflow-hidden border-4 border-white/5 shadow-2xl bg-stone-900 mb-6">
                    <Image
                      src={specialOffer.cake.image_data_uri || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600'}
                      alt={specialOffer.cake.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-1000"
                      priority
                    />
                    <div className="absolute top-4 right-4 h-20 w-20 md:h-24 md:w-24 bg-primary rounded-full flex flex-col items-center justify-center text-white shadow-2xl rotate-12 z-20 border-2 border-white/20 animate-bounce">
                      <span className="text-[7px] uppercase font-black tracking-widest opacity-80">Save</span>
                      <span className="text-xl md:text-2xl font-black">{specialOffer.discount_percentage}%</span>
                    </div>
                  </div>

                  <div id="special" className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-2">
                    <div className="space-y-1">
                      <Badge className="bg-primary text-white border-none text-[7px] font-black uppercase tracking-widest">
                        Masterpiece of the Day
                      </Badge>
                      <h3 className="text-xl md:text-2xl font-black text-white font-headline">{specialOffer.cake.name}</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-primary font-black text-xl">{formatPrice(specialOffer.special_price)}</span>
                        <span className="text-stone-500 text-xs line-through font-black">{formatPrice(specialOffer.original_price)}</span>
                      </div>
                    </div>
                    <Link href={`/cakes/${specialOffer.cake.id}`} className="w-full md:w-auto" onClick={() => setNavigatingId('hero-special')}>
                      <Button
                        className="w-full h-12 px-8 text-[10px] font-black rounded-xl bg-white text-stone-950 hover:bg-primary hover:text-white transition-all group uppercase tracking-widest"
                        disabled={navigatingId === 'hero-special'}
                      >
                        {navigatingId === 'hero-special' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Claim'}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        <section id="menu" className="px-5 pb-16 md:px-6 md:pb-24">
          <div className="container mx-auto section-shell overflow-hidden p-6 md:p-8">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-3">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-primary">
                    The menu
                  </p>
                  <h2 className="text-4xl text-stone-950 md:text-5xl">Find the right cake in a few taps.</h2>
                  <p className="max-w-2xl text-sm leading-6 text-stone-600 md:text-base">
                    Filter by collection, search by name, and jump straight into a detail page that keeps the options readable.
                  </p>
                </div>

                <div className="soft-panel flex flex-col gap-3 rounded-[1.6rem] p-4 sm:flex-row sm:items-center">
                  <div className="relative min-w-[15rem] flex-1">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                    <Input
                      placeholder="Search cakes"
                      className="h-12 rounded-full border-stone-200 bg-white pl-11 text-sm"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={filter === category ? 'default' : 'outline'}
                        onClick={() => setFilter(category)}
                        className="h-10 rounded-full px-4 text-[0.68rem] font-semibold uppercase tracking-[0.22em]"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <AnimatePresence mode="popLayout">
                <motion.div layout className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {filteredCakes.map((cake, index) => (
                    <motion.div
                      key={cake.id}
                      layout
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 18 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <Card className="h-full overflow-hidden rounded-[1.8rem] border-none bg-white shadow-[0_18px_55px_rgba(61,43,31,0.08)] transition-transform duration-300 hover:-translate-y-1">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <Image
                            src={cake.image_data_uri || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=900'}
                            alt={cake.name}
                            fill
                            className="object-cover transition-transform duration-700 hover:scale-105"
                          />
                          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-stone-900">
                            <Star className="h-3.5 w-3.5 text-primary" />
                            {cake.rating || 'New'}
                          </div>
                        </div>
                        <CardContent className="space-y-5 p-6">
                          <div className="space-y-2">
                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-primary">
                              {cake.category}
                            </p>
                            <h3 className="text-3xl leading-tight text-stone-950">{cake.name}</h3>
                            <p className="text-sm leading-6 text-stone-600">{cake.description}</p>
                          </div>

                          <div className="flex items-center justify-between rounded-[1.2rem] bg-stone-50 px-4 py-3">
                            <div>
                              <p className="text-[0.64rem] font-semibold uppercase tracking-[0.24em] text-stone-400">
                                From
                              </p>
                              <p className="text-2xl font-semibold text-primary">{formatPrice(cake.base_price)}</p>
                            </div>
                            <div className="text-right text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-stone-500">
                              <p>{cake.ready_time}</p>
                              <p>{cake.customizable ? 'Customizable' : 'Ready style'}</p>
                            </div>
                          </div>

                          <Link href={`/cakes/${cake.id}`} onClick={() => setNavigatingId(cake.id)}>
                            <Button
                              className="h-12 w-full rounded-[1rem] text-[0.72rem] font-semibold uppercase tracking-[0.24em]"
                              disabled={navigatingId === cake.id}
                            >
                              {navigatingId === cake.id ? <Loader2 className="h-4 w-4 animate-spin" /> : (cake.customizable ? 'Customize cake' : 'Order this cake')}
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {filteredCakes.length === 0 && (
                <div className="soft-panel flex flex-col items-center justify-center gap-4 rounded-[1.8rem] py-20 text-center">
                  <Sparkles className="h-12 w-12 text-stone-300" />
                  <div className="space-y-2">
                    <h3 className="text-2xl text-stone-900">No cakes match that search.</h3>
                    <p className="text-sm text-stone-500">Try another collection or search term.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="border-t border-white/50 bg-[linear-gradient(180deg,#fffaf5_0%,#f0e3d3_100%)] px-5 py-14 md:px-6">
        <div className="container mx-auto grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#cf8b4b,#8f4520)] text-white">
                <UtensilsCrossed className="h-5 w-5" />
              </div>
              <div>
                <p className="font-headline text-2xl text-stone-950">WhiskeDelights</p>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-stone-500">
                  Calm ordering experience
                </p>
              </div>
            </div>
            <p className="max-w-md text-sm leading-7 text-stone-600">
              Premium cakes, clearer pages, and a booking flow that feels simple enough to trust on the first try.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-stone-500">Hours</p>
            <div className="space-y-3 text-sm text-stone-700">
              <p className="flex items-center gap-3"><Clock3 className="h-4 w-4 text-primary" /> Monday to Friday · 8am to 7pm</p>
              <p className="flex items-center gap-3"><Clock3 className="h-4 w-4 text-primary" /> Saturday · 9am to 6pm</p>
              <p className="flex items-center gap-3"><Clock3 className="h-4 w-4 text-primary" /> Sunday · Closed</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-stone-500">Follow</p>
            <div className="flex gap-3">
              <Link href="#" className="flex h-12 w-12 items-center justify-center rounded-2xl border border-stone-200 bg-white transition-colors hover:text-primary">
                <InstagramIcon className="h-5 w-5" />
              </Link>
              <Link href="#" className="flex h-12 w-12 items-center justify-center rounded-2xl border border-stone-200 bg-white transition-colors hover:text-green-600">
                <WhatsappIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
