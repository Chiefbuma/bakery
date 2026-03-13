'use client';

import { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus, deleteOrder } from '@/services/cake-service';
import type { Order } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice, cn } from '@/lib/utils';
import { Trash2, CheckCircle, ChevronLeft, ChevronRight, ShoppingBag, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const recordsPerPage = 5; // Strict 5-record pagination for high-precision auditing

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      toast({ variant: "destructive", title: "Sync Failed", description: "Could not retrieve order ledger." });
    }
  };

  const handleUpdateStatus = async (id: number, status: any) => {
    await updateOrderStatus(id, status);
    toast({ title: "Order Updated", description: `Status successfully changed to ${status}.` });
    fetchOrders();
  };

  const handleDelete = async (id: number) => {
    await deleteOrder(id);
    toast({ variant: "destructive", title: "Order Removed", description: "Transaction cleared from the system." });
    fetchOrders();
  };

  const filteredOrders = orders.filter(o => 
    o.customer_name.toLowerCase().includes(search.toLowerCase()) || 
    o.order_number.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / recordsPerPage));
  const currentOrders = filteredOrders.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-headline tracking-tight">Order Fulfillment</h1>
          <p className="text-muted-foreground font-medium">Precision Auditing • 5 Records Per Page</p>
        </div>
        <div className="relative w-full md:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input 
             placeholder="Search ledger..." 
             className="pl-10 h-10 border-2" 
             value={search} 
             onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} 
           />
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-stone-900 text-white">
          <CardTitle className="text-sm uppercase tracking-[0.2em] font-black flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Transaction Ledger
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-stone-50 border-none">
                <TableHead className="font-black text-[10px] uppercase">Ref #</TableHead>
                <TableHead className="font-black text-[10px] uppercase">Guest</TableHead>
                <TableHead className="font-black text-[10px] uppercase text-right">Total</TableHead>
                <TableHead className="font-black text-[10px] uppercase">Status</TableHead>
                <TableHead className="font-black text-[10px] uppercase text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentOrders.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">No matches found.</TableCell></TableRow>
              ) : currentOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-stone-50/50 transition-colors">
                  <TableCell className="font-black font-mono text-primary text-xs">{order.order_number}</TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="font-bold text-sm">{order.customer_name}</p>
                      <p className="text-[10px] text-muted-foreground">{order.customer_phone}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-black text-sm">{formatPrice(order.total_price)}</TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "uppercase text-[10px] font-black",
                      order.order_status === 'complete' ? 'bg-green-100 text-green-700' :
                      order.order_status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    )}>
                      {order.order_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                       <Button variant="ghost" size="icon" className="text-green-600 h-8 w-8" onClick={() => handleUpdateStatus(order.id, 'complete')}>
                         <CheckCircle className="h-4 w-4" />
                       </Button>
                       <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => handleDelete(order.id)}>
                         <Trash2 className="h-4 w-4" />
                       </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="p-4 border-t flex items-center justify-between bg-stone-50/50">
             <span className="text-xs font-bold text-muted-foreground">Page {currentPage} of {totalPages || 1}</span>
             <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 w-8 p-0"><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="h-8 w-8 p-0"><ChevronRight className="h-4 w-4" /></Button>
             </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}