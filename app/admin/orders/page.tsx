
'use client';

import { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus, deleteOrder } from '@/services/cake-service';
import type { Order } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { Trash2, CheckCircle, Clock, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const data = await getOrders();
    setOrders(data);
  };

  const handleUpdateStatus = async (id: number, status: any) => {
    await updateOrderStatus(id, status);
    toast({ title: "Order Updated", description: `Status changed to ${status}.` });
    fetchOrders();
  };

  const handleDelete = async (id: number) => {
    await deleteOrder(id);
    toast({ variant: "destructive", title: "Order Deleted", description: "The record has been permanently removed." });
    fetchOrders();
  };

  // Pagination Logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentOrders = orders.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(orders.length / recordsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black font-headline tracking-tight">Order Management</h1>
        <p className="text-muted-foreground font-medium">Review customer requests and track delivery status.</p>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="bg-stone-900 text-white rounded-t-lg">
          <CardTitle className="text-sm uppercase tracking-[0.2em] font-black">Transaction Ledger</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-stone-50 border-none">
                <TableHead className="font-black text-[10px] uppercase">Ref #</TableHead>
                <TableHead className="font-black text-[10px] uppercase">Customer</TableHead>
                <TableHead className="font-black text-[10px] uppercase text-right">Total</TableHead>
                <TableHead className="font-black text-[10px] uppercase">Status</TableHead>
                <TableHead className="font-black text-[10px] uppercase text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">No orders found.</TableCell>
                </TableRow>
              ) : currentOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-stone-50/50 transition-colors">
                  <TableCell className="font-black font-mono text-primary text-xs">{order.order_number}</TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="font-bold text-sm">{order.customer_name}</p>
                      <p className="text-[10px] text-muted-foreground">{order.customer_phone}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-black">{formatPrice(order.total_price)}</TableCell>
                  <TableCell>
                    <Badge className={`uppercase text-[10px] font-black ${
                      order.order_status === 'complete' ? 'bg-green-100 text-green-700' :
                      order.order_status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {order.order_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                       <Button variant="ghost" size="icon" className="text-green-600 h-8 w-8" onClick={() => handleUpdateStatus(order.id, 'complete')} title="Mark Complete">
                         <CheckCircle className="h-4 w-4" />
                       </Button>
                       <Button variant="ghost" size="icon" className="text-amber-600 h-8 w-8" onClick={() => handleUpdateStatus(order.id, 'processing')} title="Mark Processing">
                         <Clock className="h-4 w-4" />
                       </Button>
                       <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => handleDelete(order.id)} title="Delete Record">
                         <Trash2 className="h-4 w-4" />
                       </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Custom Pagination Footer */}
          <div className="p-4 border-t flex items-center justify-between">
             <span className="text-xs font-bold text-muted-foreground">Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, orders.length)} of {orders.length}</span>
             <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
