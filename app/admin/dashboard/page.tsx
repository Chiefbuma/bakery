'use client';

import { useState, useEffect } from 'react';
import { getOrders, getCakes } from '@/services/cake-service';
import type { Order, Cake } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatPrice, cn } from '@/lib/utils';
import { 
  ShoppingBag, 
  Package, 
  Clock, 
  Star,
  DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [orderList, cakeList] = await Promise.all([getOrders(), getCakes()]);
      setOrders(orderList || []);
      setCakes(cakeList || []);
      setLoading(false);
    }
    loadData();
  }, []);

  const stats = [
    { 
      label: 'Bakery Revenue', 
      value: formatPrice(orders.reduce((acc, o) => acc + o.total_price, 0)), 
      icon: DollarSign, 
      color: 'bg-green-500' 
    },
    { 
      label: 'Order Volume', 
      value: orders.length.toString(), 
      icon: ShoppingBag, 
      color: 'bg-primary' 
    },
    { 
      label: 'Active Creations', 
      value: cakes.length.toString(), 
      icon: Package, 
      color: 'bg-amber-500' 
    },
    { 
      label: 'Pending Jobs', 
      value: orders.filter(o => o.order_status === 'processing').length.toString(), 
      icon: Clock, 
      color: 'bg-stone-600' 
    },
  ];

  // For Dashboard preview, we show top 5, but the dedicated ledger page has the strict 5-record pagination
  const recentOrders = orders.slice(0, 5);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div>
        <h1 className="text-3xl font-black font-headline tracking-tight text-stone-900">Bakery Performance</h1>
        <p className="text-muted-foreground font-medium">Real-time performance metrics for WhiskeDelights Artisanal Bakery.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
                  <h3 className="text-2xl font-black">{stat.value}</h3>
                </div>
                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg", stat.color)}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-stone-900 text-white flex flex-row items-center justify-between">
            <CardTitle className="text-sm uppercase tracking-[0.2em] font-black flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Requests (Top 5)
            </CardTitle>
            <Link href="/admin/orders">
              <Badge variant="outline" className="text-white border-white/20 hover:bg-white/10 cursor-pointer">View Full Ledger</Badge>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-stone-50 border-none">
                  <TableHead className="font-black text-[10px] uppercase">Ref #</TableHead>
                  <TableHead className="font-black text-[10px] uppercase">Customer</TableHead>
                  <TableHead className="font-black text-[10px] uppercase text-right">Value</TableHead>
                  <TableHead className="font-black text-[10px] uppercase">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">No recent orders.</TableCell></TableRow>
                ) : recentOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-stone-50/50 transition-colors">
                    <TableCell className="font-mono text-xs font-black text-primary">{order.order_number}</TableCell>
                    <TableCell className="font-bold text-sm">{order.customer_name}</TableCell>
                    <TableCell className="text-right font-black text-sm">{formatPrice(order.total_price)}</TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "uppercase text-[10px] font-black",
                        order.order_status === 'complete' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      )}>
                        {order.order_status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-primary text-white">
            <CardTitle className="text-sm uppercase tracking-[0.2em] font-black flex items-center gap-2">
              <Star className="h-4 w-4" />
              Bestsellers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {cakes.slice(0, 4).map((cake) => (
              <div key={cake.id} className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-stone-100 overflow-hidden border relative shrink-0">
                  <img src={cake.image_data_uri || ''} alt={cake.name} className="object-cover w-full h-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{cake.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-black">{cake.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-xs">{cake.orders_count}</p>
                  <p className="text-[9px] text-muted-foreground uppercase">Sales</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
