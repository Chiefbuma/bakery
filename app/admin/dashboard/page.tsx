'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, TrendingUp, Users, Package } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function AdminDashboardPage() {
  const stats = [
    { label: 'Total Revenue', value: formatPrice(124500), icon: TrendingUp, color: 'text-green-600' },
    { label: 'Active Orders', value: '12', icon: ShoppingBag, color: 'text-primary' },
    { label: 'Total Customers', value: '84', icon: Users, color: 'text-blue-600' },
    { label: 'Artisanal Collection', value: '24', icon: Package, color: 'text-amber-600' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div>
        <h1 className="text-3xl font-black font-headline tracking-tight text-stone-900">Bakery Performance</h1>
        <p className="text-muted-foreground font-medium">Real-time metrics for WhiskeDelights operations.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm overflow-hidden">
             <CardContent className="p-6 flex items-center gap-4">
                <div className={cn("p-3 rounded-2xl bg-stone-100", stat.color)}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                   <p className="text-2xl font-black">{stat.value}</p>
                </div>
             </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-black uppercase tracking-widest">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground italic text-center py-10">
              No recent alerts to display.
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-black uppercase tracking-widest">Top Selling Masterpieces</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                {[
                  { name: 'Chocolate Fudge', orders: 45 },
                  { name: 'Red Velvet', orders: 32 },
                  { name: 'Matcha Dream', orders: 28 }
                ].map((cake, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-transparent hover:border-primary/10 transition-colors">
                    <span className="font-bold text-sm">{cake.name}</span>
                    <span className="text-xs font-black bg-primary/10 text-primary px-3 py-1 rounded-full">{cake.orders} orders</span>
                  </div>
                ))}
             </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
