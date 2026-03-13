'use client';

import { useState, useEffect, useMemo } from 'react';
import { getCakes, getSpecialOffer } from '@/services/cake-service';
import type { Cake, SpecialOffer } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Star, 
  ArrowRight, 
  Sparkles, 
  Search, 
  Loader2, 
  Utensils, 
  Clock, 
  MapPin, 
  Phone, 
  Mail,
  Send,
  Heart
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { InstagramIcon } from '@/components/icons/instagram-icon';
import { WhatsappIcon } from '@/components/icons/whatsapp-icon';

export default function BakeryLandingPage() {
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [specialOffer, setSpecialOffer] = useState<SpecialOffer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [navigatingId, setNavigatingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    alert("Thank you! Your message has been sent to our master bakers.");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center space-y-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-stone-400 font-black tracking-[0.3em] uppercase text-[9px] animate-pulse">Pre-heating the Oven...</p>
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
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Utensils className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-black font-headline tracking-tighter hidden sm:block">WhiskeDelights</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-[9px] font-black uppercase tracking-widest text-stone-500">
            <Link href="#menu" className="hover:text-primary transition-colors">Artisanal Gallery</Link>
            <Link href="#about" className="hover:text-primary transition-colors">Our Story</Link>
            <Link href="#contact" className="hover:text-primary transition-colors">Connect</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="#menu">
              <Button className="rounded-full font-black px-6 h-10 text-[9px] shadow-xl shadow-primary/20">Order Now</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
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
            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-8 md:p-12 rounded-[2.5rem] shadow-2xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary font-black text-[7px] uppercase tracking-[0.2em]">
                <Sparkles className="h-3 w-3 animate-pulse" />
                <span>Nyeri's Finest Bakery</span>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-black text-white leading-[1] font-headline tracking-tighter">
                  Baking <br/>
                  <span className="text-primary italic">Dreams Daily</span>
                </h1>
                <p className="text-xs md:text-sm text-stone-400 max-w-lg leading-relaxed font-medium">
                  We handcraft every creation using time-honored techniques to transform your moments into masterpieces.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link href="#menu" className="flex-1">
                  <Button className="w-full h-12 text-[10px] font-black rounded-xl shadow-2xl shadow-primary/20">Explore Gallery</Button>
                </Link>
                <Link href="#contact" className="flex-1">
                  <Button variant="outline" className="w-full h-12 text-[10px] font-black rounded-xl border-white/20 text-white hover:bg-white/10">Custom Order</Button>
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

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-2">
                  <div className="space-y-1">
                    <Badge className="bg-primary text-white border-none text-[7px] font-black uppercase tracking-widest">Masterpiece of the Day</Badge>
                    <h3 className="text-xl md:text-2xl font-black text-white font-headline">{specialOffer.cake.name}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-primary font-black text-xl">{formatPrice(specialOffer.special_price)}</span>
                      <span className="text-stone-500 text-xs line-through font-bold">{formatPrice(specialOffer.original_price)}</span>
                    </div>
                  </div>
                  <Link href={`/cakes/${specialOffer.cake.id}`} className="w-full md:w-auto" onClick={() => setNavigatingId('hero-special')}>
                    <Button className="w-full h-12 px-8 text-[10px] font-black rounded-xl bg-white text-stone-950 hover:bg-primary hover:text-white transition-all group" disabled={navigatingId === 'hero-special'}>
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

      {/* Our Story Section */}
      <section id="about" className="py-24 bg-stone-50 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
                <Image 
                  src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1000" 
                  alt="Baking with passion"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-10 -right-10 bg-white p-8 rounded-[2rem] shadow-xl max-w-xs hidden md:block border">
                <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-2">Our Promise</p>
                <p className="text-sm font-bold leading-relaxed italic">"We don't just bake cakes; we create centerpieces for your life's most beautiful chapters."</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-0.5 w-8 bg-primary"></div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-stone-400">Master Baker</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <Badge variant="outline" className="border-primary text-primary font-black uppercase tracking-widest text-[8px] px-3">Our Story</Badge>
                <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tighter leading-tight">
                  Handcrafted in Nyeri, <br/>
                  <span className="text-primary italic">Born from Passion.</span>
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Founded in the heart of Othaya, WhiskeDelights began as a small home kitchen with a single mission: to redefine what a celebration tastes like. We believe that every ingredient matters, from the finest Belgian chocolate to the local farm-fresh berries.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Our artisanal approach blends time-honored techniques with contemporary design, ensuring that every creation is as visually stunning as it is delicious. We take pride in being a part of your weddings, birthdays, and "just because" moments.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-4">
                <div className="space-y-2">
                  <h4 className="text-2xl font-black text-primary font-headline">100%</h4>
                  <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Natural Ingredients</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-black text-primary font-headline">500+</h4>
                  <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Happy Celebrations</p>
                </div>
              </div>

              <Link href="#menu">
                <Button className="rounded-xl font-black px-8 h-14 text-[10px] gap-2 group shadow-xl shadow-primary/20">
                  Visit Our Gallery
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="menu" className="py-24 container mx-auto px-6">
        <div className="flex flex-col gap-8 mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-2 text-center md:text-left"
          >
            <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tighter">Artisanal Gallery</h2>
            <p className="text-muted-foreground font-medium text-[9px] max-w-xl uppercase tracking-widest">Browse our collection of signature recipes designed to make your celebrations memorable.</p>
          </motion.div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search catalog..." 
                className="pl-12 h-11 rounded-xl border-2 focus:border-primary/50 text-[10px]"
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
                  className="rounded-full px-5 font-black h-9 text-[8px] shadow-sm whitespace-nowrap uppercase tracking-widest"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-stone-50 rounded-[2.5rem] p-6 md:p-10 border shadow-inner">
          <AnimatePresence mode="popLayout">
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10"
            >
              {filteredCakes.map((cake) => (
                <motion.div 
                  key={cake.id} 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full"
                >
                  <Card className="group h-full flex flex-col overflow-hidden border-none bg-white shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2rem]">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image 
                        src={cake.image_data_uri || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600'} 
                        alt={cake.name} 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-white/95 text-black border-none px-3 py-1 font-black shadow-lg rounded-full text-[7px]">
                          <Star className="h-3 w-3 fill-primary text-primary mr-1" /> {cake.rating || 'New'}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6 flex-1 flex flex-col justify-between">
                      <div className="mb-6">
                        <span className="text-[7px] font-black text-primary uppercase tracking-widest block mb-1">{cake.category}</span>
                        <h3 className="text-xl md:text-2xl font-black mb-2 font-headline">{cake.name}</h3>
                        <p className="text-muted-foreground text-[10px] line-clamp-2 leading-relaxed">{cake.description}</p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                        <span className="text-lg font-black text-primary">{formatPrice(cake.base_price)}</span>
                        <Link href={`/cakes/${cake.id}`} onClick={() => setNavigatingId(cake.id)}>
                          <Button size="sm" className="rounded-xl gap-2 font-black px-5 h-9 text-[9px] uppercase tracking-widest" disabled={navigatingId === cake.id}>
                            {navigatingId === cake.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : (cake.customizable ? 'Customize' : 'Order')}
                            <ArrowRight className="h-3.5 w-3.5" />
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
            <div className="py-20 flex flex-col items-center justify-center text-stone-400">
              <Sparkles className="h-16 w-16 mb-4 opacity-10" />
              <p className="font-black uppercase tracking-[0.3em] text-[9px] italic">No matches in our recipe book</p>
            </div>
          )}
        </div>
      </section>

      {/* Connect Section */}
      <section id="contact" className="py-24 relative overflow-hidden bg-stone-900 text-white">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-5 gap-16">
            <div className="lg:col-span-2 space-y-12">
              <div className="space-y-4">
                <Badge className="bg-primary text-white font-black uppercase tracking-widest text-[7px] px-3">Connect With Us</Badge>
                <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tighter">
                  Let's Discuss <br/>
                  <span className="text-primary italic">Your Celebration.</span>
                </h2>
                <p className="text-sm text-stone-400 leading-relaxed font-medium">
                  Whether you have a specific vision or need guidance on choosing the perfect flavor, our master bakers are here to help.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 group hover:border-primary/50 transition-colors">
                  <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-300">Visit Our Kitchen</h4>
                    <p className="text-sm font-medium">Othaya Main Road, Othaya Town</p>
                    <p className="text-xs text-stone-500">Nyeri County, Kenya</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 group hover:border-primary/50 transition-colors">
                  <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-300">Call Us Directly</h4>
                    <p className="text-sm font-medium">+254 700 000 000</p>
                    <p className="text-xs text-stone-500">Mon - Sat: 8am - 7pm</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 group hover:border-primary/50 transition-colors">
                  <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-300">General Inquiry</h4>
                    <p className="text-sm font-medium">hello@whiskedelights.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <Card className="bg-white border-none shadow-2xl rounded-[3rem] p-8 md:p-12 overflow-hidden relative">
                <form onSubmit={handleContactSubmit} className="space-y-6 relative z-10">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-stone-400 ml-1">Your Name</label>
                      <Input placeholder="John Doe" className="h-12 border-2 rounded-xl text-stone-900 font-bold focus:border-primary/50" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-stone-400 ml-1">Email Address</label>
                      <Input type="email" placeholder="john@example.com" className="h-12 border-2 rounded-xl text-stone-900 font-bold focus:border-primary/50" required />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-stone-400 ml-1">Occasion / Topic</label>
                    <Input placeholder="e.g. Wedding Cake Inquiry" className="h-12 border-2 rounded-xl text-stone-900 font-bold focus:border-primary/50" required />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-stone-400 ml-1">Message Details</label>
                    <Textarea placeholder="Tell us about your dream cake..." className="min-h-[150px] border-2 rounded-2xl text-stone-900 font-bold focus:border-primary/50" required />
                  </div>

                  <Button className="w-full h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest gap-3 shadow-xl shadow-primary/20" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {isSubmitting ? 'Sending Request...' : 'Send Message'}
                  </Button>
                </form>
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Heart className="h-64 w-64 fill-primary" />
                </div>
              </Card>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full scale-150 -z-0" />
      </section>

      {/* Signature Footer */}
      <footer className="py-16 border-t bg-stone-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
                  <Utensils className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-black font-headline tracking-tighter">WhiskeDelights</span>
              </div>
              <p className="text-muted-foreground font-medium text-[9px] max-w-sm leading-relaxed uppercase tracking-wide">Crafting premium artisanal cakes for Nyeri County and beyond. Every slice tells a story of passion and quality.</p>
              <div className="flex gap-3">
                <Link href="#" className="h-9 w-9 rounded-xl bg-white border shadow-sm flex items-center justify-center hover:bg-primary hover:text-white transition-all group">
                  <InstagramIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                </Link>
                <Link href="#" className="h-9 w-9 rounded-xl bg-white border shadow-sm flex items-center justify-center hover:bg-green-600 hover:text-white transition-all group">
                  <WhatsappIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                </Link>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-black uppercase tracking-widest text-[8px] text-stone-400">Navigation</h4>
              <ul className="space-y-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                <li><Link href="#menu" className="hover:text-primary transition-colors">The Gallery</Link></li>
                <li><Link href="#about" className="hover:text-primary transition-colors">Our Story</Link></li>
                <li><Link href="#contact" className="hover:text-primary transition-colors">Connect</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-black uppercase tracking-widest text-[8px] text-stone-400">Operating Hours</h4>
              <ul className="space-y-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                <li className="flex items-center gap-2"><Clock className="h-3 w-3" /> Mon - Fri: 8am - 7pm</li>
                <li className="flex items-center gap-2"><Clock className="h-3 w-3" /> Saturday: 9am - 6pm</li>
                <li className="flex items-center gap-2 text-primary italic font-black"><Star className="h-3 w-3" /> Sunday: Closed</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
             <p className="text-[8px] font-black uppercase tracking-[0.2em] text-stone-400">© 2024 WhiskeDelights Artisanal Bakery • Nyeri, Kenya</p>
             <div className="flex gap-6 text-[8px] font-black uppercase tracking-widest text-stone-400">
               <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
               <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
             </div>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
