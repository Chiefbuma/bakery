
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Hotel, Utensils, Beer, Car, Bed, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <header className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-stone-900 text-white">
        <div className="absolute inset-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=2000" 
            alt="Hotel Interior" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/20 rounded-full backdrop-blur-md">
              <Hotel className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 font-headline tracking-tight">
            Wamaghach Kahua-ini Hotel
          </h1>
          <p className="text-lg md:text-xl mb-8 text-stone-300 max-w-2xl mx-auto">
            Experience premium hospitality across our Restaurant, Bar, Accommodation, and Car Wash services.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/admin/pos">
              <Button size="lg" className="px-8 text-lg">
                Enter Terminal <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/admin/dashboard">
              <Button size="lg" variant="outline" className="px-8 text-lg border-white text-white hover:bg-white/10">
                Admin View
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Services Section */}
      <main className="container mx-auto py-20 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <ServiceCard 
            icon={<Utensils className="h-8 w-8" />} 
            title="Restaurant" 
            desc="Authentic local and international cuisine prepared by master chefs."
          />
          <ServiceCard 
            icon={<Beer className="h-8 w-8" />} 
            title="Executive Bar" 
            desc="A sophisticated selection of fine spirits and premium local lagers."
          />
          <ServiceCard 
            icon={<Bed className="h-8 w-8" />} 
            title="Accommodation" 
            desc="Luxurious rooms designed for your ultimate comfort and relaxation."
          />
          <ServiceCard 
            icon={<Car className="h-8 w-8" />} 
            title="Pro Car Wash" 
            desc="High-quality cleaning services while you enjoy our hospitality."
          />
        </div>
      </main>

      <footer className="mt-auto py-8 bg-card border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} Wamaghach Kahua-ini Hotel. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function ServiceCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 bg-card rounded-2xl border hover:border-primary/50 transition-all hover:shadow-xl group">
      <div className="mb-6 p-3 bg-primary/10 rounded-lg w-fit group-hover:bg-primary group-hover:text-white transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
